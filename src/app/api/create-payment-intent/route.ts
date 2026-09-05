import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount = 100, currency = 'usd', email, name, billingMode = 'one-time' } = body;

    // If Stripe is not yet configured with a valid API key, return a mock success for local testing
    if (!stripe || !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_secret_key')) {
      return NextResponse.json({
        success: true,
        clientSecret: 'mock_stripe_secret_' + Math.random().toString(36).substring(2),
        isMock: true,
        message: 'Stripe API key not configured yet in .env.local. Add STRIPE_SECRET_KEY to enable live Stripe charges.',
      });
    }

    // Amount in cents ($100 -> 10000 cents)
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      receipt_email: email,
      description: `Toolora 5-Tool All-Access Suite (${billingMode === 'one-time' ? 'One-Time' : 'Annual'})`,
      metadata: {
        customerName: name || 'Valued Client',
        customerEmail: email || 'unknown',
        plan: 'all-access-5-tools',
        billingMode,
      },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // Prefer direct seamless in-place charge without redirect where supported
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      isMock: false,
    });
  } catch (error: any) {
    console.error('Stripe PaymentIntent Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to initialize payment intent.',
      },
      { status: 500 }
    );
  }
}
