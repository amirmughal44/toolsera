'use client';

import React, { useState } from 'react';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';

export function RegexTesterTool({ tool }: { tool: ToolDefinition }) {
  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [flags, setFlags] = useState({ g: true, i: true, m: false });
  const [testText, setTestText] = useState(
    'Contact our team at support@toolora.com or sales@enterprise.co for questions regarding our platform.'
  );

  const flagString = `${flags.g ? 'g' : ''}${flags.i ? 'i' : ''}${flags.m ? 'm' : ''}`;

  let matches: RegExpMatchArray[] = [];
  let errorMsg: string | null = null;

  try {
    if (pattern) {
      const regex = new RegExp(pattern, flagString);
      if (flags.g) {
        matches = Array.from(testText.matchAll(regex));
      } else {
        const m = testText.match(regex);
        if (m) matches = [m];
      }
    }
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : 'Invalid Regular Expression';
  }

  const presets = [
    { label: 'Email Address', pat: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { label: 'URL / Web Link', pat: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)' },
    { label: 'IPv4 Address', pat: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
    { label: 'Hex Color', pat: '#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})' },
  ];

  return (
    <div className="space-y-6">
      {/* Pattern & Flags input */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-semibold uppercase text-slate-500">
            Regular Expression Pattern
          </label>
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-500">Flags:</span>
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={flags.g}
                onChange={(e) => setFlags({ ...flags, g: e.target.checked })}
                className="accent-indigo-600 rounded"
              />
              <span className="font-mono font-bold">g (global)</span>
            </label>
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={flags.i}
                onChange={(e) => setFlags({ ...flags, i: e.target.checked })}
                className="accent-indigo-600 rounded"
              />
              <span className="font-mono font-bold">i (ignore case)</span>
            </label>
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={flags.m}
                onChange={(e) => setFlags({ ...flags, m: e.target.checked })}
                className="accent-indigo-600 rounded"
              />
              <span className="font-mono font-bold">m (multiline)</span>
            </label>
          </div>
        </div>

        <div className="relative">
          <span className="absolute left-3.5 top-2.5 font-mono text-slate-400 font-bold">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="w-full pl-7 pr-14 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-sm outline-none focus:border-indigo-500"
          />
          <span className="absolute right-3.5 top-2.5 font-mono text-slate-400 font-bold">
            /{flagString}
          </span>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-slate-400">Presets:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setPattern(p.pat)}
              className="px-2.5 py-0.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {errorMsg ? (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>Valid Pattern • Found {matches.length} matches</span>
        </div>
      )}

      {/* Test String */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase text-slate-500">Test String</label>
        <textarea
          rows={5}
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono outline-none focus:border-indigo-500 leading-relaxed"
        />
      </div>

      {/* Matches List */}
      {matches.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-500">Extracted Matches</span>
          <div className="flex flex-wrap gap-2">
            {matches.map((m, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
              >
                Match #{idx + 1}: &quot;{m[0]}&quot; {m.index !== undefined ? `(at index ${m.index})` : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
