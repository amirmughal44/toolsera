'use client';

import React, { useState } from 'react';
import { Type, Copy, Trash2, Clock, Volume2 } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useToast } from '@/lib/context/ToastContext';

export function TextStatsTool({ tool }: { tool: ToolDefinition }) {
  const [text, setText] = useState(
    `Toolora is an all-in-one commercial utility platform where creators, developers, and digital professionals can convert files, edit PDFs, generate spreadsheets, compress images, and optimize websites directly in their browser with zero-knowledge security.\n\nEverything is engineered for speed, privacy, and simplicity.`
  );
  const { showToast } = useToast();

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charsWithSpaces = text.length;
  const charsWithoutSpaces = text.replace(/\s+/g, '').length;
  const sentences = text.trim() ? text.split(/[.!?]+/).filter(Boolean).length : 0;
  const paragraphs = text.trim() ? text.split(/\n+/).filter(Boolean).length : 0;

  // Average reading speed: 200 words/min; Speaking speed: 130 words/min
  const readingTimeMin = (words / 200).toFixed(1);
  const speakingTimeMin = (words / 130).toFixed(1);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    showToast('Copied to Clipboard', 'Text content copied.', 'success');
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="space-y-6">
      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold uppercase text-slate-400">Words</span>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
            {words}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold uppercase text-slate-400">Characters</span>
          <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-0.5">
            {charsWithSpaces}
          </div>
          <span className="text-[10px] text-slate-400">({charsWithoutSpaces} no spaces)</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold uppercase text-slate-400">Sentences</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {sentences}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold uppercase text-slate-400">Paragraphs</span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
            {paragraphs}
          </div>
        </div>
      </div>

      {/* Reading & Speaking Estimation */}
      <div className="flex flex-wrap items-center gap-6 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>Estimated Reading Time: <strong>{readingTimeMin} min</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-cyan-500" />
          <span>Estimated Speaking Time: <strong>{speakingTimeMin} min</strong></span>
        </div>
      </div>

      {/* Text Area Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase text-slate-500">
            Type or Paste Text to Analyze
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
            <button
              onClick={handleClear}
              className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <textarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or start typing your content here..."
          className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-indigo-500 leading-relaxed"
        />
      </div>
    </div>
  );
}
