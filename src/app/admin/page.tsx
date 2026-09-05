'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Cpu,
  Users,
  CreditCard,
  Settings,
  Activity,
  Heart,
  FileCheck,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { TOOLS_REGISTRY } from '@/lib/tools/registry';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';

export default function AdminPortalPage() {
  const { user, isAllAccess } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'requests' | 'charity'>('overview');
  const [toolsList, setToolsList] = useState(TOOLS_REGISTRY);

  const [requests, setRequests] = useState([
    { id: 1, title: 'Markdown to HTML live renderer', category: 'developer', status: 'Planned', votes: 14 },
    { id: 2, title: 'Extract audio from MP4 video', category: 'media', status: 'Under Review', votes: 29 },
    { id: 3, title: 'PDF page number watermark', category: 'pdf', status: 'Completed', votes: 42 },
  ]);

  const [charityLedger, setCharityLedger] = useState([
    {
      id: 'DISB-2026-01',
      date: '2026-08-15',
      initiative: 'Digital Literacy Student Laptops',
      amountPKR: 150000,
      status: 'Verified Disbursed',
    },
    {
      id: 'DISB-2026-02',
      date: '2026-07-20',
      initiative: 'Community Tech Education Workshop',
      amountPKR: 75000,
      status: 'Verified Disbursed',
    },
  ]);

  const toggleToolAccess = (id: string) => {
    setToolsList((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, accessLevel: t.accessLevel === 'free' ? 'premium' : 'free' }
          : t
      )
    );
    showToast('Tool Updated', 'Access level toggled.', 'info');
  };

  const updateRequestStatus = (id: number, newStatus: string) => {
    setRequests(
      requests.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    showToast('Status Updated', `Request marked as ${newStatus}`, 'success');
  };

  return (
    <div className="min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Platform Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Toolora Operations & Analytics
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <Activity className="w-4 h-4" />
            <span>Systems Normal (100% Client Zero-Knowledge)</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'hover:text-slate-900'
            }`}
          >
            Analytics Overview
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'tools' ? 'bg-indigo-600 text-white' : 'hover:text-slate-900'
            }`}
          >
            Tool Registry Manager ({toolsList.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'requests' ? 'bg-indigo-600 text-white' : 'hover:text-slate-900'
            }`}
          >
            Feature Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('charity')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'charity' ? 'bg-indigo-600 text-white' : 'hover:text-slate-900'
            }`}
          >
            Charity Transparency Ledger
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs font-bold uppercase text-slate-400">Active Verified Tools</span>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {toolsList.length}
                </div>
                <p className="text-[11px] text-emerald-500 font-semibold">100% operational in-browser</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs font-bold uppercase text-slate-400">All-Access Price</span>
                <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  $100
                </div>
                <p className="text-[11px] text-slate-500">One-Time or Annual (USD)</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs font-bold uppercase text-slate-400">Server Storage Retention</span>
                <div className="text-3xl font-extrabold text-emerald-600">0 MB</div>
                <p className="text-[11px] text-slate-500">Zero-knowledge local memory</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs font-bold uppercase text-slate-400">Verified Charity Grants</span>
                <div className="text-3xl font-extrabold text-rose-500">$810</div>
                <p className="text-[11px] text-slate-500">≈ PKR 225,000 (Digital Literacy)</p>
              </div>
            </div>

            {/* Popular tools table */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Core Tool Performance & Status
              </h3>
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <th className="p-3.5 font-bold">Tool Name</th>
                      <th className="p-3.5 font-bold">Category</th>
                      <th className="p-3.5 font-bold">Processing Type</th>
                      <th className="p-3.5 font-bold">Access Tier</th>
                      <th className="p-3.5 font-bold">Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {toolsList.slice(0, 7).map((t) => (
                      <tr key={t.id}>
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{t.name}</td>
                        <td className="p-3.5 uppercase font-mono text-[10px] text-slate-400">{t.category}</td>
                        <td className="p-3.5 text-slate-500">{t.processingMethod}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              t.accessLevel === 'premium'
                                ? 'bg-amber-500/10 text-amber-600'
                                : 'bg-emerald-500/10 text-emerald-600'
                            }`}
                          >
                            {t.accessLevel}
                          </span>
                        </td>
                        <td className="p-3.5 text-emerald-600 font-medium">✓ Operational</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tool Registry */}
        {activeTab === 'tools' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Tool Registry Manager
                </h3>
                <p className="text-xs text-slate-500">
                  Toggle tools between Free starter tier and All-Access premium restriction.
                </p>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="p-3.5 font-bold">Tool Name</th>
                    <th className="p-3.5 font-bold">Slug</th>
                    <th className="p-3.5 font-bold">Category</th>
                    <th className="p-3.5 font-bold">Access Tier</th>
                    <th className="p-3.5 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {toolsList.map((t) => (
                    <tr key={t.id}>
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{t.name}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">/{t.slug}</td>
                      <td className="p-3.5 uppercase font-mono text-[10px] text-slate-400">{t.category}</td>
                      <td className="p-3.5 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                            t.accessLevel === 'premium'
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          }`}
                        >
                          {t.accessLevel}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => toggleToolAccess(t.id)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                        >
                          Switch to {t.accessLevel === 'free' ? 'All-Access' : 'Free'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Feature requests */}
        {activeTab === 'requests' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Community Tool Requests</h3>
            <div className="space-y-3">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{r.title}</h4>
                    <span className="text-xs text-slate-400 uppercase font-mono">
                      Category: {r.category} • {r.votes} Votes
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      {r.status}
                    </span>
                    <select
                      value={r.status}
                      onChange={(e) => updateRequestStatus(r.id, e.target.value)}
                      className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800"
                    >
                      <option value="Under Review">Under Review</option>
                      <option value="Planned">Planned</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Charity */}
        {activeTab === 'charity' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Charity Donations Public Ledger
            </h3>
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="p-3.5 font-bold">Disbursement ID</th>
                    <th className="p-3.5 font-bold">Initiative</th>
                    <th className="p-3.5 font-bold">Date</th>
                    <th className="p-3.5 font-bold">Amount (PKR)</th>
                    <th className="p-3.5 font-bold">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {charityLedger.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">{item.id}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{item.initiative}</td>
                      <td className="p-3.5 text-slate-500">{item.date}</td>
                      <td className="p-3.5 font-bold text-emerald-600">PKR {item.amountPKR.toLocaleString()}</td>
                      <td className="p-3.5 text-xs text-emerald-600 font-semibold">✓ {item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
