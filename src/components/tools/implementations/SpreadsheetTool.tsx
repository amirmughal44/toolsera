'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Table,
  Plus,
  Trash2,
  Download,
  Upload,
  Sparkles,
  FileSpreadsheet,
  Calculator,
  RefreshCw,
} from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';

type GridData = string[][];

const TEMPLATES = {
  blank: [
    ['Item', 'Quantity', 'Unit Price', 'Total'],
    ['Product Alpha', '5', '120', '=B2*C2'],
    ['Product Beta', '10', '45', '=B3*C3'],
    ['Product Gamma', '2', '350', '=B4*C4'],
    ['Total Cost', '', '', '=SUM(D2:D4)'],
  ],
  expense: [
    ['Date', 'Category', 'Description', 'Amount ($)'],
    ['2026-09-01', 'Hosting', 'Cloud Server Cluster', '125'],
    ['2026-09-02', 'Office', 'High-speed Fiber Internet', '45'],
    ['2026-09-03', 'Software', 'Dev Licenses', '80'],
    ['2026-09-04', 'Marketing', 'Digital Ads Campaign', '150'],
    ['Total Expenses', '', '', '=SUM(D2:D5)'],
  ],
  attendance: [
    ['Employee Name', 'Role', 'Days Present', 'Status'],
    ['Sarah Khan', 'Frontend Engineer', '22', 'Full Attendance'],
    ['Zayd Ali', 'Product Designer', '21', 'Present'],
    ['Bilal Ahmed', 'Backend Architect', '22', 'Full Attendance'],
    ['Amina Malik', 'QA Specialist', '20', 'Present'],
    ['Average Attendance', '', '=AVERAGE(C2:C5)', ''],
  ],
  invoice: [
    ['Invoice #', 'INV-2026-101', 'Date:', '2026-09-05'],
    ['Client Name', 'Global Dynamics Ltd', 'Terms:', 'Net 15 Days'],
    ['Description', 'Hours', 'Rate ($/hr)', 'Subtotal'],
    ['Platform Architecture Review', '40', '150', '6000'],
    ['Security & Code Audit', '20', '180', '3600'],
    ['Grand Total', '', '', '=SUM(D4:D5)'],
  ],
};

