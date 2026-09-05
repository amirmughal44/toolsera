'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Maximize2, Download, Lock, Unlock } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';

export function ImageResizeCropTool({ tool }: { tool: ToolDefinition }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  const [targetWidth, setTargetWidth] = useState<number>(800);
  const [targetHeight, setTargetHeight] = useState<number>(600);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);

  const { canUseTool, recordConversion } = useAuth();
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    const url = URL.createObjectURL(f);
    setFile(f);
    setPreviewUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setOrigWidth(img.width);
      setOrigHeight(img.height);
      setTargetWidth(img.width);
      setTargetHeight(img.height);
    };
    setResizedUrl(null);
  };

  const handleWidthChange = (w: number) => {
    setTargetWidth(w);
    if (lockAspectRatio && origWidth > 0 && origHeight > 0) {
      setTargetHeight(Math.round((w / origWidth) * origHeight));
    }
  };

  const handleHeightChange = (h: number) => {
    setTargetHeight(h);
    if (lockAspectRatio && origWidth > 0 && origHeight > 0) {
      setTargetWidth(Math.round((h / origHeight) * origWidth));
    }
  };

  const handleResize = () => {
    const check = canUseTool(tool);
    if (!check.allowed) {
      showToast('Notice', check.reason || 'Upgrade required.', 'error');
      return;
    }
    if (!previewUrl || !file) return;

    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setResizedUrl(url);
            recordConversion(tool, `resized_${targetWidth}x${targetHeight}_${file.name}`);
            showToast('Image Resized!', `${targetWidth} × ${targetHeight} px ready.`, 'success');
          }
        },
        file.type || 'image/png',
        0.95
      );
    };
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
              <Maximize2 className="w-8 h-8" />
            </div>
            <div>
              <span className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                Upload image to scale or resize
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Custom width, height, and aspect ratio controls
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{file.name}</h4>
              <p className="text-xs text-slate-500">
                Original Dimensions: <strong>{origWidth} × {origHeight} px</strong>
              </p>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
                setResizedUrl(null);
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Choose Different Image
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Target Dimensions
              </span>
              <button
                onClick={() => setLockAspectRatio(!lockAspectRatio)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                  lockAspectRatio
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                {lockAspectRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{lockAspectRatio ? 'Aspect Ratio Locked' : 'Aspect Ratio Free'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Width (px)</label>
                <input
                  type="number"
                  value={targetWidth}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Height (px)</label>
                <input
                  type="number"
                  value={targetHeight}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleResize}
              className="px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all flex items-center gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Resize to {targetWidth} × {targetHeight} px</span>
            </button>
          </div>

          {resizedUrl && (
            <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/30 space-y-4 animate-in fade-in">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Resized Image Ready!
              </h4>
              <a
                href={resizedUrl}
                download={`resized_${targetWidth}x${targetHeight}_${file.name}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download Resized Image</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
