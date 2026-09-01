import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  ArrowUpDown,
  Mail,
  FileText,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Download,
  Copy,
  Check,
  Send,
  Plus,
  Layers,
  Sparkles,
  Tag,
  Calendar,
  X
} from 'lucide-react';
import { VisaApplication, ApplicationAuditEvent, AuditEventType, DocumentAuditHistoryItem } from '../types';
import { formatDate } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

interface AgencyAuditTrailViewProps {
  applications: VisaApplication[];
  selectedApplicationId?: string;
  onSelectApplicationId?: (id: string | undefined) => void;
  onInspectApplication: (app: VisaApplication) => void;
  onSendEmailAlert: (app: VisaApplication) => void;
  onOpenDocHistory: (app: VisaApplication) => void;
  onAddAuditEvent?: (appId: string, event: Partial<ApplicationAuditEvent>) => void;
}

export const AgencyAuditTrailView: React.FC<AgencyAuditTrailViewProps> = ({
  applications,
  selectedApplicationId,
  onSelectApplicationId,
  onInspectApplication,
  onSendEmailAlert,
  onOpenDocHistory,
  onAddAuditEvent
}) => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<AuditEventType | 'ALL'>('ALL');
  const [selectedAppFilter, setSelectedAppFilter] = useState<string>(selectedApplicationId || 'ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);

  // New Note Modal State
  const [targetAppId, setTargetAppId] = useState<string>(
    selectedApplicationId && selectedApplicationId !== 'ALL' 
      ? selectedApplicationId 
      : (applications[0]?.id || '')
  );
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteActor, setNoteActor] = useState('Desk Officer (Dubai Hub)');

  // Sync prop changes if selectedApplicationId changes from outside
  React.useEffect(() => {
    if (selectedApplicationId) {
      setSelectedAppFilter(selectedApplicationId);
    }
  }, [selectedApplicationId]);

  // Aggregate all audit events from all applications
  const allAuditEvents = useMemo(() => {
    const list: ApplicationAuditEvent[] = [];
    applications.forEach(app => {
      if (app.auditTrail && app.auditTrail.length > 0) {
        app.auditTrail.forEach(evt => {
          list.push({
            ...evt,
            applicantName: evt.applicantName || app.applicantName,
            passportNumber: evt.passportNumber || app.passportNumber,
            applicationId: evt.applicationId || app.id
          });
        });
      } else {
        // Fallback default events if an app has no explicit auditTrail array yet
        list.push({
          id: `audit-${app.id}-init`,
          applicationId: app.id,
          applicantName: app.applicantName,
          passportNumber: app.passportNumber,
          timestamp: app.createdAt || new Date().toISOString(),
          type: 'application_created',
          title: `Application Dossier Created (${app.visaType})`,
          titleBn: `আবেদন ফাইল তৈরি করা হয়েছে (${app.visaType})`,
          actor: app.assignedAgent || 'Desk Officer 01 (Dubai Hub)',
          details: {
            newStatus: app.status,
            notes: app.notes
          }
        });

        if (app.status !== 'Draft') {
          list.push({
            id: `audit-${app.id}-status`,
            applicationId: app.id,
            applicantName: app.applicantName,
            passportNumber: app.passportNumber,
            timestamp: app.updatedAt || new Date().toISOString(),
            type: 'status_change',
            title: `Status: ${app.status}`,
            titleBn: `স্ট্যাটাস: ${app.status}`,
            actor: app.assignedAgent || 'Desk Officer 01 (Dubai Hub)',
            details: {
              newStatus: app.status,
              notes: app.notes
            }
          });
        }
      }
    });

    // Sort chronologically descending (newest first)
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [applications]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return allAuditEvents.filter(evt => {
      // Application filter
      if (selectedAppFilter !== 'ALL' && evt.applicationId !== selectedAppFilter) {
        return false;
      }

      // Event Type filter
      if (filterType !== 'ALL' && evt.type !== filterType) {
        return false;
      }

      // Search Query filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = (evt.applicantName || '').toLowerCase().includes(q);
        const matchesId = (evt.applicationId || '').toLowerCase().includes(q);
        const matchesPassport = (evt.passportNumber || '').toLowerCase().includes(q);
        const matchesTitle = (evt.title || '').toLowerCase().includes(q);
        const matchesActor = (evt.actor || '').toLowerCase().includes(q);
        const matchesNotes = (evt.details.notes || '').toLowerCase().includes(q);
        const matchesSubject = (evt.details.subject || '').toLowerCase().includes(q);
        const matchesRecipient = (evt.details.recipientEmail || '').toLowerCase().includes(q);
        const matchesDoc = (evt.details.documentType || '').toLowerCase().includes(q);

        return matchesName || matchesId || matchesPassport || matchesTitle || matchesActor || matchesNotes || matchesSubject || matchesRecipient || matchesDoc;
      }

      return true;
    });
  }, [allAuditEvents, selectedAppFilter, filterType, searchTerm]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = allAuditEvents.length;
    const statusChanges = allAuditEvents.filter(e => e.type === 'status_change').length;
    const emailAlerts = allAuditEvents.filter(e => e.type === 'email_alert').length;
    const documentUpdates = allAuditEvents.filter(e => e.type === 'document_update').length;
    const creationsAndNotes = allAuditEvents.filter(e => e.type === 'application_created' || e.type === 'note_added').length;

    return { total, statusChanges, emailAlerts, documentUpdates, creationsAndNotes };
  }, [allAuditEvents]);

  // Copy event details
  const handleCopyEvent = (evt: ApplicationAuditEvent) => {
    const text = `[AUDIT RECORD]
File Ref: ${evt.applicationId}
Applicant: ${evt.applicantName} (${evt.passportNumber || 'N/A'})
Timestamp: ${evt.timestamp}
Event Type: ${evt.type}
Title: ${evt.title}
Actor: ${evt.actor}
Details: ${JSON.stringify(evt.details, null, 2)}`;

    navigator.clipboard.writeText(text);
    setCopiedId(evt.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export Audit Trail as JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredEvents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `uae_visa_agency_audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAppId || !noteTitle.trim()) return;

    if (onAddAuditEvent) {
      onAddAuditEvent(targetAppId, {
        type: 'note_added',
        title: noteTitle.trim(),
        actor: noteActor.trim() || 'Desk Officer (Dubai Hub)',
        details: {
          notes: noteContent.trim()
        }
      });
    }

    setNoteTitle('');
    setNoteContent('');
    setShowAddNoteModal(false);
  };

  const getEventBadge = (type: AuditEventType) => {
    switch (type) {
      case 'status_change':
        return {
          icon: <ArrowUpDown className="w-4 h-4 text-amber-400" />,
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          label: language === 'ar' ? 'تغيير الحالة' : 'Status Change'
        };
      case 'email_alert':
        return {
          icon: <Mail className="w-4 h-4 text-sky-400" />,
          bg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
          label: language === 'ar' ? 'إشعار بريد إلكتروني' : 'Email Alert'
        };
      case 'document_update':
        return {
          icon: <FileCheck className="w-4 h-4 text-purple-400" />,
          bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
          label: language === 'ar' ? 'تحديث مستند' : 'Document Update'
        };
      case 'application_created':
        return {
          icon: <Plus className="w-4 h-4 text-emerald-400" />,
          bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          label: language === 'ar' ? 'إنشاء ملف' : 'Dossier Initialized'
        };
      case 'note_added':
      default:
        return {
          icon: <FileText className="w-4 h-4 text-slate-400" />,
          bg: 'bg-slate-700/20 text-slate-300 border-slate-700/40',
          label: language === 'ar' ? 'ملاحظة تدقيق' : 'Audit Note'
        };
    }
  };

  return (
    <div className="space-y-4" id="agency-audit-trail-container">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div 
          onClick={() => setFilterType('ALL')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            filterType === 'ALL'
              ? 'bg-slate-900 border-amber-500/80 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Total Records</span>
            <History className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-xl font-bold font-mono text-white mt-1 block">{stats.total}</span>
          <span className="text-[10px] text-slate-500">Across all dossiers</span>
        </div>

        <div 
          onClick={() => setFilterType('status_change')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            filterType === 'status_change'
              ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold">Status Changes</span>
            <ArrowUpDown className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xl font-bold font-mono text-amber-300 mt-1 block">{stats.statusChanges}</span>
          <span className="text-[10px] text-amber-500/80">Workflow transitions</span>
        </div>

        <div 
          onClick={() => setFilterType('email_alert')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            filterType === 'email_alert'
              ? 'bg-sky-950/40 border-sky-500 shadow-md shadow-sky-500/10 ring-1 ring-sky-500/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-sky-400 font-semibold">Email Alerts</span>
            <Mail className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-xl font-bold font-mono text-sky-300 mt-1 block">{stats.emailAlerts}</span>
          <span className="text-[10px] text-sky-500/80">Client notifications</span>
        </div>

        <div 
          onClick={() => setFilterType('document_update')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            filterType === 'document_update'
              ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/10 ring-1 ring-purple-500/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-purple-400 font-semibold">Doc Updates</span>
            <FileCheck className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-xl font-bold font-mono text-purple-300 mt-1 block">{stats.documentUpdates}</span>
          <span className="text-[10px] text-purple-500/80">OCR & versions</span>
        </div>

        <div 
          onClick={() => setFilterType('note_added')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            filterType === 'note_added' || filterType === 'application_created'
              ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">Dossier / Notes</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xl font-bold font-mono text-emerald-300 mt-1 block">{stats.creationsAndNotes}</span>
          <span className="text-[10px] text-emerald-500/80">Intake & logs</span>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search audit trail by applicant, passport, file ref, email, document or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Application Selector Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <label className="text-xs text-slate-400 whitespace-nowrap font-medium">Application:</label>
            <select
              value={selectedAppFilter}
              onChange={(e) => {
                setSelectedAppFilter(e.target.value);
                if (onSelectApplicationId) {
                  onSelectApplicationId(e.target.value === 'ALL' ? undefined : e.target.value);
                }
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 max-w-[220px]"
            >
              <option value="ALL">All Applications ({applications.length})</option>
              {applications.map(app => (
                <option key={app.id} value={app.id}>
                  {app.applicantName} ({app.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowAddNoteModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Add a manual audit log or compliance note"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Audit Note</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Download audit trail as JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Log</span>
          </button>
        </div>
      </div>

      {/* Active Application Filter Banner if narrowed */}
      {selectedAppFilter !== 'ALL' && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Showing audit history specifically for:{' '}
              <strong className="text-white font-mono">
                {applications.find(a => a.id === selectedAppFilter)?.applicantName || selectedAppFilter}
              </strong>{' '}
              ({selectedAppFilter})
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedAppFilter('ALL');
              if (onSelectApplicationId) onSelectApplicationId(undefined);
            }}
            className="text-amber-400 hover:text-white underline cursor-pointer text-[11px]"
          >
            Show All Applications
          </button>
        </div>
      )}

      {/* Audit Event Feed Timeline */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <History className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-300">No Audit Events Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No audit log entries match your current search and filter criteria. Try resetting filters or choosing another application dossier.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('ALL');
                setSelectedAppFilter('ALL');
              }}
              className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredEvents.map((evt, idx) => {
            const badge = getEventBadge(evt.type);
            const parentApp = applications.find(a => a.id === evt.applicationId);

            return (
              <div
                key={evt.id || `audit-row-${idx}`}
                className="bg-slate-900/85 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700/90 rounded-xl p-4 transition-all shadow-sm space-y-3"
              >
                {/* Header Row: Badge, Title, Timestamp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 shrink-0 ${badge.bg}`}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>

                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {evt.title}
                      </h4>
                      {evt.titleBn && (
                        <p className="text-[11px] text-slate-400 font-bengali">
                          {evt.titleBn}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatDate(evt.timestamp)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopyEvent(evt)}
                      title="Copy event record"
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                    >
                      {copiedId === evt.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Event Context & Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Column 1: Application Dossier Context */}
                  <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-lg space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block font-semibold">
                      Target Dossier
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{evt.applicantName}</span>
                      <span className="font-mono text-[11px] text-amber-400 font-bold">{evt.applicationId}</span>
                    </div>
                    {evt.passportNumber && (
                      <div className="text-[11px] text-slate-400 font-mono">
                        Passport: <span className="text-slate-200">{evt.passportNumber}</span>
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400">
                      Logged by: <span className="text-slate-300 font-medium">{evt.actor}</span>
                    </div>
                  </div>

                  {/* Column 2 & 3: Event Specific Details */}
                  <div className="md:col-span-2 bg-slate-950/80 border border-slate-800/80 p-3 rounded-lg space-y-2">
                    {/* Status Change Details */}
                    {evt.type === 'status_change' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 font-medium">Transition:</span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                            {evt.details.previousStatus || 'Previous'}
                          </span>
                          <span className="text-amber-400 font-bold">➔</span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {evt.details.newStatus || 'New Status'}
                          </span>
                        </div>
                        {evt.details.reason && (
                          <div className="text-[11px] text-slate-300">
                            <strong className="text-slate-400">Reason / Trigger:</strong> {evt.details.reason}
                          </div>
                        )}
                        {evt.details.notes && evt.details.notes !== evt.details.reason && (
                          <div className="text-[11px] text-slate-400">
                            <strong className="text-slate-400">Notes:</strong> {evt.details.notes}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Email Alert Details */}
                    {evt.type === 'email_alert' && (
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <span className="text-[11px] text-sky-400 font-mono font-bold flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Recipient: {evt.details.recipientEmail || 'Applicant Email'}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {evt.details.deliveryStatus || 'Delivered'}
                          </span>
                        </div>
                        {evt.details.subject && (
                          <div className="text-[11px] text-slate-200 font-medium">
                            <strong className="text-slate-400">Subject:</strong> {evt.details.subject}
                          </div>
                        )}
                        {evt.details.templateUsed && (
                          <div className="text-[10px] text-amber-300/80 font-mono">
                            Template: {evt.details.templateUsed}
                          </div>
                        )}
                        {evt.details.emailBodyPreview && (
                          <div className="text-[11px] text-slate-400 bg-slate-900/70 p-2 rounded border border-slate-800 italic">
                            "{evt.details.emailBodyPreview}"
                          </div>
                        )}
                      </div>
                    )}

                    {/* Document Update Details */}
                    {evt.type === 'document_update' && (
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <span className="text-xs font-bold text-purple-300 font-mono flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {evt.details.documentType || 'Uploaded Document'}
                            {evt.details.version && (
                              <span className="text-[10px] bg-purple-950 text-purple-200 px-1.5 py-0.2 rounded border border-purple-800">
                                {evt.details.version}
                              </span>
                            )}
                          </span>
                          {evt.details.score !== undefined && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                              OCR Score: {evt.details.score}/100
                            </span>
                          )}
                        </div>
                        {evt.details.fileName && (
                          <div className="text-[11px] text-slate-300 font-mono">
                            File: {evt.details.fileName} {evt.details.fileSize ? `(${evt.details.fileSize})` : ''}
                          </div>
                        )}
                        {evt.details.checksumSha256 && (
                          <div className="text-[10px] text-slate-500 font-mono truncate">
                            SHA-256: {evt.details.checksumSha256}
                          </div>
                        )}
                        {evt.details.notes && (
                          <div className="text-[11px] text-slate-300">
                            {evt.details.notes}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Application Created or Note Added Details */}
                    {(evt.type === 'application_created' || evt.type === 'note_added') && (
                      <div className="space-y-1 text-[11px] text-slate-300">
                        {evt.details.notes && (
                          <p>{evt.details.notes}</p>
                        )}
                        {evt.details.newStatus && (
                          <div className="text-[10px] text-slate-400">
                            Initial Status: <span className="text-slate-200 font-mono">{evt.details.newStatus}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Interactive Quick-Actions */}
                {parentApp && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                    <span className="text-[11px] text-slate-500">
                      Visa Type: <strong className="text-slate-400">{parentApp.visaType}</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenDocHistory(parentApp)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Layers className="w-3 h-3 text-amber-400" />
                        <span>Doc Versions</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSendEmailAlert(parentApp)}
                        className="text-xs bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Alert</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onInspectApplication(parentApp)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>Inspect Dossier</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add Manual Audit Note */}
      {showAddNoteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Log Compliance / Audit Entry</h3>
              </div>
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Target Application:</label>
                <select
                  value={targetAppId}
                  onChange={(e) => setTargetAppId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                >
                  {applications.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.applicantName} ({a.id} - {a.passportNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Audit Entry Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Physical Passport Inspection Passed / GDRFA Query Cleared"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Audit / Verification Details:</label>
                <textarea
                  rows={3}
                  placeholder="Enter detailed remarks, verification notes, or manual compliance checks..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Officer / Audit Actor:</label>
                <input
                  type="text"
                  value={noteActor}
                  onChange={(e) => setNoteActor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer shadow-md"
                >
                  Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
