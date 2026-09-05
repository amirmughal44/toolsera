'use client';

import React, { useState } from 'react';
import { Globe, Upload, Download, Copy, Check } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';

interface IconSizeItem {
  size: number;
  label: string;
  url: string;
}

export function FaviconGeneratorTool({ tool }: { tool: ToolDefinition }) {
  const [file, setFile] = useState<File | null>(null);
  const [icons, setIcons] = useState<IconSizeItem[]>([]);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const { canUseTool, recordConversion } = useAuth();
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    setFile(f);
    generateFavicons(f);
  };

  const generateFavicons = (sourceFile: File) => {
    const url = URL.createObjectURL(sourceFile);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const sizes = [
        { size: 16, label: 'favicon-16x16.png (Standard Tab)' },
        { size: 32, label: 'favicon-32x32.png (Retina Tab)' },
        { size: 48, label: 'favicon-48x48.png (Desktop Shortcut)' },
        { size: 180, label: 'apple-touch-icon.png (iOS / iPad)' },
        { size: 512, label: 'android-chrome-512x512.png (PWA Splash)' },
      ];

      const results: IconSizeItem[] = sizes.map(({ size, label }) => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, size, size);
        }
        return {
          size,
          label,
          url: canvas.toDataURL('image/png'),
        };
      });

      setIcons(results);
      recordConversion(tool, 'favicon_package');
      showToast('Favicons Generated!', '5 web and mobile icon resolutions created.', 'success');
    };
  };

  const htmlCode = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<meta name="theme-color" content="#4f46e5">`;

  const copyHtml = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
    showToast('Code Copied', 'HTML <head> snippet copied to clipboard.', 'success');
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center transition-all bg-slate-50/50 dark:bg-slate-850/40">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Globe className="w-8 h-8" />
            </div>
            <div>
              <span className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                Upload your brand logo or graphic
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Generates 16x16, 32x32, 48x48, 180x180 Apple Touch, and 512x512 PWA icons
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{file.name}</span>
            <button
              onClick={() => {
                setFile(null);
                setIcons([]);
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Upload Different Image
            </button>
          </div>

          {/* Icon Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {icons.map((item) => (
              <div
                key={item.size}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 shrink-0 shadow-xs">
                    <img src={item.url} alt={`${item.size}px`} className="max-h-full max-w-full" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">{item.size}x{item.size} px</h5>
                    <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{item.label}</p>
                  </div>
                </div>

                <a
                  href={item.url}
                  download={`favicon-${item.size}x${item.size}.png`}
                  className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400"
                  title="Download icon"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>

          {/* HTML Snippet to copy */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                HTML &lt;head&gt; Implementation
              </span>
              <button
                onClick={copyHtml}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-cyan-300 overflow-x-auto p-2 bg-slate-950/80 rounded-xl">
              {htmlCode}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
