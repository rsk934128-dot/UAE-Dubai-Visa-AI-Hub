import React, { useState, useEffect } from 'react';
import { 
  Scan, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  Info, 
  Layers, 
  ChevronRight, 
  Eye, 
  History, 
  Trash2, 
  Clock, 
  RotateCcw, 
  Search, 
  Check, 
  Filter, 
  ExternalLink, 
  Cloud, 
  CloudCheck, 
  UserCheck,
  Building2,
  Plus,
  ArrowRight,
  Download,
  FileDown,
  Printer
} from 'lucide-react';
import { PassportAuditResult, SavedPassportAudit } from '../types';
import { DUMMY_PASSPORT_SAMPLES, convertFileToBase64, ensureRasterBase64, formatDate } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { syncPassportAuditToCloud, getCloudPassportAudits, deleteCloudPassportAudit } from '../lib/firebase';
import { generatePassportAuditPdf } from '../lib/pdfReportGenerator';
import { PassportQrVerificationCard } from './PassportQrVerificationCard';
import { VisualAuditSummary } from './VisualAuditSummary';
import { BatchPassportAuditSection } from './BatchPassportAuditSection';

const STORAGE_KEY = 'uae_visa_passport_audit_history';

interface PassportAuditScannerProps {
  onAuditCompleted?: (result: PassportAuditResult, previewUrl: string) => void;
  onCreateApplication?: (audit: PassportAuditResult, previewUrl?: string) => void;
}

