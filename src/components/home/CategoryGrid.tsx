import React from 'react';
import Link from 'next/link';
import {
  Layers,
  Sheet,
  Image as ImageIcon,
  Search,
  Code2,
  Type,
  QrCode,
  Calculator,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { CATEGORIES, getToolsByCategory } from '@/lib/tools/registry';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  pdf: <Layers className="w-6 h-6 text-rose-500" />,
  spreadsheet: <Sheet className="w-6 h-6 text-emerald-500" />,
  image: <ImageIcon className="w-6 h-6 text-cyan-500" />,
  seo: <Search className="w-6 h-6 text-amber-500" />,
  developer: <Code2 className="w-6 h-6 text-indigo-500" />,
  text: <Type className="w-6 h-6 text-violet-500" />,
  qr: <QrCode className="w-6 h-6 text-pink-500" />,
  calculators: <Calculator className="w-6 h-6 text-teal-500" />,
  ai: <Sparkles className="w-6 h-6 text-purple-500" />,
};

export function CategoryGrid() {
  return (
    <section className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Explore by Category
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
            Find the exact utility you need organized across comprehensive tool domains.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const count = getToolsByCategory(cat.id).length;
            const icon = CATEGORY_ICONS[cat.id] || <Sparkles className="w-6 h-6 text-indigo-500" />;

            return (
              <Link
                key={cat.id}
                href={`/tools?cat=${cat.id}`}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-500/80 dark:hover:border-indigo-500/80 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 group-hover:scale-105 transition-transform">
                      {icon}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {count} {count === 1 ? 'tool' : 'tools'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>Browse {cat.name}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
