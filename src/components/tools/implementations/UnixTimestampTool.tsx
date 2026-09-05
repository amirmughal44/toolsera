'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Copy, Check } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useToast } from '@/lib/context/ToastContext';

export function UnixTimestampTool({ tool }: { tool: ToolDefinition }) {
  const [currentEpoch, setCurrentEpoch] = useState(Math.floor(Date.now() / 1000));
  const [inputEpoch, setInputEpoch] = useState(Math.floor(Date.now() / 1000).toString());
  const [inputDate, setInputDate] = useState(new Date().toISOString().slice(0, 16));
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const epochNum = parseInt(inputEpoch, 10);
  const isEpochValid = !isNaN(epochNum);
  const parsedDate = isEpochValid
    ? new Date(epochNum > 10000000000 ? epochNum : epochNum * 1000)
    : null;

  const dateEpochVal = Math.floor(new Date(inputDate).getTime() / 1000);

  const copyCurrent = () => {
    navigator.clipboard.writeText(currentEpoch.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied!', `${currentEpoch} copied to clipboard.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Live current clock */}
      <div className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-600 text-white shrink-0">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-indigo-700 dark:text-indigo-300">
              Current Unix Epoch Timestamp
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
              {currentEpoch}
            </div>
          </div>
        </div>

        <button
          onClick={copyCurrent}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5 shadow-md shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Timestamp'}</span>
        </button>
      </div>

      {/* Epoch to Human Date */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200 dark:border-slate-700 space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          1. Convert Unix Epoch to Human Date
        </label>
        <input
          type="text"
          value={inputEpoch}
          onChange={(e) => setInputEpoch(e.target.value)}
          placeholder="Enter timestamp (seconds or milliseconds)"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-sm outline-none"
        />

        {parsedDate && !isNaN(parsedDate.getTime()) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 uppercase font-mono text-[10px]">GMT / UTC</span>
              <div className="font-semibold text-slate-900 dark:text-white mt-1">
                {parsedDate.toUTCString()}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 uppercase font-mono text-[10px]">Your Local Time</span>
              <div className="font-semibold text-slate-900 dark:text-white mt-1">
                {parsedDate.toString()}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-rose-500">Invalid Unix epoch value.</p>
        )}
      </div>

      {/* Date to Epoch */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200 dark:border-slate-700 space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          2. Convert Human Date to Unix Epoch
        </label>
        <input
          type="datetime-local"
          value={inputDate}
          onChange={(e) => setInputDate(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
        />

        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-mono">Epoch Seconds</span>
            <div className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 mt-0.5">
              {dateEpochVal}
            </div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(dateEpochVal.toString());
              showToast('Copied', dateEpochVal.toString(), 'success');
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
