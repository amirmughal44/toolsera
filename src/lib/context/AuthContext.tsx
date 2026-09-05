'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ToolDefinition } from '../tools/types';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'all-access';
  billingType?: 'one-time' | 'annual';
  joinedAt: string;
}

export interface ConversionRecord {
  id: string;
  toolSlug: string;
  toolName: string;
  timestamp: string;
  fileName?: string;
  fileSizeFormatted?: string;
  status: 'completed' | 'failed';
}

interface AuthContextType {
  user: UserProfile | null;
  isAllAccess: boolean;
  dailyUsageCount: number;
  maxDailyFreeQuota: number;
  favorites: string[];
  history: ConversionRecord[];
  login: (email: string, name?: string) => void;
  logout: () => void;
  upgradeToAllAccess: (billingType: 'one-time' | 'annual') => void;
  downgradeToFree: () => void;
  recordConversion: (tool: ToolDefinition, fileName?: string, fileSizeFormatted?: string) => void;
  toggleFavorite: (toolSlug: string) => void;
  isFavorite: (toolSlug: string) => boolean;
  canUseTool: (tool: ToolDefinition) => { allowed: boolean; reason?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MAX_FREE_DAILY = 5;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<string[]>(['pdf-merger', 'excel-generator', 'image-compressor']);
  const [history, setHistory] = useState<ConversionRecord[]>([]);
  const [dailyUsageCount, setDailyUsageCount] = useState<number>(0);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('toolora_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // Default guest user profile
        setUser({
          id: 'usr_guest_01',
          name: 'Guest User',
          email: 'guest@toolora.local',
          plan: 'free',
          joinedAt: new Date().toISOString(),
        });
      }

      const savedFavs = localStorage.getItem('toolora_favs');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }

      const savedHistory = localStorage.getItem('toolora_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }

      // Check daily usage by date
      const todayKey = `toolora_usage_${new Date().toISOString().slice(0, 10)}`;
      const currentUsage = parseInt(localStorage.getItem(todayKey) || '0', 10);
      setDailyUsageCount(currentUsage);
    } catch {
      // Ignore
    }
  }, []);

  const isAllAccess = user?.plan === 'all-access';

  const login = (email: string, name: string = 'SaaS Member') => {
    const updated: UserProfile = {
      id: `usr_${Math.random().toString(36).substring(2, 8)}`,
      name,
      email,
      plan: user?.plan || 'free',
      billingType: user?.billingType,
      joinedAt: user?.joinedAt || new Date().toISOString(),
    };
    setUser(updated);
    try {
      localStorage.setItem('toolora_user', JSON.stringify(updated));
    } catch {}
  };

  const logout = () => {
    const guest: UserProfile = {
      id: 'usr_guest_01',
      name: 'Guest User',
      email: 'guest@toolora.local',
      plan: 'free',
      joinedAt: new Date().toISOString(),
    };
    setUser(guest);
    try {
      localStorage.setItem('toolora_user', JSON.stringify(guest));
    } catch {}
  };

  const upgradeToAllAccess = (billingType: 'one-time' | 'annual') => {
    const updated: UserProfile = {
      id: user?.id || `usr_${Math.random().toString(36).substring(2, 8)}`,
      name: user?.name === 'Guest User' ? 'Toolora Pro Member' : (user?.name || 'Toolora Pro Member'),
      email: user?.email === 'guest@toolora.local' ? 'member@toolora.com' : (user?.email || 'member@toolora.com'),
      plan: 'all-access',
      billingType,
      joinedAt: user?.joinedAt || new Date().toISOString(),
    };
    setUser(updated);
    try {
      localStorage.setItem('toolora_user', JSON.stringify(updated));
    } catch {}
  };

  const downgradeToFree = () => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      plan: 'free',
      billingType: undefined,
    };
    setUser(updated);
    try {
      localStorage.setItem('toolora_user', JSON.stringify(updated));
    } catch {}
  };

  const recordConversion = (tool: ToolDefinition, fileName?: string, fileSizeFormatted?: string) => {
    const newRecord: ConversionRecord = {
      id: `cnv_${Math.random().toString(36).substring(2, 9)}`,
      toolSlug: tool.slug,
      toolName: tool.name,
      timestamp: new Date().toISOString(),
      fileName: fileName || `${tool.slug}-output`,
      fileSizeFormatted,
      status: 'completed',
    };

    const updatedHistory = [newRecord, ...history.slice(0, 49)];
    setHistory(updatedHistory);

    // Update daily counter
    const todayKey = `toolora_usage_${new Date().toISOString().slice(0, 10)}`;
    const newCount = dailyUsageCount + 1;
    setDailyUsageCount(newCount);

    try {
      localStorage.setItem('toolora_history', JSON.stringify(updatedHistory));
      localStorage.setItem(todayKey, newCount.toString());
    } catch {}
  };

  const toggleFavorite = (toolSlug: string) => {
    let updated: string[];
    if (favorites.includes(toolSlug)) {
      updated = favorites.filter((s) => s !== toolSlug);
    } else {
      updated = [...favorites, toolSlug];
    }
    setFavorites(updated);
    try {
      localStorage.setItem('toolora_favs', JSON.stringify(updated));
    } catch {}
  };

  const isFavorite = (toolSlug: string) => favorites.includes(toolSlug);

  const canUseTool = (tool: ToolDefinition): { allowed: boolean; reason?: string } => {
    if (isAllAccess) return { allowed: true };

    if (tool.accessLevel === 'premium') {
      return {
        allowed: false,
        reason: 'This tool requires Toolora All-Access. Upgrade for $100 to unlock.',
      };
    }

    if (dailyUsageCount >= MAX_FREE_DAILY) {
      return {
        allowed: false,
        reason: `You have reached your free daily quota of ${MAX_FREE_DAILY} conversions. Upgrade to All-Access for unlimited daily usage.`,
      };
    }

    return { allowed: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAllAccess,
        dailyUsageCount,
        maxDailyFreeQuota: MAX_FREE_DAILY,
        favorites,
        history,
        login,
        logout,
        upgradeToAllAccess,
        downgradeToFree,
        recordConversion,
        toggleFavorite,
        isFavorite,
        canUseTool,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
