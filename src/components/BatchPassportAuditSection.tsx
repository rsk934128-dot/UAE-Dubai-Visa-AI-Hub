import React, { useState, useMemo, useRef } from 'react';
import {
  UploadCloud,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Scan,
  Sparkles,
  Download,
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  ExternalLink,
  ShieldCheck,
  Layers,
  Award,
  AlertCircle,
  Check,
  UserPlus
} from 'lucide-react';
import { PassportAuditResult, BatchPassportAuditItem, SavedPassportAudit } from '../types';
import {
  DUMMY_PASSPORT_SAMPLES,
  convertFileToBase64,
  ensureRasterBase64,
  formatDate
} from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';
import { generatePassportAuditPdf } from '../lib/pdfReportGenerator';
import { VisualAuditSummary } from './VisualAuditSummary';

interface BatchPassportAuditSectionProps {
  onBatchAuditCompleted?: (items: BatchPassportAuditItem[]) => void;
  onSaveToHistory?: (result: PassportAuditResult, previewUrl: string, fileName?: string) => void;
  onCreateApplication?: (prefill: {
    applicantName: string;
    passportNumber: string;
    nationality: string;
    dateOfBirth?: string;
    expiryDate?: string;
  }) => void;
}

type FilterStatus = 'all' | 'compliant' | 'near-expiry' | 'critical';
type SortField = 'score-desc' | 'score-asc' | 'days-asc' | 'name-asc';

