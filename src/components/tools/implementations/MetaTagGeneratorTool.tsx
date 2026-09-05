'use client';

import React, { useState } from 'react';
import { Tag, Copy, Check, ExternalLink, Globe } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useToast } from '@/lib/context/ToastContext';

export function MetaTagGeneratorTool({ tool }: { tool: ToolDefinition }) {
  const [title, setTitle] = useState('Toolora — One Platform. Every Tool You Need.');
  const [description, setDescription] = useState(
    'Convert files, edit PDFs, generate spreadsheets, optimize websites, and simplify digital tasks with zero-knowledge browser security.'
  );
  const [siteUrl, setSiteUrl] = useState('https://toolora.com');
  const [imageUrl, setImageUrl] = useState('https://toolora.com/og-banner.png');
  const [author, setAuthor] = useState('Toolora Inc.');
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const titleLength = title.length;
  const descLength = description.length;

  const htmlMetaCode = `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${description}">
<meta name="author" content="${author}">

<!-- Open Graph / Facebook / LinkedIn -->
<meta property="og:type" content="website">
<meta property="og:url" content="${siteUrl}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${imageUrl}">

<!-- Twitter / X -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${siteUrl}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${description}">
<meta property="twitter:image" content="${imageUrl}">`;

  const copyTags = () => {
    navigator.clipboard.writeText(htmlMetaCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Tags Copied!', 'Pasted into your clipboard.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase text-slate-500">Page Title</label>
            <span
              className={`text-[11px] font-mono ${
                titleLength > 60 ? 'text-amber-500 font-bold' : 'text-slate-400'
              }`}
            >
              {titleLength}/60 chars (optimal &lt; 60)
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold outline-none focus:border-indigo-500"
          />
        </div>

        <div className="sm:col-span-2 space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase text-slate-500">
              Meta Description
            </label>
            <span
              className={`text-[11px] font-mono ${
                descLength > 160 ? 'text-amber-500 font-bold' : 'text-slate-400'
              }`}
            >
              {descLength}/160 chars (optimal 140-160)
            </span>
          </div>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase text-slate-500">Canonical URL</label>
          <input
            type="url"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase text-slate-500">
            Open Graph Social Image URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono outline-none"
          />
        </div>
      </div>

      {/* Live SERP & Social Previews */}
      <div className="space-y-4 pt-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Live Search & Social Feeds Preview
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Google SERP Preview */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5 font-sans">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{siteUrl}</span>
            </div>
            <h4 className="text-blue-700 dark:text-blue-400 font-semibold text-base hover:underline cursor-pointer truncate">
              {title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Social Twitter / OG Preview */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-850">
            <div className="h-28 bg-gradient-to-tr from-indigo-900 via-slate-800 to-indigo-950 flex items-center justify-center text-slate-400 text-xs font-medium">
              <span>{imageUrl}</span>
            </div>
            <div className="p-3 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono">{siteUrl}</span>
              <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">{title}</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Copy Code */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-slate-500">
            Generated HTML &lt;head&gt; Code
          </span>
          <button
            onClick={copyTags}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Meta Tags'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-2xl bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto border border-slate-800">
          {htmlMetaCode}
        </pre>
      </div>
    </div>
  );
}
