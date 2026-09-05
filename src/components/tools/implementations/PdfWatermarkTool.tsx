'use client';

import React, { useState } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { Upload, Stamp, FileText, Download, CheckCircle2, Loader2, Lock } from 'lucide-react';
import Link from 'next/link';
import { ToolDefinition } from '@/lib/tools/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';

export function PdfWatermarkTool({ tool }: { tool: ToolDefinition }) {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [opacity, setOpacity] = useState<number>(0.3);
  const [fontSize, setFontSize] = useState<number>(48);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultPdfUrl, setResultPdfUrl] = useState<string | null>(null);
  const { isAllAccess, canUseTool, recordConversion } = useAuth();
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    if (f.type !== 'application/pdf' && !f.name.endsWith('.pdf')) {
      showToast('Invalid File', 'Please select a valid PDF file.', 'error');
      return;
    }
    setFile(f);
    setResultPdfUrl(null);
  };

  const handleApplyWatermark = async () => {
    const check = canUseTool(tool);
    if (!check.allowed) {
      showToast('All-Access Required', check.reason || 'Upgrade required.', 'error');
      return;
    }

    if (!file || !watermarkText.trim()) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer);
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const pages = pdf.getPages();

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        page.drawText(watermarkText, {
          x: width / 2 - textWidth / 2,
          y: height / 2 - textHeight / 2,
          size: fontSize,
          font,
          color: rgb(0.8, 0.1, 0.1),
          opacity,
          rotate: degrees(45),
        });
      });

      const stampedBytes = await pdf.save();
      const blob = new Blob([stampedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setResultPdfUrl(url);
      recordConversion(tool, `stamped_${file.name}`);
      showToast('Watermark Applied!', 'Document stamped successfully.', 'success');
    } catch {
      showToast('Error', 'Failed to apply watermark to PDF.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isAllAccess && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Premium Toolora Utility
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                This advanced document protection tool is part of the Toolora All-Access tier ($100).
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 shrink-0 transition-colors"
          >
            Upgrade Plan
          </Link>
        </div>
      )}

      {!file ? (
        <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center transition-all bg-slate-50/50 dark:bg-slate-850/40">
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Stamp className="w-8 h-8" />
            </div>
            <div>
              <span className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                Upload PDF to apply watermark or confidential stamp
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Embedded directly into the vector document stream
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{file.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ready to watermark</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setResultPdfUrl(null);
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Change File
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-slate-500">Watermark Text</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="e.g. CONFIDENTIAL"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-slate-500">
                Opacity: {Math.round(opacity * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 mt-2"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-slate-500">
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="24"
                max="72"
                step="4"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 mt-2"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleApplyWatermark}
              disabled={isProcessing || !watermarkText.trim()}
              className="px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Stamping Document...</span>
                </>
              ) : (
                <span>Stamp Watermark on All Pages</span>
              )}
            </button>
          </div>

          {resultPdfUrl && (
            <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/30 space-y-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500 text-white">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Watermark Successfully Applied!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Your protected PDF is ready to download.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href={resultPdfUrl}
                  download={`watermarked_${file.name}`}
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Stamped PDF</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
