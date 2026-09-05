'use client';

import React, { useState, useRef } from 'react';
import { Upload, Minimize2, Download, CheckCircle2, Sliders, Image as ImageIcon } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';

export function ImageCompressorTool({ tool }: { tool: ToolDefinition }) {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);

  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(75);
  const [isProcessing, setIsProcessing] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const { canUseTool, recordConversion } = useAuth();
  const { showToast } = useToast();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      showToast('Invalid Image', 'Please choose a JPG, PNG, or WebP photo.', 'error');
      return;
    }

    const url = URL.createObjectURL(file);
    setOriginalFile(file);
    setOriginalUrl(url);
    setOriginalSize(file.size);
    compress(file, url, quality);
  };

  const compress = (file: File, imgUrl: string, targetQuality: number) => {
    setIsProcessing(true);
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      // Determine output format
      const outMime = file.type === 'image/png' ? 'image/webp' : file.type;
      const qVal = targetQuality / 100;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setCompressedUrl(url);
            setCompressedSize(blob.size);
            setIsProcessing(false);
          }
        },
        outMime,
        qVal
      );
    };
  };

  const handleQualityChange = (val: number) => {
    setQuality(val);
    if (originalFile && originalUrl) {
      compress(originalFile, originalUrl, val);
    }
  };

  const handleDownload = () => {
    const check = canUseTool(tool);
    if (!check.allowed) {
      showToast('Notice', check.reason || 'Upgrade required.', 'error');
      return;
    }
    if (!compressedUrl || !originalFile) return;

    recordConversion(tool, `compressed_${originalFile.name}`, formatBytes(compressedSize));
    showToast('Downloaded!', 'Compressed image saved to your device.', 'success');
  };

  const savingsPercent =
    originalSize > 0 && compressedSize > 0
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {!originalUrl ? (
        <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center transition-all bg-slate-50/50 dark:bg-slate-850/40">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400">
              <Minimize2 className="w-8 h-8" />
            </div>
            <div>
              <span className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                Drop your image here to compress
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports JPG, PNG, and WebP up to {tool.maxFileSizeFreeMB}MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Compression Quality: {quality}%</span>
              </div>
              <button
                onClick={() => {
                  setOriginalUrl(null);
                  setCompressedUrl(null);
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Choose Different Image
              </button>
            </div>

            <input
              type="range"
              min="10"
              max="95"
              step="5"
              value={quality}
              onChange={(e) => handleQualityChange(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Before and After Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Original Size</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {formatBytes(originalSize)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Compressed Size</span>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatBytes(compressedSize)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Total Savings</span>
              <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                -{savingsPercent}%
              </div>
            </div>
          </div>

          {/* Visual Previews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500">Original</span>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-950 max-h-72 flex items-center justify-center p-2">
                {originalUrl && (
                  <img src={originalUrl} alt="Original" className="max-h-64 object-contain rounded-lg" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500">Optimized Preview</span>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-950 max-h-72 flex items-center justify-center p-2">
                {compressedUrl && (
                  <img src={compressedUrl} alt="Compressed" className="max-h-64 object-contain rounded-lg" />
                )}
              </div>
            </div>
          </div>

          {/* Download CTA */}
          {compressedUrl && originalFile && (
            <div className="pt-2">
              <a
                href={compressedUrl}
                download={`compressed_${originalFile.name}`}
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Compressed Photo ({formatBytes(compressedSize)})</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
