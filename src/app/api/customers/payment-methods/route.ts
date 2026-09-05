import { NextRequest, NextResponse } from 'next/server';
import { getCustomerByEmail, getSavedPaymentMethodsByCustomer } from '@/lib/db';
import { getStripeServer } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ paymentMethods: [] });
    }

    const customer = getCustomerByEmail(email);
    if (!customer?.stripeCustomerId) {
      return NextResponse.json({ paymentMethods: [] });
    }

    const stripe = getStripeServer();
    if (stripe) {
      try {
        const stripePms = await stripe.paymentMethods.list({
          customer: customer.stripeCustomerId,
          type: 'card',
        });

        const list = stripePms.data.map((pm) => ({
          id: pm.id,
          brand: pm.card?.brand || 'card',
          last4: pm.card?.last4 || '••••',
          expMonth: pm.card?.exp_month || 12,
          expYear: pm.card?.exp_year || 2028,
        }));

        return NextResponse.json({ paymentMethods: list });
      } catch (err) {
        console.error('Error fetching payment methods from Stripe:', err);
      }
    }

    // Fallback to local DB records
    const localPms = getSavedPaymentMethodsByCustomer(customer.stripeCustomerId).map((p) => ({
      id: p.stripePaymentMethodId,
      brand: p.brand,
      last4: p.last4,
      expMonth: p.expMonth,
      expYear: p.expYear,
    }));

    return NextResponse.json({ paymentMethods: localPms });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
