'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, FileText, Trash2, ArrowUp, ArrowDown, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';

interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  sizeFormatted: string;
}

export function PdfMergerTool({ tool }: { tool: ToolDefinition }) {
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [mergedPdfName, setMergedPdfName] = useState<string>('');
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
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files).filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (incoming.length === 0) {
      showToast('Invalid File', 'Please select valid PDF documents.', 'error');
      return;
    }

    const newItems: PdfFileItem[] = incoming.map((f) => ({
      id: Math.random().toString(36).substring(2, 9),
      file: f,
      name: f.name,
      sizeFormatted: formatBytes(f.size),
    }));

    setFiles((prev) => [...prev, ...newItems]);
    setMergedPdfUrl(null);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setMergedPdfUrl(null);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;
    const updated = [...files];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFiles(updated);
    setMergedPdfUrl(null);
  };

  const handleMerge = async () => {
    const check = canUseTool(tool);
    if (!check.allowed) {
      showToast('Quota or Plan Notice', check.reason || 'Upgrade required.', 'error');
      return;
    }

    if (files.length < 2) {
      showToast('At least 2 PDFs needed', 'Please upload at least two PDF documents to merge.', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        const arrayBuffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const outputName = `toolora_merged_${Date.now()}.pdf`;
      setMergedPdfUrl(url);
      setMergedPdfName(outputName);

      recordConversion(tool, outputName, formatBytes(mergedPdfBytes.length));
      showToast('PDFs Merged Successfully!', 'Your merged document is ready for download.', 'success');
    } catch (err: unknown) {
      console.error(err);
      showToast('Merge Error', 'Failed to merge selected PDFs. Please check if files are password protected.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setMergedPdfUrl(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-8 text-center transition-all bg-slate-50/50 dark:bg-slate-850/40">
        <input
          type="file"
          multiple
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <span className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200">
              Drag & drop multiple PDF files here, or{' '}
              <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports standard PDFs up to {tool.maxFileSizeFreeMB}MB for Free users (150MB for All-Access)
            </p>
          </div>
        </div>
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Selected Documents ({files.length})</span>
            <span>Order (Top to Bottom)</span>
          </div>

          <div className="space-y-2">
            {files.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {idx + 1}. {item.name}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.sizeFormatted}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => moveFile(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveFile(idx, 'down')}
                    disabled={idx === files.length - 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeFile(item.id)}
                    className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Remove file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action trigger */}
          {!mergedPdfUrl && (
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Clear All
              </button>
              <button
                onClick={handleMerge}
                disabled={isProcessing || files.length < 2}
                className="px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md shadow-indigo-500/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Merging PDFs in Browser...</span>
                  </>
                ) : (
                  <span>Merge {files.length} Files</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Result State */}
      {mergedPdfUrl && (
        <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/30 space-y-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Your Merged PDF is Ready!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Combined {files.length} documents into &quot;{mergedPdfName}&quot;.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={mergedPdfUrl}
              download={mergedPdfName}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Merged PDF</span>
            </a>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Merge Another Batch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
