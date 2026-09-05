'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  Sheet,
  Image as ImageIcon,
  Code2,
  FileText,
  Lock,
  QrCode,
  FileJson,
} from 'lucide-react';
import { TOOLS_REGISTRY } from '@/lib/tools/registry';

export function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Find closest tool or route to /tools?q=
      const match = TOOLS_REGISTRY.find(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      if (match) {
        router.push(`/${match.slug}`);
      } else {
        router.push(`/tools?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  const suggestions = [
    { label: 'PDF Merger', slug: 'pdf-merger' },
    { label: 'Compress Image', slug: 'image-compressor' },
    { label: 'Excel & Sheet', slug: 'excel-generator' },
    { label: 'Generate Sitemap', slug: 'sitemap-generator' },
    { label: 'JSON Formatter', slug: 'json-formatter' },
    { label: 'Custom QR', slug: 'qr-code-generator' },
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/15 via-cyan-500/15 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>One Platform. Every Tool You Need.</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Everything You Need.{' '}
            <span className="gradient-text">One Powerful Toolkit.</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Convert files, create documents, generate spreadsheets, optimize websites, edit images and simplify everyday digital tasks — all with private, zero-knowledge browser security.
          </p>

          {/* Interactive Search Bar */}
          <div className="pt-2 max-w-2xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center p-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 transition-all"
            >
              <div className="pl-3 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you want to do? (Try: PDF merge, compress image, sitemap...)"
                className="w-full px-3 py-2 text-sm sm:text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shrink-0 shadow-md shadow-indigo-600/20"
              >
                Search
              </button>
            </form>

            {/* Suggestions Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-400">Popular:</span>
              {suggestions.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${item.slug}`}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-slate-200/60 dark:border-slate-700/60"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/tools"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore All Tools</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Get All Access — $100</span>
            </Link>
          </div>
        </div>

        {/* Constellation Visual of 5 Core Tool Cards */}
        <div className="mt-16 sm:mt-20 relative max-w-6xl mx-auto">
          <div className="p-4 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-100/90 to-slate-200/50 dark:from-slate-900/90 dark:to-slate-950/60 border border-slate-200 dark:border-slate-800/80 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Toolora Core Suite • 5 Essential Tools
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <Lock className="w-3.5 h-3.5" />
                <span>Zero-Knowledge Browser Processing Active</span>
              </div>
            </div>

            {/* Grid of the 5 Core Tool Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-6">
              <Link
                href="/pdf-merger"
                className="p-4 rounded-2xl bg-white dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-500 transition-all hover:shadow-lg group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    TOOL 1
                  </span>
                </div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                  PDF Merger
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Combine & reorder PDF files in-browser.
                </p>
              </Link>

              <Link
                href="/excel-generator"
                className="p-4 rounded-2xl bg-white dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-500 transition-all hover:shadow-lg group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
                    <Sheet className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    TOOL 2
                  </span>
                </div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                  Smart Spreadsheet
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Formulas, templates & instant XLSX export.
                </p>
              </Link>

              <Link
                href="/image-compressor"
                className="p-4 rounded-2xl bg-white dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-500 transition-all hover:shadow-lg group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    TOOL 3
                  </span>
                </div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                  Image Compressor
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Compress photos up to 85% with zero quality loss.
                </p>
              </Link>

              <Link
                href="/qr-code-generator"
                className="p-4 rounded-2xl bg-white dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-500 transition-all hover:shadow-lg group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-500">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    TOOL 4
                  </span>
                </div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                  Custom QR Studio
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Custom colors, WiFi/URL & vector SVG/PNG.
                </p>
              </Link>

              <Link
                href="/json-formatter"
                className="p-4 rounded-2xl bg-white dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-500 transition-all hover:shadow-lg group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-500">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    TOOL 5
                  </span>
                </div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                  JSON Formatter
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Beautify, validate, minify & copy JSON data.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
