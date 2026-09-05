'use client';

import React, { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { Upload, RotateCw, FileText, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';

export function PdfRotateTool({ tool }: { tool: ToolDefinition }) {
  const [file, setFile] = useState<File | null>(null);
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultPdfUrl, setResultPdfUrl] = useState<string | null>(null);
  const { canUseTool, recordConversion } = useAuth();
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    if (f.type !== 'application/pdf' && !f.name.endsWith('.pdf')) {
      showToast('Invalid File', 'Please select a PDF document.', 'error');
      return;
    }
    setFile(f);
    setResultPdfUrl(null);
  };

  const handleRotate = async () => {
    const check = canUseTool(tool);
    if (!check.allowed) {
      showToast('Quota or Plan Notice', check.reason || 'Upgrade required.', 'error');
      return;
    }

    if (!file) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer);
      const pages = pdf.getPages();

      pages.forEach((page) => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + rotationAngle) % 360));
      });

      const rotatedBytes = await pdf.save();
      const blob = new Blob([rotatedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setResultPdfUrl(url);
      recordConversion(tool, `rotated_${file.name}`);
      showToast('Rotated Successfully!', `Rotated all pages by ${rotationAngle}° clockwise.`, 'success');
    } catch {
      showToast('Rotation Error', 'Could not rotate PDF pages.', 'error');
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
              <RotateCw className="w-8 h-8" />
            </div>
            <div>
              <span className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                Choose a PDF to permanently rotate
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Fix sideways or upside-down orientations
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
                <p className="text-xs text-slate-500 dark:text-slate-400">Ready to rotate</p>
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

          {/* Rotation options */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Rotation Angle (Clockwise)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[90, 180, 270].map((deg) => (
                <button
                  key={deg}
                  onClick={() => setRotationAngle(deg)}
                  className={`p-3 rounded-xl border font-bold text-sm transition-all ${
                    rotationAngle === deg
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500'
                  }`}
                >
                  +{deg}° Degrees
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleRotate}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-md"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Rotating Pages...</span>
                </>
              ) : (
                <span>Apply +{rotationAngle}° Rotation</span>
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
                    PDF Rotated Successfully!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Your re-oriented document is ready to download.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href={resultPdfUrl}
                  download={`rotated_${rotationAngle}deg_${file.name}`}
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Rotated PDF</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
