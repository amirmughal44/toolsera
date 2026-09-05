'use client';

import React, { useState } from 'react';
import { CalendarClock, Copy, Check } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useToast } from '@/lib/context/ToastContext';

export function CronGeneratorTool({ tool }: { tool: ToolDefinition }) {
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [dayOfMonth, setDayOfMonth] = useState('*');
  const [month, setMonth] = useState('*');
  const [dayOfWeek, setDayOfWeek] = useState('*');
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const cronExpr = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  const getHumanReadable = () => {
    if (cronExpr === '* * * * *') return 'Runs every single minute.';
    if (minute.startsWith('*/') && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      return `Runs every ${minute.replace('*/', '')} minutes.`;
    }
    if (minute === '0' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      return 'Runs at the beginning of every hour (minute 0).';
    }
    if (minute === '0' && hour === '0' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      return 'Runs every day at midnight (00:00).';
    }
    if (minute === '0' && hour === '9' && dayOfWeek === '1-5') {
      return 'Runs at 09:00 AM every weekday (Monday through Friday).';
    }
    return `Custom schedule: Minute (${minute}), Hour (${hour}), Day (${dayOfMonth}), Month (${month}), Weekday (${dayOfWeek}).`;
  };

  const copyCron = () => {
    navigator.clipboard.writeText(cronExpr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied!', `${cronExpr} copied to clipboard.`, 'success');
  };

  const presets = [
    { label: 'Every minute', m: '*', h: '*', d: '*', mon: '*', dow: '*' },
    { label: 'Every 15 minutes', m: '*/15', h: '*', d: '*', mon: '*', dow: '*' },
    { label: 'Every hour', m: '0', h: '*', d: '*', mon: '*', dow: '*' },
    { label: 'Daily at midnight', m: '0', h: '0', d: '*', mon: '*', dow: '*' },
    { label: 'Weekdays at 9 AM', m: '0', h: '9', d: '*', mon: '*', dow: '1-5' },
    { label: '1st of every month', m: '0', h: '0', d: '1', mon: '*', dow: '*' },
  ];

  return (
    <div className="space-y-6">
      {/* Expression result banner */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
            Standard 5-Field Cron Expression
          </span>
          <div className="text-3xl font-extrabold font-mono tracking-widest text-cyan-300">
            {cronExpr}
          </div>
          <p className="text-xs text-slate-400 mt-1">{getHumanReadable()}</p>
        </div>

        <button
          onClick={copyCron}
          className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-indigo-950 bg-white hover:bg-slate-100 flex items-center gap-1.5 shadow-md shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied' : 'Copy Cron'}</span>
        </button>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase text-slate-500">Popular Presets</span>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setMinute(p.m);
                setHour(p.h);
                setDayOfMonth(p.d);
                setMonth(p.mon);
                setDayOfWeek(p.dow);
              }}
              className="px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:border-indigo-500"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Configuration Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Minute</label>
          <select
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono outline-none"
          >
            <option value="*">Every minute (*)</option>
            <option value="*/5">Every 5 min (*/5)</option>
            <option value="*/10">Every 10 min (*/10)</option>
            <option value="*/15">Every 15 min (*/15)</option>
            <option value="*/30">Every 30 min (*/30)</option>
            <option value="0">At min 0</option>
            <option value="30">At min 30</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Hour</label>
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono outline-none"
          >
            <option value="*">Every hour (*)</option>
            <option value="*/2">Every 2 hours (*/2)</option>
            <option value="*/6">Every 6 hours (*/6)</option>
            <option value="0">Midnight (0)</option>
            <option value="6">06:00 AM (6)</option>
            <option value="9">09:00 AM (9)</option>
            <option value="12">12:00 PM (12)</option>
            <option value="18">06:00 PM (18)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Day of Month</label>
          <select
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono outline-none"
          >
            <option value="*">Every day (*)</option>
            <option value="1">1st of month (1)</option>
            <option value="15">15th of month (15)</option>
            <option value="*/2">Every 2nd day (*/2)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono outline-none"
          >
            <option value="*">Every month (*)</option>
            <option value="1">January (1)</option>
            <option value="3">March (3)</option>
            <option value="6">June (6)</option>
            <option value="12">December (12)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Day of Week</label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono outline-none"
          >
            <option value="*">Every day (*)</option>
            <option value="1-5">Weekdays Mon-Fri (1-5)</option>
            <option value="0,6">Weekends Sun,Sat (0,6)</option>
            <option value="1">Monday only (1)</option>
            <option value="5">Friday only (5)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
