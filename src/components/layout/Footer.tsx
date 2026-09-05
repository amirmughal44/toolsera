import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, Coffee, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-850 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                TOOLORA
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              One platform. Every tool you need. Convert files, edit PDFs, generate spreadsheets, optimize websites, and streamline developer workflows with zero-knowledge browser security.
            </p>

            <div className="pt-2">
              <Link
                href="/support"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
              >
                <Coffee className="w-4 h-4 text-amber-500" />
                <span>Buy Us a Coffee ☕</span>
              </Link>
            </div>

            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Tools Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4">
              Tools
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/pdf-merger" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  PDF Merger
                </Link>
              </li>
              <li>
                <Link href="/word-to-pdf" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Word to PDF
                </Link>
              </li>
              <li>
                <Link href="/excel-generator" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Spreadsheet & Excel
                </Link>
              </li>
              <li>
                <Link href="/image-compressor" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Image Compressor
                </Link>
              </li>
              <li>
                <Link href="/sitemap-generator" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  XML Sitemap Generator
                </Link>
              </li>
              <li>
                <Link href="/json-formatter" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  JSON Formatter
                </Link>
              </li>
              <li>
                <Link href="/qr-code-generator" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  QR Code Generator
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Engineering Blog
                </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Complete Tool Directory
                </Link>
              </li>
              <li>
                <Link href="/request-tool" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Suggest a New Tool
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Admin Panel
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  User Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4">
              Company & Impact
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  About Toolora
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  All-Access Pricing ($5)
                </Link>
              </li>
              <li>
                <Link href="/charity" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Tools That Give Back</span>
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Support & Donations
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Zero-Knowledge Architecture: Files are processed securely in your browser.</span>
          </div>
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} Toolora Inc. All rights reserved.</span>
            <span>Made with care for global digital builders.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
