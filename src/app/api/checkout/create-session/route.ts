import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { createOrder } from '@/lib/db';

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
      uiMode = 'hosted', // 'hosted' or 'embedded'
    } = body;

    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid customer email address is required.' },
        { status: 400 }
      );
    }

    // 1. Anti card-testing rate limit
    const rateLimitKey = `session:${ip}:${cleanEmail}`;
    const rateLimit = checkRateLimit(rateLimitKey, 15, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many payment requests from this IP. Please wait a few minutes before trying again.',
        },
        { status: 429 }
      );
    }

    // 2. Generate unique Order ID
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

    // 3. Fallback Sandbox Mode if Stripe key missing
    if (!stripe) {
      return NextResponse.json({
        success: true,
        orderId,
        url: `${req.headers.get('origin') || 'https://www.toolsera.site'}/checkout/confirmation?order_id=${orderId}&demo=true`,
        isDemo: true,
        message: 'Sandbox mode active. Configure STRIPE_SECRET_KEY to enable live charges.',
      });
    }

    const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/checkout.*$/, '') || 'https://www.toolsera.site';

    // 4. Create Stripe Checkout Session
    if (uiMode === 'embedded') {
      const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded_page',
        customer_email: cleanEmail,
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: 'Toolora 5-Tool Productivity Suite',
                description: 'Lifetime All-Access Pass ($5.00 Special)',
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        return_url: `${origin}/checkout/confirmation?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
        metadata: {
          orderId,
          userId: effectiveUserId,
          customerEmail: cleanEmail,
          customerName: name,
          plan,
          billingMode,
        },
      });

      return NextResponse.json({
        success: true,
        orderId,
        sessionId: session.id,
        clientSecret: session.client_secret,
        isDemo: false,
      });
    } else {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: cleanEmail,
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: 'Toolora 5-Tool Productivity Suite',
                description: 'Lifetime All-Access Pass ($5.00 Special)',
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/checkout/confirmation?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
        cancel_url: `${origin}/checkout`,
        metadata: {
          orderId,
          userId: effectiveUserId,
          customerEmail: cleanEmail,
          customerName: name,
          plan,
          billingMode,
        },
      });

      return NextResponse.json({
        success: true,
        orderId,
        sessionId: session.id,
        url: session.url,
        isDemo: false,
      });
    }
  } catch (error: any) {
    console.error('Create Checkout Session Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to initialize Checkout Session.',
      },
      { status: 500 }
    );
  }
}
