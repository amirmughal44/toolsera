'use client';

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { FileText, Download, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';

export function WordToPdfTool({ tool }: { tool: ToolDefinition }) {
  const [docTitle, setDocTitle] = useState('Commercial Service Agreement');
  const [docSubtitle, setDocSubtitle] = useState('Prepared for Global Enterprise Client');
  const [docBody, setDocBody] = useState(
    `1. PURPOSE AND SCOPE\nThis document outlines the standard operational guidelines and terms of service provided by Toolora Inc. The deliverables will be executed in accordance with enterprise digital standards.\n\n2. CONFIDENTIALITY AND SECURITY\nAll data, documents, and technical infrastructure shall remain strictly private under zero-knowledge encryption protocols. Neither party shall disclose proprietary materials.\n\n3. PAYMENT AND TERMS\nInvoices are billed in accordance with the agreed schedule. Support terms and maintenance intervals are governed by standard service level specifications.\n\n4. SIGNATURE AND ACCEPTANCE\nBy executing this agreement, both parties accept the terms and conditions outlined herein.`
  );
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const { canUseTool, recordConversion } = useAuth();
  const { showToast } = useToast();

  const handleExportPdf = () => {
    const check = canUseTool(tool);
    if (!check.allowed) {
      showToast('Quota or Plan Notice', check.reason || 'Upgrade required.', 'error');
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 50;
      const contentWidth = pageWidth - margin * 2;

      // Header Banner
      doc.setFillColor(79, 70, 229); // Indigo 600
      doc.rect(margin, 40, contentWidth, 4, 'F');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text(docTitle, margin, 75);

      // Subtitle
      if (docSubtitle) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139); // Slate 500
        doc.text(docSubtitle, margin, 95);
      }

      // Date stamp
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 115);

      // Separator Line
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, 125, pageWidth - margin, 125);

      // Body text with word wrap
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(51, 65, 85);

      const splitText = doc.splitTextToSize(docBody, contentWidth);
      doc.text(splitText, margin, 150);

      // Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Created securely with Toolora — toolora.com', margin, pageHeight - 35);

      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setDownloadUrl(url);

      recordConversion(tool, `${docTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`, `${(pdfBlob.size / 1024).toFixed(1)} KB`);
      showToast('PDF Document Ready!', 'High-resolution PDF generated.', 'success');
    } catch {
      showToast('Error', 'Failed to generate PDF document.', 'error');
    }
  };

  const loadTemplate = (type: 'proposal' | 'invoice' | 'receipt') => {
    if (type === 'proposal') {
      setDocTitle('Business Project Proposal');
      setDocSubtitle('Project Deliverables and Timeline');
      setDocBody(
        `PROJECT OBJECTIVES:\nDeliver an enterprise-grade digital suite within 4 weeks.\n\nPHASE 1: RESEARCH & SPECIFICATION\n- Architectural modeling and tool registry integration.\n\nPHASE 2: IMPLEMENTATION\n- Zero-knowledge client tools, real spreadsheet engine, and SEO modules.\n\nPHASE 3: QA & DEPLOYMENT\n- Security review and cloud deployment.`
      );
    } else if (type === 'invoice') {
      setDocTitle('Consulting & Services Invoice');
      setDocSubtitle('Invoice #INV-2026-089 — Due on Receipt');
      setDocBody(
        `BILLED TO:\nAcme Global Ventures\nAttention: Accounts Payable\n\nSERVICES RENDERED:\n1. SaaS Architecture Review — $2,500\n2. Technical Implementation & Integration — $7,500\n3. Security Auditing & Compliance — $2,500\n\nTOTAL PAYABLE: $12,500\n\nPayment Details: International Wire Transfer\nSWIFT: TOOLUS33XXX | IBAN: US89TOOLORA000192837465`
      );
    } else {
      setDocTitle('Official Payment Receipt');
      setDocSubtitle('Receipt ID #RCT-98234');
      setDocBody(
        `PAYMENT CONFIRMATION:\nCustomer Name: Valued Client\nTransaction Status: PAID IN FULL\n\nITEMS:\n- Toolora All-Access Annual Membership: $100\n- Zero-Knowledge File Processing Suite: INCLUDED\n\nThank you for choosing Toolora.`
      );
    }
    setDownloadUrl(null);
  };

  return (
    <div className="space-y-6">
      {/* Template Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Quick Starter Templates:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadTemplate('proposal')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-indigo-500 text-slate-700 dark:text-slate-200"
          >
            Proposal
          </button>
          <button
            onClick={() => loadTemplate('invoice')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-indigo-500 text-slate-700 dark:text-slate-200"
          >
            Invoice
          </button>
          <button
            onClick={() => loadTemplate('receipt')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-indigo-500 text-slate-700 dark:text-slate-200"
          >
            Receipt
          </button>
        </div>
      </div>

      {/* Editor inputs */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
            Document Title
          </label>
          <input
            type="text"
            value={docTitle}
            onChange={(e) => {
              setDocTitle(e.target.value);
              setDownloadUrl(null);
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-base font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
            Subtitle / Metadata
          </label>
          <input
            type="text"
            value={docSubtitle}
            onChange={(e) => {
              setDocSubtitle(e.target.value);
              setDownloadUrl(null);
            }}
            className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
            Document Content (Supports Multi-line & Headings)
          </label>
          <textarea
            rows={10}
            value={docBody}
            onChange={(e) => {
              setDocBody(e.target.value);
              setDownloadUrl(null);
            }}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>
      </div>

      {/* Action button */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            setDocTitle('New Document');
            setDocSubtitle('');
            setDocBody('');
            setDownloadUrl(null);
          }}
          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          Clear Text
        </button>

        <button
          onClick={handleExportPdf}
          className="px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>Generate Clean PDF</span>
        </button>
      </div>

      {/* Result Card */}
      {downloadUrl && (
        <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/30 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                PDF Ready for Download!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Formatted with clean typography and ready for distribution.
              </p>
            </div>
          </div>
          <div className="pt-1">
            <a
              href={downloadUrl}
              download={`${docTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF File</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
