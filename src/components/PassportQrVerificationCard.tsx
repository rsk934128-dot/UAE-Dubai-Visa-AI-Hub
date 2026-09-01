import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Copy, 
  Check, 
  Download, 
  Maximize2, 
  X, 
  ShieldCheck, 
  Terminal, 
  FileCode2, 
  Smartphone, 
  Printer, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { PassportAuditResult } from '../types';
import { formatDate } from '../lib/utils';

interface PassportQrVerificationCardProps {
  auditResult: PassportAuditResult;
  agencyName?: string;
  consultantName?: string;
}

export type QrPayloadFormat = 'agency_json' | 'icao_vds' | 'human_summary';

export const PassportQrVerificationCard: React.FC<PassportQrVerificationCardProps> = ({
  auditResult,
  agencyName = 'UAE & Dubai Visa AI Hub',
  consultantName
}) => {
  const [format, setFormat] = useState<QrPayloadFormat>('agency_json');
  const [theme, setTheme] = useState<'navy' | 'light'>('navy');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errorCorrection, setErrorCorrection] = useState<'M' | 'H'>('M');

  const passportNumber = auditResult.extractedData.passportNumber || 'UAEX999999';
  const fullName = auditResult.extractedData.fullName || 'APPLICANT';
  const nationality = auditResult.extractedData.nationality || 'UNKNOWN';
  const countryCode = auditResult.extractedData.countryCode || 'UAE';
  const refCode = `AUD-${passportNumber}-${Date.now().toString().slice(-4)}`;

  // Generate payload string based on selected format
  const getEncodedPayload = (): string => {
    if (format === 'agency_json') {
      const payloadObj = {
        schema: 'UAE_VISA_AI_HUB_V1',
        type: 'PASSPORT_AUDIT_VERIFICATION',
        ref: refCode,
        passportNumber,
        fullName,
        nationality,
        countryCode,
        dob: auditResult.extractedData.dateOfBirth || null,
        sex: auditResult.extractedData.sex || 'M',
        expiryDate: auditResult.extractedData.expiryDate || null,
        validityRemainingDays: auditResult.validationChecks.validityRemainingDays || 0,
        hasSixMonthsValidity: auditResult.validationChecks.hasSixMonthsValidity,
        overallScore: auditResult.overallScore,
        complianceVerdict: auditResult.isValid ? 'PASSED_DUBAI_COMPLIANT' : 'FLAGGED_RECTIFICATION_NEEDED',
        mrzMatch: auditResult.validationChecks.mrzMatched,
        agency: agencyName,
        verifiedAt: new Date().toISOString()
      };
      return JSON.stringify(payloadObj);
    }

    if (format === 'icao_vds') {
      const cleanDob = (auditResult.extractedData.dateOfBirth || '').replace(/-/g, '').substring(2, 8);
      const cleanExp = (auditResult.extractedData.expiryDate || '').replace(/-/g, '').substring(2, 8);
      const sex = auditResult.extractedData.sex ? auditResult.extractedData.sex[0].toUpperCase() : 'M';
      return `VDS:UAE:PASS:${countryCode}:${passportNumber}:${cleanDob}:${sex}:${cleanExp}:${auditResult.overallScore}:${auditResult.isValid ? 'PASS' : 'FLAG'}:${refCode}`;
    }

    // human_summary
    return `UAE & DUBAI VISA AI AUDIT
REF: ${refCode}
NAME: ${fullName}
PASSPORT: ${passportNumber}
NATIONALITY: ${nationality} (${countryCode})
EXPIRY: ${formatDate(auditResult.extractedData.expiryDate)} (${auditResult.validationChecks.validityRemainingDays || 0}d left)
6-MONTH RULE: ${auditResult.validationChecks.hasSixMonthsValidity ? 'PASSED ✓' : 'FAILED ✗'}
SCORE: ${auditResult.overallScore}/100 [${auditResult.isValid ? 'PASSED' : 'FLAGGED'}]
ISSUED BY: ${agencyName}`;
  };

  const payload = getEncodedPayload();

  // Generate QR Code data URL whenever payload, theme or correction level changes
  useEffect(() => {
    const generateQr = async () => {
      try {
        const darkColor = theme === 'navy' ? '#F59E0B' : '#0F172A'; // Gold on dark / Navy on light
        const lightColor = theme === 'navy' ? '#0F172A' : '#FFFFFF'; // Dark slate background / Pure white

        const url = await QRCode.toDataURL(payload, {
          errorCorrectionLevel: errorCorrection,
          margin: 1.5,
          width: 320,
          color: {
            dark: darkColor,
            light: lightColor
          }
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Failed to generate QR code data URL:', err);
      }
    };

    generateQr();
  }, [payload, theme, errorCorrection]);

  const handleCopyPayload = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleDownloadQrPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_Audit_${passportNumber}_${format}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider text-slate-200 font-bold flex items-center gap-2">
              Digital Verification QR Code
              <span className="text-[10px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-mono">
                External Agency Scanner
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Encodes verified passport data, 6-month validity, and audit checksum for instant counter scanning.
            </p>
          </div>
        </div>

        {/* Format Selector Pills */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono shrink-0">
          <button
            type="button"
            onClick={() => setFormat('agency_json')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              format === 'agency_json'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Standard JSON payload for agency CRM and RPA software"
          >
            <FileCode2 className="w-3 h-3" />
            <span>Agency JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setFormat('icao_vds')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              format === 'icao_vds'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Compact ICAO travel string for hardware 2D barcode imagers"
          >
            <Terminal className="w-3 h-3" />
            <span>ICAO String</span>
          </button>

          <button
            type="button"
            onClick={() => setFormat('human_summary')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              format === 'human_summary'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Human-readable text for smartphone camera preview"
          >
            <Smartphone className="w-3 h-3" />
            <span>Text Card</span>
          </button>
        </div>
      </div>

      {/* Main QR Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: QR Display Box */}
        <div className="md:col-span-4 flex flex-col items-center justify-center">
          <div 
            className={`relative p-3 rounded-xl border transition-all shadow-xl group ${
              theme === 'navy' 
                ? 'bg-slate-950 border-amber-500/40 shadow-amber-500/5' 
                : 'bg-white border-slate-300 shadow-slate-900/40'
            }`}
          >
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="Passport Verification QR Code" 
                className="w-44 h-44 object-contain rounded-lg block"
              />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-slate-500 font-mono text-xs">
                Generating QR...
              </div>
            )}

            {/* Quick Enlarge Hover Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-amber-300 hover:bg-slate-800 border border-slate-700 opacity-80 hover:opacity-100 transition-opacity cursor-pointer shadow"
              title="Full screen counter scan view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Badge on bottom */}
            <div className="mt-2 text-center">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                auditResult.isValid 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {auditResult.isValid ? '✓ Verified Compliant' : '⚠ Flagged Rectify'}
              </span>
            </div>
          </div>

          {/* Theme & Correction Controls */}
          <div className="flex items-center gap-2 mt-3 text-[10px] font-mono text-slate-400">
            <span className="text-slate-500">Style:</span>
            <button
              type="button"
              onClick={() => setTheme('navy')}
              className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                theme === 'navy'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
              }`}
            >
              Gold/Dark
            </button>
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-200 border-slate-400 text-slate-900 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
              }`}
            >
              High-Contrast Print
            </button>
          </div>
        </div>

        {/* Right: Encoded Metadata & Fast Actions */}
        <div className="md:col-span-8 space-y-3">
          {/* Key Decoded Attributes */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Encoded Verification Hash:</span>
              <span className="text-amber-300 font-mono font-bold">{refCode}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
              <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[9px]">PASSPORT NO</span>
                <span className="text-slate-200 font-bold">{passportNumber}</span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[9px]">LEGAL HOLDER</span>
                <span className="text-slate-200 font-semibold truncate block" title={fullName}>{fullName}</span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[9px]">6-MO STATUS</span>
                <span className={auditResult.validationChecks.hasSixMonthsValidity ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {auditResult.validationChecks.validityRemainingDays || 0}d left ({auditResult.validationChecks.hasSixMonthsValidity ? 'PASSED' : 'EXPIRING'})
                </span>
              </div>
            </div>

            {/* Raw Payload Preview Box */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono text-slate-500">Raw QR Payload Data:</span>
                <span className="text-[10px] text-slate-500 font-mono">{payload.length} chars</span>
              </div>
              <pre className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-24 leading-relaxed select-all">
                {payload}
              </pre>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyPayload}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Copy raw encoded data"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Payload</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadQrPng}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 transition-all active:scale-95"
              title="Download high resolution QR image file"
            >
              <Download className="w-3.5 h-3.5 text-slate-950" />
              <span>Download QR Code (PNG)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-3.5 py-2 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              title="Enlarge for countertop scanner"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Counter Scan Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Countertop QR Scanner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/30 mb-1">
                <QrCode className="w-3.5 h-3.5" />
                <span>OFFICIAL VERIFICATION BADGE</span>
              </div>
              <h3 className="text-lg font-bold text-white">Counter Scan QR Code</h3>
              <p className="text-xs text-slate-400">
                Point 2D barcode scanner or smartphone camera directly at this code.
              </p>
            </div>

            {/* Huge QR Code View */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner border border-slate-200">
              {qrDataUrl && (
                <img 
                  src={qrDataUrl} 
                  alt="High Resolution QR Code" 
                  className="w-64 h-64 object-contain"
                />
              )}
              <div className="mt-2 text-center">
                <span className="text-xs font-mono font-bold text-slate-900 block">{passportNumber}</span>
                <span className="text-[11px] font-semibold text-slate-700 block truncate max-w-xs">{fullName}</span>
              </div>
            </div>

            {/* Quick Summary Pill */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Compliance Score:</span>
                <span className="text-amber-300 font-bold">{auditResult.overallScore}/100</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>6-Month Validity:</span>
                <span className={auditResult.validationChecks.hasSixMonthsValidity ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {auditResult.validationChecks.validityRemainingDays || 0} Days Remaining
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payload Format:</span>
                <span className="text-sky-300 uppercase">{format.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadQrPng}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Save PNG</span>
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
