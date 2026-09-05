'use client';

import React, { useState } from 'react';
import { Code2, Copy, Check, Plus, Trash2 } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useToast } from '@/lib/context/ToastContext';

export function SchemaGeneratorTool({ tool }: { tool: ToolDefinition }) {
  const [schemaType, setSchemaType] = useState<'faq' | 'article' | 'local_business'>('faq');
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>([
    { q: 'What is Toolora?', a: 'Toolora is an all-in-one commercial online utility platform for files, docs, and SEO.' },
    { q: 'Is file processing secure?', a: 'Yes, files are processed directly in your local browser using client-side zero-knowledge execution.' },
  ]);
  const [articleTitle, setArticleTitle] = useState('How to Optimize PDF Workflows in 2026');
  const [authorName, setAuthorName] = useState('Toolora Team');
  const [businessName, setBusinessName] = useState('Acme Technologies');
  const [businessAddress, setBusinessAddress] = useState('Tech District, Suite 400');
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const addFaq = () => setFaqs([...faqs, { q: 'New Question', a: 'Answer text here.' }]);
  const removeFaq = (idx: number) => setFaqs(faqs.filter((_, i) => i !== idx));
  const updateFaq = (idx: number, field: 'q' | 'a', val: string) => {
    const updated = [...faqs];
    updated[idx][field] = val;
    setFaqs(updated);
  };

  let jsonLdObj: Record<string, unknown> = {};

  if (schemaType === 'faq') {
    jsonLdObj = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    };
  } else if (schemaType === 'article') {
    jsonLdObj = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: articleTitle,
      author: {
        '@type': 'Person',
        name: authorName,
      },
      datePublished: new Date().toISOString(),
      publisher: {
        '@type': 'Organization',
        name: 'Toolora Inc.',
      },
    };
  } else {
    jsonLdObj = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: businessName,
      address: {
        '@type': 'PostalAddress',
        streetAddress: businessAddress,
      },
      telephone: '+1-800-555-0199',
    };
  }

  const jsonLdString = `<script type="application/ld+json">\n${JSON.stringify(
    jsonLdObj,
    null,
    2
  )}\n</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonLdString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Schema Copied!', 'JSON-LD script tag copied to clipboard.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Type Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-slate-500">Schema Type</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'faq' as const, label: 'FAQ Page' },
            { id: 'article' as const, label: 'Article / Blog' },
            { id: 'local_business' as const, label: 'Local Business' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSchemaType(item.id)}
              className={`p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                schemaType === item.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Fields */}
      {schemaType === 'faq' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Questions & Answers ({faqs.length})
            </span>
            <button
              onClick={addFaq}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Q&A</span>
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={f.q}
                    onChange={(e) => updateFaq(i, 'q', e.target.value)}
                    placeholder="Question"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold outline-none"
                  />
                  <button
                    onClick={() => removeFaq(i)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={f.a}
                  onChange={(e) => updateFaq(i, 'a', e.target.value)}
                  placeholder="Answer"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {schemaType === 'article' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold uppercase text-slate-500">Article Headline</label>
            <input
              type="text"
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-500">Author Name</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none"
            />
          </div>
        </div>
      )}

      {schemaType === 'local_business' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-500">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-500">Street Address</label>
            <input
              type="text"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
            />
          </div>
        </div>
      )}

      {/* Code Preview */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-slate-500">
            Generated JSON-LD Rich Snippet
          </span>
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy JSON-LD'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-2xl bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto max-h-64 border border-slate-800">
          {jsonLdString}
        </pre>
      </div>
    </div>
  );
}
