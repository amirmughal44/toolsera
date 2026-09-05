'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Share2,
  Lock,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { TOOLS_REGISTRY } from '@/lib/tools/registry';

interface ToolLayoutProps {
  tool: ToolDefinition;
  children: React.ReactNode;
}

export function ToolLayout({ tool, children }: ToolLayoutProps) {
  const { isAllAccess, isFavorite, toggleFavorite } = useAuth();
  const { showToast } = useToast();
  const favorited = isFavorite(tool.slug);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link Copied!', 'Direct tool URL copied to clipboard.', 'success');
    }
  };

  const relatedTools = TOOLS_REGISTRY.filter(
    (t) => t.category === tool.category && t.id !== tool.id
  ).slice(0, 3);

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Tools
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link
            href={`/tools?cat=${tool.category}`}
            className="capitalize hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {tool.category}
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-900 dark:text-slate-200 font-medium truncate">{tool.name}</span>
        </nav>

        {/* Tool Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {tool.name}
              </h1>
              {tool.accessLevel === 'premium' ? (
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  All-Access
                </span>
              ) : (
                <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Free
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {tool.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                toggleFavorite(tool.slug);
                showToast(
                  favorited ? 'Removed from Favorites' : 'Added to Favorites',
                  tool.name,
                  'info'
                );
              }}
              className={`p-2.5 rounded-xl border transition-colors ${
                favorited
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={favorited ? 'Favorited' : 'Bookmark this tool'}
            >
              <Bookmark className={`w-4 h-4 ${favorited ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Share tool"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Security & Client-side guarantee banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              <strong>Private & Secure:</strong> All operations execute in your local browser memory. Files are never stored on any remote server.
            </span>
          </div>
          <span className="hidden md:inline font-mono text-[10px] text-slate-400">Zero-Knowledge</span>
        </div>

        {/* Dynamic Tool Workspace Container */}
        <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5">
          {children}
        </div>

        {/* Lower Info Sections: How it works, Features, FAQ, Related */}
        <div className="pt-8 space-y-12 border-t border-slate-200 dark:border-slate-800">
          {/* How It Works */}
          {tool.howItWorks && tool.howItWorks.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                How It Works
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {tool.howItWorks.map((step) => (
                  <div
                    key={step.step}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-3 shadow-sm">
                      {step.step}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {tool.features && tool.features.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Key Features & Security
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tool.features.map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white dark:bg-slate-850/50 border border-slate-200/70 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs */}
          {tool.faqs && tool.faqs.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {tool.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
                  >
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{faq.q}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Tools */}
          {relatedTools.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Related {tool.category.toUpperCase()} Tools
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedTools.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/${rel.slug}`}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 transition-colors group flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                        {rel.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {rel.description}
                      </p>
                    </div>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-3 inline-flex items-center gap-1">
                      Open Tool <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
