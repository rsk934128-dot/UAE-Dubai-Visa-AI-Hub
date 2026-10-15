import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building, 
  Users, 
  Send, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Mail, 
  MessageSquare,
  MessageCircle,
  FileText,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  ArrowUpDown,
  Scan,
  ShieldCheck,
  Check,
  XCircle,
  FileCheck,
  Calculator,
  Coins,
  X,
  TrendingUp,
  History,
  Layers,
  ChevronRight,
  QrCode,
  PieChart as PieChartIcon,
  FileDown,
  RefreshCw,
  Camera,
  LayoutGrid,
  Table as TableIcon,
  Globe
} from 'lucide-react';
import { VisaApplication, PassportAuditResult, DocumentAuditHistoryItem, ApplicationAuditEvent } from '../types';
import { formatDate } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';
import { ApplicationsStatusDoughnutSection } from './ApplicationsStatusDoughnutSection';
import { PassportAuditStatisticsDashboard } from './PassportAuditStatisticsDashboard';
import { VisaDemandForecastWidget } from './VisaDemandForecastWidget';
import { VisaFeeCalculatorModal } from './VisaFeeCalculatorModal';
import { TemplateManagerModal } from './TemplateManagerModal';
import { DocumentHistoryModal } from './DocumentHistoryModal';
import { AgencyAuditTrailView } from './AgencyAuditTrailView';
import { ApplicationQrCodeModal } from './ApplicationQrCodeModal';
import { PWABuilderModal } from './PWABuilderModal';
import { WhatsAppShareModal } from './WhatsAppShareModal';
import { 
  WhatsAppAuditPayload, 
  WhatsAppStatusTemplateId,
  getWhatsAppPayloadFromApplication, 
  getRecommendedTemplateForStatus 
} from '../utils/whatsappUtils';
import { generateApplicationAuditTrailPdf } from '../lib/auditTrailPdfGenerator';
import { generateApplicationDossierPdf } from '../lib/applicationDossierPdfGenerator';
import { ApplicationDossierPdfModal } from './ApplicationDossierPdfModal';
import { CameraQrScannerModal } from './CameraQrScannerModal';
import { ApplicantNationalityMarketMap } from './ApplicantNationalityMarketMap';

interface AgencyCrmDashboardProps {
  applications: VisaApplication[];
  onAddApplication: (app: VisaApplication) => void;
  onUpdateStatus: (id: string, newStatus: VisaApplication['status'], notes?: string) => void;
  onSendEmailUpdate: (app: VisaApplication, customSubject?: string, customBody?: string) => void;
  onUpdateApplicationDocuments?: (id: string, updatedDocs: DocumentAuditHistoryItem[]) => void;
  onAddAuditEvent?: (appId: string, event: Partial<ApplicationAuditEvent>) => void;
  userEmail?: string;
  isSendingEmail?: boolean;
  prefillApplication?: Partial<VisaApplication> | null;
  onClearPrefill?: () => void;
}

