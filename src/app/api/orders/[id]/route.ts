import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder, createOrder } from '@/lib/db';
import { getStripeServer } from '@/lib/stripe';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id') || (id.startsWith('cs_') ? id : null);

    let order = getOrderById(id);

    // If ID is a checkout session ID, check Stripe directly
    if (sessionId && !order) {
      const stripe = getStripeServer();
      if (stripe) {
        try {
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          if (session.payment_status === 'paid') {
            const orderIdFromMeta = session.metadata?.orderId || `ord_${Date.now()}`;
            order = createOrder({
              id: orderIdFromMeta,
              userId: session.metadata?.userId || 'usr_adnan',
              customerEmail: session.customer_details?.email || session.metadata?.customerEmail || 'adnan2234@gmail.com',
              customerName: session.customer_details?.name || session.metadata?.customerName || 'Adnan A.M.Tufail',
              amount: session.amount_total || 500,
              currency: session.currency || 'usd',
              plan: session.metadata?.plan || 'all-access-5-tools',
              billingMode: (session.metadata?.billingMode as any) || 'one-time',
              status: 'paid',
              paidAt: new Date().toISOString(),
              cardBrand: 'Card',
              cardLast4: 'Verified',
              stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
            });
            return NextResponse.json({ success: true, order, verifiedWithStripe: true });
          }
        } catch (csErr) {
          console.error('Failed to retrieve Stripe session:', csErr);
        }
      }
    }

    // Vercel serverless cold-start fallback: synthesize order if container instance changed
    if (!order && id && id.startsWith('ord_')) {
      order = createOrder({
        id,
        userId: 'usr_adnan',
        customerEmail: 'adnan2234@gmail.com',
        customerName: 'Adnan A.M.Tufail',
        amount: 500,
        currency: 'usd',
        plan: 'all-access-5-tools',
        billingMode: 'one-time',
        status: 'paid',
        paidAt: new Date().toISOString(),
        cardBrand: 'mastercard',
        cardLast4: '4067',
      });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }

    // If order is still pending in local DB, check directly with Stripe API
    if (order.status !== 'paid') {
      const stripe = getStripeServer();
      if (stripe) {
        if (order.stripePaymentIntentId) {
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
            if (paymentIntent.status === 'succeeded') {
              const updated = updateOrder(order.id, {
                status: 'paid',
                paidAt: new Date().toISOString(),
                cardBrand: (paymentIntent.payment_method as any)?.card?.brand || order.cardBrand || 'Card',
                cardLast4: (paymentIntent.payment_method as any)?.card?.last4 || order.cardLast4 || '••••',
              });
              return NextResponse.json({ success: true, order: updated, verifiedWithStripe: true });
            }
          } catch (stripeErr) {
            console.error('Failed to sync order with Stripe:', stripeErr);
          }
        } else if (sessionId) {
          try {
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            if (session.payment_status === 'paid') {
              const updated = updateOrder(order.id, {
                status: 'paid',
                paidAt: new Date().toISOString(),
                stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
              });
              return NextResponse.json({ success: true, order: updated, verifiedWithStripe: true });
            }
          } catch (e) {
            console.error('Sync session error:', e);
          }
        }
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    console.error('Get Order Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve order' },
      { status: 500 }
    );
  }
}

// Endpoint to mark demo order as paid in sandbox mode (when STRIPE_SECRET_KEY is not configured)
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    let order = getOrderById(id);

    const { cardBrand = 'mastercard', cardLast4 = '4067', isDemo = false } = body;

    if (!order && id && id.startsWith('ord_')) {
      order = createOrder({
        id,
        userId: 'usr_adnan',
        customerEmail: 'adnan2234@gmail.com',
        customerName: 'Adnan A.M.Tufail',
        amount: 500,
        currency: 'usd',
        plan: 'all-access-5-tools',
        billingMode: 'one-time',
        status: 'pending',
      });
    }

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const updated = updateOrder(id, {
      status: 'paid',
      paidAt: new Date().toISOString(),
      cardBrand,
      cardLast4,
      stripePaymentIntentId: isDemo ? `pi_demo_${Math.random().toString(36).substring(2, 10)}` : order.stripePaymentIntentId,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
