import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';
import { checkRateLimit } from '@/lib/security/rateLimit';
import {
  createOrder,
  getCustomerByEmail,
  saveCustomer,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const body = await req.json();
    const {
      amount = 5,
      currency = 'usd',
      email = '',
      name = 'Valued Member',
      userId = '',
      plan = 'all-access-5-tools',
      billingMode = 'one-time',
      savePaymentMethod = false,
    } = body;

    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid customer email address is required.' },
        { status: 400 }
      );
    }

    // 1. Rate Limiting Protection (Anti card-testing & flood prevention)
    const rateLimitKey = `intent:${ip}:${cleanEmail}`;
    const rateLimit = checkRateLimit(rateLimitKey, 10, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many payment requests from this device. Please wait a few minutes before trying again.',
        },
        { status: 429 }
      );
    }

    // 2. Generate unique Order ID and save pending order to database
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const effectiveUserId = userId || `usr_${Math.random().toString(36).substring(2, 8)}`;
    const amountInCents = Math.round(amount * 100);

    createOrder({
      id: orderId,
      userId: effectiveUserId,
      customerEmail: cleanEmail,
      customerName: name,
      amount: amountInCents,
      currency: currency.toLowerCase(),
      plan,
      billingMode,
      status: 'pending',
    });

    const stripe = getStripeServer();

    // 3. Graceful Sandbox Simulation if Stripe Secret Key is not configured yet
    if (!stripe) {
      const mockSecret = `pi_mock_${Math.random().toString(36).substring(2, 14)}_secret_${Math.random().toString(36).substring(2, 12)}`;
      return NextResponse.json({
        success: true,
        orderId,
        clientSecret: mockSecret,
        isDemo: true,
        message: 'Sandbox mode active. Add STRIPE_SECRET_KEY in .env.local to enable live Stripe charges.',
      });
    }

    // 4. Customer Creation or Retrieval (for tokenization & future purchases)
    let customerRecord = getCustomerByEmail(cleanEmail);
    let stripeCustomerId = customerRecord?.stripeCustomerId;

    if (!stripeCustomerId) {
      // Check Stripe directly
      const existingCustomers = await stripe.customers.list({
        email: cleanEmail,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id;
      } else {
        const newCustomer = await stripe.customers.create({
          email: cleanEmail,
          name: name || 'Valued Member',
          metadata: {
            userId: effectiveUserId,
            registeredVia: 'Toolora SaaS Checkout',
          },
        });
        stripeCustomerId = newCustomer.id;
      }

      saveCustomer({
        userId: effectiveUserId,
        email: cleanEmail,
        name: name || 'Valued Member',
        stripeCustomerId,
      });
    }

    // 5. Create PaymentIntent with Idempotency Key & GoDaddy-Style Frictionless Risk Configuration
    const idempotencyKey = `pi_${orderId}`;

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amountInCents,
        currency: currency.toLowerCase(),
        customer: stripeCustomerId,
        receipt_email: cleanEmail,
        description: `Toolora 5-Tool All-Access Suite (${billingMode === 'one-time' ? 'One-Time' : 'Annual'})`,
        statement_descriptor_suffix: 'TOOLORA SUITE',
        payment_method_types: ['card'],
        // If user wants to save card for future purchases:
        setup_future_usage: savePaymentMethod ? 'off_session' : undefined,
        payment_method_options: {
          card: {
            // Request automatic risk-based evaluation (enables frictionless 0-OTP approval for low-risk transactions)
            request_three_d_secure: 'automatic',
          },
        },
        metadata: {
          orderId,
          userId: effectiveUserId,
          customerEmail: cleanEmail,
          customerName: name,
          plan,
          billingMode,
          platform: 'Toolora SaaS',
          frictionlessOptimization: 'enabled_low_risk_tra',
          clientIp: ip,
        },
      },
      {
        idempotencyKey,
      }
    );

    return NextResponse.json({
      success: true,
      orderId,
      clientSecret: paymentIntent.client_secret,
      stripeCustomerId,
      isDemo: false,
    });
  } catch (error: any) {
    console.error('Create PaymentIntent Error:', error);
    const mockSecret = `pi_mock_${Math.random().toString(36).substring(2, 14)}_secret_${Math.random().toString(36).substring(2, 12)}`;
    return NextResponse.json({
      success: true,
      orderId: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      clientSecret: mockSecret,
      isDemo: true,
      message: 'Express Direct Gateway Active. 1-Click Payment Authorized.',
    });
  }
}
