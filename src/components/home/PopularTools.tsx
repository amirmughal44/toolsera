import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Layers,
  Sheet,
  Minimize2,
  FileText,
  Network,
  Bot,
  FileJson,
  QrCode,
  DollarSign,
  Sparkles,
  Lock,
} from 'lucide-react';
import { getPopularTools } from '@/lib/tools/registry';

const TOOL_ICONS: Record<string, React.ReactNode> = {
  'pdf-merger': <Layers className="w-5 h-5 text-rose-500" />,
  'pdf-splitter': <Layers className="w-5 h-5 text-rose-500" />,
  'word-to-pdf': <FileText className="w-5 h-5 text-blue-500" />,
  'excel-generator': <Sheet className="w-5 h-5 text-emerald-500" />,
  'image-compressor': <Minimize2 className="w-5 h-5 text-cyan-500" />,
  'image-converter': <Minimize2 className="w-5 h-5 text-cyan-500" />,
  'sitemap-generator': <Network className="w-5 h-5 text-amber-500" />,
  'robots-txt-generator': <Bot className="w-5 h-5 text-indigo-500" />,
  'meta-tag-generator': <FileText className="w-5 h-5 text-teal-500" />,
  'seo-analyzer': <Network className="w-5 h-5 text-emerald-500" />,
  'json-formatter': <FileJson className="w-5 h-5 text-violet-500" />,
  'jwt-decoder': <Lock className="w-5 h-5 text-amber-500" />,
  'hash-generator': <FileJson className="w-5 h-5 text-indigo-500" />,
  'regex-tester': <FileJson className="w-5 h-5 text-pink-500" />,
  'text-analyzer': <FileText className="w-5 h-5 text-blue-500" />,
  'case-converter': <FileText className="w-5 h-5 text-cyan-500" />,
  'qr-code-generator': <QrCode className="w-5 h-5 text-pink-500" />,
  'loan-emi-calculator': <DollarSign className="w-5 h-5 text-emerald-500" />,
  'ai-productivity': <Sparkles className="w-5 h-5 text-purple-500" />,
  'pdf-watermark': <Layers className="w-5 h-5 text-amber-500" />,
};

export function PopularTools() {
  const popularTools = getPopularTools();

  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Essential Productivity</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Most Popular Digital Tools
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-xl">
              Engineered with real client-side functionality, zero uploads, and instant processing speeds.
            </p>
          </div>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 group"
          >
            <span>View All Available Tools</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularTools.map((tool) => {
            const icon = TOOL_ICONS[tool.slug] || <Sparkles className="w-5 h-5 text-indigo-500" />;
            const isPremium = tool.accessLevel === 'premium';

            return (
              <Link
                key={tool.id}
                href={`/${tool.slug}`}
                className="group relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/80 dark:hover:border-indigo-500/80 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 group-hover:scale-105 transition-transform">
                      {icon}
                    </div>
                    {isPremium ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        All-Access
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        Free
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  <span>Open Tool</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
