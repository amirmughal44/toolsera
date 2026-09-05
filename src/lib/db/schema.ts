export type OrderStatus = 'pending' | 'requires_action' | 'paid' | 'failed' | 'canceled';
export type BillingMode = 'one-time' | 'annual';

export interface OrderRecord {
  id: string; // ord_...
  userId: string;
  customerEmail: string;
  customerName: string;
  amount: number; // in cents or standard units ($100 = 10000 cents)
  currency: string;
  plan: string;
  billingMode: BillingMode;
  status: OrderStatus;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  paymentMethodId?: string;
  cardBrand?: string;
  cardLast4?: string;
  failureMessage?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

export interface CustomerRecord {
  userId: string;
  email: string;
  name: string;
  stripeCustomerId: string;
  defaultPaymentMethodId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedPaymentMethodRecord {
  id: string; // spm_...
  userId: string;
  stripeCustomerId: string;
  stripePaymentMethodId: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: string;
}

export interface WebhookEventRecord {
  eventId: string;
  type: string;
  processedAt: string;
  status: 'processed' | 'ignored' | 'failed';
  errorMessage?: string;
}

export interface DatabaseState {
  orders: Record<string, OrderRecord>;
  customers: Record<string, CustomerRecord>;
  paymentMethods: Record<string, SavedPaymentMethodRecord>;
  webhookEvents: Record<string, WebhookEventRecord>;
}
