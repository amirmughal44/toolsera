'use client';

import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2, AlertTriangle, Copy, Check } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useToast } from '@/lib/context/ToastContext';

export function JwtDecoderTool({ tool }: { tool: ToolDefinition }) {
  const sampleToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOTA4MTI3IiwibmFtZSI6IlRvb2xvcmEgQWRtaW4iLCJwbGFuIjoiYWxsLWFjY2VzcyIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxODMxNTUzOTIyfQ.4Pgm4zCbgC7iJk7i6Hl7h8I9f8L3_f_8G8_k';

  const [jwt, setJwt] = useState(sampleToken);
  const [copiedPart, setCopiedPart] = useState<string | null>(null);
  const { showToast } = useToast();

  const decodeJwt = () => {
    try {
      const parts = jwt.trim().split('.');
      if (parts.length < 2) {
        return { error: 'Invalid JWT structure: Token must contain at least 2 dot-separated segments.' };
      }

      // Base64URL decode
      const b64Decode = (str: string) => {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        return decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      };

      const header = JSON.parse(b64Decode(parts[0]));
      const payload = JSON.parse(b64Decode(parts[1]));

      let expDate: Date | null = null;
      let isExpired = false;

      if (payload.exp && typeof payload.exp === 'number') {
        expDate = new Date(payload.exp * 1000);
        isExpired = expDate.getTime() < Date.now();
      }

      return {
        header,
        payload,
        expDate,
        isExpired,
        error: null,
      };
    } catch {
      return { error: 'Could not decode token. Ensure token is a valid Base64URL string.' };
    }
  };

  const result = decodeJwt();

  const copySection = (data: unknown, key: string) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedPart(key);
    setTimeout(() => setCopiedPart(null), 1500);
    showToast('Copied!', `${key} copied as formatted JSON.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Input token */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase text-slate-500">
          Paste Encoded JWT Token (Bearer token or raw string)
        </label>
        <textarea
          rows={4}
          value={jwt}
          onChange={(e) => setJwt(e.target.value)}
          placeholder="Paste JWT string..."
          className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs text-indigo-700 dark:text-indigo-400 break-all outline-none focus:border-indigo-500"
        />
      </div>

      {result.error ? (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{result.error}</span>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in">
          {/* Expiration Status Banner */}
          {result.expDate && (
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                result.isExpired
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-500/30 text-rose-700 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {result.isExpired ? (
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {result.isExpired ? 'Token Expired' : 'Token Active & Valid'}
                  </h4>
                  <p className="text-xs opacity-90 mt-0.5">
                    Expires on: {result.expDate.toUTCString()} ({result.expDate.toLocaleString()})
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-white/50 dark:bg-slate-900/50">
                {result.isExpired ? 'EXPIRED' : 'ACTIVE'}
              </span>
            </div>
          )}

          {/* Decoded Header and Payload Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-rose-500">Header: Algorithm & Type</span>
                <button
                  onClick={() => copySection(result.header, 'Header')}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  {copiedPart === 'Header' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 text-rose-400 font-mono text-xs overflow-x-auto border border-slate-800">
                {JSON.stringify(result.header, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-purple-400">Payload: Claims & Data</span>
                <button
                  onClick={() => copySection(result.payload, 'Payload')}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  {copiedPart === 'Payload' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 text-purple-300 font-mono text-xs overflow-x-auto border border-slate-800">
                {JSON.stringify(result.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
