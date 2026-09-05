import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeServer, getStripeWebhookSecret } from '@/lib/stripe';
import {
  getOrderById,
  updateOrder,
  savePaymentMethod,
  isWebhookEventProcessed,
  recordWebhookEvent,
} from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = getStripeWebhookSecret();
    const stripe = getStripeServer();

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured on this server.' },
        { status: 500 }
      );
    }

    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET is not configured in .env.local. Webhook signature verification bypassed for development.');
    }

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json(
          { error: `Webhook signature verification failed: ${err.message}` },
          { status: 400 }
        );
      }
    } else {
      // Development fallback without signature verification
      try {
        event = JSON.parse(rawBody) as Stripe.Event;
      } catch {
        return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
      }
    }

    // Idempotency: Prevent duplicate processing of the same Stripe event
    if (isWebhookEventProcessed(event.id)) {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    // Process event based on type
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          const existingOrder = getOrderById(orderId);
          if (existingOrder) {
            // Retrieve payment method details for receipt and tokenized reuse
            let brand = 'card';
            let last4 = '••••';
            let expMonth = 12;
            let expYear = 2028;

            if (typeof paymentIntent.payment_method === 'string') {
              try {
                const pm = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
                if (pm.card) {
                  brand = pm.card.brand;
                  last4 = pm.card.last4;
                  expMonth = pm.card.exp_month;
                  expYear = pm.card.exp_year;

                  // If customer saved this card, store token in DB
                  if (paymentIntent.customer && typeof paymentIntent.customer === 'string') {
                    savePaymentMethod({
                      userId: existingOrder.userId,
                      stripeCustomerId: paymentIntent.customer,
                      stripePaymentMethodId: pm.id,
                      brand,
                      last4,
                      expMonth,
                      expYear,
                      isDefault: true,
                    });
                  }
                }
              } catch (err) {
                console.error('Failed to retrieve payment method details:', err);
              }
            }

            // Server-Side Order Fulfillment
            updateOrder(orderId, {
              status: 'paid',
              paidAt: new Date().toISOString(),
              stripePaymentIntentId: paymentIntent.id,
              cardBrand: brand,
              cardLast4: last4,
            });

            console.log(`[Stripe Webhook] Order ${orderId} marked as PAID. All-Access fulfilled.`);
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;
        const failureReason = paymentIntent.last_payment_error?.message || 'Payment authorization failed.';

        if (orderId) {
          updateOrder(orderId, {
            status: 'failed',
            failureMessage: failureReason,
          });
          console.warn(`[Stripe Webhook] Order ${orderId} marked as FAILED: ${failureReason}`);
        }
        break;
      }

      case 'payment_intent.requires_action': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
          updateOrder(orderId, {
            status: 'requires_action',
          });
        }
        break;
      }

      default:
        // Other events ignored
        break;
    }

    // Record webhook event processed
    recordWebhookEvent({
      eventId: event.id,
      type: event.type,
      processedAt: new Date().toISOString(),
      status: 'processed',
    });

    return NextResponse.json({ received: true, status: 'processed' });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal webhook error' },
      { status: 500 }
    );
  }
}
