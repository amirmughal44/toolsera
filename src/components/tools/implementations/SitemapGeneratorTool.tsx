'use client';

import React, { useState } from 'react';
import { Network, Copy, Download, Check, Plus, Trash2 } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';

interface UrlEntry {
  path: string;
  priority: string;
  changefreq: string;
}

export function SitemapGeneratorTool({ tool }: { tool: ToolDefinition }) {
  const [baseUrl, setBaseUrl] = useState('https://example.com');
  const [urls, setUrls] = useState<UrlEntry[]>([
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/tools', priority: '0.9', changefreq: 'weekly' },
    { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
    { path: '/blog', priority: '0.8', changefreq: 'daily' },
    { path: '/about', priority: '0.6', changefreq: 'monthly' },
    { path: '/contact', priority: '0.5', changefreq: 'yearly' },
  ]);
  const [copied, setCopied] = useState(false);
  const { canUseTool, recordConversion } = useAuth();
  const { showToast } = useToast();

  const addUrl = () => {
    setUrls([...urls, { path: '/new-page', priority: '0.7', changefreq: 'monthly' }]);
  };

  const removeUrl = (index: number) => {
    if (urls.length <= 1) return;
    setUrls(urls.filter((_, i) => i !== index));
  };

  const updateUrl = (index: number, field: keyof UrlEntry, value: string) => {
    const updated = [...urls];
    updated[index][field] = value;
    setUrls(updated);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const cleanBase = baseUrl.replace(/\/+$/, '');

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${cleanBase}${u.path.startsWith('/') ? u.path : '/' + u.path}</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Sitemap Copied', 'Copied XML to clipboard.', 'success');
  };

  const handleDownload = () => {
    const check = canUseTool(tool);
    if (!check.allowed) {
      showToast('Notice', check.reason || 'Upgrade required.', 'error');
      return;
    }

    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    link.click();

    recordConversion(tool, 'sitemap.xml');
    showToast('Downloaded!', 'Saved sitemap.xml to downloads.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Base URL Configuration */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase text-slate-500">Website Base URL</label>
        <input
          type="url"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://yourwebsite.com"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold outline-none focus:border-indigo-500"
        />
      </div>

      {/* URL List Builder */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-slate-500">
            Pages to Include ({urls.length})
          </span>
          <button
            onClick={addUrl}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Page Path</span>
          </button>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {urls.map((u, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
            >
              <input
                type="text"
                value={u.path}
                onChange={(e) => updateUrl(i, 'path', e.target.value)}
                placeholder="/page-slug"
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-mono outline-none"
              />

              <select
                value={u.changefreq}
                onChange={(e) => updateUrl(i, 'changefreq', e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs outline-none"
              >
                <option value="always">always</option>
                <option value="hourly">hourly</option>
                <option value="daily">daily</option>
                <option value="weekly">weekly</option>
                <option value="monthly">monthly</option>
                <option value="yearly">yearly</option>
              </select>

              <select
                value={u.priority}
                onChange={(e) => updateUrl(i, 'priority', e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs outline-none"
              >
                <option value="1.0">1.0 (High)</option>
                <option value="0.9">0.9</option>
                <option value="0.8">0.8</option>
                <option value="0.7">0.7</option>
                <option value="0.6">0.6</option>
                <option value="0.5">0.5 (Normal)</option>
                <option value="0.3">0.3</option>
              </select>

              <button
                onClick={() => removeUrl(i)}
                className="p-1.5 text-slate-400 hover:text-rose-500"
                title="Remove page"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* XML Code Preview & Action Buttons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-slate-500">
            Generated sitemap.xml Preview
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy XML'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-1.5 rounded-lg font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download sitemap.xml</span>
            </button>
          </div>
        </div>

        <pre className="p-4 rounded-2xl bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto max-h-64 border border-slate-800">
          {xmlContent}
        </pre>
      </div>
    </div>
  );
}
