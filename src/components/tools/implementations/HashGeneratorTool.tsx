'use client';

import React, { useState, useEffect } from 'react';
import { Hash, Copy, Check } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useToast } from '@/lib/context/ToastContext';

export function HashGeneratorTool({ tool }: { tool: ToolDefinition }) {
  const [inputText, setInputText] = useState('Toolora — Enterprise Digital Utilities Platform');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    async function computeHashes() {
      if (!inputText) {
        setHashes({});
        return;
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(inputText);

      const algos = [
        { name: 'SHA-256', id: 'SHA-256' },
        { name: 'SHA-512', id: 'SHA-512' },
        { name: 'SHA-384', id: 'SHA-384' },
        { name: 'SHA-1', id: 'SHA-1' },
      ];

      const computed: Record<string, string> = {};

      for (const algo of algos) {
        try {
          const hashBuffer = await crypto.subtle.digest(algo.id, data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
          computed[algo.name] = hashHex;
        } catch {
          computed[algo.name] = 'Unsupported algorithm';
        }
      }

      setHashes(computed);
    }

    computeHashes();
  }, [inputText]);

  const copyHash = (name: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedKey(name);
    setTimeout(() => setCopiedKey(null), 1500);
    showToast('Copied!', `${name} hash copied to clipboard.`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase text-slate-500">
          Input String or Payload
        </label>
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type string to compute checksums..."
          className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono outline-none focus:border-indigo-500"
        />
      </div>

      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Cryptographic Checksums (Hardware-Accelerated Web Crypto API)
        </span>

        <div className="space-y-3">
          {Object.entries(hashes).map(([algo, hash]) => (
            <div
              key={algo}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200 dark:border-slate-700 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{algo}</span>
                <button
                  onClick={() => copyHash(algo, hash)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                >
                  {copiedKey === algo ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === algo ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all pt-1">
                {hash}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
