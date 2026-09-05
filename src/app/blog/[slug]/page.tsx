import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Clock, Calendar, ChevronRight, ArrowRight, HelpCircle, Sparkles } from 'lucide-react';
import { BLOG_POSTS } from '@/lib/blog/posts';
import { getToolBySlug } from '@/lib/tools/registry';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) {
    return { title: 'Post Not Found — Toolora' };
  }

  return {
    title: `${post.title} — Toolora Blog`,
    description: post.seoDescription,
    openGraph: {
      title: post.title,
      description: post.seoDescription,
      type: 'article',
      publishedTime: post.publishDate,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedTools = post.relatedToolSlugs
    .map((s) => getToolBySlug(s))
    .filter(Boolean);

  return (
    <article className="min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link href="/blog" className="hover:underline">Blog</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{post.title}</span>
        </nav>

        {/* Article Header */}
        <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
              {post.category}
            </span>
            <div className="flex items-center gap-1 text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{post.publishDate}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTime}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {post.summary}
          </p>
        </div>

        {/* Table of Contents */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Table of Contents
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
            {post.tableOfContents.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-xs">{idx + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Body Content */}
        <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-base">
          {post.content.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {/* Related Tools Embed */}
        {relatedTools.length > 0 && (
          <div className="p-8 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Related Toolora Utilities</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedTools.map((t) => (
                <Link
                  key={t!.id}
                  href={`/${t!.slug}`}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors group flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                      {t!.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t!.description}</p>
                  </div>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-3 inline-flex items-center gap-1">
                    Try Tool <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        {post.faqs.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Article FAQs</h2>
            <div className="space-y-3">
              {post.faqs.map((faq, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 pl-6">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
