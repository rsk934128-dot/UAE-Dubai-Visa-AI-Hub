import React, { useState } from 'react';
import {
  X,
  FileDown,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  User,
  Clock,
  Layers,
  Sparkles,
  RefreshCw,
  Printer,
  ChevronDown
} from 'lucide-react';
import { VisaApplication } from '../types';
import { generateApplicationDossierPdf } from '../lib/applicationDossierPdfGenerator';
import { formatDate } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

interface ApplicationDossierPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: VisaApplication[];
  initialApplication?: VisaApplication | null;
}

export const ApplicationDossierPdfModal: React.FC<ApplicationDossierPdfModalProps> = ({
  isOpen,
  onClose,
  applications,
  initialApplication
}) => {
  const { language } = useLanguage();

  const [selectedAppId, setSelectedAppId] = useState<string>(
    initialApplication?.id || applications[0]?.id || ''
  );

  // Sync if initialApplication changes
  React.useEffect(() => {
    if (initialApplication?.id) {
      setSelectedAppId(initialApplication.id);
    }
  }, [initialApplication]);

  const currentApp = applications.find(a => a.id === selectedAppId) || initialApplication || applications[0];

  // Options toggles
  const [includePassportData, setIncludePassportData] = useState(true);
  const [includeStatusLogs, setIncludeStatusLogs] = useState(true);
  const [includeAuditTrail, setIncludeAuditTrail] = useState(true);
  const [includeDocumentHistory, setIncludeDocumentHistory] = useState(true);
  const [includeQrCode, setIncludeQrCode] = useState(true);

  // Agency branding fields
  const [agencyName, setAgencyName] = useState('UAE & Dubai Visa AI Hub');
  const [consultantName, setConsultantName] = useState(
    currentApp?.assignedAgent || 'Senior Immigration Processing Officer'
  );

  // Generating state
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Update consultant default when application changes
  React.useEffect(() => {
    if (currentApp?.assignedAgent) {
      setConsultantName(currentApp.assignedAgent);
    }
  }, [currentApp]);

  if (!isOpen || !currentApp) return null;

  const handleGeneratePdf = async () => {
    try {
      setIsGenerating(true);
      setDownloadSuccess(false);

      await generateApplicationDossierPdf({
        application: currentApp,
        agencyName: agencyName.trim() || 'UAE & Dubai Visa AI Hub',
        consultantName: consultantName.trim() || 'Senior Immigration Processing Officer',
        includePassportData,
        includeStatusLogs,
        includeAuditTrail,
        includeDocumentHistory,
        includeQrCode
      });

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to generate application dossier PDF:', err);
      alert('Could not generate the dossier PDF. Please check your browser settings and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const statusTransitionsCount = (currentApp.auditTrail || []).filter(
    e => e.type === 'status_change' || e.type === 'application_created' || e.details?.newStatus
  ).length || 1;

  const auditEventsCount = currentApp.auditTrail?.length || 1;
  const docsCount = currentApp.documentHistory?.length || 0;
  const pData = currentApp.passportAudit?.extractedData;
  const isSixMonthsValid = currentApp.passportAudit?.validationChecks?.hasSixMonthsValidity ?? true;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl relative">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Export Application Dossier PDF Report</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold px-2 py-0.5 rounded-full">
                  Official Record
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Generate an executive printable report containing verified passport data, lifecycle status logs, and full audit history.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Application Selector (if multiple available) */}
        {applications.length > 1 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Target Application Dossier:</span>
              <span className="text-[11px] text-slate-400 font-mono">Ref: {currentApp.id}</span>
            </label>
            <div className="relative">
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer appearance-none pr-9 font-medium"
              >
                {applications.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.applicantName} — {app.passportNumber} ({app.visaType}) • {app.status}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Selected Dossier Executive Preview Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-850 pb-3">
            <div className="flex items-center gap-3">
              {currentApp.avatarUrl ? (
                <img
                  src={currentApp.avatarUrl}
                  alt={currentApp.applicantName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/40 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-sm border border-slate-700 shrink-0">
                  {currentApp.applicantName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{currentApp.applicantName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {currentApp.passportNumber}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {currentApp.nationality} • {currentApp.visaType} • Officer: <strong className="text-slate-300">{currentApp.assignedAgent}</strong>
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                currentApp.status === 'Approved'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : currentApp.status === 'Audited - Passed'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                  : currentApp.status === 'Audited - Flagged'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {currentApp.status}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Priority: {currentApp.urgency}</p>
            </div>
          </div>

          {/* Quick Metrics Badge Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2">
              <div className="text-slate-400 text-[10px]">6-Month Validity</div>
              <div className={`font-bold text-xs mt-0.5 ${isSixMonthsValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isSixMonthsValid ? '✔ Compliant' : '⚠ Flagged'}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2">
              <div className="text-slate-400 text-[10px]">Status Milestones</div>
              <div className="font-bold text-slate-200 text-xs mt-0.5">{statusTransitionsCount} Logged</div>
            </div>

            <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2">
              <div className="text-slate-400 text-[10px]">Audit Trail Events</div>
              <div className="font-bold text-amber-400 text-xs mt-0.5">{auditEventsCount} Records</div>
            </div>

            <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2">
              <div className="text-slate-400 text-[10px]">Attached Docs</div>
              <div className="font-bold text-sky-400 text-xs mt-0.5">{docsCount} Files</div>
            </div>
          </div>
        </div>

        {/* Section Inclusion Checkboxes */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Sections to Include in PDF Dossier Report:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={includePassportData}
                onChange={(e) => setIncludePassportData(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Passport Data & MRZ ICAO 9303</span>
                <span className="text-[10px] text-slate-400">Full extracted data, expiry, 6-mo check, OCR score</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={includeStatusLogs}
                onChange={(e) => setIncludeStatusLogs(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Lifecycle Status Logs</span>
                <span className="text-[10px] text-slate-400">Step-by-step milestones, dates, officers & notes</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={includeAuditTrail}
                onChange={(e) => setIncludeAuditTrail(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Chronological Audit Trail</span>
                <span className="text-[10px] text-slate-400">Emails, alerts, uploads, officer comments & receipts</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={includeDocumentHistory}
                onChange={(e) => setIncludeDocumentHistory(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Audited Document Inventory</span>
                <span className="text-[10px] text-slate-400">Versions (v1, v2), file sizes, statuses & scores</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors sm:col-span-2">
              <input
                type="checkbox"
                checked={includeQrCode}
                onChange={(e) => setIncludeQrCode(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Digital Verification QR Code & Official Seal</span>
                <span className="text-[10px] text-slate-400">Embeds scannable high-res QR code for mobile verification & GDRFA/ICP compliance stamp</span>
              </div>
            </label>
          </div>
        </div>

        {/* Branding & Sign-off Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Typing Center / Agency Name:
            </label>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Authorized Processing Officer:
            </label>
            <input
              type="text"
              value={consultantName}
              onChange={(e) => setConsultantName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>
        </div>

        {/* Success Alert */}
        {downloadSuccess && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl p-3 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Dossier PDF Report generated and downloaded successfully!</span>
          </div>
        )}

        {/* Modal Action Bar */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition-colors cursor-pointer font-semibold"
          >
            Cancel
          </button>

          <button
            id="btn-confirm-generate-dossier-pdf"
            type="button"
            onClick={handleGeneratePdf}
            disabled={isGenerating}
            className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Dossier Report...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Download Dossier PDF Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
