'use client';

import React, { useState } from 'react';
import { Type, Copy, Check } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useToast } from '@/lib/context/ToastContext';

export function CaseConverterTool({ tool }: { tool: ToolDefinition }) {
  const [text, setText] = useState('Convert your text into multiple case formats effortlessly!');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { showToast } = useToast();

  const toUppercase = () => text.toUpperCase();
  const toLowercase = () => text.toLowerCase();
  const toTitleCase = () =>
    text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  const toSentenceCase = () =>
    text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  const toCamelCase = () =>
    text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '');
  const toSnakeCase = () =>
    text
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '_')
      .replace(/^_+|_+$/g, '');
  const toKebabCase = () =>
    text
      .toLowerCase()
      .trim()
      .replace(/[\s\W_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  const toSlug = () =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const formats = [
    { label: 'UPPERCASE', getVal: toUppercase, id: 'upper' },
    { label: 'lowercase', getVal: toLowercase, id: 'lower' },
    { label: 'Title Case', getVal: toTitleCase, id: 'title' },
    { label: 'Sentence case', getVal: toSentenceCase, id: 'sentence' },
    { label: 'camelCase', getVal: toCamelCase, id: 'camel' },
    { label: 'snake_case', getVal: toSnakeCase, id: 'snake' },
    { label: 'kebab-case', getVal: toKebabCase, id: 'kebab' },
    { label: 'SEO URL-slug', getVal: toSlug, id: 'slug' },
  ];

  const applyFormat = (formattedVal: string) => {
    setText(formattedVal);
  };

  const copyVal = (val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
    showToast('Copied to Clipboard!', val, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase text-slate-500">
          Enter Text to Convert
        </label>
        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text..."
          className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-indigo-500 leading-relaxed"
        />
      </div>

      {/* Conversion Cards & Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {formats.map((fmt) => {
          const val = fmt.getVal();
          return (
            <div
              key={fmt.id}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{fmt.label}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => applyFormat(val)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Apply to input
                  </button>
                  <button
                    onClick={() => copyVal(val, fmt.id)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Copy"
                  >
                    {copiedKey === fmt.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="font-mono text-xs text-slate-900 dark:text-slate-100 truncate p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {val || '<empty>'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
