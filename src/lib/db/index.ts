import fs from 'fs';
import path from 'path';
import {
  DatabaseState,
  OrderRecord,
  CustomerRecord,
  SavedPaymentMethodRecord,
  WebhookEventRecord,
} from './schema';

declare global {
  var __toolora_db: DatabaseState | undefined;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'toolora_store.json');
const TMP_DB_FILE = path.join('/tmp', 'toolora_store.json');

const INITIAL_STATE: DatabaseState = {
  orders: {},
  customers: {},
  paymentMethods: {},
  webhookEvents: {},
};

function getInMemoryDb(): DatabaseState {
  if (!globalThis.__toolora_db) {
    globalThis.__toolora_db = { ...INITIAL_STATE, orders: {}, customers: {}, paymentMethods: {}, webhookEvents: {} };
    // Try to load initial data from file if present
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        globalThis.__toolora_db = JSON.parse(raw);
      } else if (fs.existsSync(TMP_DB_FILE)) {
        const raw = fs.readFileSync(TMP_DB_FILE, 'utf-8');
        globalThis.__toolora_db = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[DB] Could not read disk cache, using fresh in-memory state.');
    }
  }
  return globalThis.__toolora_db!;
}

export function getDb(): DatabaseState {
  return getInMemoryDb();
}

export function saveDb(state: DatabaseState): void {
  globalThis.__toolora_db = state;
  try {
    // Attempt saving to /tmp first on serverless or DB_DIR locally
    const targetDir = process.env.VERCEL ? '/tmp' : DB_DIR;
    const targetFile = process.env.VERCEL ? TMP_DB_FILE : DB_FILE;

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(targetFile, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err: any) {
    console.warn('[DB] Read-only environment or file write ignored, state persisted in-memory:', err?.message || err);
  }
}

// -------------------------------------------------------------
// Orders Helpers
// -------------------------------------------------------------
export function createOrder(order: Omit<OrderRecord, 'createdAt' | 'updatedAt'>): OrderRecord {
  const db = getDb();
  const now = new Date().toISOString();
  const record: OrderRecord = {
    ...order,
    createdAt: now,
    updatedAt: now,
  };
  db.orders[record.id] = record;
  saveDb(db);
  return record;
}

export function getOrderById(id: string): OrderRecord | null {
  const db = getDb();
  return db.orders[id] || null;
}

export function getOrderByPaymentIntentId(piId: string): OrderRecord | null {
  const db = getDb();
  const match = Object.values(db.orders).find((o) => o.stripePaymentIntentId === piId);
  return match || null;
}

export function updateOrder(id: string, updates: Partial<OrderRecord>): OrderRecord | null {
  const db = getDb();
  const existing = db.orders[id];
  if (!existing) return null;

  const updated: OrderRecord = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  db.orders[id] = updated;
  saveDb(db);
  return updated;
}

// -------------------------------------------------------------
// Customers Helpers
// -------------------------------------------------------------
export function getCustomerByEmail(email: string): CustomerRecord | null {
  const db = getDb();
  const normalized = email.toLowerCase().trim();
  const match = Object.values(db.customers).find((c) => c.email.toLowerCase().trim() === normalized);
  return match || null;
}

export function getCustomerByUserId(userId: string): CustomerRecord | null {
  const db = getDb();
  return db.customers[userId] || null;
}

export function saveCustomer(customer: Omit<CustomerRecord, 'createdAt' | 'updatedAt'>): CustomerRecord {
  const db = getDb();
  const now = new Date().toISOString();
  const existing = db.customers[customer.userId];

  const record: CustomerRecord = {
    ...customer,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  db.customers[customer.userId] = record;
  saveDb(db);
  return record;
}

// -------------------------------------------------------------
// Saved Payment Methods Helpers
// -------------------------------------------------------------
export function getSavedPaymentMethodsByCustomer(stripeCustomerId: string): SavedPaymentMethodRecord[] {
  const db = getDb();
  return Object.values(db.paymentMethods).filter((pm) => pm.stripeCustomerId === stripeCustomerId);
}

export function savePaymentMethod(
  pm: Omit<SavedPaymentMethodRecord, 'id' | 'createdAt'>
): SavedPaymentMethodRecord {
  const db = getDb();
  // Check if this card already exists
  const existing = Object.values(db.paymentMethods).find(
    (p) => p.stripePaymentMethodId === pm.stripePaymentMethodId
  );
  if (existing) {
    return existing;
  }

  const id = `spm_${Math.random().toString(36).substring(2, 10)}`;
  const record: SavedPaymentMethodRecord = {
    ...pm,
    id,
    createdAt: new Date().toISOString(),
  };
  db.paymentMethods[id] = record;
  saveDb(db);
  return record;
}

// -------------------------------------------------------------
// Webhook Idempotency Helpers
// -------------------------------------------------------------
export function isWebhookEventProcessed(eventId: string): boolean {
  const db = getDb();
  return Boolean(db.webhookEvents[eventId]);
}

export function recordWebhookEvent(record: WebhookEventRecord): void {
  const db = getDb();
  db.webhookEvents[record.eventId] = record;
  saveDb(db);
}
