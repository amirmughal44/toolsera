'use client';

import React, { useState } from 'react';
import { GitCompare, ArrowRight } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';

export function TextDiffTool({ tool }: { tool: ToolDefinition }) {
  const [text1, setText1] = useState(`const API_BASE = "https://api.v1.example.com";
const TIMEOUT = 5000;

function fetchData() {
  console.log("Fetching legacy data...");
  return fetch(API_BASE);
}`);

  const [text2, setText2] = useState(`const API_BASE = "https://api.v2.toolora.com";
const TIMEOUT = 3000;
const RETRIES = 3;

function fetchData() {
  console.log("Fetching v2 high-speed data...");
  return fetch(API_BASE, { cache: "no-store" });
}`);

  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  const maxLines = Math.max(lines1.length, lines2.length);

  return (
    <div className="space-y-6">
      {/* Input textareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase text-slate-500">
            Original Text / Base Version
          </label>
          <textarea
            rows={8}
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase text-slate-500">
            Modified Text / Updated Version
          </label>
          <textarea
            rows={8}
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>
      </div>

      {/* Side-by-Side Diff Table */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Line-by-Line Difference Comparison
        </span>

        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 font-mono text-xs shadow-inner">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                  <th className="w-10 p-2 text-center border-r border-slate-200 dark:border-slate-800">#</th>
                  <th className="p-2 text-left w-1/2 border-r border-slate-200 dark:border-slate-800">Original</th>
                  <th className="w-10 p-2 text-center border-r border-slate-200 dark:border-slate-800">#</th>
                  <th className="p-2 text-left w-1/2">Modified</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxLines }).map((_, idx) => {
                  const l1 = lines1[idx] !== undefined ? lines1[idx] : null;
                  const l2 = lines2[idx] !== undefined ? lines2[idx] : null;
                  const isDiff = l1 !== l2;

                  return (
                    <tr
                      key={idx}
                      className={`border-b border-slate-100 dark:border-slate-900 ${
                        isDiff ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="p-1.5 text-center text-slate-400 text-[10px] border-r border-slate-200 dark:border-slate-800 select-none">
                        {l1 !== null ? idx + 1 : ''}
                      </td>
                      <td
                        className={`p-1.5 border-r border-slate-200 dark:border-slate-800 whitespace-pre-wrap break-all ${
                          isDiff && l1 !== null
                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {l1 !== null ? l1 : ''}
                      </td>

                      <td className="p-1.5 text-center text-slate-400 text-[10px] border-r border-slate-200 dark:border-slate-800 select-none">
                        {l2 !== null ? idx + 1 : ''}
                      </td>
                      <td
                        className={`p-1.5 whitespace-pre-wrap break-all ${
                          isDiff && l2 !== null
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {l2 !== null ? l2 : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
