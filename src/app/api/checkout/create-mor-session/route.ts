import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/db';
import { generateMorCheckoutUrl, getMorConfig } from '@/lib/mor';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount = 5,
      currency = 'usd',
      email = '',
      name = 'Valued Member',
      userId = '',
      plan = 'all-access-5-tools',
      billingMode = 'one-time',
    } = body;

    const cleanEmail = (email || '').toLowerCase().trim();
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const effectiveUserId = userId || `usr_${Math.random().toString(36).substring(2, 8)}`;
    const amountInCents = Math.round(amount * 100);

    createOrder({
      id: orderId,
      userId: effectiveUserId,
      customerEmail: cleanEmail || 'customer@toolora.com',
      customerName: name || 'Valued Member',
      amount: amountInCents,
      currency: currency.toLowerCase(),
      plan,
      billingMode,
      status: 'pending',
    });

    const morConfig = getMorConfig();
    const redirectUrl = generateMorCheckoutUrl({
      amount,
      email: cleanEmail,
      name,
      orderId,
    });

    return NextResponse.json({
      success: true,
      orderId,
      provider: morConfig.morProvider,
      url: redirectUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create MoR session' },
      { status: 500 }
    );
  }
}
