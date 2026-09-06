import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getStripeSecretKey } from '@/lib/stripe';
import { getStripePublishableKey } from '@/lib/stripeClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const secretKey = getStripeSecretKey();
    const pubKey = getStripePublishableKey();

    const isConfigured = Boolean(secretKey && secretKey.length > 10 && !secretKey.includes('your_secret_key'));
    const isLive = secretKey.startsWith('sk_live_');
    const isTest = secretKey.startsWith('sk_test_');

    const maskedSecretKey = isConfigured
      ? `${secretKey.substring(0, 8)}...${secretKey.substring(secretKey.length - 4)}`
      : '';

    return NextResponse.json({
      configured: isConfigured,
      mode: isLive ? 'live' : isTest ? 'test' : 'none',
      maskedSecretKey,
      publishableKey: pubKey,
      hasPublishableKey: Boolean(pubKey && pubKey.length > 10),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { secretKey, publishableKey } = await req.json();

    if (!secretKey || typeof secretKey !== 'string') {
      return NextResponse.json({ error: 'Valid Stripe Secret Key is required.' }, { status: 400 });
    }

    const cleanSecret = secretKey.trim();
    const cleanPub = (publishableKey || '').trim();

    if (!cleanSecret.startsWith('sk_live_') && !cleanSecret.startsWith('sk_test_')) {
      return NextResponse.json(
        { error: 'Invalid secret key format. Stripe secret keys must start with sk_live_ or sk_test_' },
        { status: 400 }
      );
    }

    // Update .env.local file safely if filesystem is writable
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      const envContent = `# =========================================================
# TOOLORA - STRIPE PAYMENT GATEWAY CONFIGURATION
# =========================================================
STRIPE_SECRET_KEY=${cleanSecret}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${cleanPub}
`;
      fs.writeFileSync(envPath, envContent, 'utf-8');
    } catch (e) {
      console.warn('[Stripe Config] Read-only filesystem, updated process.env in memory.');
    }

    // Update process.env in memory
    process.env.STRIPE_SECRET_KEY = cleanSecret;
    if (cleanPub) {
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = cleanPub;
    }

    const isLive = cleanSecret.startsWith('sk_live_');

    return NextResponse.json({
      success: true,
      mode: isLive ? 'live' : 'test',
      message: `Stripe ${isLive ? 'Live' : 'Test'} key saved successfully. Money will deposit directly to your Stripe merchant account.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
