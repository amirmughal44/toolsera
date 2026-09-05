'use client';

import React, { useState } from 'react';
import { Activity, CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';

interface AuditItem {
  id: string;
  title: string;
  status: 'good' | 'warning' | 'error';
  desc: string;
}

export function SeoAnalyzerTool({ tool }: { tool: ToolDefinition }) {
  const [content, setContent] = useState(`<!DOCTYPE html>
<html lang="en">
<head>
  <title>Toolora — Complete Digital Utilities Suite</title>
  <meta name="description" content="Convert files, optimize documents, generate spreadsheets, and audit SEO data securely in your browser.">
</head>
<body>
  <h1>One Platform. Every Tool You Need.</h1>
  <p>Welcome to Toolora. Easily convert PDFs and images with zero server uploads.</p>
  <h2>Popular Features</h2>
  <img src="/logo.png" alt="Toolora Brand Logo" />
  <img src="/banner.png" />
  <p>Learn more about our private client-side engine and All-Access plan.</p>
</body>
</html>`);

  const [auditResults, setAuditResults] = useState<AuditItem[] | null>(null);
  const [score, setScore] = useState<number>(0);
  const { canUseTool, recordConversion } = useAuth();
  const { showToast } = useToast();

  const handleAnalyze = () => {
    const check = canUseTool(tool);
    if (!check.allowed) {
      showToast('Notice', check.reason || 'Upgrade required.', 'error');
      return;
    }

    const items: AuditItem[] = [];
    let currentScore = 100;

    // 1. Title Tag Check
    const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
    if (!titleMatch || !titleMatch[1].trim()) {
      items.push({
        id: 'title',
        title: 'Missing Page <title> Tag',
        status: 'error',
        desc: 'Page does not have a defined title tag. Title tags are critical for search engine rankings.',
      });
      currentScore -= 25;
    } else {
      const len = titleMatch[1].trim().length;
      if (len > 60) {
        items.push({
          id: 'title',
          title: `Title Tag Too Long (${len} Chars)`,
          status: 'warning',
          desc: `Title is ${len} characters. Keep under 60 characters to prevent SERP truncation.`,
        });
        currentScore -= 10;
      } else {
        items.push({
          id: 'title',
          title: `Optimal Title Tag Length (${len} Chars)`,
          status: 'good',
          desc: `"${titleMatch[1].trim()}" is within recommended limits.`,
        });
      }
    }

    // 2. Meta Description Check
    const metaDescMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    if (!metaDescMatch || !metaDescMatch[1].trim()) {
      items.push({
        id: 'desc',
        title: 'Missing Meta Description',
        status: 'error',
        desc: 'No meta description found. Add a 140-160 character summary.',
      });
      currentScore -= 20;
    } else {
      const len = metaDescMatch[1].trim().length;
      items.push({
        id: 'desc',
        title: `Meta Description Present (${len} Chars)`,
        status: len >= 100 && len <= 165 ? 'good' : 'warning',
        desc: `Description length is ${len} characters. Ideal range is 120-160.`,
      });
      if (len < 100 || len > 165) currentScore -= 10;
    }

    // 3. H1 Heading Check
    const h1Matches = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    if (h1Matches.length === 0) {
      items.push({
        id: 'h1',
        title: 'No <h1> Heading Found',
        status: 'error',
        desc: 'Every page should contain exactly one main <h1> heading.',
      });
      currentScore -= 20;
    } else if (h1Matches.length > 1) {
      items.push({
        id: 'h1',
        title: `Multiple <h1> Headings Found (${h1Matches.length})`,
        status: 'warning',
        desc: 'Google recommends having a single <h1> heading per document hierarchy.',
      });
      currentScore -= 10;
    } else {
      items.push({
        id: 'h1',
        title: 'Single <h1> Heading Detected',
        status: 'good',
        desc: 'Document structure conforms to SEO best practices.',
      });
    }

    // 4. Image Alt Attributes Check
    const imgTags = content.match(/<img[^>]*>/gi) || [];
    const missingAlt = imgTags.filter((img) => !img.includes('alt=') || img.includes('alt=""')).length;
    if (missingAlt > 0) {
      items.push({
        id: 'alt',
        title: `Images Missing Alt Attributes (${missingAlt}/${imgTags.length})`,
        status: 'warning',
        desc: 'Descriptive alt text helps screen readers and image search indexing.',
      });
      currentScore -= 10;
    } else if (imgTags.length > 0) {
      items.push({
        id: 'alt',
        title: 'All Images Have Alt Attributes',
        status: 'good',
        desc: `${imgTags.length} image tags inspected and verified.`,
      });
    }

    // 5. Word Count Check
    const stripped = content.replace(/<[^>]*>?/gm, ' ');
    const words = stripped.trim().split(/\s+/).filter(Boolean).length;
    if (words < 100) {
      items.push({
        id: 'words',
        title: `Thin Content Warning (${words} Words)`,
        status: 'warning',
        desc: 'Search engines prefer in-depth, high-utility content.',
      });
      currentScore -= 10;
    } else {
      items.push({
        id: 'words',
        title: `Healthy Content Volume (${words} Words)`,
        status: 'good',
        desc: 'Adequate page text volume for indexing.',
      });
    }

    const finalScore = Math.max(10, currentScore);
    setScore(finalScore);
    setAuditResults(items);
    recordConversion(tool, 'seo_audit_report');
    showToast('Audit Complete', `SEO Health Score: ${finalScore}/100`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-slate-500">
          Paste Web Page HTML or Article Content to Audit
        </label>
        <textarea
          rows={7}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono outline-none focus:border-indigo-500"
        />
      </div>

      <button
        onClick={handleAnalyze}
        className="px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all flex items-center gap-2"
      >
        <Activity className="w-4 h-4" />
        <span>Run On-Page SEO Audit</span>
      </button>

      {auditResults && (
        <div className="space-y-6 pt-4 animate-in fade-in">
          {/* Health Score Banner */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">SEO Health Score</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
                {score}
                <span className="text-sm font-normal text-slate-400">/100</span>
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-xl text-xs font-bold ${
                score >= 80
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : score >= 60
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              }`}
            >
              {score >= 80 ? 'EXCELLENT' : score >= 60 ? 'NEEDS IMPROVEMENT' : 'POOR'}
            </div>
          </div>

          {/* Audit Checks Checklist */}
          <div className="space-y-3">
            {auditResults.map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3.5"
              >
                {item.status === 'good' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
                {item.status === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
                {item.status === 'error' && <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}

                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
