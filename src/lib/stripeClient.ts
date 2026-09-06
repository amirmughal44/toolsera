import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

const DEFAULT_PK_B64 = 'cGtfdGVzdF81MVVDUFRHMzFGNWxneHFwS2JCb0FtYWVUZTBnMmlna25PbGRjS2JRZ1BXbjhsUW93WlBiSG5RTDJsaEtYc0hmN1lvT2RCUUlOWnl3cnhlU1N3R3pVNDhIQzAwN2xKQkxKME4=';

export function getStripePublishableKey(): string {
  let pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  if (!pubKey || pubKey.includes('your_publishable_key')) {
    try {
      if (typeof window !== 'undefined' && window.atob) {
        pubKey = window.atob(DEFAULT_PK_B64);
      } else if (typeof Buffer !== 'undefined') {
        pubKey = Buffer.from(DEFAULT_PK_B64, 'base64').toString('utf-8');
      }
    } catch {
      pubKey = '';
    }
  }
  return pubKey;
}

export function getStripePromise(customPubKey?: string): Promise<Stripe | null> {
  const pubKey = customPubKey || getStripePublishableKey();

  if (!pubKey || pubKey.includes('your_publishable_key')) {
    return Promise.resolve(null);
  }

  if (!stripePromise) {
    stripePromise = loadStripe(pubKey);
  }

  return stripePromise;
}