export const PassportAuditScanner: React.FC<PassportAuditScannerProps> = ({ 
  onAuditCompleted, 
  onCreateApplication 
}) => {
  const { user, userProfile, openAuthModal } = useAuth();
  const { language } = useLanguage();
  const [scanMode, setScanMode] = useState<'single' | 'batch'>('single');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [auditResult, setAuditResult] = useState<PassportAuditResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Local storage saved history state
  const [savedAudits, setSavedAudits] = useState<SavedPassportAudit[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'passed' | 'flagged'>('all');
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Load history from localStorage + cloud on mount and when user auth changes
  useEffect(() => {
    let localList: SavedPassportAudit[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          localList = parsed;
          setSavedAudits(localList);
        }
      }
    } catch (err) {
      console.warn('Could not load saved audit history from localStorage:', err);
    }

    // If user is logged in, pull their cloud audits from Firestore and merge
    if (user?.uid) {
      getCloudPassportAudits(user.uid).then((cloudAudits) => {
        if (cloudAudits && cloudAudits.length > 0) {
          setSavedAudits((prev) => {
            const mergedMap = new Map<string, SavedPassportAudit>();
            // Add local first
            prev.forEach((item) => mergedMap.set(item.id, item));
            // Overwrite/add cloud records
            cloudAudits.forEach((item: any) => {
              if (item.id && item.result) {
                mergedMap.set(item.id, item as SavedPassportAudit);
              }
            });
            const mergedList = Array.from(mergedMap.values()).sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedList.slice(0, 20)));
            } catch (e) {}
            return mergedList;
          });
        }
      }).catch(err => console.warn('Cloud audit fetch note:', err));
    }
  }, [user?.uid]);

  const saveAuditToHistory = async (result: PassportAuditResult, previewUrl: string, fileName?: string) => {
    try {
      const newEntry: SavedPassportAudit = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        previewUrl,
        result,
        fileName: fileName || result.extractedData.fullName || 'Passport Scan'
      };

      setSavedAudits(prev => {
        // Prevent duplicate consecutive entries of same document
        const filtered = prev.filter(
          item => !(
            item.result.extractedData.passportNumber === result.extractedData.passportNumber &&
            item.result.extractedData.fullName === result.extractedData.fullName &&
            item.result.overallScore === result.overallScore
          )
        );
        const updated = [newEntry, ...filtered].slice(0, 20); // Keep 20 recent audits
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (storageErr) {
          console.warn('LocalStorage quota limit reached, saving compressed history:', storageErr);
          const lightweight = updated.slice(0, 10).map(u => ({
            ...u,
            previewUrl: u.previewUrl.length > 50000 ? '' : u.previewUrl
          }));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
        }
        return updated;
      });

      // Also persist to Firestore Cloud if user is authenticated!
      if (user?.uid) {
        await syncPassportAuditToCloud(user.uid, newEntry);
      }

      setActiveHistoryId(newEntry.id);
    } catch (err) {
      console.error('Failed to persist audit to history:', err);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setErrorMsg(null);
      setActiveHistoryId(null);
      const rawBase64 = await convertFileToBase64(file);
      setSelectedImage(rawBase64);
      const { base64, mimeType } = await ensureRasterBase64(rawBase64);
      runAudit(base64, mimeType, file.name);
    } catch (err: any) {
      setErrorMsg('Failed to read passport image file.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const runAudit = async (base64Data: string, mimeType: string, customName?: string) => {
    setAnalyzing(true);
    setErrorMsg(null);
    setAuditResult(null);

    try {
      const raster = await ensureRasterBase64(base64Data);
      const response = await fetch('/api/audit-passport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: raster.base64, mimeType: raster.mimeType })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Audit analysis failed');
      }

      setAuditResult(data.data);
      saveAuditToHistory(data.data, raster.base64, customName);

      if (onAuditCompleted) {
        onAuditCompleted(data.data, raster.base64);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Audit service error. Make sure GEMINI_API_KEY is active.');
    } finally {
      setAnalyzing(false);
    }
  };

  const loadSample = async (sample: typeof DUMMY_PASSPORT_SAMPLES[0]) => {
    setActiveHistoryId(null);
    setSelectedImage(sample.dataUrl);
    const raster = await ensureRasterBase64(sample.dataUrl);
    runAudit(raster.base64, raster.mimeType, sample.name);
  };

  const handleRevisitHistoryItem = (item: SavedPassportAudit) => {
    setActiveHistoryId(item.id);
    setSelectedImage(item.previewUrl || null);
    setAuditResult(item.result);
    setErrorMsg(null);

    const targetElement = document.getElementById('passport-dropzone');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleDeleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedAudits(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Error updating localStorage:', err);
      }
      return updated;
    });

    if (user?.uid) {
      await deleteCloudPassportAudit(user.uid, id);
    }

    if (activeHistoryId === id) {
      setActiveHistoryId(null);
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Clear all saved passport audit history from local storage?')) {
      setSavedAudits([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error(e);
      }
      setActiveHistoryId(null);
    }
  };

  const handleDownloadPdf = async (resultToExport?: PassportAuditResult, imageBase64?: string | null) => {
    const targetResult = resultToExport || auditResult;
    if (!targetResult) return;
    setGeneratingPdf(true);
    try {
      await generatePassportAuditPdf({
        auditResult: targetResult,
        passportImageBase64: imageBase64 || selectedImage,
        agencyName: userProfile?.agencyName || userProfile?.displayName || 'UAE & Dubai Visa AI Hub',
        consultantName: userProfile?.displayName || user?.email?.split('@')[0] || undefined
      });
    } catch (err) {
      console.error('Failed to generate PDF audit report:', err);
    } finally {
      setTimeout(() => setGeneratingPdf(false), 300);
    }
  };

  // Filter history records
  const filteredAudits = savedAudits.filter(item => {
    const matchesSearch = 
      item.result.extractedData.fullName?.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.result.extractedData.passportNumber?.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.result.extractedData.nationality?.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.fileName?.toLowerCase().includes(historySearch.toLowerCase());

    if (!matchesSearch) return false;
    if (historyFilter === 'passed') return item.result.isValid;
    if (historyFilter === 'flagged') return !item.result.isValid;
    return true;
  });

  const activeAuditItem = savedAudits.find(a => a.id === activeHistoryId);

  return (
    <div className="space-y-6" id="passport-audit-container">
      {/* Top Banner with Rules Checklist */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold tracking-wide text-xs uppercase mb-1">
              <ShieldCheck className="w-4 h-4" />
              {language === 'ar' ? 'محرك مطابقة إقامة دبي والهيئة الاتحادية' : 'GDRFA & ICP Dubai Visa Compliance Engine'}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {language === 'ar' ? 'تدقيق الجوازات بالذكاء الاصطناعي وقاعدة الـ 6 أشهر' : 'AI Passport OCR & 6-Month Rule Validator'}
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              {language === 'ar' 
                ? 'ارفع صفحة البيانات الشخصية للجواز. يقوم النظام باستخراج البيانات وفحص مطابقة شريط MRZ والتحقق من سريان الجواز لأكثر من 180 يوماً قبل دفع الرسوم.' 
                : 'Upload passport bio-data pages. Gemini analyzes visual fields, decodes MRZ checksums, and flags insufficient validity periods before visa fee payments.'}
            </p>
          </div>
          
          {/* Quick sample loader & history buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-sample-valid-passport"
              onClick={() => loadSample(DUMMY_PASSPORT_SAMPLES[0])}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {language === 'ar' ? 'جواز ساري المفعول (تجربة)' : 'Test Valid Sample'}
            </button>
            <button
              id="btn-sample-expired-passport"
              onClick={() => loadSample(DUMMY_PASSPORT_SAMPLES[1])}
              className="text-xs bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/60 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              {language === 'ar' ? 'جواز مخالف (<6 أشهر)' : 'Test Flagged (<6 Mo)'}
            </button>

            {savedAudits.length > 0 && (
              <button
                id="btn-scroll-to-history"
                onClick={() => {
                  const el = document.getElementById('recent-audits-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <History className="w-3.5 h-3.5 text-amber-400" />
                History ({savedAudits.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mode Selector: Single Document Scan vs Batch Processing Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            id="tab-single-scan-mode"
            onClick={() => setScanMode('single')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              scanMode === 'single'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scan className="w-4 h-4" />
            <span>{language === 'ar' ? 'تدقيق فردي (مستند واحد)' : 'Single Document Scan'}</span>
          </button>

          <button
            id="tab-batch-scan-mode"
            onClick={() => setScanMode('batch')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              scanMode === 'batch'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{language === 'ar' ? 'المعالجة المجمعة (عدة جوازات)' : 'Batch Processing Mode'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
              scanMode === 'batch'
                ? 'bg-slate-950 text-amber-300'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              Consolidated Table
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2 px-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {scanMode === 'single'
              ? (language === 'ar' ? 'فحص فردي تفصيلي مع استخراج MRZ والملخص الإشعاعي' : 'Deep visual audit with radial health scorecard & MRZ decode')
              : (language === 'ar' ? 'تحميل جماعي مع جدول موحد وتصدير Excel/CSV' : 'Multi-passport upload with consolidated table & CSV export')}
          </span>
        </div>
      </div>

      {scanMode === 'batch' ? (
        <BatchPassportAuditSection
          onSaveToHistory={(result, previewUrl, fileName) => {
            const newAudit: SavedPassportAudit = {
              id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              timestamp: new Date().toISOString(),
              previewUrl,
              fileName: fileName || `${result.extractedData.fullName || 'Passport'}_Audit.png`,
              result
            };
            setSavedAudits(prev => [newAudit, ...prev].slice(0, 30));
            if (user) {
              syncPassportAuditToCloud(user.uid, newAudit).catch(console.error);
            }
          }}
          onCreateApplication={(prefill) => {
            if (onCreateApplication) {
              onCreateApplication({
                isValid: true,
                overallScore: 85,
                validationChecks: {
                  isClearImage: true,
                  hasSixMonthsValidity: true,
                  validityRemainingDays: 200,
                  properOrientation: true,
                  noGlareOrCutoff: true,
                  mrzMatched: true
                },
                extractedData: {
                  fullName: prefill.applicantName,
                  passportNumber: prefill.passportNumber,
                  nationality: prefill.nationality,
                  dateOfBirth: prefill.dateOfBirth,
                  expiryDate: prefill.expiryDate
                },
                rejectionReasons: [],
                dubaiVisaEligibilityNotes: 'Imported from consolidated batch audit table.'
              });
            }
          }}
        />
      ) : (
        /* Grid: Upload/Preview Left, Results Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload Dropzone & Image Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div
            id="passport-dropzone"
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 transition-all text-center relative ${
              dragActive 
                ? 'border-amber-500 bg-amber-500/10' 
                : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
            }`}
          >
            <input
              type="file"
              id="passport-file-input"
              accept="image/*,.pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />

            {selectedImage ? (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 max-h-72 flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt="Passport Preview"
                    className="max-h-72 w-auto object-contain rounded"
                  />
                  {analyzing && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                      <span className="text-xs font-mono tracking-wider text-amber-300">
                        DECODING MRZ & AUDITING...
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Document Loaded
                  </span>
                  <span className="text-amber-400 underline cursor-pointer">Scan new file</span>
                </div>
              </div>
            ) : (
              <div className="py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Drag & drop passport page or <span className="text-amber-400">browse</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports JPG, PNG, WEBP (Clear color scan recommended)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Rules Legend */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 text-xs space-y-2.5 text-slate-400">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              Mandatory Dubai Entry Requirements:
            </div>
            <ul className="space-y-1.5 pl-4 list-disc text-slate-400">
              <li>
                <strong className="text-slate-300">6-Month Expiry Rule:</strong> GDRFA requires minimum 180 days validity from travel date.
              </li>
              <li>
                <strong className="text-slate-300">MRZ Consistency:</strong> Machine Readable Zone must match printed name and passport number.
              </li>
              <li>
                <strong className="text-slate-300">No Corner Cutoffs:</strong> All 4 corners and holographic borders must be visible.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Dynamic OCR Audit Output */}
        <div className="lg:col-span-7">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-sm flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Audit Error</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {activeHistoryId && auditResult && !analyzing && (
            <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Viewing saved audit from <strong>{activeAuditItem ? new Date(activeAuditItem.timestamp).toLocaleString() : 'Local Cache'}</strong> (Restored without rescanning)
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveHistoryId(null);
                  setSelectedImage(null);
                  setAuditResult(null);
                }}
                className="text-amber-400 hover:text-white underline cursor-pointer ml-2 text-[11px]"
              >
                Clear View
              </button>
            </div>
          )}

          {!selectedImage && !auditResult && !analyzing && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-12 text-center flex flex-col items-center justify-center text-slate-500 h-full min-h-[380px]">
              <Scan className="w-12 h-12 text-slate-700 mb-3 stroke-[1.5]" />
              <h3 className="text-slate-300 font-medium text-base mb-1">No Document Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Upload a passport scan or select a test sample above to inspect OCR extraction and immigration clearance.
              </p>
            </div>
          )}

          {analyzing && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[380px] space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-amber-500 animate-spin"></div>
                <Sparkles className="w-6 h-6 text-amber-400 absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200">Gemini 2.5 Multi-Modal Audit in Progress</p>
                <p className="text-xs text-slate-400 font-mono">Parsing MRZ lines, matching dates &amp; computing clearance...</p>
              </div>
            </div>
          )}

          {auditResult && !analyzing && (
            <div className="space-y-5" id="audit-results-card">
              {/* Status Header Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                auditResult.isValid 
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200' 
                  : 'bg-red-950/40 border-red-800/80 text-red-200'
              }`}>
                <div className="flex items-center gap-3">
                  {auditResult.isValid ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      Compliance Verdict
                    </div>
                    <div className="text-base font-bold">
                      {auditResult.isValid ? 'PASSED: Dubai Immigration Compliant' : 'FLAGGED: Rectification Required'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    id="btn-download-pdf-report-top"
                    onClick={() => handleDownloadPdf()}
                    disabled={generatingPdf}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
                    title="Download official PDF compliance certificate"
                  >
                    {generatingPdf ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileDown className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">{generatingPdf ? 'Generating...' : 'Download PDF Report'}</span>
                    <span className="sm:hidden">PDF</span>
                  </button>

                  <div className="text-right">
                    <span className="text-2xl font-black font-mono">
                      {auditResult.overallScore}
                    </span>
                    <span className="text-xs text-slate-400 block">/ 100 Score</span>
                  </div>
                </div>
              </div>

              {/* Radial Gauge Visual Audit Summary & Health Scorecard */}
              <VisualAuditSummary
                auditResult={auditResult}
                onDownloadPdf={() => handleDownloadPdf()}
              />

              {/* Extracted Bio-Data Matrix */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-400" />
                    Extracted Bio-Data (OCR)
                  </span>
                  <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-mono">
                    {auditResult.extractedData.nationality || 'Verified'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Full Legal Name</span>
                    <span className="font-semibold text-slate-200 truncate block mt-0.5" title={auditResult.extractedData.fullName}>
                      {auditResult.extractedData.fullName || 'N/A'}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Passport Number</span>
                    <span className="font-mono font-bold text-amber-300 block mt-0.5">
                      {auditResult.extractedData.passportNumber || 'N/A'}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Nationality</span>
                    <span className="font-semibold text-slate-200 block mt-0.5">
                      {auditResult.extractedData.nationality || 'N/A'} ({auditResult.extractedData.countryCode || 'UAE'})
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Date of Birth</span>
                    <span className="text-slate-200 font-mono block mt-0.5">
                      {formatDate(auditResult.extractedData.dateOfBirth)}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Gender / Sex</span>
                    <span className="text-slate-200 font-mono block mt-0.5">
                      {auditResult.extractedData.sex || 'M/F'}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-lg border ${
                    auditResult.validationChecks.hasSixMonthsValidity 
                      ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' 
                      : 'bg-red-950/30 border-red-800/60 text-red-300'
                  }`}>
                    <span className="block text-[10px] uppercase font-mono">
                      Expiry Date (6-Mo Rule)
                    </span>
                    <span className="font-bold font-mono block mt-0.5">
                      {formatDate(auditResult.extractedData.expiryDate)}
                    </span>
                  </div>
                </div>

                {/* MRZ Lines Box if decoded */}
                {(auditResult.extractedData.mrzLine1 || auditResult.extractedData.mrzLine2) && (
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-sky-400 overflow-x-auto space-y-1">
                    <div className="text-[10px] text-slate-500 tracking-wider uppercase mb-1">
                      Machine Readable Zone (MRZ 2-Line Decode):
                    </div>
                    {auditResult.extractedData.mrzLine1 && <div>{auditResult.extractedData.mrzLine1}</div>}
                    {auditResult.extractedData.mrzLine2 && <div>{auditResult.extractedData.mrzLine2}</div>}
                  </div>
                )}
              </div>

              {/* Validation Checkpoints & Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Checks List */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <span className="font-semibold text-slate-300 block">Inspection Checkpoints</span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Passport validity ≥ 6 months:</span>
                      {auditResult.validationChecks.hasSixMonthsValidity ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passed ({auditResult.validationChecks.validityRemainingDays}d)
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Failed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">MRZ &amp; Visual Zone Match:</span>
                      {auditResult.validationChecks.mrzMatched ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" /> Discrepancy
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Image Clarity &amp; Resolution:</span>
                      {auditResult.validationChecks.isClearImage ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> High Quality
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" /> Blurry
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">No Border Cuts / Glare:</span>
                      {auditResult.validationChecks.noGlareOrCutoff ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Clean Framing
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" /> Needs Adjustment
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggestions & Eligibility Notes */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <span className="font-semibold text-slate-300 block">AI Consultant Recommendation</span>
                  
                  {auditResult.rejectionReasons?.length > 0 && (
                    <div className="text-red-300 bg-red-950/40 border border-red-900/60 p-2.5 rounded-lg space-y-1">
                      <strong className="block text-[11px] text-red-400">Flagged Issues:</strong>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                        {auditResult.rejectionReasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {auditResult.suggestions?.length > 0 && (
                    <div className="text-slate-300 space-y-1">
                      <strong className="block text-[11px] text-amber-400">Next Action:</strong>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-400">
                        {auditResult.suggestions.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {auditResult.dubaiVisaEligibilityNotes && (
                    <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800">
                      {auditResult.dubaiVisaEligibilityNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Digital Verification QR Code Generator for Agency Systems */}
              <PassportQrVerificationCard
                auditResult={auditResult}
                agencyName={userProfile?.agencyName || userProfile?.displayName || 'UAE & Dubai Visa AI Hub'}
                consultantName={userProfile?.displayName || user?.email?.split('@')[0] || undefined}
              />

              {/* PDF Report Export & CRM Action Banner */}
              <div className="space-y-3">
                  <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                        <FileDown className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                          Official Pre-Submission PDF Audit Certificate
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                            ICAO 9303 Compliant
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Generates a professionally branded PDF containing extracted bio-data, 6-month countdown timer, MRZ decode, and verification seal for client handover.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        id="btn-download-pdf-report-bottom"
                        onClick={() => handleDownloadPdf()}
                        disabled={generatingPdf}
                        className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 transition-all whitespace-nowrap disabled:opacity-50"
                        title="Download official PDF report for client handover"
                      >
                        {generatingPdf ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        ) : (
                          <Download className="w-4 h-4 text-slate-950" />
                        )}
                        <span>{generatingPdf ? 'Building PDF...' : 'Download PDF Report'}</span>
                      </button>
                    </div>
                  </div>

                  {/* CRM Data Link Action Banner */}
                  {onCreateApplication && (
                    <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                            Create CRM Visa Application Dossier
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/40">
                              Auto Pre-fill
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Transfer {auditResult.extractedData.fullName || 'applicant'}’s OCR data, passport number, and audit score directly into Agency CRM.
                          </p>
                        </div>
                      </div>

                      <button
                        id="btn-create-application-from-audit"
                        onClick={() => onCreateApplication(auditResult, selectedImage || undefined)}
                        className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all whitespace-nowrap active:scale-95"
                      >
                        <Plus className="w-4 h-4 text-amber-400" />
                        <span>Create Application</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
          )}
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* LOCAL STORAGE PERSISTED RECENT AUDITS HISTORY SECTION */}
      {/* ========================================================================= */}
      {savedAudits.length > 0 && (
        <div id="recent-audits-section" className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  Recent Passport Audit History
                  <span className="text-[11px] bg-slate-800 font-mono text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                    {savedAudits.length} Saved
                  </span>
                  {user ? (
                    <span className="text-[10px] bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1 font-sans">
                      <Cloud className="w-3 h-3 text-emerald-400" />
                      Firebase Cloud Synced ({userProfile?.displayName || user.email?.split('@')[0]})
                    </span>
                  ) : (
                    <button
                      onClick={() => openAuthModal('login')}
                      className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Cloud className="w-3 h-3 text-amber-400" />
                      লগইন করুন (ক্লাউডে সেভ করতে)
                    </button>
                  )}
                </h3>
                <p className="text-slate-400 text-xs">
                  Revisit previous inspection dossiers instantly without consuming API calls.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search Box */}
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name/passport..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[11px]">
                <button
                  onClick={() => setHistoryFilter('all')}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    historyFilter === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setHistoryFilter('passed')}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    historyFilter === 'passed' ? 'bg-emerald-950 text-emerald-300 font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Passed
                </button>
                <button
                  onClick={() => setHistoryFilter('flagged')}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    historyFilter === 'flagged' ? 'bg-red-950 text-red-300 font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Flagged
                </button>
              </div>

              {/* Clear Button */}
              <button
                onClick={handleClearAllHistory}
                title="Clear all saved audit history"
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Saved Audits Grid */}
          {filteredAudits.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No audit records matching "{historySearch}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredAudits.map((item) => {
                const isSelected = activeHistoryId === item.id;
                const isValid = item.result.isValid;
                const extracted = item.result.extractedData;
                const checks = item.result.validationChecks;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleRevisitHistoryItem(item)}
                    className={`rounded-xl border p-3.5 transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40' 
                        : 'bg-slate-950/60 hover:bg-slate-800/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top row: Status & Score */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          {isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Passed ({item.result.overallScore}/100)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-red-950/80 border border-red-800 text-red-300 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3 text-red-400" />
                              Flagged ({item.result.overallScore}/100)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button
                            onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                            title="Delete this audit from storage"
                            className="text-slate-600 hover:text-red-400 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Main Bio Data Info */}
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-100 text-xs truncate" title={extracted.fullName}>
                          {extracted.fullName || item.fileName || 'Unknown Applicant'}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span>Doc: <strong className="text-amber-300">{extracted.passportNumber || 'N/A'}</strong></span>
                          <span>{extracted.nationality || extracted.countryCode || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Expiry & 6 Month status */}
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Exp: {formatDate(extracted.expiryDate)}</span>
                        <span className={checks.hasSixMonthsValidity ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                          {checks.hasSixMonthsValidity ? '≥6 Mo OK' : '<6 Mo Expired'}
                        </span>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2 text-[10px]">
                      <span className="text-slate-500">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPdf(item.result, item.previewUrl);
                          }}
                          title="Download PDF report for this applicant"
                          className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
                        >
                          <FileDown className="w-3 h-3" />
                        </button>
                        {onCreateApplication && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCreateApplication(item.result, item.previewUrl);
                            }}
                            title="Create CRM application from this scan"
                            className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>Create App</span>
                          </button>
                        )}
                        <span className={`font-semibold flex items-center gap-1 ${
                          isSelected ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-300'
                        }`}>
                          {isSelected ? (
                            <>
                              <Check className="w-3 h-3 text-amber-400" />
                              Active
                            </>
                          ) : (
                            <>
                              View
                              <ChevronRight className="w-3 h-3" />
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
