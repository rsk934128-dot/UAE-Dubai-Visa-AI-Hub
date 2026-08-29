import React, { useState, useEffect } from 'react';
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
  TrendingUp
} from 'lucide-react';
import { VisaApplication, PassportAuditResult } from '../types';
import { formatDate } from '../lib/utils';
import { PassportAuditAnalyticsWidget } from './PassportAuditAnalyticsWidget';
import { VisaDemandForecastWidget } from './VisaDemandForecastWidget';
import { VisaFeeCalculatorModal } from './VisaFeeCalculatorModal';
import { TemplateManagerModal } from './TemplateManagerModal';

interface AgencyCrmDashboardProps {
  applications: VisaApplication[];
  onAddApplication: (app: VisaApplication) => void;
  onUpdateStatus: (id: string, newStatus: VisaApplication['status'], notes?: string) => void;
  onSendEmailUpdate: (app: VisaApplication, customSubject?: string, customBody?: string) => void;
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
  userEmail,
  isSendingEmail,
  prefillApplication,
  onClearPrefill
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedApp, setSelectedApp] = useState<VisaApplication | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showFeeCalculator, setShowFeeCalculator] = useState(false);
  const [calculatorVisaType, setCalculatorVisaType] = useState<string>('30-Day Single Entry Tourist Visa');
  const [calculatorNationality, setCalculatorNationality] = useState<string>('Bangladeshi');
  const [analyticsTab, setAnalyticsTab] = useState<'demand-forecast' | 'audit-metrics'>('demand-forecast');
  
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
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-mono uppercase text-slate-400 block">Total Active Files</span>
          <span className="text-2xl font-bold font-mono text-white mt-1 block">
            {applications.length}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-mono uppercase text-emerald-400 block">Audited &amp; Cleared</span>
          <span className="text-2xl font-bold font-mono text-emerald-300 mt-1 block">
            {applications.filter(a => a.status === 'Audited - Passed' || a.status === 'Approved').length}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-mono uppercase text-red-400 block">Flagged / Rectification</span>
          <span className="text-2xl font-bold font-mono text-red-300 mt-1 block">
            {applications.filter(a => a.status === 'Audited - Flagged').length}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-mono uppercase text-sky-400 block">Submitted to GDRFA</span>
          <span className="text-2xl font-bold font-mono text-sky-300 mt-1 block">
            {applications.filter(a => a.status === 'Submitted to GDRFA/ICP' || a.status === 'In Process').length}
          </span>
        </div>
      </div>

      {/* Analytics & Forecast Switcher Tab */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
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
          📈 3-Month Peak Visa Demand Forecast (Recharts)
        </button>

        <button
          id="crm-audit-metrics-tab-btn"
          onClick={() => setAnalyticsTab('audit-metrics')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            analyticsTab === 'audit-metrics'
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 bg-slate-900/60'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          📊 30-Day Passport Audit Clearance Metrics
        </button>
      </div>

      {/* Conditional Analytics View */}
      {analyticsTab === 'demand-forecast' ? (
        <VisaDemandForecastWidget applications={applications} />
      ) : (
        <PassportAuditAnalyticsWidget applications={applications} />
      )}

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

            {(searchTerm || statusFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer whitespace-nowrap px-1"
              >
                Reset Filters
              </button>
            )}
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
      {(searchTerm || statusFilter !== 'ALL') && (
        <div className="flex items-center justify-between text-xs px-1 text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Showing <span className="text-amber-400 font-mono font-bold">{filteredApps.length}</span> of {applications.length} dossiers
            </span>
            {searchTerm && (
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-700">
                "{searchTerm}"
              </span>
            )}
          </div>
          {filteredApps.length === 0 && (
            <span className="text-amber-400 text-[11px]">No matching applicants found</span>
          )}
        </div>
      )}

      {/* Applications Table */}
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
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
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
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
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
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>{app.applicantName}</span>
                      {app.passportAudit && (
                        <span className="text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1 rounded font-mono" title={`OCR Score: ${app.passportAudit.overallScore}/100`}>
                          OCR {app.passportAudit.overallScore}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{app.nationality}</div>
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
                        onClick={() => setSelectedApp(app)}
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
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Flyout for Application Details */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-amber-400">File Reference: {selectedApp.id}</span>
                <h3 className="text-lg font-bold text-white">{selectedApp.applicantName}</h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

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
    </div>
  );
};
