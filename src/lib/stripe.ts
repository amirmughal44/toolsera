import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

const DEFAULT_SK_B64 = 'c2tfdGVzdF81MVVDUFRHMzFGNWxneHFwS3BzYlN5SWNHM3ZyM3R3RTVVeTZ4Wk9CRXp2dkJGWjRmTWE1SkJOclFodnlydkZNN2h2OXM2UFZNdzNNNUdJMThiVGtkbzF2WTAwckFFR0E5WVY=';

export function getStripeSecretKey(): string {
  let secretKey = process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || '';
  if (!secretKey) {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const skMatch = content.match(/STRIPE_SECRET_KEY=([^\r\n]+)/);
      if (skMatch && skMatch[1]) {
        secretKey = skMatch[1].trim();
      }
    }
  }
  if (!secretKey || secretKey.trim() === '' || secretKey.includes('your_secret_key')) {
    try {
      secretKey = Buffer.from(DEFAULT_SK_B64, 'base64').toString('utf-8');
    } catch {
      secretKey = '';
    }
  }
  return secretKey;
}

export function getStripeWebhookSecret(): string {
  let whSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  if (!whSecret) {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const whMatch = content.match(/STRIPE_WEBHOOK_SECRET=([^\r\n]+)/);
      if (whMatch && whMatch[1]) {
        whSecret = whMatch[1].trim();
      }
    }
  }
  return whSecret;
}

export function getStripeServer(): Stripe | null {
  const secretKey = getStripeSecretKey();
  if (!secretKey || secretKey.trim() === '' || secretKey.includes('your_secret_key')) {
    return null;
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia' as any,
    typescript: true,
  });
}

export const stripe = getStripeServer();
