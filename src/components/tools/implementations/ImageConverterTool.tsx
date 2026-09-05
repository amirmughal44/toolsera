'use client';

import React, { useState } from 'react';
import { Upload, RefreshCw, Download, CheckCircle2 } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';

export function ImageConverterTool({ tool }: { tool: ToolDefinition }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp');
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const { canUseTool, recordConversion } = useAuth();
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setConvertedUrl(null);
  };

  const handleConvert = () => {
    const check = canUseTool(tool);
    if (!check.allowed) {
      showToast('Notice', check.reason || 'Upgrade required.', 'error');
      return;
    }
    if (!file || !previewUrl) return;

    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setConvertedUrl(url);
            const ext = targetFormat.split('/')[1];
            recordConversion(tool, `converted_${file.name.replace(/\.[^/.]+$/, '')}.${ext}`);
            showToast('Conversion Complete!', `Converted image to ${ext.toUpperCase()}.`, 'success');
          }
        },
        targetFormat,
        0.92
      );
    };
  };

  const getExt = () => {
    if (targetFormat === 'image/jpeg') return 'jpg';
    if (targetFormat === 'image/png') return 'png';
    return 'webp';
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
            <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400">
              <RefreshCw className="w-8 h-8" />
            </div>
            <div>
              <span className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                Choose an image to convert
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Convert between JPG, PNG, and WebP instantly
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate max-w-sm">
              {file.name}
            </span>
            <button
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
                setConvertedUrl(null);
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Change
            </button>
          </div>

          {/* Format selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-slate-500">
              Target Output Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'WebP (Next-Gen)', value: 'image/webp' as const },
                { label: 'PNG (Lossless)', value: 'image/png' as const },
                { label: 'JPG (Standard)', value: 'image/jpeg' as const },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTargetFormat(opt.value);
                    setConvertedUrl(null);
                  }}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                    targetFormat === opt.value
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <button
              onClick={handleConvert}
              className="px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Convert to {getExt().toUpperCase()}</span>
            </button>
          </div>

          {convertedUrl && (
            <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/30 space-y-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Image Converted to {getExt().toUpperCase()}!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Zero compression loss and clean format encoding.
                  </p>
                </div>
              </div>

              <a
                href={convertedUrl}
                download={`${file.name.replace(/\.[^/.]+$/, '')}.${getExt()}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download Converted Image</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
