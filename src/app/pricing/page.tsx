'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Sparkles, HelpCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export default function PricingPage() {
  const [billingType, setBillingType] = useState<'one-time' | 'annual'>('one-time');
  const { isAllAccess } = useAuth();

  const faqs = [
    {
      q: 'What is included in the $5 All-Access Plan?',
      a: 'The $5 plan unlocks full unrestricted access to all 5 core tools: PDF Merger, Smart Spreadsheet Engine, Image Compressor, Custom QR Studio, and Developer JSON Formatter with unlimited conversions.',
    },
    {
      q: 'Is the $5 payment one-time or recurring?',
      a: 'You can choose either a One-Time Payment for unlimited access or an Annual Subscription. We explicitly state our pricing terms with zero hidden fees.',
    },
    {
      q: 'What payment methods do you support?',
      a: 'We support all major credit/debit cards (Visa, Mastercard, Amex), PayPal, wire transfers, and cryptocurrency (USDT, BTC) with instant entitlement activation.',
    },
    {
      q: 'Can I use Toolora for free without entering a card?',
      a: 'Yes, our Free plan is available indefinitely with 5 free daily conversions and zero registration required.',
    },
  ];

  return (
    <div className="min-h-screen py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Honest & Transparent Pricing</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            5 Essential Tools. Simple $5 Pricing.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Get unrestricted access to the 5 core client-side productivity utilities for one simple $5 payment.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setBillingType('one-time')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  billingType === 'one-time'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                One-Time Payment ($5)
              </button>
              <button
                onClick={() => setBillingType('annual')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  billingType === 'annual'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Annual Subscription ($5/yr)
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Free Plan */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Free Tier</span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  Starter Access
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Essential access for occasional file conversions and quick calculations.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
                <span className="text-xs text-slate-500">/ forever</span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Access to all 5 core tools</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>5 conversions per day</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Up to 15MB file size limit</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Standard browser processing queue</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>100% private zero-knowledge execution</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/tools"
                className="w-full py-3 rounded-xl font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>Start Free</span>
              </Link>
            </div>
          </div>

          {/* All-Access Plan */}
          <div className="relative p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-600 shadow-2xl shadow-indigo-600/10 flex flex-col justify-between">
            {/* Highlight Ribbon */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white bg-indigo-600 shadow-md">
              Most Popular • All 5 Tools Included
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Toolora All-Access
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  Complete 5-Tool Suite
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  &quot;Unlock all 5 tools for $5 with unrestricted lifetime batch power.&quot;
                </p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
                  $5
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {billingType === 'one-time' ? '/ One-Time Payment' : '/ Annual Subscription'}
                </span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                <li className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>PDF Merger: Unlimited multi-document merging</span>
                </li>
                <li className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Smart Spreadsheet: Formulas, templates & XLSX export</span>
                </li>
                <li className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Image Compressor: High-ratio canvas optimization</span>
                </li>
                <li className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Custom QR Studio: High-res vector SVG & PNG</span>
                </li>
                <li className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>JSON Formatter: Instant syntax validation & minify</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Unlimited daily conversions with no caps</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Priority in-browser processing queue</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href={`/checkout?plan=all-access&billing=${billingType}&amount=5`}
                className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
              >
                <span>
                  {isAllAccess ? 'Manage All-Access Membership' : 'Get All 5 Tools — $5'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Instant entitlement activation • Printable receipt included
              </p>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-4xl mx-auto pt-10 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">
            Plan Feature Comparison
          </h2>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-500">
                  <th className="p-4 font-bold">Feature</th>
                  <th className="p-4 font-bold">Free Plan</th>
                  <th className="p-4 font-bold text-indigo-600 dark:text-indigo-400">
                    All-Access ($5)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-4 font-medium">Daily Operations</td>
                  <td className="p-4 text-slate-500">5 files/day</td>
                  <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Maximum File Size</td>
                  <td className="p-4 text-slate-500">15 MB</td>
                  <td className="p-4 font-bold text-indigo-600 dark:text-indigo-400">150 MB</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Zero-Knowledge Security</td>
                  <td className="p-4 text-emerald-600">✓ In-browser</td>
                  <td className="p-4 text-emerald-600 font-bold">✓ In-browser</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Batch File Processing</td>
                  <td className="p-4 text-slate-400">No</td>
                  <td className="p-4 font-bold text-emerald-600">Yes (Multi-file)</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Advanced PDF Stamping & Watermarking</td>
                  <td className="p-4 text-slate-400">No</td>
                  <td className="p-4 font-bold text-emerald-600">Included</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Priority Queue</td>
                  <td className="p-4 text-slate-500">Standard</td>
                  <td className="p-4 font-bold text-indigo-600">Instant Priority</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto pt-8 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">
            Frequently Asked Pricing Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5"
              >
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
