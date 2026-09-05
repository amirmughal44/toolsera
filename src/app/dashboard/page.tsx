'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  ShieldCheck,
  Sparkles,
  Bookmark,
  History,
  CreditCard,
  Settings,
  ArrowRight,
  ExternalLink,
  Trash2,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { TOOLS_REGISTRY, getToolBySlug } from '@/lib/tools/registry';
import { useToast } from '@/lib/context/ToastContext';

export default function DashboardPage() {
  const {
    user,
    isAllAccess,
    dailyUsageCount,
    maxDailyFreeQuota,
    favorites,
    history,
    toggleFavorite,
    downgradeToFree,
    upgradeToAllAccess,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'favorites' | 'history' | 'billing'>('overview');
  const { showToast } = useToast();

  const favoriteToolObjects = favorites
    .map((slug) => getToolBySlug(slug))
    .filter(Boolean);

  const usagePercent = isAllAccess
    ? 0
    : Math.min(100, Math.round((dailyUsageCount / maxDailyFreeQuota) * 100));

  return (
    <div className="min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Greeting & Plan Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
              {user?.name?.slice(0, 2).toUpperCase() || 'TU'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {user?.name || 'Toolora Member'}
                </h1>
                {isAllAccess ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    All-Access Pro
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Free Starter
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{user?.email || 'guest@toolora.local'}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isAllAccess ? (
              <Link
                href="/pricing"
                className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Upgrade to All-Access — $100</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  downgradeToFree();
                  showToast('Switched to Free Mode', 'You can test the free tier experience.', 'info');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Simulate Free Tier
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Overview & Quota
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'favorites'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pinned Favorites ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Recent Conversions ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'billing'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Subscription & Billing
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Daily Usage Quota Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Daily Operation Quota
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isAllAccess
                      ? 'All-Access active: Unlimited daily conversions with priority processing.'
                      : `Free tier quota resets daily at midnight UTC.`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                    {isAllAccess ? 'Unlimited' : `${dailyUsageCount} / ${maxDailyFreeQuota}`}
                  </span>
                  <span className="block text-[10px] uppercase text-slate-400">Operations Today</span>
                </div>
              </div>

              {!isAllAccess && (
                <div className="space-y-1.5">
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        usagePercent >= 100 ? 'bg-rose-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{dailyUsageCount} operations used</span>
                    <span>{Math.max(0, maxDailyFreeQuota - dailyUsageCount)} remaining today</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Favorites Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Favorite Utilities
                </h3>
                <Link href="/tools" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                  Browse All Tools
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {favoriteToolObjects.map((tool) => (
                  <Link
                    key={tool!.id}
                    href={`/${tool!.slug}`}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400">{tool!.category}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {tool!.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{tool!.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Favorites */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pinned Favorite Tools</h3>
            {favoriteToolObjects.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                No pinned tools yet. Bookmark tools using the star button on any tool page.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteToolObjects.map((tool) => (
                  <div
                    key={tool!.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400">{tool!.category}</span>
                        <button
                          onClick={() => toggleFavorite(tool!.slug)}
                          className="text-xs text-rose-500 hover:underline"
                        >
                          Unpin
                        </button>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{tool!.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{tool!.description}</p>
                    </div>
                    <Link
                      href={`/${tool!.slug}`}
                      className="mt-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"
                    >
                      <span>Open Tool</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Recent In-Browser Conversions
            </h3>
            {history.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                No recent conversions yet. Use any tool to view history.
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-500">
                      <th className="p-3.5 font-bold">Tool</th>
                      <th className="p-3.5 font-bold">File / Output</th>
                      <th className="p-3.5 font-bold">Size</th>
                      <th className="p-3.5 font-bold">Date / Time</th>
                      <th className="p-3.5 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {history.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                          <Link href={`/${record.toolSlug}`} className="hover:underline text-indigo-600 dark:text-indigo-400">
                            {record.toolName}
                          </Link>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">
                          {record.fileName}
                        </td>
                        <td className="p-3.5 text-slate-500">{record.fileSizeFormatted || '—'}</td>
                        <td className="p-3.5 text-slate-500">
                          {new Date(record.timestamp).toLocaleDateString()}{' '}
                          {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Billing */}
        {activeTab === 'billing' && (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Subscription & Plan</h3>
              <p className="text-xs text-slate-500 mt-1">Manage your active tier and payments.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold">Current Tier</span>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {isAllAccess ? 'Toolora All-Access ($100)' : 'Starter Free Tier'}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isAllAccess
                    ? 'Unrestricted batch processing & advanced tools active.'
                    : 'Upgrade to unlock all tools with no limits.'}
                </p>
              </div>

              {!isAllAccess ? (
                <Link
                  href="/pricing"
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md"
                >
                  Upgrade to All-Access
                </Link>
              ) : (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Active Subscription
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