export const BatchPassportAuditSection: React.FC<BatchPassportAuditSectionProps> = ({
  onBatchAuditCompleted,
  onSaveToHistory,
  onCreateApplication
}) => {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [batchItems, setBatchItems] = useState<BatchPassportAuditItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState<number>(-1);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortField>('score-desc');
  const [inspectItem, setInspectItem] = useState<BatchPassportAuditItem | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
  const cancelProcessingRef = useRef(false);

  // Ingest files into queue
  const addFilesToQueue = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const newItems: BatchPassportAuditItem[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      try {
        const rawBase64 = await convertFileToBase64(file);
        const { base64 } = await ensureRasterBase64(rawBase64);
        newItems.push({
          id: `batch_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
          fileName: file.name,
          fileSize: file.size,
          previewUrl: base64,
          status: 'pending'
        });
      } catch (err) {
        console.error(`Failed reading file ${file.name}:`, err);
      }
    }

    if (newItems.length > 0) {
      setBatchItems(prev => [...prev, ...newItems]);
    }
  };

  // Load Demo Pack (4 distinct passports)
  const handleLoadDemoPack = async () => {
    const demoItems: BatchPassportAuditItem[] = [];
    for (let i = 0; i < DUMMY_PASSPORT_SAMPLES.length; i++) {
      const sample = DUMMY_PASSPORT_SAMPLES[i];
      try {
        const { base64 } = await ensureRasterBase64(sample.dataUrl);
        demoItems.push({
          id: `demo_${Date.now()}_${i}`,
          fileName: `${sample.nationality}_Passport_${sample.number}.png`,
          fileSize: 1024 * 180, // ~180KB estimate
          previewUrl: base64,
          status: 'pending'
        });
      } catch (e) {
        console.warn('Demo sample raster error:', e);
      }
    }
    setBatchItems(prev => [...prev, ...demoItems]);
  };

  // Single file removal from queue
  const handleRemoveItem = (id: string) => {
    if (isProcessing) return;
    setBatchItems(prev => prev.filter(item => item.id !== id));
  };

  // Clear all queue
  const handleClearAll = () => {
    if (isProcessing) return;
    if (batchItems.length > 0 && window.confirm(language === 'ar' ? 'هل تريد مسح جميع الجوازات في قائمة الدفعة؟' : 'Clear all passport items from the batch queue?')) {
      setBatchItems([]);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(e.dataTransfer.files);
    }
  };

  // Perform single audit API call with fallback
  const auditSinglePassport = async (base64: string): Promise<PassportAuditResult> => {
    const response = await fetch('/api/audit-passport', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64, mimeType: 'image/png' })
    });

    const json = await response.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Audit engine failure');
    }
    return json.data;
  };

  // Execute Batch Audit Processing
  const handleStartBatchAudit = async () => {
    if (isProcessing || batchItems.length === 0) return;

    cancelProcessingRef.current = false;
    setIsProcessing(true);

    const pendingIndices: number[] = [];
    batchItems.forEach((item, index) => {
      if (item.status === 'pending' || item.status === 'error') {
        pendingIndices.push(index);
      }
    });

    if (pendingIndices.length === 0) {
      setIsProcessing(false);
      return;
    }

    for (let i = 0; i < pendingIndices.length; i++) {
      if (cancelProcessingRef.current) {
        break;
      }

      const itemIdx = pendingIndices[i];
      setCurrentProcessingIndex(itemIdx);

      // Mark current item as processing
      setBatchItems(prev => {
        const next = [...prev];
        if (next[itemIdx]) {
          next[itemIdx] = { ...next[itemIdx], status: 'processing' };
        }
        return next;
      });

      const currentItem = batchItems[itemIdx];

      try {
        const result = await auditSinglePassport(currentItem.previewUrl);

        // Update item with result
        setBatchItems(prev => {
          const next = [...prev];
          if (next[itemIdx]) {
            next[itemIdx] = {
              ...next[itemIdx],
              status: 'completed',
              result,
              processedAt: new Date().toISOString()
            };
          }
          return next;
        });

        // Save to individual history if handler provided
        if (onSaveToHistory) {
          onSaveToHistory(result, currentItem.previewUrl, currentItem.fileName);
        }
      } catch (err: any) {
        console.error(`Audit failed for ${currentItem.fileName}:`, err);
        setBatchItems(prev => {
          const next = [...prev];
          if (next[itemIdx]) {
            next[itemIdx] = {
              ...next[itemIdx],
              status: 'error',
              error: err.message || 'Audit failed'
            };
          }
          return next;
        });
      }

      // Small pause between audits for rate limit friendliness
      await new Promise(r => setTimeout(r, 400));
    }

    setIsProcessing(false);
    setCurrentProcessingIndex(-1);

    if (onBatchAuditCompleted) {
      onBatchAuditCompleted(batchItems);
    }
  };

  const handleCancelBatch = () => {
    cancelProcessingRef.current = true;
    setIsProcessing(false);
    setCurrentProcessingIndex(-1);
  };

  // Generate Individual PDF from batch row
  const handleDownloadPdf = async (item: BatchPassportAuditItem) => {
    if (!item.result) return;
    setGeneratingPdfId(item.id);
    try {
      await generatePassportAuditPdf({
        auditResult: item.result,
        passportImageBase64: item.previewUrl
      });
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setGeneratingPdfId(null);
    }
  };

  // Export Consolidated Batch CSV
  const handleExportCsv = () => {
    setIsExportingCsv(true);
    try {
      const headers = [
        'Batch ID',
        'File Name',
        'Applicant Name',
        'Passport Number',
        'Nationality',
        'Date of Birth',
        'Gender',
        'Expiry Date',
        'Remaining Days',
        '6-Month Rule Passed',
        'Compliance Score',
        'Health Status',
        'MRZ Matched',
        'Rejection Reasons',
        'GDRFA Dubai Eligibility Notes',
        'Audit Timestamp'
      ];

      const rows = batchItems
        .filter(item => item.result)
        .map(item => {
          const r = item.result!;
          const data = r.extractedData;
          const checks = r.validationChecks;
          const healthTier = !checks.hasSixMonthsValidity || checks.validityRemainingDays < 180 || !r.isValid
            ? 'Critical Defect'
            : checks.validityRemainingDays < 240 || r.overallScore < 80
            ? 'Near-Expiry Horizon'
            : 'Compliant & Approved';

          return [
            `"${item.id}"`,
            `"${item.fileName.replace(/"/g, '""')}"`,
            `"${(data.fullName || '').replace(/"/g, '""')}"`,
            `"${(data.passportNumber || '').replace(/"/g, '""')}"`,
            `"${(data.nationality || '').replace(/"/g, '""')}"`,
            `"${data.dateOfBirth || ''}"`,
            `"${data.sex || ''}"`,
            `"${data.expiryDate || ''}"`,
            checks.validityRemainingDays ?? 0,
            checks.hasSixMonthsValidity ? 'YES' : 'NO',
            r.overallScore,
            `"${healthTier}"`,
            checks.mrzMatched ? 'YES' : 'NO',
            `"${(r.rejectionReasons || []).join('; ').replace(/"/g, '""')}"`,
            `"${(r.dubaiVisaEligibilityNotes || '').replace(/"/g, '""')}"`,
            `"${item.processedAt || new Date().toISOString()}"`
          ].join(',');
        });

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Dubai_Visa_Passport_Batch_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Failed to export batch CSV:', e);
    } finally {
      setIsExportingCsv(false);
    }
  };

  // Batch Metrics
  const metrics = useMemo(() => {
    const total = batchItems.length;
    const completed = batchItems.filter(i => i.status === 'completed');
    const pending = batchItems.filter(i => i.status === 'pending');
    const error = batchItems.filter(i => i.status === 'error');

    let compliantCount = 0;
    let nearExpiryCount = 0;
    let criticalCount = 0;

    completed.forEach(i => {
      if (!i.result) return;
      const checks = i.result.validationChecks;
      const days = checks.validityRemainingDays ?? 0;
      const score = i.result.overallScore ?? 0;

      if (!checks.hasSixMonthsValidity || days < 180 || !i.result.isValid || !checks.mrzMatched || score < 60) {
        criticalCount++;
      } else if (days < 240 || score < 80 || checks.glareDetected || checks.blurDetected || checks.cornersCut) {
        nearExpiryCount++;
      } else {
        compliantCount++;
      }
    });

    const passRate = completed.length > 0 ? Math.round((compliantCount / completed.length) * 100) : 0;
    // 350 AED standard typing & non-refundable service fee averted per flagged rejection
    const feeLossAverted = (criticalCount + nearExpiryCount) * 350;

    return {
      total,
      completedCount: completed.length,
      pendingCount: pending.length,
      errorCount: error.length,
      compliantCount,
      nearExpiryCount,
      criticalCount,
      passRate,
      feeLossAverted
    };
  }, [batchItems]);

  // Filtered & Sorted Table Items
  const filteredItems = useMemo(() => {
    return batchItems.filter(item => {
      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const name = (item.result?.extractedData.fullName || item.fileName).toLowerCase();
        const num = (item.result?.extractedData.passportNumber || '').toLowerCase();
        const nat = (item.result?.extractedData.nationality || '').toLowerCase();
        if (!name.includes(query) && !num.includes(query) && !nat.includes(query)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === 'all') return true;
      if (!item.result) {
        return statusFilter === 'all';
      }

      const checks = item.result.validationChecks;
      const days = checks.validityRemainingDays ?? 0;
      const score = item.result.overallScore ?? 0;

      const isCrit = !checks.hasSixMonthsValidity || days < 180 || !item.result.isValid || !checks.mrzMatched || score < 60;
      const isNear = !isCrit && (days < 240 || score < 80 || checks.glareDetected || checks.blurDetected || checks.cornersCut);
      const isComp = !isCrit && !isNear;

      if (statusFilter === 'compliant') return isComp;
      if (statusFilter === 'near-expiry') return isNear;
      if (statusFilter === 'critical') return isCrit;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'score-desc') {
        const scoreA = a.result?.overallScore ?? -1;
        const scoreB = b.result?.overallScore ?? -1;
        return scoreB - scoreA;
      }
      if (sortBy === 'score-asc') {
        const scoreA = a.result?.overallScore ?? 999;
        const scoreB = b.result?.overallScore ?? 999;
        return scoreA - scoreB;
      }
      if (sortBy === 'days-asc') {
        const daysA = a.result?.validationChecks.validityRemainingDays ?? 99999;
        const daysB = b.result?.validationChecks.validityRemainingDays ?? 99999;
        return daysA - daysB;
      }
      if (sortBy === 'name-asc') {
        const nameA = a.result?.extractedData.fullName || a.fileName;
        const nameB = b.result?.extractedData.fullName || b.fileName;
        return nameA.localeCompare(nameB);
      }
      return 0;
    });
  }, [batchItems, searchTerm, statusFilter, sortBy]);

  return (
    <div id="batch-passport-audit-section" className="space-y-6">
      {/* Upload Zone & Action Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Header & Quick Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-semibold tracking-wide text-xs uppercase">
              <Layers className="w-4 h-4" />
              <span>{language === 'ar' ? 'المعالجة المجمعة لجوازات السفر' : 'Multi-Passport Batch Verification Engine'}</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {language === 'ar' ? 'فحص حزمة جوازات سفر دفعة واحدة' : 'Batch Passport Ingestion & Validation Table'}
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl">
              {language === 'ar'
                ? 'قم برفع مستندات متعددة في وقت واحد. يفحص النظام قاعدة الـ 6 أشهر والرمز الشريطي بدقة، وينشئ جدولاً موحداً مع تقرير قابل للتصدير.'
                : 'Upload multiple passport bio-data pages simultaneously. Simultaneously audit 180-day GDRFA compliance, extract ICAO data, and prevent typing fee forfeitures.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="btn-batch-load-demo-pack"
              onClick={handleLoadDemoPack}
              disabled={isProcessing}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'ar' ? 'تحميل حزمة تجريبية (٤ جوازات)' : 'Load Demo Pack (4 Passports)'}</span>
            </button>

            <button
              id="btn-batch-add-more"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'إضافة ملفات' : 'Add Passports'}</span>
            </button>
          </div>
        </div>

        {/* Multi-file Dropzone */}
        <div
          id="batch-dropzone-container"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative ${
            dragActive
              ? 'border-amber-500 bg-amber-500/10 scale-[1.005]'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            id="batch-file-input-multiple"
            multiple
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => e.target.files && addFilesToQueue(e.target.files)}
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                {language === 'ar' ? 'اسحب وأفلت جوازات سفر متعددة هنا أو' : 'Drag & drop multiple passport scans or'}{' '}
                <span className="text-amber-400 underline font-bold">{language === 'ar' ? 'تصفح جهازك' : 'browse files'}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'ar'
                  ? 'يدعم JPG, PNG, WEBP, PDF (اختر عدة ملفات معاً)'
                  : 'Supports JPG, PNG, WEBP, PDF — Select multiple files at once for consolidated auditing'}
              </p>
            </div>
          </div>
        </div>

        {/* Batch Queue Status & Execution Toolbar */}
        {batchItems.length > 0 && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 font-mono font-bold text-xs">
                {batchItems.length}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    {language === 'ar' ? 'قائمة الجوازات الجاهزة:' : 'Batch Ingestion Queue:'}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {metrics.completedCount} / {metrics.total} {language === 'ar' ? 'مكتمل' : 'Audited'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                  {metrics.pendingCount > 0 && (
                    <span className="text-amber-400 font-mono">{metrics.pendingCount} pending</span>
                  )}
                  {metrics.completedCount > 0 && (
                    <span className="text-emerald-400 font-mono">{metrics.completedCount} completed</span>
                  )}
                  {metrics.errorCount > 0 && (
                    <span className="text-rose-400 font-mono">{metrics.errorCount} failed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Execution Controls */}
            <div className="flex items-center gap-2.5 shrink-0">
              {isProcessing ? (
                <button
                  id="btn-cancel-batch-audit"
                  onClick={handleCancelBatch}
                  className="text-xs bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 px-4 py-2 rounded-xl transition-all font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إيقاف مؤقت' : 'Pause Batch'}</span>
                </button>
              ) : (
                <button
                  id="btn-start-batch-audit"
                  onClick={handleStartBatchAudit}
                  disabled={metrics.pendingCount === 0 && metrics.errorCount === 0}
                  className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Scan className="w-4 h-4" />
                  <span>
                    {metrics.completedCount === 0
                      ? (language === 'ar' ? `بدء فحص الحزمة (${batchItems.length})` : `Audit Batch (${batchItems.length} Passports)`)
                      : (language === 'ar' ? `استئناف فحص المتبقي (${metrics.pendingCount + metrics.errorCount})` : `Audit Remaining (${metrics.pendingCount + metrics.errorCount})`)}
                  </span>
                </button>
              )}

              <button
                id="btn-clear-batch-queue"
                onClick={handleClearAll}
                disabled={isProcessing}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 p-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                title={language === 'ar' ? 'مسح القائمة' : 'Clear Queue'}
              >
                <Trash2 className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {/* Live Batch Progress Indicator */}
        {isProcessing && (
          <div className="space-y-2 bg-slate-950/80 p-4 rounded-xl border border-amber-500/30 animate-pulse">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                {language === 'ar'
                  ? `جارٍ تدقيق الجواز رقم ${currentProcessingIndex + 1} من ${metrics.total}...`
                  : `Auditing passport ${currentProcessingIndex + 1} of ${metrics.total}: ${batchItems[currentProcessingIndex]?.fileName || ''}`}
              </span>
              <span className="text-slate-300 font-bold">
                {Math.round((metrics.completedCount / metrics.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.round((metrics.completedCount / metrics.total) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      {metrics.completedCount > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Total Audited */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              {language === 'ar' ? 'إجمالي المفحوص' : 'Total Audited'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold font-mono text-white">
                {metrics.completedCount}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ {metrics.total}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {metrics.pendingCount > 0 ? `${metrics.pendingCount} remaining` : 'Batch complete'}
            </span>
          </div>

          {/* Compliant & Cleared (Green) */}
          <div className="bg-emerald-950/30 border border-emerald-800/60 p-4 rounded-xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {language === 'ar' ? 'مطابق ومعتمد' : 'Compliant'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold font-mono text-emerald-300">
                {metrics.compliantCount}
              </span>
              <span className="text-xs text-emerald-400 font-mono">({metrics.passRate}%)</span>
            </div>
            <span className="text-[10px] text-emerald-300 block mt-0.5">
              {language === 'ar' ? 'جاهز للطباعة فوراً' : 'Ready for direct entry typing'}
            </span>
          </div>

          {/* Near Expiry Horizon (Orange) */}
          <div className="bg-amber-950/30 border border-amber-800/60 p-4 rounded-xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 block flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {language === 'ar' ? 'صلاحية وشيكة' : 'Near-Expiry'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold font-mono text-amber-300">
                {metrics.nearExpiryCount}
              </span>
            </div>
            <span className="text-[10px] text-amber-300 block mt-0.5">
              {language === 'ar' ? '180 - 240 يوماً متبقية' : 'Borderline (180 - 240 Days)'}
            </span>
          </div>

          {/* Critical Defects (Red) */}
          <div className="bg-rose-950/30 border border-rose-800/60 p-4 rounded-xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 block flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              {language === 'ar' ? 'مخالف وغير مطابق' : 'Critical Defects'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold font-mono text-rose-300">
                {metrics.criticalCount}
              </span>
            </div>
            <span className="text-[10px] text-rose-300 block mt-0.5">
              {language === 'ar' ? 'أقل من 180 يوماً أو خلل MRZ' : '<180 days / MRZ error'}
            </span>
          </div>

          {/* Loss Averted */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl col-span-2 lg:col-span-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              {language === 'ar' ? 'رسوم وُفرت من الرفض' : 'Loss Averted'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-extrabold font-mono text-amber-400">
                AED {metrics.feeLossAverted.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {language === 'ar' ? 'توفير رسوم طباعة مهدورة' : 'Saved in rejected typing fees'}
            </span>
          </div>
        </div>
      )}

      {/* Consolidated Validation Result Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Filters & Control Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'ar' ? 'الكل' : 'All'} ({batchItems.length})
            </button>
            <button
              onClick={() => setStatusFilter('compliant')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'compliant'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'ar' ? 'المطابق' : 'Compliant'}</span> ({metrics.compliantCount})
            </button>
            <button
              onClick={() => setStatusFilter('near-expiry')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'near-expiry'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'ar' ? 'صلاحية وشيكة' : 'Near-Expiry'}</span> ({metrics.nearExpiryCount})
            </button>
            <button
              onClick={() => setStatusFilter('critical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'critical'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>{language === 'ar' ? 'المخالف' : 'Critical'}</span> ({metrics.criticalCount})
            </button>
          </div>

          {/* Right: Search, Sort & Export CSV */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'ar' ? 'بحث بالاسم أو الرقم...' : 'Search name or passport #...'}
                className="bg-slate-950 border border-slate-800 text-slate-200 pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-amber-500 w-48 sm:w-56"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="score-desc">Score: High → Low</option>
              <option value="score-asc">Score: Low → High</option>
              <option value="days-asc">Validity Days: Fewest First</option>
              <option value="name-asc">Name: A → Z</option>
            </select>

            <button
              id="btn-export-consolidated-csv"
              onClick={handleExportCsv}
              disabled={metrics.completedCount === 0 || isExportingCsv}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Download consolidated Excel/CSV table"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{language === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* The Consolidated Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">{language === 'ar' ? 'معاينة المستند' : 'Document'}</th>
                <th className="py-3 px-4">{language === 'ar' ? 'صاحب الجواز والبيانات' : 'Applicant & Bio-Data'}</th>
                <th className="py-3 px-4">{language === 'ar' ? 'رقم الجواز والدولة' : 'Passport & Nationality'}</th>
                <th className="py-3 px-4">{language === 'ar' ? 'الصلاحية (قاعدة الـ 6 أشهر)' : 'Validity & 180-Day Rule'}</th>
                <th className="py-3 px-4 text-center">{language === 'ar' ? 'بطاقة الصحة (Health)' : 'Health Score'}</th>
                <th className="py-3 px-4">{language === 'ar' ? 'التشخيص والملاحظات' : 'Audit Findings'}</th>
                <th className="py-3 px-4 text-right">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Scan className="w-10 h-10 mx-auto text-slate-700 mb-2 stroke-[1.5]" />
                    <p className="text-sm font-medium text-slate-400">
                      {batchItems.length === 0
                        ? (language === 'ar' ? 'لا توجد جوازات في قائمة الدفعة. قم برفع ملفات أو اختر الحزمة التجريبية.' : 'No passports in batch queue. Upload files or load the demo pack above.')
                        : (language === 'ar' ? 'لا توجد نتائج تطابق معايير البحث والفلترة.' : 'No passports match the search or filter criteria.')}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const r = item.result;
                  const data = r?.extractedData;
                  const checks = r?.validationChecks;
                  const days = checks?.validityRemainingDays ?? 0;
                  const score = r?.overallScore ?? 0;

                  // Health Tier
                  let tier: 'valid' | 'near-expiry' | 'critical' = 'valid';
                  if (!checks?.hasSixMonthsValidity || days < 180 || !r?.isValid || !checks?.mrzMatched || score < 60) {
                    tier = 'critical';
                  } else if (days < 240 || score < 80 || checks?.glareDetected || checks?.blurDetected || checks?.cornersCut) {
                    tier = 'near-expiry';
                  }

                  const tierColor = tier === 'valid' ? '#10b981' : tier === 'near-expiry' ? '#f59e0b' : '#f43f5e';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* 1. Index & Status Icon */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                        {item.status === 'processing' ? (
                          <RefreshCw className="w-4 h-4 text-amber-400 animate-spin mx-auto" />
                        ) : item.status === 'completed' ? (
                          tier === 'valid' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                          ) : tier === 'near-expiry' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 mx-auto" />
                          )
                        ) : item.status === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-rose-400 mx-auto" />
                        ) : (
                          <span className="text-[11px]">{index + 1}</span>
                        )}
                      </td>

                      {/* 2. Document Preview Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => setLightboxImage({ url: item.previewUrl, title: item.fileName })}
                          className="w-14 h-10 rounded-lg border border-slate-700 bg-slate-950 overflow-hidden relative group/thumb cursor-pointer shrink-0 shadow-xs flex items-center justify-center"
                        >
                          <img
                            src={item.previewUrl}
                            alt={item.fileName}
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate block max-w-[110px] mt-1 font-mono">
                          {item.fileName}
                        </span>
                      </td>

                      {/* 3. Applicant Name & Bio */}
                      <td className="py-3.5 px-4">
                        {data?.fullName ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-white block text-xs tracking-tight">
                              {data.fullName}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                              <span>DOB: {data.dateOfBirth || 'N/A'}</span>
                              <span>•</span>
                              <span>{data.sex || 'M'}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">
                            {item.status === 'processing' ? 'Extracting OCR...' : 'Pending Audit'}
                          </span>
                        )}
                      </td>

                      {/* 4. Passport No & Nationality */}
                      <td className="py-3.5 px-4">
                        {data?.passportNumber ? (
                          <div className="space-y-1">
                            <span className="font-mono font-bold text-amber-300 block text-xs">
                              {data.passportNumber}
                            </span>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                              {data.nationality || data.countryCode || 'International'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">---</span>
                        )}
                      </td>

                      {/* 5. Validity & 180-Day Rule */}
                      <td className="py-3.5 px-4">
                        {checks ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="font-mono text-slate-200 text-xs font-semibold">
                                {data?.expiryDate || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                                style={{
                                  backgroundColor: `${tierColor}15`,
                                  borderColor: `${tierColor}40`,
                                  color: tierColor
                                }}
                              >
                                {days} Days ({checks.hasSixMonthsValidity ? '≥ 180D' : '< 180D Defect'})
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">---</span>
                        )}
                      </td>

                      {/* 6. Health Scorecard */}
                      <td className="py-3.5 px-4 text-center">
                        {r ? (
                          <div className="inline-flex flex-col items-center">
                            <div
                              className="px-2.5 py-1 rounded-lg border text-xs font-mono font-extrabold shadow-xs flex items-center gap-1"
                              style={{
                                backgroundColor: `${tierColor}15`,
                                borderColor: `${tierColor}50`,
                                color: tierColor
                              }}
                            >
                              <span>{score}</span>
                              <span className="text-[9px] opacity-75">/100</span>
                            </div>
                            <span
                              className="text-[9px] font-bold uppercase tracking-wider block mt-1"
                              style={{ color: tierColor }}
                            >
                              {tier === 'valid'
                                ? 'Compliant'
                                : tier === 'near-expiry'
                                ? 'Near-Expiry'
                                : 'Critical'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">--</span>
                        )}
                      </td>

                      {/* 7. Findings & Defect Diagnosis */}
                      <td className="py-3.5 px-4">
                        {r ? (
                          <div className="space-y-1 max-w-xs">
                            {r.rejectionReasons && r.rejectionReasons.length > 0 ? (
                              r.rejectionReasons.slice(0, 2).map((reason, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-rose-950/60 text-rose-300 border border-rose-800/80 px-2 py-0.5 rounded block truncate"
                                  title={reason}
                                >
                                  ⚠️ {reason}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded inline-block">
                                ✓ GDRFA & ICP Ready (100% Match)
                              </span>
                            )}
                            {checks?.glareDetected && (
                              <span className="text-[9px] text-amber-400 block font-mono">
                                ↳ Warning: Surface specular reflection
                              </span>
                            )}
                          </div>
                        ) : item.status === 'error' ? (
                          <span className="text-[11px] text-rose-400 font-mono">
                            {item.error || 'Audit Failed'}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">Queued</span>
                        )}
                      </td>

                      {/* 8. Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r && (
                            <>
                              <button
                                onClick={() => setInspectItem(item)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer border border-slate-700"
                                title="Inspect Radial Gauge Scorecard"
                              >
                                <Eye className="w-3.5 h-3.5 text-amber-400" />
                              </button>

                              <button
                                onClick={() => handleDownloadPdf(item)}
                                disabled={generatingPdfId === item.id}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer border border-slate-700 disabled:opacity-50"
                                title="Download PDF Clearance Certificate"
                              >
                                {generatingPdfId === item.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                                ) : (
                                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                              </button>

                              {onCreateApplication && data?.fullName && (
                                <button
                                  onClick={() => {
                                    onCreateApplication({
                                      applicantName: data.fullName,
                                      passportNumber: data.passportNumber || '',
                                      nationality: data.nationality || '',
                                      dateOfBirth: data.dateOfBirth,
                                      expiryDate: data.expiryDate
                                    });
                                  }}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer border border-slate-700"
                                  title="Add to CRM Intake"
                                >
                                  <UserPlus className="w-3.5 h-3.5 text-sky-400" />
                                </button>
                              )}
                            </>
                          )}

                          {!isProcessing && (
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1.5 hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                              title="Remove from batch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Inspection Modal for Detailed Radial Gauge Scorecard */}
      {inspectItem && inspectItem.result && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden space-y-5 p-6 my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Scan className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white tracking-tight">
                    {inspectItem.result.extractedData.fullName || inspectItem.fileName}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Passport No: {inspectItem.result.extractedData.passportNumber || 'N/A'} • {inspectItem.result.extractedData.nationality || ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPdf(inspectItem)}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ar' ? 'تحميل PDF' : 'Download PDF'}</span>
                </button>
                <button
                  onClick={() => setInspectItem(null)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Embedded Radial Gauge Scorecard Component */}
            <VisualAuditSummary
              auditResult={inspectItem.result}
              onDownloadPdf={() => handleDownloadPdf(inspectItem)}
            />

            {/* Extracted Bio-Data Details Grid */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">DOB</span>
                <span className="text-slate-200 font-medium">{inspectItem.result.extractedData.dateOfBirth || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Issue Date</span>
                <span className="text-slate-200 font-medium">{inspectItem.result.extractedData.issueDate || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Expiry Date</span>
                <span className="text-emerald-400 font-mono font-bold">{inspectItem.result.extractedData.expiryDate || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Remaining Days</span>
                <span className="text-slate-200 font-mono font-bold">
                  {inspectItem.result.validationChecks.validityRemainingDays} Days
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl w-full text-center space-y-2" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="max-h-[80vh] w-auto mx-auto rounded-2xl border border-slate-700 shadow-2xl object-contain"
            />
            <p className="text-xs text-slate-300 font-mono">{lightboxImage.title}</p>
            <button
              onClick={() => setLightboxImage(null)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-full border border-slate-700 mt-2 cursor-pointer"
            >
              {language === 'ar' ? 'إغلاق' : 'Close Preview'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
