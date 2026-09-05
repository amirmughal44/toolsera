'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Printer,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { OrderRecord } from '@/lib/db/schema';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { upgradeToAllAccess } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!orderId) {
      setError('No order ID found in the confirmation URL.');
      setLoading(false);
      return;
    }

    let pollAttempts = 0;
    const maxAttempts = 5;

    const verifyOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();

        if (!res.ok || !data.success || !data.order) {
          throw new Error(data.error || 'Failed to verify order details.');
        }

        const verifiedOrder: OrderRecord = data.order;
        setOrder(verifiedOrder);

        if (verifiedOrder.status === 'paid') {
          setLoading(false);
          upgradeToAllAccess(verifiedOrder.billingMode);

          confetti({
            particleCount: 110,
            spread: 80,
            origin: { y: 0.6 },
          });

          showToast('Payment Verified!', 'Toolora All-Access is now fully active.', 'success');
        } else if (verifiedOrder.status === 'pending' && pollAttempts < maxAttempts) {
          pollAttempts++;
          setTimeout(verifyOrder, 1500);
        } else {
          setLoading(false);
          if (verifiedOrder.status === 'failed') {
            setError(verifiedOrder.failureMessage || 'Payment was declined by the card issuer.');
          }
        }
      } catch (err: any) {
        setLoading(false);
        setError(err.message || 'Error verifying payment with server.');
      }
    };

    verifyOrder();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Verifying Payment With Gateway
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Confirming server-side cryptographic signature & authorization with Stripe...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order || order.status === 'failed') {
    return (
      <div className="min-h-screen py-24 flex items-center justify-center">
        <div className="text-center space-y-5 max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Payment Not Completed
            </h3>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              {error || order?.failureMessage || 'The payment was not authorized by the gateway.'}
            </p>
          </div>
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all"
          >
            <span>Return to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 sm:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-8 text-center animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Server-Verified & Confirmed</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome to Toolora All-Access 🎉
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            Your transaction was authorized and securely verified. Unrestricted access to all 5 core productivity tools is now active.
          </p>
        </div>

        {/* Official Printable Receipt Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg mx-auto text-left text-xs space-y-3.5 font-mono">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 font-sans">
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm block">
                Official Stripe Receipt
              </span>
              <span className="text-[11px] text-slate-400">Order ID: {order.id}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
              Paid & Confirmed
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Gateway Reference:</span>
            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
              {order.stripePaymentIntentId || 'pi_confirmed'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Licensed To:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-sans truncate max-w-[200px]">
              {order.customerName} ({order.customerEmail})
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Plan Suite:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-sans">
              Toolora 5-Tool All-Access
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Billing Mode:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-sans">
              {order.billingMode === 'one-time' ? 'One-Time Payment' : 'Annual Subscription'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Payment Method:</span>
            <span className="text-slate-800 dark:text-slate-200 font-sans uppercase">
              {order.cardBrand || 'Card'} •••• {order.cardLast4 || '4242'}
            </span>
          </div>

          <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-3">
            <span className="font-bold text-slate-900 dark:text-white font-sans text-sm">
              Total Amount:
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              ${(order.amount / 100).toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/tools"
            className="w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Launch All 5 Tools</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Official Receipt</span>
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-slate-400">
          Loading confirmation...
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
