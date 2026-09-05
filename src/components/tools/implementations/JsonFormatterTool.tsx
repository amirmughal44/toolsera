'use client';

import React, { useState } from 'react';
import { FileJson, Copy, Check, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';

export function JsonFormatterTool({ tool }: { tool: ToolDefinition }) {
  const [inputJson, setInputJson] = useState(`{
  "platform": "Toolora",
  "tagline": "One Platform. Every Tool You Need.",
  "features": ["zero-knowledge", "pdf-merger", "spreadsheets", "seo-tools"],
  "pricing": {
    "allAccessUSD": 100,
    "unlimitedConversions": true
  }
}`);

  const [outputJson, setOutputJson] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { canUseTool, recordConversion } = useAuth();
  const { showToast } = useToast();

  const handleFormat = (spaces: number = 2) => {
    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, spaces);
      setOutputJson(formatted);
      setErrorMsg(null);
      showToast('JSON Formatted!', `Prettified with ${spaces} spaces indentation.`, 'success');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Invalid JSON syntax');
      }
      setOutputJson('');
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setOutputJson(minified);
      setErrorMsg(null);
      showToast('JSON Minified!', 'Compressed into single line.', 'success');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Invalid JSON syntax');
      }
      setOutputJson('');
    }
  };

  const handleValidate = () => {
    try {
      JSON.parse(inputJson);
      setErrorMsg(null);
      showToast('Valid JSON!', 'Syntax conforms to standard JSON specification.', 'success');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Invalid JSON syntax');
      }
    }
  };

  const handleCopy = () => {
    const textToCopy = outputJson || inputJson;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied to Clipboard!', 'JSON string copied.', 'success');
  };

  const handleDownload = () => {
    const check = canUseTool(tool);
    if (!check.allowed) {
      showToast('Notice', check.reason || 'Upgrade required.', 'error');
      return;
    }

    const textToDownload = outputJson || inputJson;
    const blob = new Blob([textToDownload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'toolora_formatted.json';
    link.click();

    recordConversion(tool, 'toolora_formatted.json');
    showToast('Downloaded!', 'Saved .json file.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top action toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleFormat(2)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:border-indigo-500 shadow-xs"
          >
            Prettify (2 Spaces)
          </button>
          <button
            onClick={() => handleFormat(4)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:border-indigo-500 shadow-xs"
          >
            Prettify (4 Spaces)
          </button>
          <button
            onClick={handleMinify}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:border-indigo-500 shadow-xs"
          >
            Minify JSON
          </button>
          <button
            onClick={handleValidate}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:border-indigo-500 shadow-xs"
          >
            Validate
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .json</span>
          </button>
        </div>
      </div>

      {/* Error alert banner */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-mono">{errorMsg}</span>
        </div>
      )}

      {/* Editor Grid: Input vs Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase text-slate-500">Input JSON</span>
          <textarea
            rows={14}
            value={inputJson}
            onChange={(e) => {
              setInputJson(e.target.value);
              setErrorMsg(null);
            }}
            placeholder="Paste raw JSON here..."
            className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase text-slate-500">Formatted Output</span>
          <textarea
            rows={14}
            readOnly
            value={outputJson || inputJson}
            placeholder="Formatted JSON will appear here..."
            className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-indigo-700 dark:text-cyan-300 outline-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
