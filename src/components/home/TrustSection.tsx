import React from 'react';
import { ShieldCheck, Cpu, Smartphone, Sparkles, Lock } from 'lucide-react';
import { TOOLS_REGISTRY } from '@/lib/tools/registry';

export function TrustSection() {
  const activeToolCount = TOOLS_REGISTRY.length;

  const trustMetrics = [
    {
      icon: <Cpu className="w-6 h-6 text-indigo-500" />,
      title: `${activeToolCount}+ Verified Tools`,
      description: 'Fully functional client-side and cloud utilities tested for speed and accuracy.',
    },
    {
      icon: <Lock className="w-6 h-6 text-emerald-500" />,
      title: 'Zero-Knowledge Privacy',
      description: 'PDFs, spreadsheets, and photos are processed in your browser memory and never uploaded.',
    },
    {
      icon: <Smartphone className="w-6 h-6 text-cyan-500" />,
      title: 'Mobile & Desktop Ready',
      description: 'Responsive tools with touch-friendly controls engineered for phones, tablets, and laptops.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      title: 'Free Tools Available',
      description: 'Generous everyday utility access without requiring credit cards or signups.',
    },
  ];

  return (
    <section className="py-12 border-y border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustMetrics.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white/80 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 backdrop-blur-xs"
            >
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