export function SpreadsheetTool({ tool }: { tool: ToolDefinition }) {
  const [data, setData] = useState<GridData>(TEMPLATES.blank);
  const [activeTemplate, setActiveTemplate] = useState<string>('blank');
  const [sheetName, setSheetName] = useState('Toolora_Sheet');
  const { canUseTool, recordConversion } = useAuth();
  const { showToast } = useToast();

  // Evaluates cell values: if starting with =, calculates formulas or basic math
  const evaluateCell = (val: string, r: number, c: number): string => {
    if (!val || !val.startsWith('=')) return val;

    const formula = val.substring(1).toUpperCase().trim();

    // Check SUM(range) e.g., SUM(D2:D4)
    const sumMatch = formula.match(/^SUM\(([A-Z])(\d+):([A-Z])(\d+)\)$/);
    if (sumMatch) {
      const colLetter = sumMatch[1];
      const startRow = parseInt(sumMatch[2], 10) - 1;
      const endRow = parseInt(sumMatch[4], 10) - 1;
      const colIdx = colLetter.charCodeAt(0) - 65;

      let sum = 0;
      for (let i = startRow; i <= endRow; i++) {
        if (data[i] && data[i][colIdx]) {
          const num = parseFloat(data[i][colIdx]);
          if (!isNaN(num)) sum += num;
        }
      }
      return sum.toLocaleString();
    }

    // Check AVERAGE(range)
    const avgMatch = formula.match(/^AVERAGE\(([A-Z])(\d+):([A-Z])(\d+)\)$/);
    if (avgMatch) {
      const colLetter = avgMatch[1];
      const startRow = parseInt(avgMatch[2], 10) - 1;
      const endRow = parseInt(avgMatch[4], 10) - 1;
      const colIdx = colLetter.charCodeAt(0) - 65;

      let sum = 0;
      let count = 0;
      for (let i = startRow; i <= endRow; i++) {
        if (data[i] && data[i][colIdx]) {
          const num = parseFloat(data[i][colIdx]);
          if (!isNaN(num)) {
            sum += num;
            count++;
          }
        }
      }
      return count > 0 ? (sum / count).toFixed(1) : '0';
    }

    // Basic multiplication e.g., B2*C2
    const mulMatch = formula.match(/^([A-Z])(\d+)\*([A-Z])(\d+)$/);
    if (mulMatch) {
      const col1 = mulMatch[1].charCodeAt(0) - 65;
      const row1 = parseInt(mulMatch[2], 10) - 1;
      const col2 = mulMatch[3].charCodeAt(0) - 65;
      const row2 = parseInt(mulMatch[4], 10) - 1;

      const v1 = parseFloat(data[row1]?.[col1] || '0');
      const v2 = parseFloat(data[row2]?.[col2] || '0');
      return (!isNaN(v1) && !isNaN(v2) ? (v1 * v2).toLocaleString() : 'ERR');
    }

    return val;
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const updated = data.map((row, r) =>
      row.map((cell, c) => (r === rowIndex && c === colIndex ? value : cell))
    );
    setData(updated);
  };

  const addRow = () => {
    const colCount = data[0]?.length || 4;
    const newRow = new Array(colCount).fill('');
    setData([...data, newRow]);
  };

  const addColumn = () => {
    const updated = data.map((row) => [...row, '']);
    setData(updated);
  };

  const removeRow = (rowIndex: number) => {
    if (data.length <= 1) return;
    setData(data.filter((_, idx) => idx !== rowIndex));
  };

  const removeColumn = (colIndex: number) => {
    if ((data[0]?.length || 0) <= 1) return;
    const updated = data.map((row) => row.filter((_, idx) => idx !== colIndex));
    setData(updated);
  };

  const loadTemplate = (key: keyof typeof TEMPLATES) => {
    setActiveTemplate(key);
    setData(JSON.parse(JSON.stringify(TEMPLATES[key])));
    showToast('Template Loaded', `Loaded ${key} starter sheet.`, 'info');
  };

  const handleExportXLSX = () => {
    const check = canUseTool(tool);
    if (!check.allowed) {
      showToast('Quota or Plan Notice', check.reason || 'Upgrade required.', 'error');
      return;
    }

    try {
      // Evaluate formulas before export
      const computedData = data.map((row, r) =>
        row.map((cell, c) => evaluateCell(cell, r, c))
      );

      const ws = XLSX.utils.aoa_to_sheet(computedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      const fileName = `${sheetName.trim() || 'toolora_spreadsheet'}.xlsx`;
      XLSX.writeFile(wb, fileName);

      recordConversion(tool, fileName);
      showToast('Exported Successfully!', `Saved ${fileName} to downloads.`, 'success');
    } catch {
      showToast('Export Error', 'Failed to generate Excel file.', 'error');
    }
  };

  const handleExportCSV = () => {
    try {
      const computedData = data.map((row, r) =>
        row.map((cell, c) => evaluateCell(cell, r, c))
      );
      const ws = XLSX.utils.aoa_to_sheet(computedData);
      const csv = XLSX.utils.sheet_to_csv(ws);

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sheetName.trim() || 'toolora_spreadsheet'}.csv`;
      link.click();

      showToast('CSV Downloaded', 'Spreadsheet saved as CSV.', 'success');
    } catch {
      showToast('CSV Export Error', 'Failed to export CSV.', 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const parsed = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];

        if (parsed && parsed.length > 0) {
          // Normalize row lengths
          const maxCols = Math.max(...parsed.map((r) => r.length));
          const normalized = parsed.map((r) => {
            const row = [...r];
            while (row.length < maxCols) row.push('');
            return row.map((c) => (c !== undefined && c !== null ? String(c) : ''));
          });
          setData(normalized);
          setSheetName(file.name.replace(/\.[^/.]+$/, ''));
          showToast('File Imported!', `Imported ${file.name} successfully.`, 'success');
        }
      } catch {
        showToast('Parse Error', 'Failed to read spreadsheet file.', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
        {/* Template Selectors */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">Template:</span>
          <button
            onClick={() => loadTemplate('blank')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTemplate === 'blank'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
            }`}
          >
            General Sheet
          </button>
          <button
            onClick={() => loadTemplate('expense')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTemplate === 'expense'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
            }`}
          >
            Expense Tracker
          </button>
          <button
            onClick={() => loadTemplate('attendance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTemplate === 'attendance'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => loadTemplate('invoice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTemplate === 'invoice'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
            }`}
          >
            Invoice Sheet
          </button>
        </div>

        {/* Upload & Export buttons */}
        <div className="flex items-center gap-2.5">
          <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-500 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            <span>Import XLSX/CSV</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-500 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportXLSX}
            className="px-4 py-1.5 rounded-lg font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Grid Controls (Row/Col additions) */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {data.length} Rows × {data[0]?.length || 0} Columns
          </span>
          <span className="hidden sm:inline text-slate-400">
            Formulas supported: =SUM(col), =AVERAGE(col), e.g. =SUM(D2:D5)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={addRow}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add Row</span>
          </button>
          <button
            onClick={addColumn}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add Col</span>
          </button>
        </div>
      </div>

      {/* Interactive Spreadsheet Grid Table */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl shadow-inner bg-white dark:bg-slate-900">
        <table className="w-full border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
              <th className="w-12 py-2 px-2 text-center font-mono text-[10px] text-slate-400 border-r border-slate-200 dark:border-slate-700">
                #
              </th>
              {data[0]?.map((_, colIdx) => (
                <th
                  key={colIdx}
                  className="py-2 px-3 text-center font-mono text-xs font-bold border-r border-slate-200 dark:border-slate-700 min-w-[130px]"
                >
                  <div className="flex items-center justify-between">
                    <span>{String.fromCharCode(65 + colIdx)}</span>
                    <button
                      onClick={() => removeColumn(colIdx)}
                      className="text-slate-400 hover:text-rose-500 p-0.5"
                      title="Delete Column"
                    >
                      ×
                    </button>
                  </div>
                </th>
              ))}
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-850/40"
              >
                <td className="py-2 px-2 text-center font-mono text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-850/50 border-r border-slate-200 dark:border-slate-700">
                  {rowIdx + 1}
                </td>
                {row.map((cell, colIdx) => {
                  const displayValue = evaluateCell(cell, rowIdx, colIdx);
                  const isFormula = cell && cell.startsWith('=');

                  return (
                    <td
                      key={colIdx}
                      className="p-1 border-r border-slate-200 dark:border-slate-800 min-w-[130px]"
                    >
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                        placeholder=""
                        className={`w-full px-2.5 py-1.5 rounded-lg bg-transparent text-slate-900 dark:text-slate-100 outline-none focus:bg-indigo-50 dark:focus:bg-indigo-950/40 focus:ring-1 focus:ring-indigo-500 font-mono text-xs ${
                          rowIdx === 0 ? 'font-bold' : ''
                        }`}
                        title={isFormula ? `Formula evaluated: ${displayValue}` : cell}
                      />
                    </td>
                  );
                })}
                <td className="py-1 px-2 text-center">
                  <button
                    onClick={() => removeRow(rowIdx)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                    title="Delete Row"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
