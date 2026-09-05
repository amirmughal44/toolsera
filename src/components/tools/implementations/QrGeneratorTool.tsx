'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Copy, Check, Wifi, Globe, Mail, Phone, User, FileText } from 'lucide-react';
import { ToolDefinition } from '@/lib/tools/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';

type QrMode = 'url' | 'wifi' | 'text' | 'email' | 'vcard';

export function QrGeneratorTool({ tool }: { tool: ToolDefinition }) {
  const [mode, setMode] = useState<QrMode>('url');
  const [urlInput, setUrlInput] = useState('https://toolora.com');
  const [textInput, setTextInput] = useState('Welcome to Toolora');
  const [wifiSsid, setWifiSsid] = useState('Office_Network_5G');
  const [wifiPass, setWifiPass] = useState('securepassword123');
  const [wifiType, setWifiType] = useState('WPA');
  const [emailTo, setEmailTo] = useState('support@toolora.com');
  const [emailSubject, setEmailSubject] = useState('Platform Inquiry');
  const [vcardName, setVcardName] = useState('John Doe');
  const [vcardPhone, setVcardPhone] = useState('+1-555-0199');
  const [vcardEmail, setVcardEmail] = useState('john@example.com');

  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const { canUseTool, recordConversion } = useAuth();
  const { showToast } = useToast();

  const getPayload = () => {
    switch (mode) {
      case 'url':
        return urlInput.trim() || 'https://toolora.com';
      case 'wifi':
        return `WIFI:T:${wifiType};S:${wifiSsid};P:${wifiPass};;`;
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nFN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
      case 'text':
      default:
        return textInput.trim() || 'Toolora';
    }
  };

  useEffect(() => {
    const payload = getPayload();
    QRCode.toDataURL(payload, {
      width: 500,
      margin: 2,
      errorCorrectionLevel: errorLevel,
      color: {
        dark: fgColor,
        light: bgColor,
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => {});

    QRCode.toString(payload, {
      type: 'svg',
      margin: 2,
      errorCorrectionLevel: errorLevel,
      color: {
        dark: fgColor,
        light: bgColor,
      },
    })
      .then((svg) => setQrSvg(svg))
      .catch(() => {});
  }, [mode, urlInput, textInput, wifiSsid, wifiPass, wifiType, emailTo, emailSubject, vcardName, vcardPhone, vcardEmail, fgColor, bgColor, errorLevel]);

  const handleDownloadPng = () => {
    const check = canUseTool(tool);
    if (!check.allowed) {
      showToast('Notice', check.reason || 'Upgrade required.', 'error');
      return;
    }

    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `toolora_qr_${mode}.png`;
    a.click();
    recordConversion(tool, `toolora_qr_${mode}.png`);
    showToast('Downloaded!', 'QR code saved as PNG.', 'success');
  };

  const handleDownloadSvg = () => {
    const check = canUseTool(tool);
    if (!check.allowed) {
      showToast('Notice', check.reason || 'Upgrade required.', 'error');
      return;
    }

    const blob = new Blob([qrSvg], { type: 'image/svg+xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolora_qr_${mode}.svg`;
    a.click();
    recordConversion(tool, `toolora_qr_${mode}.svg`);
    showToast('Downloaded!', 'Vector QR code saved as SVG.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Mode navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        {[
          { id: 'url' as const, label: 'Website URL', icon: <Globe className="w-3.5 h-3.5" /> },
          { id: 'wifi' as const, label: 'WiFi Network', icon: <Wifi className="w-3.5 h-3.5" /> },
          { id: 'vcard' as const, label: 'Contact vCard', icon: <User className="w-3.5 h-3.5" /> },
          { id: 'email' as const, label: 'Email', icon: <Mail className="w-3.5 h-3.5" /> },
          { id: 'text' as const, label: 'Plain Text', icon: <FileText className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mode === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Inputs */}
        <div className="md:col-span-7 space-y-4">
          {mode === 'url' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-slate-500">Destination URL</label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {mode === 'wifi' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-500">Network Name (SSID)</label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-500">WiFi Password</label>
                <input
                  type="text"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none font-mono"
                />
              </div>
            </div>
          )}

          {mode === 'vcard' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-500">Full Name</label>
                <input
                  type="text"
                  value={vcardName}
                  onChange={(e) => setVcardName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-500">Phone</label>
                  <input
                    type="text"
                    value={vcardPhone}
                    onChange={(e) => setVcardPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-500">Email</label>
                  <input
                    type="email"
                    value={vcardEmail}
                    onChange={(e) => setVcardEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {mode === 'email' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-500">Recipient Email</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-500">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
                />
              </div>
            </div>
          )}

          {mode === 'text' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-slate-500">Plain Text Message</label>
              <textarea
                rows={4}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
              />
            </div>
          )}

          {/* Color & Styling Controls */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Style Customization
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-500">QR Foreground</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0"
                  />
                  <span className="font-mono text-xs">{fgColor}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0"
                  />
                  <span className="font-mono text-xs">{bgColor}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500">Error Correction</label>
                <select
                  value={errorLevel}
                  onChange={(e) => setErrorLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                >
                  <option value="L">L (7%)</option>
                  <option value="M">M (15% Normal)</option>
                  <option value="Q">Q (25%)</option>
                  <option value="H">H (30% Highest)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Live Preview & Download */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700 space-y-5">
          <div className="p-4 rounded-2xl bg-white shadow-lg border border-slate-200 dark:border-slate-700 max-w-[240px] w-full aspect-square flex items-center justify-center">
            {qrDataUrl && (
              <img src={qrDataUrl} alt="Generated QR" className="w-full h-full object-contain" />
            )}
          </div>

          <div className="w-full space-y-2">
            <button
              onClick={handleDownloadPng}
              className="w-full py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG (500x500)</span>
            </button>

            <button
              onClick={handleDownloadSvg}
              className="w-full py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Vector SVG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
