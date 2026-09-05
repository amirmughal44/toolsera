import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export function AiSection() {
  const highlights = [
    'Automated SEO meta description generator calibrated for search rankings',
    'Intelligent text summarizer condensing lengthy reports into actionable bullet points',
    'Regex & code pattern explainer converting cryptic syntax into plain English',
    'Zero data retention: queries stay private and are never used for model training',
  ];

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-8 sm:p-14 text-white overflow-hidden border border-indigo-700/40 shadow-2xl">
          {/* Subtle Ambient Background */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>AI Access</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Power Your Work With AI
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Get more done with AI-powered productivity tools. Accelerate writing, optimize technical metadata, and explain complex code without switching between disconnected apps.
            </p>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Honest Disclosure notice */}
            <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Toolora provides independent productivity utilities. No unauthorized affiliation or trademark claims.
              </span>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <Link
                href="/ai-productivity"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-white text-indigo-950 hover:bg-slate-100 transition-colors shadow-lg shadow-black/25"
              >
                <span>Explore AI Tools</span>
                <ArrowRight className="w-4 h-4 text-indigo-600" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