export const AgencyCrmDashboard: React.FC<AgencyCrmDashboardProps> = ({
  applications,
  onAddApplication,
  onUpdateStatus,
  onSendEmailUpdate,
  onUpdateApplicationDocuments,
  onAddAuditEvent,
  userEmail,
  isSendingEmail,
  prefillApplication,
  onClearPrefill
}) => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedApp, setSelectedApp] = useState<VisaApplication | null>(null);
  const [selectedDocHistoryApp, setSelectedDocHistoryApp] = useState<VisaApplication | null>(null);
  const [selectedQrApp, setSelectedQrApp] = useState<VisaApplication | null>(null);
  const [whatsAppPayload, setWhatsAppPayload] = useState<WhatsAppAuditPayload | null>(null);
  const [whatsAppTargetApp, setWhatsAppTargetApp] = useState<VisaApplication | null>(null);
  const [whatsAppInitialTemplate, setWhatsAppInitialTemplate] = useState<WhatsAppStatusTemplateId | undefined>(undefined);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [dossierLayoutMode, setDossierLayoutMode] = useState<'cards' | 'table'>('cards');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showPWABuilder, setShowPWABuilder] = useState(false);

  // Check URL query parameters for direct mobile QR scan links (e.g. ?appId=...&action=documents)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const targetAppId = params.get('appId');
        const targetAction = params.get('action');
        if (targetAppId && applications.length > 0) {
          const matched = applications.find(
            (a) => a.id.toLowerCase() === targetAppId.toLowerCase() ||
                   a.passportNumber.toLowerCase() === targetAppId.toLowerCase()
          );
          if (matched) {
            if (targetAction === 'documents') {
              setSelectedDocHistoryApp(matched);
            } else if (targetAction === 'dossier') {
              setSelectedApp(matched);
              setInspectModalTab('overview');
            } else if (targetAction === 'qr') {
              setSelectedQrApp(matched);
            } else {
              setSelectedApp(matched);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not parse initial QR scan query parameters:', e);
    }
  }, [applications]);
  const [showFeeCalculator, setShowFeeCalculator] = useState(false);
  const [calculatorVisaType, setCalculatorVisaType] = useState<string>('30-Day Single Entry Tourist Visa');
  const [calculatorNationality, setCalculatorNationality] = useState<string>('Bangladeshi');
  const [analyticsTab, setAnalyticsTab] = useState<'status-doughnut' | 'nationality-markets' | 'demand-forecast' | 'audit-metrics'>('status-doughnut');
  const [nationalityFilter, setNationalityFilter] = useState<string>('ALL');
  
  // CRM Dashboard View Tab state
  const [crmViewTab, setCrmViewTab] = useState<'dossiers' | 'audit-trail' | 'analytics'>('dossiers');
  const [auditTrailTargetAppId, setAuditTrailTargetAppId] = useState<string | undefined>(undefined);
  const [inspectModalTab, setInspectModalTab] = useState<'overview' | 'audit-trail'>('overview');

  // Total audit trail events across applications
  const totalAuditEventsCount = useMemo(() => {
    return applications.reduce((sum, a) => sum + (a.auditTrail?.length || 0), 0);
  }, [applications]);
  
  // Template Manager state
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [templateTargetApp, setTemplateTargetApp] = useState<VisaApplication | null>(null);

  // New Application Form State
  const [newName, setNewName] = useState('');
  const [newPassport, setNewPassport] = useState('');
  const [newNationality, setNewNationality] = useState('Bangladeshi');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newVisaType, setNewVisaType] = useState('30-Day Single Entry Tourist Visa');
  const [newUrgency, setNewUrgency] = useState<'Standard' | 'Express 24h' | 'Emergency 6h'>('Standard');
  const [newNotes, setNewNotes] = useState('');
  const [attachedAudit, setAttachedAudit] = useState<PassportAuditResult | null>(null);
  const [generatingPdfAppId, setGeneratingPdfAppId] = useState<string | null>(null);
  const [showDossierPdfModal, setShowDossierPdfModal] = useState(false);
  const [dossierPdfApp, setDossierPdfApp] = useState<VisaApplication | null>(null);
  const [showQrScannerModal, setShowQrScannerModal] = useState(false);

  const handleLinkPhysicalDocument = (
    appId: string,
    newDoc: DocumentAuditHistoryItem,
    event: ApplicationAuditEvent
  ) => {
    const target = applications.find(a => a.id === appId);
    if (!target) return;
    const existingDocs = target.documentHistory && target.documentHistory.length > 0
      ? target.documentHistory
      : [];
    const updatedDocs = [newDoc, ...existingDocs];
    if (onUpdateApplicationDocuments) {
      onUpdateApplicationDocuments(appId, updatedDocs);
    }
    if (onAddAuditEvent) {
      onAddAuditEvent(appId, event);
    }
  };

  const handleExportApplicationAuditPdf = async (app: VisaApplication) => {
    try {
      setGeneratingPdfAppId(app.id);
      await generateApplicationDossierPdf({
        application: app,
        agencyName: 'UAE & Dubai Visa AI Hub',
        consultantName: app.assignedAgent || 'Senior Immigration Processing Officer',
        includePassportData: true,
        includeStatusLogs: true,
        includeAuditTrail: true,
        includeDocumentHistory: true,
        includeQrCode: true
      });
    } catch (err) {
      console.error('Failed to generate dossier PDF report:', err);
      alert('Could not generate PDF dossier report. Please try again.');
    } finally {
      setGeneratingPdfAppId(null);
    }
  };

  const handleOpenDossierPdfModal = (app?: VisaApplication) => {
    setDossierPdfApp(app || selectedApp || applications[0] || null);
    setShowDossierPdfModal(true);
  };

  const handleOpenFeeCalculator = (visaType?: string, nationality?: string) => {
    if (visaType) setCalculatorVisaType(visaType);
    if (nationality) setCalculatorNationality(nationality);
    setShowFeeCalculator(true);
  };

  const handleOpenTemplateManager = (app?: VisaApplication) => {
    if (app) {
      setTemplateTargetApp(app);
    } else if (applications.length > 0) {
      setTemplateTargetApp(applications[0]);
    }
    setShowTemplateManager(true);
  };

  const handleOpenWhatsAppForApp = (app: VisaApplication, templateId?: WhatsAppStatusTemplateId) => {
    const payload = getWhatsAppPayloadFromApplication(app);
    setWhatsAppPayload(payload);
    setWhatsAppTargetApp(app);
    setWhatsAppInitialTemplate(templateId || getRecommendedTemplateForStatus(app.status));
    setShowWhatsAppModal(true);
  };

  const handleLogWhatsAppAuditTrail = (event: Partial<ApplicationAuditEvent>) => {
    if (whatsAppTargetApp && onAddAuditEvent) {
      onAddAuditEvent(whatsAppTargetApp.id, event);
    }
  };

  const handleApplyCalculatedFee = (feeDetails: {
    visaType: string;
    nationality: string;
    totalAED: number;
    totalUSD: number;
    totalBDT: number;
    breakdownNote: string;
  }) => {
    setNewVisaType(feeDetails.visaType);
    setNewNationality(feeDetails.nationality);
    setNewNotes(prev => prev ? `${prev}\n${feeDetails.breakdownNote}` : feeDetails.breakdownNote);
    setShowNewModal(true);
  };

  // Listen for prefill application from PassportAuditScanner or other sources
  useEffect(() => {
    if (prefillApplication) {
      if (prefillApplication.applicantName) setNewName(prefillApplication.applicantName);
      if (prefillApplication.passportNumber) setNewPassport(prefillApplication.passportNumber);
      if (prefillApplication.nationality) setNewNationality(prefillApplication.nationality);
      if (prefillApplication.contactEmail) setNewEmail(prefillApplication.contactEmail);
      if (prefillApplication.contactPhone) setNewPhone(prefillApplication.contactPhone);
      if (prefillApplication.visaType) setNewVisaType(prefillApplication.visaType);
      if (prefillApplication.urgency) setNewUrgency(prefillApplication.urgency);
      if (prefillApplication.notes) setNewNotes(prefillApplication.notes);
      if (prefillApplication.passportAudit) {
        setAttachedAudit(prefillApplication.passportAudit);
      }
      setShowNewModal(true);
    }
  }, [prefillApplication]);

  const handleCloseModal = () => {
    setShowNewModal(false);
    setAttachedAudit(null);
    if (onClearPrefill) onClearPrefill();
  };

  const filteredApps = applications.filter((app) => {
    const matchesNationality = nationalityFilter === 'ALL' || 
      (app.nationality && app.nationality.toLowerCase() === nationalityFilter.toLowerCase());

    if (!matchesNationality) return false;

    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return statusFilter === 'ALL' || app.status === statusFilter;
    }
    
    // Normalized passport search (stripping spaces, hyphens)
    const cleanQuery = query.replace(/[\s-]/g, '');
    const cleanPassport = (app.passportNumber || '').toLowerCase().replace(/[\s-]/g, '');

    const matchesSearch =
      app.applicantName.toLowerCase().includes(query) ||
      cleanPassport.includes(cleanQuery) ||
      app.passportNumber.toLowerCase().includes(query) ||
      app.id.toLowerCase().includes(query) ||
      (app.nationality && app.nationality.toLowerCase().includes(query)) ||
      (app.contactEmail && app.contactEmail.toLowerCase().includes(query));

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPassport) return;

    const initialStatus: VisaApplication['status'] = attachedAudit
      ? (attachedAudit.isValid ? 'Audited - Passed' : 'Audited - Flagged')
      : 'Draft';

    const defaultNotes = attachedAudit
      ? `Passport OCR Verified (Score: ${attachedAudit.overallScore}/100). Expiry: ${attachedAudit.extractedData.expiryDate}. 6-Month Rule: ${attachedAudit.validationChecks.hasSixMonthsValidity ? 'Passed' : 'Flagged'}.`
      : 'New agency client intake. Awaiting passport page and photo upload.';

    const initialDocs: DocumentAuditHistoryItem[] = attachedAudit ? [{
      id: `doc-${Date.now()}-passport`,
      version: 'v1.0',
      documentType: 'Passport OCR',
      fileName: `${newName.toLowerCase().replace(/\s+/g, '_')}_passport.png`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Desk Officer 01 (Dubai Hub)',
      status: attachedAudit.isValid ? 'Passed' : 'Flagged',
      score: attachedAudit.overallScore,
      summary: `Initial intake passport OCR. Expiry: ${attachedAudit.extractedData.expiryDate || 'N/A'}. 6-Month Rule: ${attachedAudit.validationChecks.hasSixMonthsValidity ? 'Passed' : 'Flagged'}.`,
      details: {
        validityDaysRemaining: attachedAudit.validationChecks.validityRemainingDays,
        expiryDate: attachedAudit.extractedData.expiryDate,
        mrzStatus: attachedAudit.validationChecks.mrzMatched ? 'Matched' : 'Discrepancy',
        sixMonthRuleMet: attachedAudit.validationChecks.hasSixMonthsValidity,
        fileSize: '1.8 MB'
      },
      notes: attachedAudit.dubaiVisaEligibilityNotes,
      passportAudit: attachedAudit
    }] : [];

    const newApp: VisaApplication = {
      id: `DXB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      applicantName: newName.trim(),
      passportNumber: newPassport.trim().toUpperCase(),
      nationality: newNationality.trim(),
      contactEmail: newEmail.trim() || userEmail || 'client@example.com',
      contactPhone: newPhone.trim() || '+880 1700-000000',
      visaType: newVisaType,
      status: initialStatus,
      urgency: newUrgency,
      assignedAgent: 'Desk Officer 01 (Dubai Hub)',
      passportAudit: attachedAudit || undefined,
      documentHistory: initialDocs,
      notes: newNotes.trim() || defaultNotes,
      feePaid: false
    };

    onAddApplication(newApp);
    handleCloseModal();
    // Reset form
    setNewName('');
    setNewPassport('');
    setNewEmail('');
    setNewPhone('');
    setNewNotes('');
    setAttachedAudit(null);
  };

  return (
    <div className="space-y-6" id="agency-crm-container">
      {/* Top Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`bg-slate-900 border p-4 rounded-xl text-left transition-all cursor-pointer hover:border-slate-700 ${
            statusFilter === 'ALL' ? 'ring-1 ring-amber-500/50 border-amber-500/50' : 'border-slate-800'
          }`}
          title="Show all applications"
        >
          <span className="text-[11px] font-mono uppercase text-slate-400 block">Total Active Files</span>
          <span className="text-2xl font-bold font-mono text-white mt-1 block">
            {applications.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'Audited - Passed' ? 'ALL' : 'Audited - Passed')}
          className={`bg-slate-900 border p-4 rounded-xl text-left transition-all cursor-pointer hover:border-emerald-700 ${
            statusFilter === 'Audited - Passed' || statusFilter === 'Approved' ? 'ring-1 ring-emerald-500/50 border-emerald-500/50' : 'border-slate-800'
          }`}
          title="Filter to audited & approved files"
        >
          <span className="text-[11px] font-mono uppercase text-emerald-400 block">Audited &amp; Cleared</span>
          <span className="text-2xl font-bold font-mono text-emerald-300 mt-1 block">
            {applications.filter(a => a.status === 'Audited - Passed' || a.status === 'Approved').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'Audited - Flagged' ? 'ALL' : 'Audited - Flagged')}
          className={`bg-slate-900 border p-4 rounded-xl text-left transition-all cursor-pointer hover:border-red-700 ${
            statusFilter === 'Audited - Flagged' ? 'ring-1 ring-red-500/50 border-red-500/50' : 'border-slate-800'
          }`}
          title="Filter to flagged files requiring rectification"
        >
          <span className="text-[11px] font-mono uppercase text-red-400 block">Flagged / Rectification</span>
          <span className="text-2xl font-bold font-mono text-red-300 mt-1 block">
            {applications.filter(a => a.status === 'Audited - Flagged').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'Submitted to GDRFA/ICP' ? 'ALL' : 'Submitted to GDRFA/ICP')}
          className={`bg-slate-900 border p-4 rounded-xl text-left transition-all cursor-pointer hover:border-sky-700 ${
            statusFilter === 'Submitted to GDRFA/ICP' || statusFilter === 'In Process' ? 'ring-1 ring-sky-500/50 border-sky-500/50' : 'border-slate-800'
          }`}
          title="Filter to files submitted to GDRFA / ICP"
        >
          <span className="text-[11px] font-mono uppercase text-sky-400 block">Submitted to GDRFA</span>
          <span className="text-2xl font-bold font-mono text-sky-300 mt-1 block">
            {applications.filter(a => a.status === 'Submitted to GDRFA/ICP' || a.status === 'In Process').length}
          </span>
        </button>
      </div>

      {/* CRM Primary Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="crm-tab-dossiers"
            onClick={() => setCrmViewTab('dossiers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              crmViewTab === 'dossiers'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>{language === 'ar' ? 'ملفات الوكالة والطلبات' : 'Application Dossiers'}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-950/60 text-slate-200 border border-slate-700/60 font-bold">
              {applications.length}
            </span>
          </button>

          <button
            id="crm-tab-audit-trail"
            onClick={() => {
              setAuditTrailTargetAppId(undefined);
              setCrmViewTab('audit-trail');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              crmViewTab === 'audit-trail'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{language === 'ar' ? 'سجل التدقيق والتتبع' : 'Audit Trail'}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-950/60 text-amber-300 border border-amber-500/30 font-bold">
              {totalAuditEventsCount || 8}
            </span>
          </button>

          <button
            id="crm-tab-analytics"
            onClick={() => setCrmViewTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              crmViewTab === 'analytics'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{language === 'ar' ? 'التحليلات والتوقعات' : 'Demand & Audit Analytics'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-open-template-manager-header"
            type="button"
            onClick={() => handleOpenTemplateManager()}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
            title="Manage frequently used email messages and templates"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Templates</span>
          </button>

          <button
            id="btn-open-fee-calculator-header"
            type="button"
            onClick={() => handleOpenFeeCalculator()}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>Fee Calculator</span>
          </button>

          <button
            id="btn-open-dossier-pdf-header"
            type="button"
            onClick={() => handleOpenDossierPdfModal()}
            className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            title="Export official application dossier as a professional PDF report containing passport data, status logs & audit history"
          >
            <FileDown className="w-3.5 h-3.5 text-amber-400" />
            <span>Dossier PDF Report</span>
          </button>

          <button
            id="btn-open-camera-qr-scanner-header"
            type="button"
            onClick={() => setShowQrScannerModal(true)}
            className="bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            title="Scan QR code using camera to quickly link physical documents to existing digital files"
          >
            <Scan className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scan & Link Document</span>
          </button>

          <button
            id="btn-open-pwabuilder-crm"
            type="button"
            onClick={() => setShowPWABuilder(true)}
            className="hidden sm:flex bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
            title="PWABuilder 100% Store Readiness & Native Packaging Hub"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>PWABuilder</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">100%</span>
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Intake</span>
          </button>
        </div>
      </div>

      {/* VIEW: AUDIT TRAIL TAB */}
      {crmViewTab === 'audit-trail' && (
        <AgencyAuditTrailView
          applications={applications}
          selectedApplicationId={auditTrailTargetAppId}
          onSelectApplicationId={(id) => setAuditTrailTargetAppId(id)}
          onInspectApplication={(app) => {
            setSelectedApp(app);
            setInspectModalTab('overview');
          }}
          onSendEmailAlert={(app) => onSendEmailUpdate(app)}
          onOpenDocHistory={(app) => setSelectedDocHistoryApp(app)}
          onAddAuditEvent={onAddAuditEvent}
        />
      )}

      {/* VIEW: ANALYTICS TAB */}
      {crmViewTab === 'analytics' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
            <button
              id="crm-status-doughnut-tab-btn"
              onClick={() => setAnalyticsTab('status-doughnut')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                analyticsTab === 'status-doughnut'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 bg-slate-900/60'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>🍩 Applications by Status (Recharts Doughnut)</span>
            </button>

            <button
              id="crm-nationality-markets-tab-btn"
              onClick={() => setAnalyticsTab('nationality-markets')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                analyticsTab === 'nationality-markets'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 bg-slate-900/60'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>🗺️ {language === 'ar' ? 'الأسواق الجغرافية (D3.js)' : language === 'bn' ? 'ভৌগোলিক বাজার ও জাতীয়তা বিশ্লেষণ (D3.js)' : 'Geographic Markets by Nationality (D3.js)'}</span>
            </button>

            <button
              id="crm-demand-forecast-tab-btn"
              onClick={() => setAnalyticsTab('demand-forecast')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                analyticsTab === 'demand-forecast'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 bg-slate-900/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>📈 3-Month Peak Visa Demand Forecast (Recharts)</span>
            </button>

            <button
              id="crm-passport-audit-stats-tab-btn"
              onClick={() => setAnalyticsTab('audit-metrics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                analyticsTab === 'audit-metrics'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 bg-slate-900/60'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? '📊 إحصائيات تدقيق جوازات السفر (Recharts)' : '📊 Passport Audit Statistics (Recharts)'}</span>
            </button>
            <span id="crm-audit-metrics-tab-btn" className="hidden" onClick={() => setAnalyticsTab('audit-metrics')} />
          </div>

          {analyticsTab === 'status-doughnut' ? (
            <ApplicationsStatusDoughnutSection
              applications={applications}
              selectedStatus={statusFilter}
              onSelectStatus={(status) => {
                setStatusFilter(status);
                setCrmViewTab('dossiers');
              }}
              onClearStatusFilter={() => setStatusFilter('ALL')}
            />
          ) : analyticsTab === 'nationality-markets' ? (
            <ApplicantNationalityMarketMap
              applications={applications}
              selectedNationality={nationalityFilter !== 'ALL' ? nationalityFilter : null}
              onSelectNationality={(nat) => {
                setNationalityFilter(nat);
                if (nat !== 'ALL') {
                  setCrmViewTab('dossiers');
                }
              }}
            />
          ) : analyticsTab === 'demand-forecast' ? (
            <VisaDemandForecastWidget applications={applications} />
          ) : (
            <PassportAuditStatisticsDashboard
              applications={applications}
              onSelectApplication={(app) => setSelectedApp(app)}
            />
          )}
        </div>
      )}

      {/* VIEW: DOSSIERS TAB */}
      {crmViewTab === 'dossiers' && (
        <div className="space-y-4">
          {/* Applications by Status (Recharts Doughnut Chart Data Visualization Section) */}
          <ApplicationsStatusDoughnutSection
            applications={applications}
            selectedStatus={statusFilter}
            onSelectStatus={(status) => setStatusFilter(status)}
            onClearStatusFilter={() => setStatusFilter('ALL')}
          />

          {/* Control Bar: Search, Filters, New Intake */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1" id="agency-crm-search-bar">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              id="agency-crm-search-input"
              type="text"
              placeholder="Search by applicant name, passport number, file ID or nationality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-20 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-full p-1 transition-colors cursor-pointer"
                title="Clear search query"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <span className="absolute right-3 top-2.5 text-[10px] text-slate-600 font-mono hidden sm:inline-block pointer-events-none">
                Filter
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">All Statuses</option>
                <option value="Audited - Passed" className="bg-slate-900">Audited - Passed</option>
                <option value="Audited - Flagged" className="bg-slate-900">Audited - Flagged</option>
                <option value="Submitted to GDRFA/ICP" className="bg-slate-900">Submitted to GDRFA/ICP</option>
                <option value="Approved" className="bg-slate-900">Approved</option>
                <option value="Draft" className="bg-slate-900">Draft</option>
              </select>
            </div>

            {(searchTerm || statusFilter !== 'ALL' || nationalityFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setNationalityFilter('ALL');
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer whitespace-nowrap px-1"
              >
                Reset Filters
              </button>
            )}

            <button
              type="button"
              id="btn-open-d3-market-map"
              onClick={() => {
                setCrmViewTab('analytics');
                setAnalyticsTab('nationality-markets');
              }}
              className="bg-slate-950 hover:bg-slate-800 text-sky-300 border border-slate-800 hover:border-sky-500/50 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              title="Open D3.js Applicant Nationality Market Map"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">D3 Markets</span>
            </button>

            <button
              type="button"
              id="btn-search-qr-scanner"
              onClick={() => setShowQrScannerModal(true)}
              className="bg-slate-950 hover:bg-slate-800 text-emerald-300 border border-slate-800 hover:border-emerald-500/50 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              title="Scan physical document QR code using camera to locate file or link"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Scan QR</span>
            </button>

            {/* Layout View Mode Toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                id="btn-view-mode-cards"
                onClick={() => setDossierLayoutMode('cards')}
                className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  dossierLayoutMode === 'cards'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Display applications as visual cards with 'Share via WhatsApp' button"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                id="btn-view-mode-table"
                onClick={() => setDossierLayoutMode('table')}
                className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  dossierLayoutMode === 'table'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Display applications as compact table"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-open-template-manager"
            type="button"
            onClick={() => handleOpenTemplateManager()}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
            title="Manage frequently used email messages, GDRFA/ICP cover letters, and document request templates"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Template Manager</span>
          </button>

          <button
            id="btn-open-fee-calculator"
            type="button"
            onClick={() => handleOpenFeeCalculator()}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>Fee Calculator</span>
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Agency File</span>
          </button>
        </div>
      </div>

      {/* Search results summary when filtering */}
      {(searchTerm || statusFilter !== 'ALL' || nationalityFilter !== 'ALL') && (
        <div className="flex items-center justify-between text-xs px-1 text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Showing <span className="text-amber-400 font-mono font-bold">{filteredApps.length}</span> of {applications.length} dossiers
            </span>
            {searchTerm && (
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-700">
                "{searchTerm}"
              </span>
            )}
            {nationalityFilter !== 'ALL' && (
              <span className="bg-sky-950 text-sky-300 px-2 py-0.5 rounded text-[11px] font-mono border border-sky-800 flex items-center gap-1.5">
                <span>Origin: {nationalityFilter}</span>
                <button
                  type="button"
                  onClick={() => setNationalityFilter('ALL')}
                  className="hover:text-white cursor-pointer font-bold leading-none"
                  title="Remove nationality filter"
                >
                  ×
                </button>
              </span>
            )}
          </div>
          {filteredApps.length === 0 && (
            <span className="text-amber-400 text-[11px]">No matching applicants found</span>
          )}
        </div>
      )}

      {/* Empty State when no applications match search/filter */}
      {filteredApps.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">No matching applications found</h4>
            <p className="text-xs text-slate-400">
              No client records match the applicant name or passport number <span className="text-amber-400 font-mono">"{searchTerm}"</span>. Try adjusting your query or resetting filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
              className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 px-3.5 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer font-medium"
            >
              <X className="w-3 h-3" />
              <span>Clear Search &amp; Show All</span>
            </button>
          </div>
        </div>
      ) : dossierLayoutMode === 'cards' ? (
        /* APPLICATION CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 space-y-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
            >
              {/* Card Header: Avatar, Name, File ID, Urgency */}
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {app.avatarUrl ? (
                      <img
                        src={app.avatarUrl}
                        alt={app.applicantName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/40 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-sm shrink-0 border border-slate-700">
                        {app.applicantName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-white text-sm truncate" title={app.applicantName}>
                          {app.applicantName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{app.nationality}</span>
                        <span>•</span>
                        <span className="font-mono text-amber-400 font-bold">{app.id}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded font-sans font-medium shrink-0 ${
                    app.urgency === 'Emergency 6h' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    app.urgency === 'Express 24h' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {app.urgency}
                  </span>
                </div>

                {/* Workflow Status & Compliance Benchmark Pill */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-medium text-[11px] ${
                    app.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    app.status === 'Audited - Passed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    app.status === 'Audited - Flagged' ? 'bg-red-950 text-red-400 border border-red-800' :
                    app.status === 'Submitted to GDRFA/ICP' ? 'bg-sky-950 text-sky-400 border border-sky-800' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {app.status === 'Approved' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {app.status === 'Audited - Passed' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {app.status === 'Audited - Flagged' && <AlertTriangle className="w-3 h-3 text-red-400" />}
                    {app.status === 'Submitted to GDRFA/ICP' && <Clock className="w-3 h-3 text-sky-400" />}
                    <span>{app.status}</span>
                  </span>

                  {app.passportAudit ? (
                    <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-semibold">
                      OCR {app.passportAudit.overallScore}/100
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">
                      Unscanned
                    </span>
                  )}
                </div>

                {/* Core Dossier Metadata */}
                <div className="bg-slate-950/70 rounded-lg p-2.5 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Passport:</span>
                    <span className="font-mono text-white font-bold">{app.passportNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Visa Category:</span>
                    <span className="text-slate-200 text-right truncate max-w-[180px]" title={app.visaType}>
                      {app.visaType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">WhatsApp / Mobile:</span>
                    <span className="font-mono text-emerald-400 text-[11px]">
                      {app.contactPhone || 'No phone registered'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/50">
                    <span>Officer: <strong className="text-slate-300">{app.assignedAgent || 'Unassigned'}</strong></span>
                    <span>{formatDate(app.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* CARD ACTION BUTTONS */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                {/* 1. PRIMARY HIGHLIGHT: Share via WhatsApp button */}
                <button
                  id={`btn-share-whatsapp-card-${app.id}`}
                  type="button"
                  onClick={() => handleOpenWhatsAppForApp(app)}
                  className="w-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 hover:border-emerald-500/50 text-emerald-300 hover:text-emerald-200 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group active:scale-[0.98]"
                  title={`Send automated WhatsApp status update template directly to ${app.applicantName} (${app.contactPhone || 'Enter phone'})`}
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-500/20 group-hover:scale-110 transition-transform shrink-0" />
                  <span>Share via WhatsApp</span>
                </button>

                {/* 2. SECONDARY ACTIONS ROW */}
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setInspectModalTab('overview');
                    }}
                    title="Inspect application dossier"
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-1.5 rounded-md transition-colors cursor-pointer text-center font-medium"
                  >
                    Inspect
                  </button>

                  <button
                    onClick={() => setSelectedDocHistoryApp(app)}
                    title={`View document versions & audit history for ${app.applicantName}`}
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 py-1.5 px-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1 font-medium"
                  >
                    <History className="w-3 h-3 text-amber-400" />
                    <span>Docs ({app.documentHistory?.length || (app.passportAudit ? 1 : 0)})</span>
                  </button>

                  <button
                    onClick={() => handleExportApplicationAuditPdf(app)}
                    disabled={generatingPdfAppId === app.id}
                    title="Export professional PDF dossier report"
                    className="text-[11px] bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 py-1.5 px-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1 font-semibold disabled:opacity-50"
                  >
                    {generatingPdfAppId === app.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                    ) : (
                      <FileDown className="w-3 h-3 text-amber-400" />
                    )}
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => setSelectedQrApp(app)}
                    title="Generate QR code"
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1 font-medium"
                  >
                    <QrCode className="w-3 h-3 text-amber-400" />
                    <span>QR</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* COMPACT TABLE VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">File ID / Urgency</th>
                  <th className="px-4 py-3">Applicant Name</th>
                  <th className="px-4 py-3">Passport No.</th>
                  <th className="px-4 py-3">Visa Category</th>
                  <th className="px-4 py-3">Audit &amp; Immigration Status</th>
                  <th className="px-4 py-3">Last Activity</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono">
                      <span className="font-bold text-amber-400 block">{app.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans ${
                        app.urgency === 'Emergency 6h' ? 'bg-red-500/20 text-red-300' :
                        app.urgency === 'Express 24h' ? 'bg-amber-500/20 text-amber-300' :
                        'text-slate-500'
                      }`}>
                        {app.urgency}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {app.avatarUrl ? (
                          <img 
                            src={app.avatarUrl} 
                            alt={app.applicantName} 
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-500/40 shrink-0" 
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-700">
                            {app.applicantName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>{app.applicantName}</span>
                            {app.passportAudit && (
                              <span className="text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1 rounded font-mono" title={`OCR Score: ${app.passportAudit.overallScore}/100`}>
                                OCR {app.passportAudit.overallScore}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{app.nationality}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono font-medium">
                      {app.passportNumber}
                    </td>

                    <td className="px-4 py-3 text-slate-300 max-w-xs truncate" title={app.visaType}>
                      {app.visaType}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium text-[11px] ${
                        app.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        app.status === 'Audited - Passed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        app.status === 'Audited - Flagged' ? 'bg-red-950 text-red-400 border border-red-800' :
                        app.status === 'Submitted to GDRFA/ICP' ? 'bg-sky-950 text-sky-400 border border-sky-800' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {app.status === 'Audited - Passed' && <CheckCircle2 className="w-3 h-3" />}
                        {app.status === 'Audited - Flagged' && <AlertTriangle className="w-3 h-3" />}
                        {app.status === 'Submitted to GDRFA/ICP' && <Clock className="w-3 h-3" />}
                        {app.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {formatDate(app.updatedAt)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDocHistoryApp(app)}
                          title={`View document versions & audit history for ${app.applicantName}`}
                          className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/80 px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
                        >
                          <History className="w-3.5 h-3.5 text-amber-400" />
                          <span>{language === 'ar' ? 'سجل الوثائق' : 'Doc History'}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                            {app.documentHistory && app.documentHistory.length > 0
                              ? app.documentHistory.length
                              : (app.passportAudit ? 1 : 0)}
                          </span>
                        </button>

                        <button
                          onClick={() => handleOpenTemplateManager(app)}
                          title="Draft or copy message/cover letter from Template Manager"
                          className="text-xs bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700/80 px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-sky-400" />
                          <span>Draft</span>
                        </button>

                        <button
                          onClick={() => handleOpenFeeCalculator(app.visaType, app.nationality)}
                          title="Calculate fee estimate for this application"
                          className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/80 px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Coins className="w-3 h-3 text-amber-400" />
                          <span>Fees</span>
                        </button>

                        <button
                          id={`btn-open-audit-trail-${app.id}`}
                          onClick={() => {
                            setAuditTrailTargetAppId(app.id);
                            setCrmViewTab('audit-trail');
                          }}
                          title={`View chronological audit trail for ${app.applicantName}`}
                          className="text-xs bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700/80 px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 font-medium"
                        >
                          <History className="w-3.5 h-3.5 text-sky-400" />
                          <span>Audit</span>
                          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
                            {app.auditTrail?.length || 0}
                          </span>
                        </button>

                        <button
                          id={`btn-open-qr-${app.id}`}
                          onClick={() => setSelectedQrApp(app)}
                          title={`Generate scannable QR Code linking to digital documents / status for ${app.applicantName}`}
                          className="text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                        >
                          <QrCode className="w-3.5 h-3.5 text-amber-400" />
                          <span>QR</span>
                        </button>

                        <button
                          id={`btn-export-pdf-audit-${app.id}`}
                          onClick={() => handleExportApplicationAuditPdf(app)}
                          disabled={generatingPdfAppId === app.id}
                          title={`Export professional PDF dossier report for ${app.applicantName} containing passport data, status logs & audit history`}
                          className="text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 font-semibold disabled:opacity-50"
                        >
                          {generatingPdfAppId === app.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                          ) : (
                            <FileDown className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span>Dossier PDF</span>
                        </button>

                        {/* Share via WhatsApp Table Button */}
                        <button
                          id={`btn-whatsapp-dispatch-${app.id}`}
                          onClick={() => handleOpenWhatsAppForApp(app)}
                          title={`Send automated WhatsApp status update template directly to ${app.applicantName} (${app.contactPhone || 'Enter phone'})`}
                          className="text-xs bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-800/80 px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 font-semibold shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Share via WhatsApp</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setInspectModalTab('overview');
                          }}
                          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>

                        <button
                          onClick={() => onSendEmailUpdate(app)}
                          disabled={isSendingEmail}
                          title={`Notify ${app.contactEmail} via Gmail`}
                          className="text-xs bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Mail className="w-3 h-3" />
                          Send Alert
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    )}

      {/* Modal / Flyout for Application Details */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                {selectedApp.avatarUrl ? (
                  <img 
                    src={selectedApp.avatarUrl} 
                    alt={selectedApp.applicantName} 
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/50 shrink-0" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-base shrink-0 border border-slate-700">
                    {selectedApp.applicantName.charAt(0)}
                  </div>
                )}
                <div>
                  <span className="text-xs font-mono text-amber-400">File Reference: {selectedApp.id}</span>
                  <h3 className="text-lg font-bold text-white">{selectedApp.applicantName}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Internal Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                type="button"
                id="modal-tab-overview"
                onClick={() => setInspectModalTab('overview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  inspectModalTab === 'overview'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Dossier Overview</span>
              </button>

              <button
                type="button"
                id="modal-tab-audit-trail"
                onClick={() => setInspectModalTab('audit-trail')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  inspectModalTab === 'audit-trail'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Audit Trail History</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900 text-amber-300 font-bold border border-slate-700">
                  {selectedApp.auditTrail?.length || 0}
                </span>
              </button>
            </div>

            {/* Tab 1: Dossier Overview Content */}
            {inspectModalTab === 'overview' && (
              <div className="space-y-4">

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Passport Number</span>
                <span className="font-mono text-white font-bold">{selectedApp.passportNumber}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Contact Email</span>
                <span className="text-sky-400 font-mono">{selectedApp.contactEmail}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Visa Type Requested</span>
                <span className="text-slate-200">{selectedApp.visaType}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Assigned Officer</span>
                <span className="text-slate-200">{selectedApp.assignedAgent}</span>
              </div>
            </div>

            {/* Change Status Options */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Update Application Workflow Status:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {(['Audited - Passed', 'Audited - Flagged', 'Submitted to GDRFA/ICP', 'Approved'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      onUpdateStatus(selectedApp.id, st);
                      setSelectedApp({ ...selectedApp, status: st });
                    }}
                    className={`p-2 rounded-lg border font-medium text-left transition-colors ${
                      selectedApp.status === st 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Attached Passport Audit Dossier (If Available) */}
            {selectedApp.passportAudit && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 font-mono">
                    <Scan className="w-3.5 h-3.5" />
                    Attached Passport OCR &amp; Biometric Audit Dossier
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    selectedApp.passportAudit.isValid 
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' 
                      : 'bg-red-950/80 text-red-300 border-red-800'
                  }`}>
                    Audit Score: {selectedApp.passportAudit.overallScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">6-Month Rule</span>
                    <span className={`font-semibold flex items-center gap-1 mt-0.5 ${
                      selectedApp.passportAudit.validationChecks.hasSixMonthsValidity ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {selectedApp.passportAudit.validationChecks.hasSixMonthsValidity ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Valid ({selectedApp.passportAudit.validationChecks.validityRemainingDays || '180+'} Days)
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                          Invalid / Expired
                        </>
                      )}
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">MRZ Verification</span>
                    <span className={`font-semibold flex items-center gap-1 mt-0.5 ${
                      selectedApp.passportAudit.validationChecks.mrzMatched ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {selectedApp.passportAudit.validationChecks.mrzMatched ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          MRZ Matched
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          Discrepancy
                        </>
                      )}
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Passport Expiry</span>
                    <span className="font-mono text-slate-200 block mt-0.5">
                      {selectedApp.passportAudit.extractedData.expiryDate || 'N/A'}
                    </span>
                  </div>
                </div>

                {selectedApp.passportAudit.dubaiVisaEligibilityNotes && (
                  <div className="text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-slate-400">
                    <strong className="text-slate-300 block mb-0.5">Immigration Clearance Notes:</strong>
                    <span>{selectedApp.passportAudit.dubaiVisaEligibilityNotes}</span>
                  </div>
                )}
              </div>
            )}

            {/* Document Versions & Audit Trail Mini-Panel */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {language === 'ar' ? 'سجل وتاريخ المستندات الممسوحة والمفحوصة' : 'Document Version History & Audit Trail'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {selectedApp.documentHistory && selectedApp.documentHistory.length > 0
                      ? `${selectedApp.documentHistory.length} ${language === 'ar' ? 'نسخ ووثائق مؤرشفة لهذا الطلب' : 'audited document versions on file'}`
                      : (selectedApp.passportAudit 
                        ? (language === 'ar' ? 'نسخة جواز السفر الأساسية مسجلة' : '1 primary passport record on file')
                        : (language === 'ar' ? 'لا توجد مستندات مسجلة بعد' : 'No documents attached yet'))}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDocHistoryApp(selectedApp)}
                className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer font-semibold transition-colors shrink-0"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'استعراض السجل والمقارنة' : 'Open Document History'}</span>
              </button>
            </div>

            {/* Remarks / Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Audit &amp; Processing Remarks:</label>
              <p className="text-xs bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-400">
                {selectedApp.notes || 'No notes added.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenFeeCalculator(selectedApp.visaType, selectedApp.nationality);
                  }}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5 text-amber-400" />
                  <span>Calculate Total Fees</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleOpenTemplateManager(selectedApp);
                  }}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Templates &amp; Drafts</span>
                </button>

                <button
                  type="button"
                  id="btn-modal-open-qr"
                  onClick={() => {
                    setSelectedQrApp(selectedApp);
                  }}
                  className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors font-semibold"
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mobile QR Code</span>
                </button>

                <button
                  type="button"
                  id="btn-modal-open-whatsapp"
                  onClick={() => handleOpenWhatsAppForApp(selectedApp)}
                  className="text-xs bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors font-semibold shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Share via WhatsApp</span>
                </button>

                <button
                  type="button"
                  id="btn-modal-export-pdf-audit"
                  onClick={() => handleExportApplicationAuditPdf(selectedApp)}
                  disabled={generatingPdfAppId === selectedApp.id}
                  className="text-xs bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all font-bold shadow-md shadow-amber-500/20 disabled:opacity-50"
                  title="Export official branded PDF dossier report containing passport data, status logs & audit history"
                >
                  {generatingPdfAppId === selectedApp.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5 text-slate-950" />
                  )}
                  <span>Export Dossier PDF</span>
                </button>

                <button
                  type="button"
                  id="btn-modal-customize-pdf-dossier"
                  onClick={() => handleOpenDossierPdfModal(selectedApp)}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-2 rounded-lg flex items-center gap-1 cursor-pointer transition-colors font-semibold"
                  title="Configure and preview PDF dossier report options"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Options</span>
                </button>
              </div>

              <button
                onClick={() => {
                  onSendEmailUpdate(selectedApp);
                  setSelectedApp(null);
                }}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                Dispatch Email Notice to Client
              </button>
            </div>
          </div>
          )}

          {/* Tab 2: Audit Trail Tab Content */}
          {inspectModalTab === 'audit-trail' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-300">
                  Chronological audit log for <strong className="text-amber-400 font-mono">{selectedApp.applicantName}</strong> ({selectedApp.id})
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuditTrailTargetAppId(selectedApp.id);
                    setCrmViewTab('audit-trail');
                    setSelectedApp(null);
                  }}
                  className="text-xs text-sky-400 hover:text-sky-300 underline cursor-pointer flex items-center gap-1"
                >
                  <span>Open in Full CRM Audit Trail View</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {(!selectedApp.auditTrail || selectedApp.auditTrail.length === 0) ? (
                  <div className="text-center p-6 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400">
                    No logged audit events found for this application yet.
                  </div>
                ) : (
                  selectedApp.auditTrail
                    .slice()
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((evt, idx) => (
                      <div
                        key={evt.id || idx}
                        className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <span className="font-semibold text-white flex items-center gap-1.5">
                            {evt.type === 'status_change' && <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />}
                            {evt.type === 'email_alert' && <Mail className="w-3.5 h-3.5 text-sky-400" />}
                            {evt.type === 'document_update' && <FileCheck className="w-3.5 h-3.5 text-purple-400" />}
                            {evt.type === 'application_created' && <Plus className="w-3.5 h-3.5 text-emerald-400" />}
                            {evt.type === 'note_added' && <FileText className="w-3.5 h-3.5 text-slate-400" />}
                            <span>{evt.title}</span>
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {formatDate(evt.timestamp)}
                          </span>
                        </div>

                        {/* Event specifics */}
                        {evt.type === 'status_change' && (
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="text-slate-500">Transition:</span>
                            <span className="text-slate-300 font-mono">{evt.details.previousStatus}</span>
                            <span className="text-amber-400 font-bold">➔</span>
                            <span className="text-amber-300 font-mono font-bold">{evt.details.newStatus}</span>
                            {evt.details.reason && (
                              <span className="text-slate-400 ml-2">({evt.details.reason})</span>
                            )}
                          </div>
                        )}

                        {evt.type === 'email_alert' && (
                          <div className="space-y-1 text-[11px]">
                            <div className="text-sky-300 font-mono">
                              Sent to: {evt.details.recipientEmail} | {evt.details.deliveryStatus || 'Delivered'}
                            </div>
                            {evt.details.subject && (
                              <div className="text-slate-300 font-medium">Subject: {evt.details.subject}</div>
                            )}
                            {evt.details.emailBodyPreview && (
                              <div className="text-slate-400 italic bg-slate-900/60 p-2 rounded border border-slate-800">
                                "{evt.details.emailBodyPreview}"
                              </div>
                            )}
                          </div>
                        )}

                        {evt.type === 'document_update' && (
                          <div className="space-y-1 text-[11px]">
                            <div className="text-purple-300 font-semibold font-mono">
                              {evt.details.documentType} {evt.details.version && `(${evt.details.version})`}
                              {evt.details.score !== undefined && ` - Score: ${evt.details.score}/100`}
                            </div>
                            {evt.details.fileName && (
                              <div className="text-slate-400 font-mono">File: {evt.details.fileName}</div>
                            )}
                            {evt.details.notes && (
                              <div className="text-slate-300">{evt.details.notes}</div>
                            )}
                          </div>
                        )}

                        {(evt.type === 'note_added' || evt.type === 'application_created') && evt.details.notes && (
                          <div className="text-[11px] text-slate-300">{evt.details.notes}</div>
                        )}

                        <div className="text-[10px] text-slate-500">
                          Actor: <span className="text-slate-400">{evt.actor}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Total recorded events: <strong className="text-slate-200">{selectedApp.auditTrail?.length || 0}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportApplicationAuditPdf(selectedApp)}
                    disabled={generatingPdfAppId === selectedApp.id}
                    className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    title="Export printable PDF dossier report containing passport data, status logs & audit history"
                  >
                    {generatingPdfAppId === selectedApp.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileDown className="w-3.5 h-3.5" />
                    )}
                    <span>Print / Export Dossier PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuditTrailTargetAppId(selectedApp.id);
                      setCrmViewTab('audit-trail');
                      setSelectedApp(null);
                    }}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-slate-700"
                  >
                    Open in Audit Trail Tab
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

      {/* Modal: Create New Intake */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateNew} className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Create New Agency Visa Dossier</span>
                  {attachedAudit && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono">
                      Passport Linked
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  Register client for typing center submission and GDRFA/ICP filing.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Pre-fill AI Audit Info Callout Banner */}
            {attachedAudit && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1.5 text-xs text-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Auto-Populated from Passport AI Audit</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full ${
                    attachedAudit.isValid ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'
                  }`}>
                    Score: {attachedAudit.overallScore}/100
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Extracted Name: <strong className="text-white">{attachedAudit.extractedData.fullName}</strong> | Doc: <strong className="text-amber-300 font-mono">{attachedAudit.extractedData.passportNumber}</strong> ({attachedAudit.extractedData.nationality})
                </p>
                <div className="text-[10px] text-slate-400 flex items-center gap-3">
                  <span>6-Month Expiry Rule: <strong className={attachedAudit.validationChecks.hasSixMonthsValidity ? 'text-emerald-400' : 'text-red-400'}>{attachedAudit.validationChecks.hasSixMonthsValidity ? 'Passed' : 'Flagged'}</strong></span>
                  <span>MRZ Match: <strong className={attachedAudit.validationChecks.mrzMatched ? 'text-emerald-400' : 'text-amber-400'}>{attachedAudit.validationChecks.mrzMatched ? 'Verified' : 'Review'}</strong></span>
                </div>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Applicant Full Name (As in Passport) *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. MOHAMMED RAHIM"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Passport Number *</label>
                  <input
                    type="text"
                    required
                    value={newPassport}
                    onChange={(e) => setNewPassport(e.target.value)}
                    placeholder="e.g. A01928374"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Nationality</label>
                  <input
                    type="text"
                    value={newNationality}
                    onChange={(e) => setNewNationality(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Client Email (For Updates)</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Contact Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+880 1700-000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400">Visa Category</label>
                    <button
                      type="button"
                      onClick={() => handleOpenFeeCalculator(newVisaType, newNationality)}
                      className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer underline"
                    >
                      <Calculator className="w-2.5 h-2.5" />
                      <span>Estimate Cost</span>
                    </button>
                  </div>
                  <select
                    value={newVisaType}
                    onChange={(e) => setNewVisaType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option>30-Day Single Entry Tourist Visa</option>
                    <option>60-Day Multiple Entry Tourist Visa</option>
                    <option>5-Year Green Visa (Freelancer &amp; Self-Employed)</option>
                    <option>10-Year Golden Visa (Investors, Tech Innovators &amp; Executives)</option>
                    <option>96-Hour Transit Visa (Emirates Stopover)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Urgency Level</label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option value="Standard">Standard (2 - 3 Days)</option>
                    <option value="Express 24h">Express (24 Hours)</option>
                    <option value="Emergency 6h">Emergency (6 Hours)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Dossier Notes &amp; Intake Remarks</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Additional client details, flight dates, fee breakdown or typing center notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer shadow-md shadow-amber-500/20"
              >
                Register File
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Visa Fee Calculator Modal */}
      <VisaFeeCalculatorModal
        isOpen={showFeeCalculator}
        onClose={() => setShowFeeCalculator(false)}
        initialVisaType={calculatorVisaType}
        initialNationality={calculatorNationality}
        onApplyToNewDossier={handleApplyCalculatedFee}
      />

      {/* Agency Communication & Template Manager Modal */}
      <TemplateManagerModal
        isOpen={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
        applications={applications}
        selectedApplicant={templateTargetApp}
        onSelectApplicant={(app) => setTemplateTargetApp(app)}
        onDispatchEmail={(app, subject, body) => {
          onSendEmailUpdate(app, subject, body);
        }}
      />

      {/* Document History & Audit Trail Modal */}
      {selectedDocHistoryApp && (
        <DocumentHistoryModal
          application={selectedDocHistoryApp}
          isOpen={!!selectedDocHistoryApp}
          onClose={() => setSelectedDocHistoryApp(null)}
          onOpenQrScanner={() => setShowQrScannerModal(true)}
          onUpdateApplicationDocuments={(id, docs) => {
            if (onUpdateApplicationDocuments) {
              onUpdateApplicationDocuments(id, docs);
            }
            if (selectedApp && selectedApp.id === id) {
              setSelectedApp({
                ...selectedApp,
                documentHistory: docs
              });
            }
            if (selectedDocHistoryApp && selectedDocHistoryApp.id === id) {
              setSelectedDocHistoryApp({
                ...selectedDocHistoryApp,
                documentHistory: docs
              });
            }
          }}
        />
      )}

      {/* Application Mobile QR Code Generator Modal */}
      {selectedQrApp && (
        <ApplicationQrCodeModal
          application={selectedQrApp}
          isOpen={!!selectedQrApp}
          onClose={() => setSelectedQrApp(null)}
          onOpenDocumentFolder={(app) => {
            setSelectedDocHistoryApp(app);
          }}
          onOpenDossier={(app) => {
            setSelectedApp(app);
            setInspectModalTab('overview');
          }}
        />
      )}

      {/* PWABuilder Store Package & Audit Modal */}
      {showPWABuilder && (
        <PWABuilderModal
          isOpen={showPWABuilder}
          onClose={() => setShowPWABuilder(false)}
        />
      )}

      {/* WhatsApp Client Visa Status Update & Audit Report Share Modal */}
      <WhatsAppShareModal
        isOpen={showWhatsAppModal}
        onClose={() => {
          setShowWhatsAppModal(false);
          setWhatsAppPayload(null);
          setWhatsAppTargetApp(null);
        }}
        payload={whatsAppPayload}
        initialTemplateId={whatsAppInitialTemplate}
        onLogAuditTrail={handleLogWhatsAppAuditTrail}
      />

      {/* Official Application Dossier PDF Report Export Modal */}
      {showDossierPdfModal && (
        <ApplicationDossierPdfModal
          isOpen={showDossierPdfModal}
          onClose={() => {
            setShowDossierPdfModal(false);
            setDossierPdfApp(null);
          }}
          applications={applications}
          initialApplication={dossierPdfApp}
        />
      )}

      {/* Live Camera QR Code Scanner & Physical Document Linker Modal */}
      {showQrScannerModal && (
        <CameraQrScannerModal
          isOpen={showQrScannerModal}
          onClose={() => setShowQrScannerModal(false)}
          applications={applications}
          onLinkDocumentToApplication={handleLinkPhysicalDocument}
          onSelectApplicationDossier={(app) => {
            setSelectedApp(app);
            setInspectModalTab('overview');
          }}
          onOpenDocumentHistory={(app) => {
            setSelectedDocHistoryApp(app);
          }}
          onExportDossierPdf={(app) => {
            handleOpenDossierPdfModal(app);
          }}
          onAddNewApplicationWithPrefill={(prefill) => {
            if (prefill.passportNumber) setNewPassport(prefill.passportNumber);
            if (prefill.notes) setNewNotes(prefill.notes);
            setShowNewModal(true);
          }}
        />
      )}
    </div>
  );
};
