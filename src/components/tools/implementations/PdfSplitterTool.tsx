'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, FileText, Download, CheckCircle2, Loader2, Scissors } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';

export function PdfSplitterTool({ tool }: { tool: ToolDefinition }) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pageRange, setPageRange] = useState<string>('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultPdfUrl, setResultPdfUrl] = useState<string | null>(null);
  const [resultPdfName, setResultPdfName] = useState<string>('');
  const { canUseTool, recordConversion } = useAuth();
  const { showToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    if (f.type !== 'application/pdf' && !f.name.endsWith('.pdf')) {
      showToast('Invalid File', 'Please upload a PDF file.', 'error');
      return;
    }

    try {
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer);
      const totalPages = pdf.getPageCount();
      setFile(f);
      setPageCount(totalPages);
      setPageRange(totalPages > 1 ? `1-${Math.min(3, totalPages)}` : '1');
      setResultPdfUrl(null);
    } catch {
      showToast('Read Error', 'Unable to parse PDF. The file may be password encrypted.', 'error');
    }
  };

  // Parses ranges like "1-3, 5, 7" into 0-indexed page indices
  const parsePageIndices = (rangeStr: string, total: number): number[] => {
    const indices = new Set<number>();
    const parts = rangeStr.split(',').map((p) => p.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const from = Math.max(1, Math.min(start, end));
          const to = Math.min(total, Math.max(start, end));
          for (let i = from; i <= to; i++) {
            indices.add(i - 1);
          }
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= total) {
          indices.add(p - 1);
        }
      }
    }
    return Array.from(indices).sort((a, b) => a - b);
  };

  const handleExtract = async () => {
    const check = canUseTool(tool);
    if (!check.allowed) {
      showToast('Quota or Plan Notice', check.reason || 'Upgrade required.', 'error');
      return;
    }

    if (!file) return;

    const indices = parsePageIndices(pageRange, pageCount);
    if (indices.length === 0) {
      showToast('Invalid Page Range', `Please enter valid pages between 1 and ${pageCount}.`, 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const originalBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(originalBuffer);
      const subDoc = await PDFDocument.create();

      const copied = await subDoc.copyPages(srcDoc, indices);
      copied.forEach((p) => subDoc.addPage(p));

      const subBytes = await subDoc.save();
      const blob = new Blob([subBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const outputName = `extracted_pages_${Date.now()}.pdf`;
      setResultPdfUrl(url);
      setResultPdfName(outputName);

      recordConversion(tool, outputName, `${(subBytes.length / 1024).toFixed(1)} KB`);
      showToast('Extraction Complete!', `Extracted ${indices.length} pages successfully.`, 'success');
    } catch {
      showToast('Extraction Failed', 'An error occurred while extracting PDF pages.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center transition-all bg-slate-50/50 dark:bg-slate-850/40">
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Scissors className="w-8 h-8" />
            </div>
            <div>
              <span className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                Choose a PDF to split or extract pages
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Zero uploads: extracted locally on your device
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File summary */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{file.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total Document Pages: <strong>{pageCount}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setResultPdfUrl(null);
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Choose Different File
            </button>
          </div>

          {/* Range input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Pages to Extract
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="e.g. 1-3, 5, 8-10"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleExtract}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <span>Extract Pages</span>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Format: comma separated (e.g. <strong>1, 3, 5</strong>) or ranges (e.g. <strong>1-4</strong>)
            </p>
          </div>

          {/* Result preview */}
          {resultPdfUrl && (
            <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/30 space-y-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500 text-white">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Pages Extracted Successfully!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Ready as &quot;{resultPdfName}&quot;.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href={resultPdfUrl}
                  download={resultPdfName}
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Extracted PDF</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
