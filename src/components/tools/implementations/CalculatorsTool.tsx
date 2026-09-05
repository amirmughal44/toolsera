'use client';

import React, { useState } from 'react';
import { DollarSign, Percent, Calculator, ArrowRight } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';

export function CalculatorsTool({ tool }: { tool: ToolDefinition }) {
  const [calcTab, setCalcTab] = useState<'emi' | 'percentage'>('emi');
  const [currency, setCurrency] = useState<string>('$');

  // EMI State
  const [loanAmount, setLoanAmount] = useState<number>(50000);
  const [interestRate, setInterestRate] = useState<number>(7.5);
  const [tenureYears, setTenureYears] = useState<number>(5);

  // Percentage State
  const [pctVal, setPctVal] = useState<number>(15);
  const [totalVal, setTotalVal] = useState<number>(2500);

  // Discount State
  const [originalPrice, setOriginalPrice] = useState<number>(500);
  const [discountPct, setDiscountPct] = useState<number>(20);

  // Calculate EMI: P * r * (1+r)^n / ((1+r)^n - 1)
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = tenureYears * 12;
  const emi =
    loanAmount && interestRate && tenureYears
      ? Math.round(
          (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1)
        )
      : 0;

  const totalPayment = emi * totalMonths;
  const totalInterest = totalPayment - loanAmount;

  // Percentage calculation
  const calculatedPercentage = (pctVal / 100) * totalVal;

  // Discount calculation
  const discountSavings = (discountPct / 100) * originalPrice;
  const finalDiscountedPrice = originalPrice - discountSavings;

  return (
    <div className="space-y-6">
      {/* Top Controls: Tabs + Currency Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCalcTab('emi')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              calcTab === 'emi'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Loan & EMI Calculator</span>
          </button>

          <button
            onClick={() => setCalcTab('percentage')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              calcTab === 'percentage'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>Percentage & Discount</span>
          </button>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <span className="text-[10px] text-slate-400 px-1.5 uppercase">Currency:</span>
          {['$', '€', '£', 'PKR'].map((cur) => (
            <button
              key={cur}
              type="button"
              onClick={() => setCurrency(cur)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                currency === cur
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {cur}
            </button>
          ))}
        </div>
      </div>

      {calcTab === 'emi' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Inputs */}
          <div className="md:col-span-7 space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Loan Principal Amount</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {currency} {loanAmount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="1000000"
                step="5000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Annual Interest Rate (%)</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{interestRate}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Tenure in Years</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{tenureYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          {/* EMI Results Card */}
          <div className="md:col-span-5 p-6 rounded-3xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Monthly EMI Payment</span>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {currency} {emi.toLocaleString()}
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Principal Loan:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currency} {loanAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Interest Payable:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {currency} {Math.max(0, totalInterest).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Payment (Principal + Interest):</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currency} {Math.max(0, totalPayment).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Percentage */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              What is X% of Y?
            </h4>
            <div className="flex items-center gap-2 text-sm">
              <span>What is</span>
              <input
                type="number"
                value={pctVal}
                onChange={(e) => setPctVal(parseFloat(e.target.value) || 0)}
                className="w-20 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-bold text-indigo-600"
              />
              <span>% of</span>
              <input
                type="number"
                value={totalVal}
                onChange={(e) => setTotalVal(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-bold text-slate-900 dark:text-white"
              />
              <span>?</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-400 font-medium">Result:</span>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {calculatedPercentage.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Discount & Savings */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Discount & Sale Price Calculator
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">Original Price ({currency})</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">Discount (%)</label>
                <input
                  type="number"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  Final Sale Price
                </span>
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {currency} {finalDiscountedPrice.toLocaleString()}
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <span>You Save:</span>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {currency} {discountSavings.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
