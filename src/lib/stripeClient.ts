import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripePromise(customPubKey?: string): Promise<Stripe | null> {
  const pubKey = customPubKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!pubKey || pubKey.includes('your_publishable_key')) {
    return Promise.resolve(null);
  }

  if (!stripePromise) {
    stripePromise = loadStripe(pubKey);
  }

  return stripePromise;
}
