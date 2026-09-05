'use client';

import React, { useState, useRef } from 'react';
import { Pipette, Copy, Check, Upload } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useToast } from '@/lib/context/ToastContext';

export function ColorPickerTool({ tool }: { tool: ToolDefinition }) {
  const [selectedHex, setSelectedHex] = useState('#4f46e5');
  const [selectedRgb, setSelectedRgb] = useState('rgb(79, 70, 229)');
  const [selectedHsl, setSelectedHsl] = useState('hsl(243, 75%, 59%)');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setImgSrc(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];

    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    const rgbStr = `rgb(${r}, ${g}, ${b})`;

    // Convert to HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / d + 2;
          break;
        case bNorm:
          h = (rNorm - gNorm) / d + 4;
          break;
      }
      h /= 6;
    }
    const hslStr = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

    setSelectedHex(hex);
    setSelectedRgb(rgbStr);
    setSelectedHsl(hslStr);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
    showToast('Copied to Clipboard', text, 'success');
  };

  const curatedPalette = [
    '#4f46e5',
    '#06b6d4',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#0f172a',
  ];

  return (
    <div className="space-y-6">
      {/* Color Preview & Values */}
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-6">
        <div
          className="w-24 h-24 rounded-2xl shadow-lg border-4 border-white dark:border-slate-800 shrink-0 transition-colors"
          style={{ backgroundColor: selectedHex }}
        />

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          <div
            onClick={() => copyToClipboard(selectedHex, 'hex')}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-500 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase text-slate-400">HEX Code</span>
            <div className="flex items-center justify-between font-mono text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              <span>{selectedHex}</span>
              {copiedKey === 'hex' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            </div>
          </div>

          <div
            onClick={() => copyToClipboard(selectedRgb, 'rgb')}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-500 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase text-slate-400">RGB</span>
            <div className="flex items-center justify-between font-mono text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              <span className="truncate">{selectedRgb}</span>
              {copiedKey === 'rgb' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            </div>
          </div>

          <div
            onClick={() => copyToClipboard(selectedHsl, 'hsl')}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-500 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase text-slate-400">HSL</span>
            <div className="flex items-center justify-between font-mono text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              <span className="truncate">{selectedHsl}</span>
              {copiedKey === 'hsl' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            </div>
          </div>
        </div>
      </div>

      {/* Preset palette */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase text-slate-500">Design System Swatches</span>
        <div className="flex flex-wrap items-center gap-2">
          {curatedPalette.map((col) => (
            <button
              key={col}
              onClick={() => {
                setSelectedHex(col);
                copyToClipboard(col, col);
              }}
              className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-600 shadow-xs hover:scale-110 transition-transform"
              style={{ backgroundColor: col }}
              title={`Click to pick ${col}`}
            />
          ))}
        </div>
      </div>

      {/* Image Eyedropper Upload */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-slate-500">
            Pick Color from Photo or UI Screenshot
          </span>
          <label className="cursor-pointer text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 p-2 min-h-48 flex items-center justify-center">
          {imgSrc ? (
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="max-h-96 w-auto cursor-crosshair rounded-lg"
              title="Click anywhere to sample color"
            />
          ) : (
            <div className="text-center p-8 text-xs text-slate-400">
              Upload any image or screenshot to sample exact pixel colors using the interactive eyedropper.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
