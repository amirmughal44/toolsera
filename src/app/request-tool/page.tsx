'use client';

import React, { useState } from 'react';
import { Sparkles, ThumbsUp, Plus, CheckCircle2, MessageSquare, Filter } from 'lucide-react';
import { useToast } from '@/lib/context/ToastContext';

interface RequestItem {
  id: number;
  name: string;
  category: string;
  description: string;
  useCase: string;
  votes: number;
  status: 'Under Review' | 'Planned' | 'In Progress' | 'Completed';
  hasVoted?: boolean;
}

export default function RequestToolPage() {
  const [toolName, setToolName] = useState('');
  const [category, setCategory] = useState('pdf');
  const [description, setDescription] = useState('');
  const [useCase, setUseCase] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [requests, setRequests] = useState<RequestItem[]>([
    {
      id: 1,
      name: 'PDF Page Numbering & Header Stamp',
      category: 'pdf',
      description: 'Add automated page numbers (Page X of Y) or custom headers/footers to all pages in a PDF.',
      useCase: 'Essential for legal briefs, university theses, and multi-page corporate proposals.',
      votes: 48,
      status: 'Completed',
    },
    {
      id: 2,
      name: 'Markdown to Word (.docx) Converter',
      category: 'documents',
      description: 'Convert GitHub-flavored Markdown text with tables and code blocks into editable DOCX.',
      useCase: 'Enables developers to share formatted technical specs with non-technical business partners.',
      votes: 34,
      status: 'In Progress',
    },
    {
      id: 3,
      name: 'SVG to Canvas Vector Path Converter',
      category: 'developer',
      description: 'Transform raw SVG markup into HTML5 canvas draw commands or React Native vector shapes.',
      useCase: 'Speeding up UI animations and mobile asset bundling.',
      votes: 21,
      status: 'Planned',
    },
    {
      id: 4,
      name: 'Batch Image WebP Resizer & Watermark',
      category: 'image',
      description: 'Batch process 50+ photos at once, applying dimension constraints and subtle copyright watermark.',
      useCase: 'Photographers and e-commerce store owners uploading product catalogs.',
      votes: 19,
      status: 'Under Review',
    },
  ]);

  const { showToast } = useToast();

  const handleVote = (id: number) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const delta = r.hasVoted ? -1 : 1;
          return { ...r, votes: r.votes + delta, hasVoted: !r.hasVoted };
        }
        return r;
      })
    );
    showToast('Vote Updated', 'Your feedback informs our roadmap.', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName || !description) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newItem: RequestItem = {
        id: Date.now(),
        name: toolName,
        category,
        description,
        useCase,
        votes: 1,
        status: 'Under Review',
        hasVoted: true,
      };

      setRequests([newItem, ...requests]);
      setIsSubmitting(false);
      setToolName('');
      setDescription('');
      setUseCase('');
      showToast('Tool Request Submitted!', 'Our team will review your proposal.', 'success');
    }, 600);
  };

  return (
    <div className="min-h-screen py-12 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Community Driven Roadmap</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Suggest a New Tool
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-400">
            Have a workflow that needs simplifying? Submit your idea or vote on community requests. We build the most upvoted tools first.
          </p>
        </div>

        {/* Submission Form */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-500" />
            <span>Submit a Feature Proposal</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-500">Tool Name</label>
                <input
                  type="text"
                  required
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  placeholder="e.g. SVG to PNG High-Res Converter"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-500">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="pdf">PDF Tools</option>
                  <option value="documents">Document Tools</option>
                  <option value="spreadsheet">Spreadsheet & Data</option>
                  <option value="image">Image Studio</option>
                  <option value="seo">SEO & Web</option>
                  <option value="developer">Developer Utilities</option>
                  <option value="text">Text & Content</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-slate-500">
                Tool Functionality Description
              </label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What exactly should this tool do?"
                className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-slate-500">
                Why do you need it? (Use Case)
              </label>
              <input
                type="text"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                placeholder="e.g. Used daily when preparing client reports..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
              >
                Submit Tool Request
              </button>
            </div>
          </form>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Community Tool Proposals ({requests.length})
          </h2>

          <div className="space-y-4">
            {requests.map((r) => (
              <div
                key={r.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      {r.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        r.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : r.status === 'In Progress'
                          ? 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20'
                          : r.status === 'Planned'
                          ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{r.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {r.description}
                  </p>
                  {r.useCase && (
                    <p className="text-xs text-slate-400 italic">
                      Use Case: &quot;{r.useCase}&quot;
                    </p>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                  <button
                    onClick={() => handleVote(r.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      r.hasVoted
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${r.hasVoted ? 'fill-white' : ''}`} />
                    <span>{r.votes} Votes</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
