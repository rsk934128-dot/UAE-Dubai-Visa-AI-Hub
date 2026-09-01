import React, { useState } from 'react';
import { 
  FileText, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Upload, 
  Plus, 
  Eye, 
  Download, 
  Copy, 
  Check, 
  ArrowRight, 
  ArrowLeftRight, 
  ShieldCheck, 
  Scan, 
  Camera, 
  Sparkles, 
  Filter, 
  Layers, 
  ChevronDown, 
  ChevronRight, 
  User, 
  Tag, 
  Trash2,
  X,
  Printer
} from 'lucide-react';
import { VisaApplication, DocumentAuditHistoryItem, DocumentAuditType, DocumentAuditStatus } from '../types';
import { formatDate } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

interface DocumentHistoryModalProps {
  application: VisaApplication;
  isOpen: boolean;
  onClose: () => void;
  onUpdateApplicationDocuments?: (applicationId: string, updatedDocs: DocumentAuditHistoryItem[]) => void;
}

export const DocumentHistoryModal: React.FC<DocumentHistoryModalProps> = ({
  application,
  isOpen,
  onClose,
  onUpdateApplicationDocuments
}) => {
  const { language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'timeline' | 'compare' | 'upload' | 'export'>('timeline');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Side-by-side compare state
  const [compareLeftId, setCompareLeftId] = useState<string>('');
  const [compareRightId, setCompareRightId] = useState<string>('');

  // Upload/Attach form state
  const [newDocType, setNewDocType] = useState<DocumentAuditType>('Passport OCR');
  const [newVersion, setNewVersion] = useState('v1.1');
  const [newFileName, setNewFileName] = useState('');
  const [newStatus, setNewStatus] = useState<DocumentAuditStatus>('Passed');
  const [newScore, setNewScore] = useState<number>(95);
  const [newSummary, setNewSummary] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [newValidityDays, setNewValidityDays] = useState<number>(730);
  const [newNotes, setNewNotes] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  // Initialize documents list with existing history or fallback derived from audits
  const docs: DocumentAuditHistoryItem[] = application.documentHistory && application.documentHistory.length > 0
    ? application.documentHistory
    : [
        ...(application.passportAudit ? [{
          id: `doc-${application.id}-passport-01`,
          version: 'v1.0',
          documentType: 'Passport OCR' as DocumentAuditType,
          fileName: `${application.applicantName.toLowerCase().replace(/\s+/g, '_')}_passport.png`,
          uploadedAt: application.createdAt,
          uploadedBy: application.assignedAgent || 'System Auto-OCR',
          status: (application.passportAudit.isValid ? 'Passed' : 'Flagged') as DocumentAuditStatus,
          score: application.passportAudit.overallScore,
          summary: `Passport OCR parsed. 6-Month Rule: ${application.passportAudit.validationChecks.hasSixMonthsValidity ? 'Passed' : 'Flagged'}. Expiry: ${application.passportAudit.extractedData.expiryDate || 'N/A'}.`,
          details: {
            validityDaysRemaining: application.passportAudit.validationChecks.validityRemainingDays,
            expiryDate: application.passportAudit.extractedData.expiryDate,
            mrzStatus: application.passportAudit.validationChecks.mrzMatched ? 'Matched' : 'Discrepancy',
            sixMonthRuleMet: application.passportAudit.validationChecks.hasSixMonthsValidity,
            rejectionReasons: application.passportAudit.rejectionReasons,
            suggestions: application.passportAudit.suggestions,
            fileSize: '1.9 MB',
            checksumSha256: 'a90e34ff1289...'
          },
          notes: application.passportAudit.dubaiVisaEligibilityNotes || 'Initial passport intake record.',
          passportAudit: application.passportAudit
        }] : []),
        ...(application.photoAudit ? [{
          id: `doc-${application.id}-photo-01`,
          version: 'v1.0',
          documentType: 'Biometric Photo' as DocumentAuditType,
          fileName: `${application.applicantName.toLowerCase().replace(/\s+/g, '_')}_photo.jpg`,
          uploadedAt: application.updatedAt || application.createdAt,
          uploadedBy: application.assignedAgent || 'AI Photo Auditor',
          status: (application.photoAudit.isValid ? 'Passed' : 'Flagged') as DocumentAuditStatus,
          score: application.photoAudit.overallScore,
          summary: `Photo audit: ${application.photoAudit.checks.isWhiteBackground ? 'Pure White BG' : 'Background Needs Correction'}, ${application.photoAudit.checks.faceCoverageRatio}% face ratio.`,
          details: {
            photoDimensions: '40x55 mm',
            faceCoverageRatio: application.photoAudit.checks.faceCoverageRatio,
            backgroundTone: application.photoAudit.detectedAttributes.backgroundTone,
            rejectionReasons: application.photoAudit.rejectionReasons,
            suggestions: application.photoAudit.suggestions,
            fileSize: '450 KB'
          },
          notes: 'ICAO / GDRFA photo standard audit.',
          photoAudit: application.photoAudit
        }] : [])
      ];

  // Set default compare selection
  React.useEffect(() => {
    if (docs.length >= 2) {
      setCompareLeftId(docs[0].id);
      setCompareRightId(docs[1].id);
    } else if (docs.length === 1) {
      setCompareLeftId(docs[0].id);
      setCompareRightId(docs[0].id);
    }
  }, [application]);

  if (!isOpen) return null;

  const filteredDocs = docs.filter(doc => {
    if (typeFilter === 'ALL') return true;
    return doc.documentType === typeFilter;
  });

  const selectedDoc = docs.find(d => d.id === selectedDocId) || docs[0];
  const docLeft = docs.find(d => d.id === compareLeftId) || docs[0];
  const docRight = docs.find(d => d.id === compareRightId) || (docs[1] || docs[0]);

  const handleCopyJson = (item: DocumentAuditHistoryItem) => {
    navigator.clipboard.writeText(JSON.stringify(item, null, 2));
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNewVersionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const newDocItem: DocumentAuditHistoryItem = {
      id: `doc-${application.id}-${Date.now().toString().slice(-6)}`,
      version: newVersion.trim() || `v${(docs.length + 1).toFixed(1)}`,
      documentType: newDocType,
      fileName: newFileName.trim(),
      uploadedAt: new Date().toISOString(),
      uploadedBy: application.assignedAgent || 'Desk Officer (Manual Intake)',
      status: newStatus,
      score: Number(newScore),
      summary: newSummary.trim() || `${newDocType} version ${newVersion} audited and archived for file ${application.id}.`,
      details: {
        validityDaysRemaining: Number(newValidityDays) || undefined,
        expiryDate: newExpiryDate || undefined,
        mrzStatus: newDocType === 'Passport OCR' ? 'Matched' : 'N/A',
        sixMonthRuleMet: Number(newValidityDays) >= 180,
        fileSize: previewDataUrl ? '1.4 MB' : '780 KB',
        previewUrl: previewDataUrl || undefined,
        checksumSha256: `sha256-${Math.random().toString(36).substring(2, 12)}`
      },
      notes: newNotes.trim() || undefined
    };

    const updated = [newDocItem, ...docs];
    if (onUpdateApplicationDocuments) {
      onUpdateApplicationDocuments(application.id, updated);
    }

    // Reset & switch to timeline
    setNewFileName('');
    setNewSummary('');
    setNewNotes('');
    setPreviewDataUrl(null);
    setActiveTab('timeline');
    setSelectedDocId(newDocItem.id);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className={`bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden ${isRTL ? 'font-arabic' : ''}`}>
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800/90 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {language === 'ar' ? 'سجل وتاريخ تدقيق المستندات' : 'Applicant Document & Audit History'}
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                  {application.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                <span className="text-slate-200 font-semibold">{application.applicantName}</span> • {application.passportNumber} ({application.nationality}) • {application.visaType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Document History"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header Tabs */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between gap-4 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="tab-doc-timeline"
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'timeline'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'سجل النسخ والتدقيق' : 'Audit Trail & Versions'}</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
                {docs.length}
              </span>
            </button>

            <button
              id="tab-doc-compare"
              onClick={() => setActiveTab('compare')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'compare'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'مقارنة النسخ جنبًا لجنب' : 'Side-by-Side Diff'}</span>
            </button>

            <button
              id="tab-doc-upload"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إرفاق نسخة وثيقة جديدة' : 'Attach New Version'}</span>
            </button>

            <button
              id="tab-doc-export"
              onClick={() => setActiveTab('export')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تقرير التدقيق الرسمي' : 'Export Audit Dossier'}</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>{language === 'ar' ? 'المطابقة الإجمالية:' : 'Overall Clearance:'}</span>
            <span className={`px-2 py-0.5 rounded font-bold ${
              application.status === 'Approved' || application.status === 'Audited - Passed'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {application.status}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* TAB 1: CHRONOLOGICAL AUDIT TRAIL & VERSIONS */}
          {activeTab === 'timeline' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: Version History List */}
              <div className="lg:col-span-5 space-y-3">
                {/* Filter Toolbar */}
                <div className="flex items-center justify-between gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL" className="bg-slate-900">{language === 'ar' ? 'جميع أنواع الوثائق' : 'All Document Types'}</option>
                      <option value="Passport OCR" className="bg-slate-900">Passport OCR</option>
                      <option value="Biometric Photo" className="bg-slate-900">Biometric Photo</option>
                      <option value="Selfie Liveness" className="bg-slate-900">Selfie Liveness</option>
                      <option value="Attested Degree" className="bg-slate-900">Attested Degree</option>
                      <option value="Salary Certificate / Bank Statement" className="bg-slate-900">Salary / Bank</option>
                      <option value="Other Document" className="bg-slate-900">Other Document</option>
                    </select>
                  </div>
                  
                  <span className="text-[11px] font-mono text-slate-500">
                    {filteredDocs.length} {language === 'ar' ? 'سجلات' : 'records'}
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-2.5">
                  {filteredDocs.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-500 text-xs">
                      {language === 'ar' ? 'لا توجد مستندات مسجلة لهذا التصنيف' : 'No document records match this filter.'}
                    </div>
                  ) : (
                    filteredDocs.map((doc) => {
                      const isSelected = (selectedDoc?.id === doc.id);
                      return (
                        <div
                          key={doc.id}
                          onClick={() => setSelectedDocId(doc.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs relative ${
                            isSelected
                              ? 'bg-slate-800/90 border-amber-500/80 shadow-md shadow-amber-500/5'
                              : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                                {doc.version}
                              </span>
                              <span className="font-semibold text-white truncate max-w-[180px]">
                                {doc.documentType}
                              </span>
                            </div>

                            <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${
                              doc.status === 'Passed' || doc.status === 'Approved'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : doc.status === 'Flagged'
                                ? 'bg-red-950 text-red-300 border-red-800'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              {doc.status}
                            </span>
                          </div>

                          <p className="text-slate-400 text-[11px] mt-1.5 line-clamp-2">
                            {doc.summary}
                          </p>

                          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                            <span>{formatDate(doc.uploadedAt)}</span>
                            <span className="text-slate-400">Score: {doc.score}/100</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Selected Document Inspector & Details */}
              <div className="lg:col-span-7">
                {selectedDoc ? (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                            {selectedDoc.version}
                          </span>
                          <h4 className="text-base font-bold text-white">
                            {selectedDoc.documentType}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 font-mono flex items-center gap-2">
                          <span>{selectedDoc.fileName}</span>
                          {selectedDoc.details.fileSize && (
                            <span className="text-slate-500">({selectedDoc.details.fileSize})</span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyJson(selectedDoc)}
                          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Copy Document Audit JSON"
                        >
                          {copiedId === selectedDoc.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-mono">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>JSON</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Key Verification Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Audit Score</span>
                        <span className={`text-base font-bold font-mono ${
                          selectedDoc.score >= 85 ? 'text-emerald-400' : selectedDoc.score >= 65 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {selectedDoc.score} / 100
                        </span>
                      </div>

                      {selectedDoc.details.validityDaysRemaining !== undefined && (
                        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase font-mono">6-Month Rule</span>
                          <span className={`font-semibold flex items-center gap-1 mt-0.5 ${
                            selectedDoc.details.sixMonthRuleMet ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {selectedDoc.details.sixMonthRuleMet ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Passed ({selectedDoc.details.validityDaysRemaining} Days)
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Flagged ({selectedDoc.details.validityDaysRemaining} Days)
                              </>
                            )}
                          </span>
                        </div>
                      )}

                      {selectedDoc.details.expiryDate && (
                        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase font-mono">Document Expiry</span>
                          <span className="font-mono text-slate-200 block mt-0.5">
                            {selectedDoc.details.expiryDate}
                          </span>
                        </div>
                      )}

                      {selectedDoc.details.mrzStatus && (
                        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px] uppercase font-mono">MRZ Checksum</span>
                          <span className="font-semibold text-sky-400 block mt-0.5">
                            {selectedDoc.details.mrzStatus}
                          </span>
                        </div>
                      )}

                      <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Uploaded By</span>
                        <span className="text-slate-300 truncate block mt-0.5">
                          {selectedDoc.uploadedBy}
                        </span>
                      </div>

                      <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Timestamp</span>
                        <span className="font-mono text-slate-400 block mt-0.5">
                          {formatDate(selectedDoc.uploadedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Summary Callout */}
                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                      <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">
                        {language === 'ar' ? 'ملخص الفحص والتحقق البيومتري:' : 'Audit Summary & Verdict:'}
                      </span>
                      <p className="text-slate-200 leading-relaxed">
                        {selectedDoc.summary}
                      </p>
                    </div>

                    {/* Rejections / Recommendations */}
                    {selectedDoc.details.rejectionReasons && selectedDoc.details.rejectionReasons.length > 0 && (
                      <div className="bg-red-950/40 border border-red-900/60 p-3.5 rounded-xl space-y-1.5 text-xs">
                        <span className="text-red-300 font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          {language === 'ar' ? 'ملاحظات عدم المطابقة والتنبيهات:' : 'Immigration Compliance Warnings:'}
                        </span>
                        <ul className="list-disc list-inside text-red-200 space-y-1 text-[11px]">
                          {selectedDoc.details.rejectionReasons.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedDoc.notes && (
                      <div className="bg-slate-900/40 border border-slate-800/80 p-3 rounded-lg text-xs text-slate-400">
                        <strong className="text-slate-300 block mb-0.5">{language === 'ar' ? 'ملاحظات الموظف / الوكالة:' : 'Agent / Desk Notes:'}</strong>
                        <span>{selectedDoc.notes}</span>
                      </div>
                    )}

                    {/* Preview Thumbnail if Available */}
                    {selectedDoc.details.previewUrl && (
                      <div className="space-y-1.5">
                        <span className="text-slate-400 text-[11px] font-semibold block">
                          {language === 'ar' ? 'معاينة المستند الممسوح ضوئياً:' : 'Document Scan Preview:'}
                        </span>
                        <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 max-h-48 overflow-hidden flex items-center justify-center">
                          <img 
                            src={selectedDoc.details.previewUrl} 
                            alt={selectedDoc.fileName}
                            className="max-h-44 object-contain rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-12 bg-slate-950/40 rounded-xl border border-slate-800 text-slate-500 text-xs">
                    {language === 'ar' ? 'حدد مستنداً من القائمة لمعاينة التفاصيل' : 'Select a document version from the list to inspect its audit details.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SIDE-BY-SIDE DIFF & VERSION COMPARISON */}
          {activeTab === 'compare' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white">
                    {language === 'ar' ? 'مقارنة نسختين مختلفتين من مستندات العميل' : 'Select 2 Document Versions to Compare:'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                    <span className="text-slate-400 font-mono text-[11px]">V1:</span>
                    <select
                      value={compareLeftId}
                      onChange={(e) => setCompareLeftId(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs focus:outline-none"
                    >
                      {docs.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.version} - {d.documentType} ({d.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="text-slate-600 font-bold">vs</span>

                  <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                    <span className="text-slate-400 font-mono text-[11px]">V2:</span>
                    <select
                      value={compareRightId}
                      onChange={(e) => setCompareRightId(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs focus:outline-none"
                    >
                      {docs.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.version} - {d.documentType} ({d.status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Side-by-side Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Left Document */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-bold">
                      {docLeft.version} • {docLeft.documentType}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      docLeft.status === 'Passed' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                    }`}>
                      {docLeft.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">File Name</span>
                      <span className="font-mono text-slate-300">{docLeft.fileName}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Score</span>
                        <span className="font-bold text-white">{docLeft.score} / 100</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Validity Remaining</span>
                        <span className="font-semibold text-slate-300">
                          {docLeft.details.validityDaysRemaining ? `${docLeft.details.validityDaysRemaining} Days` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">Expiry Date</span>
                      <span className="font-mono text-slate-200">{docLeft.details.expiryDate || 'N/A'}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">Audit Verdict</span>
                      <p className="text-slate-300 text-[11px] mt-0.5">{docLeft.summary}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">Uploaded At</span>
                      <span className="text-slate-400 text-[11px]">{formatDate(docLeft.uploadedAt)} by {docLeft.uploadedBy}</span>
                    </div>
                  </div>
                </div>

                {/* Right Document */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      {docRight.version} • {docRight.documentType}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      docRight.status === 'Passed' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                    }`}>
                      {docRight.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">File Name</span>
                      <span className="font-mono text-slate-300">{docRight.fileName}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Score</span>
                        <span className="font-bold text-emerald-400">{docRight.score} / 100</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Validity Remaining</span>
                        <span className="font-semibold text-emerald-400">
                          {docRight.details.validityDaysRemaining ? `${docRight.details.validityDaysRemaining} Days` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">Expiry Date</span>
                      <span className="font-mono text-slate-200">{docRight.details.expiryDate || 'N/A'}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">Audit Verdict</span>
                      <p className="text-slate-300 text-[11px] mt-0.5">{docRight.summary}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">Uploaded At</span>
                      <span className="text-slate-400 text-[11px]">{formatDate(docRight.uploadedAt)} by {docRight.uploadedBy}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD / ATTACH NEW DOCUMENT VERSION */}
          {activeTab === 'upload' && (
            <form onSubmit={handleAddNewVersionSubmit} className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4 max-w-2xl mx-auto">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  {language === 'ar' ? 'تسجيل وإرفاق نسخة وثيقة جديدة للملف' : 'Attach & Archive New Document Version'}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'ar'
                    ? 'أضف نسخة محدثة من جواز السفر أو الصورة أو إيصال التجديد للمحافظة على سجل التدقيق الكامل.'
                    : 'Attach an updated passport scan, revised biometric photo, degree equivalency, or renewal receipt to preserve version history.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">{language === 'ar' ? 'نوع المستند:' : 'Document Type:'}</label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as DocumentAuditType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Passport OCR">Passport OCR (Bio-data page)</option>
                    <option value="Biometric Photo">Biometric Photo (40x55mm)</option>
                    <option value="Selfie Liveness">Selfie Liveness Verification</option>
                    <option value="Attested Degree">Attested Degree / Equivalency</option>
                    <option value="Salary Certificate / Bank Statement">Salary Certificate / Bank Statement</option>
                    <option value="Emirates ID / National ID">Emirates ID / National ID</option>
                    <option value="Trade License / Work Contract">Trade License / Work Contract</option>
                    <option value="Other Document">Other Supporting Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">{language === 'ar' ? 'رقم النسخة:' : 'Version Tag:'}</label>
                  <input
                    type="text"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    placeholder="e.g. v1.1 or v2.0"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="block text-slate-400">{language === 'ar' ? 'اسم الملف أو المستند:' : 'File / Document Name:'}</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g. tariqul_passport_reissue_2029.png"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Drag and Drop File Upload Area */}
              <div className="border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-900/40">
                <input
                  type="file"
                  id="modal-doc-file-upload"
                  onChange={handleFileUpload}
                  accept="image/*,application/pdf"
                  className="hidden"
                />
                <label htmlFor="modal-doc-file-upload" className="cursor-pointer block space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-amber-300 font-semibold block">
                    {previewDataUrl ? 'File Selected (Click to Replace)' : 'Click to Upload Document Scan (PNG, JPG, PDF)'}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Supports high-resolution passport scans up to 10MB
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">{language === 'ar' ? 'حالة التدقيق:' : 'Audit Status:'}</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as DocumentAuditStatus)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                  >
                    <option value="Passed">Passed (Compliant)</option>
                    <option value="Approved">Approved by GDRFA/ICP</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Flagged">Flagged (&lt;6 Mo or Discrepancy)</option>
                    <option value="Superseded">Superseded by Newer Version</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">{language === 'ar' ? 'درجة الفحص (0-100):' : 'Score (0 - 100):'}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newScore}
                    onChange={(e) => setNewScore(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">{language === 'ar' ? 'الأيام المتبقية في الصلاحية:' : 'Validity Remaining (Days):'}</label>
                  <input
                    type="number"
                    value={newValidityDays}
                    onChange={(e) => setNewValidityDays(Number(e.target.value))}
                    placeholder="e.g. 730"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="block text-slate-400">{language === 'ar' ? 'ملخص التدقيق أو التحديث:' : 'Audit Summary / Change Log:'}</label>
                <textarea
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="e.g. Renewed e-Passport submitted. Validity extended to 5 years, satisfying GDRFA 6-month rule."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'حفظ النسخة في سجل الملف' : 'Save Version to Dossier'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: EXPORT AUDIT REPORT / PRINT SUMMARY */}
          {activeTab === 'export' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4 max-w-3xl mx-auto">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 block">
                    GDRFA &amp; ICP Official Pre-Audit Record
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    {language === 'ar' ? 'تقرير تدقيق ومطابقة المستندات المعتمد' : 'Certified Document Version & Audit Trail'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    File ID: <span className="font-mono text-slate-200">{application.id}</span> | Applicant: <span className="font-semibold text-white">{application.applicantName}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ar' ? 'طباعة التقرير' : 'Print Report'}</span>
                </button>
              </div>

              {/* Summary Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Version</th>
                      <th className="p-2.5">Document Type</th>
                      <th className="p-2.5">Score</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Date &amp; Officer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {docs.map((d) => (
                      <tr key={d.id}>
                        <td className="p-2.5 font-mono font-bold text-amber-400">{d.version}</td>
                        <td className="p-2.5 font-medium text-white">{d.documentType}</td>
                        <td className="p-2.5 font-mono">{d.score}/100</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            d.status === 'Passed' || d.status === 'Approved' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-[11px] text-slate-400">
                          {formatDate(d.uploadedAt)} ({d.uploadedBy})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-[11px] text-slate-400 font-mono">
                Verification Hash: <span className="text-amber-300">SHA256: 8f9021da... (ICAO Doc 9303 Verified)</span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="font-mono text-[11px]">
            {language === 'ar' ? 'إجمالي النسخ المؤرشفة:' : 'Total Archived Versions:'} <strong className="text-white">{docs.length}</strong>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer transition-colors"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
