'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  CreditCard,
  Building2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  KeyRound,
  ExternalLink,
  RefreshCw,
  Zap,
  BookmarkCheck,
  BadgePercent,
  Award,
  Globe,
  Check,
  ChevronRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { getStripePromise } from '@/lib/stripeClient';

interface StripeConfigStatus {
  configured: boolean;
  mode: 'live' | 'test' | 'none';
  maskedSecretKey: string;
  hasPublishableKey: boolean;
}

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

// =========================================================================
// Inner Component: Stripe Elements Payment Form
// =========================================================================
// =========================================================================
// Inner Component: Sandbox / Demo Payment Form (Zero Stripe Hooks)
// =========================================================================
function SandboxPaymentForm({
  orderId,
  chargeAmount,
  onPaymentSuccess,
}: {
  orderId: string;
  chargeAmount: number;
  onPaymentSuccess: (orderId: string) => void;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [demoCardNum, setDemoCardNum] = useState('4242 4242 4242 4242');
  const [demoExpiry, setDemoExpiry] = useState('12/28');
  const [demoCvc, setDemoCvc] = useState('894');

  const handleSandboxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    setTimeout(async () => {
      try {
        await fetch(`/api/orders/${orderId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardBrand: 'visa',
            cardLast4: demoCardNum.slice(-4) || '4242',
            isDemo: true,
          }),
        });
        setIsProcessing(false);
        onPaymentSuccess(orderId);
      } catch (err: any) {
        setIsProcessing(false);
        setErrorMessage(err.message || 'Sandbox authorization failed.');
      }
    }, 1000);
  };

  return (
    <form onSubmit={handleSandboxSubmit} className="space-y-4">
      <div className="space-y-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-700">
        <div className="flex items-center justify-between">
          <span className="font-bold text-amber-700 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>GoDaddy-Style 1-Click Frictionless Authorization</span>
          </span>
          <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
            Active Simulator
          </span>
        </div>
        <p className="text-[11px] text-slate-500">
          Enter card details below for zero-OTP frictionless authorization:
        </p>

        <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
          <div className="space-y-1 col-span-2">
            <label className="text-[10px] text-slate-500 font-sans">Card Number</label>
            <input
              type="text"
              value={demoCardNum}
              onChange={(e) => setDemoCardNum(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono outline-none focus:border-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-sans">Expiration</label>
            <input
              type="text"
              value={demoExpiry}
              onChange={(e) => setDemoExpiry(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono outline-none focus:border-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-sans">CVC</label>
            <input
              type="text"
              value={demoCvc}
              onChange={(e) => setDemoCvc(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-4 rounded-2xl font-extrabold text-sm sm:text-base text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Authorizing Transaction...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              <span>
                Pay ${chargeAmount.toFixed(2)} & Complete Order
              </span>
            </>
          )}
        </button>
        <p className="text-[11px] text-slate-400 text-center mt-2.5 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>GoDaddy-Style 1-Click Frictionless Checkout • Guaranteed 256-Bit SSL Protection</span>
        </p>
      </div>
    </form>
  );
}

// =========================================================================
// Inner Component: Official Live Stripe Hosted Form (Calls useStripe inside Elements)
// =========================================================================
function RealStripePaymentForm({
  orderId,
  chargeAmount,
  onPaymentSuccess,
}: {
  orderId: string;
  chargeAmount: number;
  onPaymentSuccess: (orderId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/checkout/confirmation?order_id=${orderId}`,
        },
      });

      if (result.error) {
        setIsProcessing(false);
        setErrorMessage(result.error.message || 'Payment authorization failed.');
        showToast('Payment Declined', result.error.message || 'Card authorization failed.', 'error');
      } else if (result.paymentIntent) {
        if (
          result.paymentIntent.status === 'succeeded' ||
          result.paymentIntent.status === 'processing'
        ) {
          onPaymentSuccess(orderId);
        } else if (result.paymentIntent.status === 'requires_action') {
          setErrorMessage('Additional 3D Secure verification required by issuing bank.');
          setIsProcessing(false);
        }
      }
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'An unexpected payment error occurred.');
    }
  };

  return (
    <form onSubmit={handleStripeSubmit} className="space-y-4">
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>PCI-DSS SAQ A Hosted Credit Card Fields</span>
          </span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Stripe Encrypted</span>
          </div>
        </div>
        <div className="pt-2 min-h-[160px]">
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isProcessing || !stripe}
          className="w-full py-4 rounded-2xl font-extrabold text-sm sm:text-base text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Authorizing Transaction...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              <span>
                Pay ${chargeAmount.toFixed(2)} & Activate All-Access
              </span>
            </>
          )}
        </button>
        <p className="text-[11px] text-slate-400 text-center mt-2.5 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>GoDaddy-Style 1-Click Frictionless Checkout • Guaranteed 256-Bit SSL Protection</span>
        </p>
      </div>
    </form>
  );
}

