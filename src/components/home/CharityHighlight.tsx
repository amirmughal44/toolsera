import React from 'react';
import Link from 'next/link';
import { Heart, ArrowRight, BookOpen, Utensils, Laptop, Users } from 'lucide-react';

export function CharityHighlight() {
  const causes = [
    {
      icon: <Laptop className="w-5 h-5 text-indigo-500" />,
      title: 'Digital Literacy',
      desc: 'Free tool access and digital skills training for students and underserved communities.',
    },
    {
      icon: <BookOpen className="w-5 h-5 text-emerald-500" />,
      title: 'Education Grants',
      desc: 'Supporting open-source learning resources and classroom supplies.',
    },
    {
      icon: <Utensils className="w-5 h-5 text-amber-500" />,
      title: 'Emergency Food Support',
      desc: 'Direct partner contributions providing essential nutritional relief.',
    },
    {
      icon: <Users className="w-5 h-5 text-rose-500" />,
      title: 'Community Projects',
      desc: 'Funding grassroots civic technology and local educational workshops.',
    },
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>Social Impact</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Tools That Give Back
            </h2>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              &quot;Technology should not only make life easier — it should make a difference.&quot;
            </p>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              A portion of Toolora All-Access proceeds and voluntary community contributions are pledged toward educational workshops, digital literacy, and community initiatives. Track verified disbursements openly in our public transparency ledger.
            </p>

            <div className="pt-2">
              <Link
                href="/charity"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20 transition-all"
              >
                <span>Support the Mission & View Ledger</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {causes.map((c, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs"
              >
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 w-fit mb-3">
                  {c.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
