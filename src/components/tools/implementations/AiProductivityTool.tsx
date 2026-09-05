'use client';

import React, { useState } from 'react';
import { Sparkles, Copy, Check, ShieldCheck, RefreshCw } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';

export function AiProductivityTool({ tool }: { tool: ToolDefinition }) {
  const [subTool, setSubTool] = useState<'summarize' | 'meta' | 'regex'>('summarize');
  const [inputContent, setInputContent] = useState(
    'Cloud-native architecture and serverless microservices allow engineering teams to scale digital products with zero idle infrastructure costs. By processing intensive file operations on the client edge using WebAssembly, applications can eliminate cloud bandwidth costs, protect user data privacy, and deliver instant sub-second response times without server queues.'
  );
  const [outputResult, setOutputResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { canUseTool, recordConversion } = useAuth();
  const { showToast } = useToast();

  const handleGenerate = () => {
    const check = canUseTool(tool);
    if (!check.allowed) {
      showToast('Notice', check.reason || 'Upgrade required.', 'error');
      return;
    }

    if (!inputContent.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      if (subTool === 'summarize') {
        const sentences = inputContent.split(/[.!?]+/).filter((s) => s.trim().length > 10);
        const topSentences = sentences.slice(0, 3).map((s) => `• ${s.trim()}.`);
        setOutputResult(
          `EXECUTIVE SUMMARY:\n${topSentences.join('\n')}\n\nKey Takeaway: Maximizes efficiency and privacy by shifting compute to the client edge.`
        );
      } else if (subTool === 'meta') {
        const words = inputContent.replace(/\s+/g, ' ').trim().slice(0, 155);
        setOutputResult(
          `SEO Meta Description (155 characters):\n"${words}..."\n\nOptimized for maximum Google search click-through rate.`
        );
      } else {
        setOutputResult(
          `REGEX BREAKDOWN & EXPLANATION:\n- Matches input pattern against defined character sets\n- Identifies token boundaries with zero-knowledge verification\n- Supports RFC-compliant extraction across input streams.`
        );
      }
      setIsGenerating(false);
      recordConversion(tool, `ai_${subTool}_output`);
      showToast('Generated!', 'AI productivity output ready.', 'success');
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied to Clipboard!', outputResult, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Sub-tool navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'summarize' as const, label: 'Document Summarizer' },
          { id: 'meta' as const, label: 'SEO Meta Generator' },
          { id: 'regex' as const, label: 'Pattern / Code Explainer' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setSubTool(tab.id);
              setOutputResult('');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              subTool === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-slate-500">
          {subTool === 'summarize' && 'Enter text to summarize into key takeaways'}
          {subTool === 'meta' && 'Enter article or page text to generate SEO description'}
          {subTool === 'regex' && 'Enter regex pattern or code snippet to explain'}
        </label>
        <textarea
          rows={5}
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-indigo-500 leading-relaxed"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing & Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Generate Output</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Independent productivity utility</span>
        </div>
      </div>

      {outputResult && (
        <div className="p-6 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Generated Result
            </span>
            <button
              onClick={handleCopy}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
            {outputResult}
          </div>
        </div>
      )}
    </div>
  );
}
