import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck, Heart, Sparkles, Cpu, Eye, Users, Lock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Toolora — Mission, Privacy & Values',
  description:
    'Toolora was created to bring everyday digital utilities into one simple, privacy-first platform with zero-knowledge browser execution.',
};

export default function AboutPage() {
  const values = [
    {
      icon: <Lock className="w-5 h-5 text-indigo-500" />,
      title: 'Zero-Knowledge Privacy',
      desc: 'We believe your documents, photos, and spreadsheets are your property. All processing takes place locally in your browser memory without server retention.',
    },
    {
      icon: <Heart className="w-5 h-5 text-rose-500" />,
      title: 'Tools That Give Back',
      desc: 'Technology should make life easier and make a positive social impact. We pledge resources to educational workshops and digital inclusion grants.',
    },
    {
      icon: <Cpu className="w-5 h-5 text-cyan-500" />,
      title: 'Commercial-Grade Performance',
      desc: 'Fast, responsive, and reliable tools. We optimize WebAssembly routines and modern canvas algorithms for instantaneous output.',
    },
    {
      icon: <Eye className="w-5 h-5 text-emerald-500" />,
      title: 'Honest & Transparent Monetization',
      desc: 'No deceptive pricing, hidden renewals, or fake discounts. Toolora All-Access is clearly labeled as $100 with zero tool-by-tool payments.',
    },
  ];

  return (
    <div className="min-h-screen py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Our Story & Principles</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            One Platform. Every Tool You Need.
          </h1>

          <p className="text-lg sm:text-xl font-medium text-slate-700 dark:text-slate-300 italic">
            &quot;Toolora was created to bring everyday digital utilities into one simple platform.&quot;
          </p>

          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Instead of navigating through dozens of ad-cluttered websites with suspicious download buttons, Toolora unifies document editing, image compression, spreadsheets, SEO analysis, and developer utilities into a single, commercial-grade experience.
          </p>
        </div>

        {/* Core Values Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">
            Our Core Principles & Commitments
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 w-fit">
                  {v.icon}
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{v.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission & Vision Callout */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white border border-indigo-700/40 shadow-xl space-y-4">
          <h2 className="text-2xl font-bold">Our Global Mission</h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            To democratize access to high-utility digital workflows for students, professionals, and small businesses globally — without compromising individual file privacy or charging recurring tool-by-tool subscription fees.
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs font-semibold">
            <Link href="/tools" className="text-cyan-400 hover:underline flex items-center gap-1">
              <span>Explore 20+ Free Utilities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/charity" className="text-rose-400 hover:underline flex items-center gap-1">
              <span>Learn About Our Charity Pledge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