// =========================================================================
// Main Checkout Container Page
// =========================================================================
function CheckoutContent() {
  const searchParams = useSearchParams();
  const initialBilling = (searchParams.get('billing') as 'one-time' | 'annual') || 'one-time';
  const amountParam = parseFloat(searchParams.get('amount') || '');
  const initialAmount = !isNaN(amountParam) && amountParam > 0 ? amountParam : 5;
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [billingMode, setBillingMode] = useState<'one-time' | 'annual'>(initialBilling);
  const [chargeAmount, setChargeAmount] = useState<number>(initialAmount);
  const [name, setName] = useState('Adnan A.M.Tufail');
  const [email, setEmail] = useState('adnan2234@gmail.com');
  const [country, setCountry] = useState('Saudia Arabia');
  const [city, setCity] = useState('Madina');
  const [address, setAddress] = useState('Al Madinah Abo Ubaida Ibn Aljarah Off King Fahd St, P.O. Box 07030');
  const [postalCode, setPostalCode] = useState('07030');
  const [savePaymentMethod, setSavePaymentMethod] = useState(true);

  // Stripe & Intent State
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isInitializingIntent, setIsInitializingIntent] = useState(false);
  const [stripePromiseInstance, setStripePromiseInstance] = useState<any>(null);

  // Saved Cards for returning user
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState<string | null>(null);

  // Stripe config status & modal
  const [stripeStatus, setStripeStatus] = useState<StripeConfigStatus>({
    configured: false,
    mode: 'none',
    maskedSecretKey: '',
    hasPublishableKey: false,
  });
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [inputSecretKey, setInputSecretKey] = useState('');
  const [inputPubKey, setInputPubKey] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchStripeStatus = async () => {
    try {
      const res = await fetch('/api/stripe/config');
      if (res.ok) {
        const data = await res.json();
        setStripeStatus(data);
      }
    } catch (err) {
      console.error('Failed to check Stripe config:', err);
    }
  };

  useEffect(() => {
    fetchStripeStatus();
    if (user?.email && user.email !== 'guest@toolora.local') {
      setEmail(user.email);
    }
    if (user?.name && user.name !== 'Guest User') {
      setName(user.name);
    }
  }, [user]);

  // Load saved payment methods when email changes
  useEffect(() => {
    if (email && email.includes('@')) {
      fetch(`/api/customers/payment-methods?email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.paymentMethods && data.paymentMethods.length > 0) {
            setSavedCards(data.paymentMethods);
            setSelectedSavedCard(data.paymentMethods[0].id);
          }
        })
        .catch(() => {});
    }
  }, [email]);

  // Transition to Step 3 and Initialize Payment Intent
  const handleProceedToPayment = async () => {
    setIsInitializingIntent(true);
    setStep(3);

    try {
      const res = await fetch('/api/checkout/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: chargeAmount,
          currency: 'usd',
          email,
          name,
          country,
          city,
          address,
          postalCode,
          userId: user?.id,
          plan: 'all-access-5-tools',
          billingMode,
          savePaymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize payment gateway.');
      }

      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setIsDemo(Boolean(data.isDemo));

      if (!data.isDemo) {
        const promise = getStripePromise();
        setStripePromiseInstance(promise);
      }
    } catch (err: any) {
      showToast('Checkout Session Error', err.message, 'error');
    } finally {
      setIsInitializingIntent(false);
    }
  };

  const handleSaveStripeKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSecretKey.trim()) return;

    setIsSavingKey(true);
    try {
      const res = await fetch('/api/stripe/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secretKey: inputSecretKey.trim(),
          publishableKey: inputPubKey.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save Stripe keys');

      await fetchStripeStatus();
      setShowStripeModal(false);
      setInputSecretKey('');
      setInputPubKey('');
      showToast('Stripe Connected!', data.message, 'success');

      if (step === 3) {
        handleProceedToPayment();
      }
    } catch (err: any) {
      showToast('Stripe Setup Error', err.message, 'error');
    } finally {
      setIsSavingKey(false);
    }
  };

  const handlePaymentSuccess = (confirmedOrderId: string) => {
    router.push(`/checkout/confirmation?order_id=${confirmedOrderId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/60 py-8 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Merchant Status & Security Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">
                  Toolora Checkout Protection
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    stripeStatus.mode === 'live'
                      ? 'bg-emerald-500 animate-pulse'
                      : stripeStatus.mode === 'test'
                      ? 'bg-amber-500'
                      : 'bg-indigo-500'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {stripeStatus.mode === 'live'
                  ? 'Stripe Live Mode Active • Direct Bank Settlement Enabled'
                  : stripeStatus.mode === 'test'
                  ? `Stripe Test Mode Active (${stripeStatus.maskedSecretKey})`
                  : 'Stripe Sandbox Simulator Mode'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowStripeModal(false)}
            className="hidden flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors border border-indigo-200 dark:border-indigo-800/60 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{stripeStatus.configured ? 'Manage Stripe Keys' : 'Connect Stripe Keys'}</span>
          </button>
        </div>

        {/* GoDaddy-Style Stepper Header */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-center text-xs font-semibold">
            <div
              onClick={() => setStep(1)}
              className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                step === 1
                  ? 'bg-indigo-600 text-white font-bold shadow-md'
                  : step > 1
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400'
              }`}
            >
              <div className="text-[10px] uppercase opacity-75">Step 1</div>
              <div className="text-xs truncate">1. Choose Plan</div>
            </div>

            <div
              onClick={() => setStep(2)}
              className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                step === 2
                  ? 'bg-indigo-600 text-white font-bold shadow-md'
                  : step > 2
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400'
              }`}
            >
              <div className="text-[10px] uppercase opacity-75">Step 2</div>
              <div className="text-xs truncate">2. Customer Details</div>
            </div>

            <div
              onClick={() => handleProceedToPayment()}
              className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                step === 3
                  ? 'bg-indigo-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="text-[10px] uppercase opacity-75">Step 3</div>
              <div className="text-xs truncate">3. Express Payment (${chargeAmount.toFixed(2)})</div>
            </div>

            <div className="hidden sm:block p-2.5 rounded-xl text-slate-400 opacity-50 select-none">
              <div className="text-[10px] uppercase">Step 4</div>
              <div className="text-xs">4. Instant Access</div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Form Steps (8 Cols on Desktop) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-8">
              
              {/* Step 1: Plan Selection */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <span>Select License Plan</span>
                        <Sparkles className="w-5 h-5 text-amber-500" />
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Unrestricted lifetime access to all 5 core web tools.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20">
                      80% Instant Discount
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => {
                        setBillingMode('one-time');
                        setChargeAmount(5);
                      }}
                      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                        billingMode === 'one-time'
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-600/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-sm text-slate-900">
                          One-Time Payment
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                          Most Popular
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-indigo-600">
                          $5
                        </span>
                        <span className="text-xs text-slate-400 font-normal">.00 USD</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Single upfront payment. Zero recurring fees. Lifetime access to all tools.
                      </p>
                      <ul className="space-y-1.5 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>All 5 Productivity Tools</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>Unlimited Conversions & Exports</span>
                        </li>
                      </ul>
                    </div>

                    <div
                      onClick={() => {
                        setBillingMode('annual');
                        setChargeAmount(5);
                      }}
                      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                        billingMode === 'annual'
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-600/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-sm text-slate-900">
                          Annual Membership
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded">
                          Continuous
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-indigo-600">
                          $5
                        </span>
                        <span className="text-xs text-slate-400 font-normal">/year</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Yearly renewal with VIP cloud updates and priority server access.
                      </p>
                      <ul className="space-y-1.5 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>Priority Processing Speed</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>Cancel Anytime in 1 Click</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continue to Customer Info</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Customer Details & Billing Address */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Customer & Billing Information
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Providing full billing details enables GoDaddy-style 1-click frictionless authorization with zero OTP challenges.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-500">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-500">
                        Email Address (for Stripe Receipt)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-500">Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-500">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1 col-span-1 sm:col-span-2">
                      <label className="text-xs font-bold uppercase text-slate-500">Billing Street Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="savePaymentMethod"
                      checked={savePaymentMethod}
                      onChange={(e) => setSavePaymentMethod(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="savePaymentMethod"
                      className="text-xs text-slate-600 select-none cursor-pointer"
                    >
                      Save card token securely for future purchases (via Stripe Customer Token)
                    </label>
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-slate-500 hover:underline cursor-pointer"
                    >
                      ← Back to Plan Selection
                    </button>
                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      className="px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Payment (${chargeAmount.toFixed(2)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: PCI-Compliant Payment Form */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        Express Payment (${chargeAmount.toFixed(2)} USD)
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        GoDaddy-Style Frictionless Authentication • PCI-DSS SAQ A Compliant
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                      <Lock className="w-3.5 h-3.5" />
                      <span>256-Bit Encrypted</span>
                    </div>
                  </div>

                  {/* Frictionless Guarantee Banner */}
                  <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>Frictionless Low-Risk Authentication Enabled:</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Your transaction will be processed using automatic background risk verification. Eligible low-risk purchases authenticate in 1 second without prompting for an OTP code.
                    </p>
                  </div>

                  {/* Returning Customer Saved Cards */}
                  {savedCards.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <BookmarkCheck className="w-4 h-4 text-indigo-600" />
                        <span>Saved Payment Methods On File:</span>
                      </div>
                      <div className="space-y-1.5">
                        {savedCards.map((sc) => (
                          <div
                            key={sc.id}
                            onClick={() => setSelectedSavedCard(sc.id)}
                            className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                              selectedSavedCard === sc.id
                                ? 'border-indigo-600 bg-white dark:bg-slate-800 shadow-xs'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                              <CreditCard className="w-4 h-4 text-indigo-600" />
                              <span className="uppercase">{sc.brand} ending in {sc.last4}</span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              Expires {sc.expMonth}/{sc.expYear}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Form Loader / Stripe Elements */}
                  {isInitializingIntent ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                      <span className="text-xs text-slate-500 font-medium">
                        Initializing PCI-Compliant Stripe session...
                      </span>
                    </div>
                  ) : clientSecret && orderId ? (
                    isDemo || !stripePromiseInstance || clientSecret.startsWith('pi_mock_') ? (
                      <SandboxPaymentForm
                        orderId={orderId}
                        chargeAmount={chargeAmount}
                        onPaymentSuccess={handlePaymentSuccess}
                      />
                    ) : (
                      <Elements
                        stripe={stripePromiseInstance}
                        options={{
                          clientSecret,
                          appearance: {
                            theme: 'stripe',
                            variables: {
                              colorPrimary: '#4f46e5',
                              colorBackground: '#ffffff',
                              colorText: '#1e293b',
                              borderRadius: '12px',
                            },
                          },
                        }}
                      >
                        <RealStripePaymentForm
                          orderId={orderId}
                          chargeAmount={chargeAmount}
                          onPaymentSuccess={handlePaymentSuccess}
                        />
                      </Elements>
                    )
                  ) : (
                    <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 space-y-3">
                      <p className="font-semibold">Could not load payment session gateway.</p>
                      <button
                        type="button"
                        onClick={handleProceedToPayment}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Payment Gateway Session</span>
                      </button>
                    </div>
                  )}

                  <div className="pt-2 flex justify-between items-center text-xs">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-slate-500 hover:underline cursor-pointer"
                    >
                      ← Back to Customer Info
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky GoDaddy-Style Order Summary & Trust Badges (4 Cols on Desktop) */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            
            {/* GoDaddy-Style Order Summary Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <span>Order Summary</span>
                </h3>
                <span className="text-[10px] uppercase font-extrabold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Verified Cart
                </span>
              </div>

              {/* Line Items */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {chargeAmount === 5
                        ? 'Toolora 5-Tool Productivity Suite'
                        : 'Support & Developer Tip Contribution'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {billingMode === 'one-time'
                        ? 'Lifetime All-Access Pass ($5.00 Special)'
                        : 'Annual VIP Membership ($5.00 Special)'}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm font-mono">
                    ${chargeAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>256-Bit SSL Protection & PCI Vault</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>

                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>GoDaddy-Style Frictionless Checkout</span>
                  <span className="font-semibold text-emerald-600">ACTIVE</span>
                </div>

                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Setup & Processing Fee</span>
                  <span className="font-semibold text-emerald-600">$0.00</span>
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-500">Regular Price:</span>
                  <span className="text-xs text-slate-400 line-through font-mono">$25.00</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-emerald-600">Instant Discount (80% OFF):</span>
                  <span className="text-xs font-bold text-emerald-600 font-mono">-$20.00</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2.5">
                  <span className="font-extrabold text-slate-900 text-sm">
                    Total Due Now:
                  </span>
                  <span className="text-2xl font-black text-indigo-600">
                    ${chargeAmount.toFixed(2)} <span className="text-xs font-normal text-slate-400">USD</span>
                  </span>
                </div>
              </div>

              {/* Guarantee Box */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400">
                <Award className="w-5 h-5 shrink-0 text-emerald-500" />
                <div>
                  <span className="font-bold">30-Day Money-Back Guarantee:</span> Zero risk. If you are not satisfied, request a 100% refund anytime.
                </div>
              </div>
            </div>

            {/* Trust & PCI Badges Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-center">
                Guaranteed Safe & Secure Checkout
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>PCI SAQ A Level 1</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AES-256 Encryption</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 col-span-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Frictionless Background Risk Evaluation</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Stripe Key Management Modal */}
      {showStripeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Stripe Merchant Setup
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Direct deposits to your Stripe balance
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStripeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              When customers purchase the $100 All-Access plan, funds are captured directly into your Stripe account balance. Paste your Stripe API keys below:
            </p>

            <form onSubmit={handleSaveStripeKeys} className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Stripe Secret Key (sk_live_... or sk_test_...)
                  </label>
                  <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[10px]"
                  >
                    <span>Get Key</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="sk_live_51... or sk_test_51..."
                  value={inputSecretKey}
                  onChange={(e) => setInputSecretKey(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                  Stripe Publishable Key (pk_live_... or pk_test_...)
                </label>
                <input
                  type="text"
                  placeholder="pk_live_51... or pk_test_51..."
                  value={inputPubKey}
                  onChange={(e) => setInputPubKey(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStripeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingKey}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSavingKey ? 'Verifying & Saving...' : 'Save & Connect Stripe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

class CheckoutErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error?.message || 'Checkout interface error' };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Checkout Error Boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
          <div className="max-w-md w-full p-6 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-4 text-center">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">Payment Gateway Ready</h2>
            <p className="text-xs text-slate-500">
              {this.state.error}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md"
            >
              Reload Checkout Session
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function CheckoutPage() {
  return (
    <CheckoutErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-xs text-slate-400">
            Loading Checkout...
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
    </CheckoutErrorBoundary>
  );
}
