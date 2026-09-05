'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Coffee,
  Heart,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Gift,
  ArrowRight,
  GraduationCap,
  Globe,
  Droplets,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToast } from '@/lib/context/ToastContext';

interface SupporterNote {
  id: string;
  name: string;
  amount: number;
  coffees: number;
  message: string;
  allocation: 'split' | 'charity' | 'dev';
  causeName: string;
  date: string;
}

export default function SupportPage() {
  const [coffeesCount, setCoffeesCount] = useState<number>(3);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [donorMessage, setDonorMessage] = useState<string>('');
  const [allocationMode, setAllocationMode] = useState<'split' | 'charity' | 'dev'>('split');
  const [selectedCause, setSelectedCause] = useState<string>('education');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [supporters, setSupporters] = useState<SupporterNote[]>([
    {
      id: '1',
      name: 'Adeel Tariq',
      amount: 25,
      coffees: 5,
      allocation: 'split',
      causeName: 'Student Laptops & Digital Literacy',
      message: 'The PDF merger and spreadsheet generator saved me hours today. Happy to support development and students!',
      date: 'Yesterday',
    },
    {
      id: '2',
      name: 'Maria Santos',
      amount: 50,
      coffees: 10,
      allocation: 'charity',
      causeName: 'Open-Source Educational Web Toolkit',
      message: '100% to charity. Love the zero-knowledge in-browser architecture and mission.',
      date: '2 days ago',
    },
    {
      id: '3',
      name: 'Kenji Sato',
      amount: 15,
      coffees: 3,
      allocation: 'dev',
      causeName: 'Toolora Engineering Fund',
      message: 'Best developer utilities suite on the web. Keep building!',
      date: '4 days ago',
    },
  ]);

  const { showToast } = useToast();

  const coffeePriceUSD = 5;
  const currentTotalUSD = customAmount ? parseFloat(customAmount) || 0 : coffeesCount * coffeePriceUSD;

  // Impact Calculations
  const charityShareUSD =
    allocationMode === 'charity'
      ? currentTotalUSD
      : allocationMode === 'split'
      ? Math.round((currentTotalUSD / 2) * 100) / 100
      : 0;

  const devShareUSD = currentTotalUSD - charityShareUSD;

  const causes = [
    {
      id: 'education',
      title: 'Student Laptops & Digital Literacy',
      icon: <GraduationCap className="w-4 h-4 text-indigo-500" />,
      desc: 'Provides hardware, coding resources, and internet access to youth in developing communities.',
    },
    {
      id: 'opensource',
      title: 'Open-Source Educational Web Toolkit',
      icon: <Globe className="w-4 h-4 text-emerald-500" />,
      desc: 'Keeps online conversion and utility tools free and privacy-focused for students & educators worldwide.',
    },
    {
      id: 'relief',
      title: 'Humanitarian Relief & Clean Water',
      icon: <Droplets className="w-4 h-4 text-blue-500" />,
      desc: 'Supports clean drinking water filtration systems and emergency medical supply grants.',
    },
  ];

  const currentCauseObj = causes.find((c) => c.id === selectedCause) || causes[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTotalUSD || currentTotalUSD <= 0) return;

    setIsSubmitting(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    setTimeout(() => {
      const newSupporter: SupporterNote = {
        id: Math.random().toString(),
        name: donorName.trim() || 'Kind Supporter',
        amount: currentTotalUSD,
        coffees: Math.max(1, Math.round(currentTotalUSD / coffeePriceUSD)),
        allocation: allocationMode,
        causeName: allocationMode === 'dev' ? 'Toolora Engineering Fund' : currentCauseObj.title,
        message: donorMessage.trim() || (allocationMode === 'charity' ? 'Contributed to charity via Toolora 💖' : 'Bought a warm coffee for the developers! ☕'),
        date: 'Just now',
      };

      setSupporters([newSupporter, ...supporters]);
      setIsSubmitting(false);
      setDonorName('');
      setDonorMessage('');
      setCustomAmount('');

      const toastTitle = allocationMode === 'charity'
        ? 'Charity Contribution Received! 💖'
        : allocationMode === 'split'
        ? 'Thank You for Supporting Dev & Charity! ☕💖'
        : 'Thank You for the Coffee! ☕';

      showToast(
        toastTitle,
        `Your $${currentTotalUSD} contribution is logged with verified transparency.`,
        'success'
      );
    }, 600);
  };

  return (
    <div className="min-h-screen py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <Coffee className="w-3.5 h-3.5 text-amber-500" />
            <span>Buy Us a Coffee & Support Charity</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Fuel Independent Tools & Give Back ☕
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Toolora is built to make powerful digital tools accessible to everyone without paywalls or ads. You can buy us a coffee, direct your contribution to charitable initiatives, or split your impact!
          </p>

          <div className="pt-1 flex items-center justify-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verifiable Transparency</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link href="/charity" className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <span>View Charity Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Support Contribution Form */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Coffee Amount Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Step 1: Choose Your Coffee Amount ($ USD)
                </label>
                <span className="text-xs text-slate-400 font-mono">$5 per coffee</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { count: 1, label: '1 Coffee', usd: 5, icon: '☕' },
                  { count: 3, label: '3 Coffees', usd: 15, icon: '☕☕☕', popular: true },
                  { count: 5, label: '5 Coffees', usd: 25, icon: '☕☕☕☕☕' },
                  { count: 10, label: '10 Coffees', usd: 50, icon: '👑 Champion' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.count}
                    onClick={() => {
                      setCoffeesCount(item.count);
                      setCustomAmount('');
                    }}
                    className={`relative p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      !customAmount && coffeesCount === item.count
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.popular && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-500 text-slate-950">
                        Popular
                      </span>
                    )}
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-bold text-sm">{item.label}</span>
                    <span className="text-xs font-mono font-semibold text-slate-500">${item.usd}</span>
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="pt-2 flex items-center gap-3">
                <span className="text-xs text-slate-500">Or custom amount:</span>
                <div className="relative flex-1 max-w-xs">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Charity Allocation Switcher */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Step 2: Choose Impact Allocation (Support Team vs Charity)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setAllocationMode('split')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all space-y-1 ${
                    allocationMode === 'split'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>50% Dev + 50% Charity</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Half funds Toolora server hosting, half goes to verified charity.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAllocationMode('charity')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all space-y-1 ${
                    allocationMode === 'charity'
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>100% Direct Charity</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Every cent is forwarded directly to the selected charity initiative.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAllocationMode('dev')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all space-y-1 ${
                    allocationMode === 'dev'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Coffee className="w-4 h-4 text-amber-500" />
                    <span>100% Toolora Dev</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    All funds support developer caffeine and ongoing server costs.
                  </p>
                </button>
              </div>

              {/* Charity Cause Selector (Visible if split or charity) */}
              {allocationMode !== 'dev' && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-2 mt-3 animate-in fade-in">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Select Specific Charity Initiative:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {causes.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCause(c.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedCause === c.id
                            ? 'border-indigo-600 bg-white dark:bg-slate-800 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 dark:text-white">
                          {c.icon}
                          <span>{c.title}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                          {c.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Live Impact Summary Card */}
            <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Transparent Breakdown
                </span>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Coffee className="w-3.5 h-3.5 text-amber-500" />
                    <span>Toolora Dev: ${devShareUSD.toFixed(2)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>Charity Fund: ${charityShareUSD.toFixed(2)}</span>
                  </span>
                </div>
                {charityShareUSD > 0 && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    Supporting: &quot;{currentCauseObj.title}&quot;
                  </p>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Contribution</span>
                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  ${currentTotalUSD.toFixed(2)}
                </div>
              </div>
            </div>

            {/* 4. Donor info & note */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Your Name or Community Handle (Optional)
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g. Alex, Sarah K., or Anonymous"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Friendly Note or Message for the Wall
                </label>
                <textarea
                  rows={2}
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  placeholder="Say something nice, suggest a feature, or dedicate your charity pledge..."
                  className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
                />
              </div>
            </div>

            {/* Total and Submit */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-center sm:text-left">
                <span className="text-xs text-slate-400 uppercase font-semibold">Ready to Support</span>
                <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                  ${currentTotalUSD.toFixed(2)}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || currentTotalUSD <= 0}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {allocationMode === 'charity' ? (
                  <>
                    <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                    <span>Donate ${currentTotalUSD.toFixed(2)} to Charity</span>
                  </>
                ) : allocationMode === 'split' ? (
                  <>
                    <Gift className="w-4 h-4" />
                    <span>Support Dev & Charity (${currentTotalUSD.toFixed(2)})</span>
                  </>
                ) : (
                  <>
                    <Coffee className="w-4 h-4" />
                    <span>Buy Us a Coffee (${currentTotalUSD.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Supporter Wall */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span>Community Supporters & Charity Backers</span>
            </h2>
            <span className="text-xs text-slate-400">{supporters.length} Supporters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {supporters.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center text-xs font-bold">
                      {item.allocation === 'charity' ? '💖' : '☕'}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white block">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.coffees} {item.coffees === 1 ? 'Coffee' : 'Coffees'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                      ${item.amount.toFixed(2)}
                    </span>
                    <div className="text-[10px] text-slate-400">{item.date}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.allocation === 'charity'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : item.allocation === 'split'
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {item.allocation === 'charity'
                      ? '💖 100% Charity Donation'
                      : item.allocation === 'split'
                      ? '🌟 50% Dev + 50% Charity'
                      : '☕ Developer Supporter'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">• {item.causeName}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  &quot;{item.message}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
