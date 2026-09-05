import fs from 'fs';
import path from 'path';
import {
  DatabaseState,
  OrderRecord,
  CustomerRecord,
  SavedPaymentMethodRecord,
  WebhookEventRecord,
} from './schema';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'toolora_store.json');

const INITIAL_STATE: DatabaseState = {
  orders: {},
  customers: {},
  paymentMethods: {},
  webhookEvents: {},
};

function ensureDbFile(): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_STATE, null, 2), 'utf-8');
  }
}

export function getDb(): DatabaseState {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseState;
  } catch (err) {
    console.error('Error reading database file, returning initial state:', err);
    return INITIAL_STATE;
  }
}

export function saveDb(state: DatabaseState): void {
  ensureDbFile();
  try {
    const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.error('Error saving database state:', err);
    throw err;
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
