import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Mail,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit3,
  Search,
  Sparkles,
  Send,
  Building,
  RotateCcw,
  Tag,
  Eye,
  Code,
  CheckCircle2,
  HelpCircle,
  FileCheck,
  AlertTriangle,
  Receipt,
  User,
  Zap,
  Globe,
  Printer
} from 'lucide-react';
import { CommunicationTemplate, TemplateCategory, VisaApplication } from '../types';
import { 
  DEFAULT_COMMUNICATION_TEMPLATES, 
  getSavedTemplates, 
  saveTemplatesToStorage, 
  resolveTemplateVariables 
} from '../data/templatePresets';

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: VisaApplication[];
  selectedApplicant?: VisaApplication | null;
  onSelectApplicant?: (app: VisaApplication) => void;
  onDispatchEmail?: (app: VisaApplication, templateSubject: string, templateBody: string) => void;
}

const CATEGORY_CONFIG: Record<TemplateCategory, { label: string; icon: any; color: string; badgeBg: string }> = {
  email_update: {
    label: 'Client Email Updates',
    icon: Mail,
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30'
  },
  cover_letter: {
    label: 'GDRFA/ICP Cover Letters',
    icon: Building,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
  },
  document_request: {
    label: 'Document & Photo Requests',
    icon: AlertTriangle,
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30'
  },
  fee_quote: {
    label: 'Fee Quotes & Invoices',
    icon: Receipt,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
  },
  rejection_advisory: {
    label: 'Advisories & Rejections',
    icon: HelpCircle,
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30'
  }
};

const VARIABLE_TAGS = [
  { tag: '{{applicant_name}}', label: 'Applicant Name', example: 'Mohammad Rahman' },
  { tag: '{{passport_number}}', label: 'Passport No.', example: 'A12894562' },
  { tag: '{{nationality}}', label: 'Nationality', example: 'Bangladeshi' },
  { tag: '{{visa_type}}', label: 'Visa Type', example: '30-Day Single Entry Tourist Visa' },
  { tag: '{{tracking_id}}', label: 'Dossier Ref ID', example: 'DXB-2026-8812' },
  { tag: '{{status}}', label: 'Status', example: 'Audited - Passed' },
  { tag: '{{officer_name}}', label: 'Officer Name', example: 'Amer Typing Center' },
  { tag: '{{current_date}}', label: 'Current Date', example: '29 Aug 2026' }
];

export const TemplateManagerModal: React.FC<TemplateManagerModalProps> = ({
  isOpen,
  onClose,
  applications,
  selectedApplicant: initialSelectedApplicant,
  onSelectApplicant,
  onDispatchEmail
}) => {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedVisaFilter, setSelectedVisaFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  
  // Active Applicant Context for Variable Preview
  const [activeApplicantId, setActiveApplicantId] = useState<string>(
    initialSelectedApplicant?.id || (applications.length > 0 ? applications[0].id : '')
  );

  // View Mode: 'rendered' (populated) vs 'raw' (with {{tags}})
  const [previewMode, setPreviewMode] = useState<'rendered' | 'raw'>('rendered');
  const [copiedType, setCopiedType] = useState<'body' | 'subject' | 'full' | null>(null);

  // Edit / Create Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<CommunicationTemplate>>({});
  const [isNewTemplate, setIsNewTemplate] = useState(false);

  // Load templates on mount
  useEffect(() => {
    const loaded = getSavedTemplates();
    setTemplates(loaded);
    if (loaded.length > 0) {
      setSelectedTemplateId(loaded[0].id);
    }
  }, []);

  // Update active applicant if prop changes
  useEffect(() => {
    if (initialSelectedApplicant) {
      setActiveApplicantId(initialSelectedApplicant.id);
    }
  }, [initialSelectedApplicant]);

  const currentApplicant = useMemo(() => {
    return applications.find(a => a.id === activeApplicantId) || applications[0] || null;
  }, [applications, activeApplicantId]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(tmpl => {
      const matchesCategory = activeCategory === 'ALL' || tmpl.category === activeCategory;
      const matchesVisa = selectedVisaFilter === 'ALL' || 
        tmpl.targetVisaType.toLowerCase().includes(selectedVisaFilter.toLowerCase()) ||
        tmpl.targetVisaType.toLowerCase().includes('all');
      
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = !query || 
        tmpl.name.toLowerCase().includes(query) ||
        tmpl.subject.toLowerCase().includes(query) ||
        tmpl.content.toLowerCase().includes(query) ||
        (tmpl.tags && tmpl.tags.some(t => t.toLowerCase().includes(query)));

      return matchesCategory && matchesVisa && matchesSearch;
    });
  }, [templates, activeCategory, selectedVisaFilter, searchTerm]);

  // Selected Template
  const activeTemplate = useMemo(() => {
    return templates.find(t => t.id === selectedTemplateId) || filteredTemplates[0] || templates[0] || null;
  }, [templates, selectedTemplateId, filteredTemplates]);

  // Populated values
  const populatedData = useMemo(() => {
    if (!activeTemplate) return { subject: '', content: '' };

    const data = {
      applicantName: currentApplicant?.applicantName || 'Mohammad Rahman',
      passportNumber: currentApplicant?.passportNumber || 'A12894562',
      nationality: currentApplicant?.nationality || 'Bangladeshi',
      visaType: currentApplicant?.visaType || activeTemplate.targetVisaType || '30-Day Single Entry Tourist Visa',
      trackingId: currentApplicant?.id || 'DXB-2026-8812',
      status: currentApplicant?.status || 'Audited - Passed',
      officerName: currentApplicant?.assignedAgent || 'Amer Operations Team',
      currentDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    return {
      subject: resolveTemplateVariables(activeTemplate.subject, data),
      content: resolveTemplateVariables(activeTemplate.content, data)
    };
  }, [activeTemplate, currentApplicant]);

  if (!isOpen) return null;

  const handleCopy = (text: string, type: 'body' | 'subject' | 'full') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleStartCreate = () => {
    setEditingTemplate({
      id: `tmpl-custom-${Date.now()}`,
      name: 'New Custom Template',
      category: 'email_update',
      targetVisaType: 'All Visa Categories',
      subject: 'UAE Visa Update - {{applicant_name}} [Ref: {{tracking_id}}]',
      content: `Dear {{applicant_name}},\n\nWe are writing to update you regarding your UAE Visa Application ({{visa_type}} - Ref: {{tracking_id}}).\n\nStatus: {{status}}\nPassport: {{passport_number}}\n\nWarm regards,\n{{officer_name}}\nUAE Visa AI Hub`,
      description: 'Custom client communication template created by typing officer.',
      tags: ['Custom', 'Client Notice'],
      isCustom: true,
      lastModified: new Date().toISOString()
    });
    setIsNewTemplate(true);
    setIsEditing(true);
  };

  const handleStartEdit = (template: CommunicationTemplate) => {
    setEditingTemplate({ ...template });
    setIsNewTemplate(false);
    setIsEditing(true);
  };

  const handleInsertVariable = (variableTag: string) => {
    if (!editingTemplate) return;
    const content = editingTemplate.content || '';
    setEditingTemplate({
      ...editingTemplate,
      content: content + (content.endsWith(' ') || content.endsWith('\n') ? '' : ' ') + variableTag
    });
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate.name || !editingTemplate.content) return;

    let updated: CommunicationTemplate[];
    if (isNewTemplate) {
      const newTmpl = {
        ...editingTemplate,
        id: editingTemplate.id || `tmpl-custom-${Date.now()}`,
        isCustom: true,
        lastModified: new Date().toISOString()
      } as CommunicationTemplate;
      updated = [newTmpl, ...templates];
      setSelectedTemplateId(newTmpl.id);
    } else {
      updated = templates.map(t => t.id === editingTemplate.id ? ({
        ...t,
        ...editingTemplate,
        lastModified: new Date().toISOString()
      } as CommunicationTemplate) : t);
    }

    setTemplates(updated);
    saveTemplatesToStorage(updated);
    setIsEditing(false);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      const updated = templates.filter(t => t.id !== id);
      setTemplates(updated);
      saveTemplatesToStorage(updated);
      if (selectedTemplateId === id && updated.length > 0) {
        setSelectedTemplateId(updated[0].id);
      }
    }
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset all templates back to standard official GDRFA/ICP presets? Custom templates will be replaced.')) {
      setTemplates(DEFAULT_COMMUNICATION_TEMPLATES);
      saveTemplatesToStorage(DEFAULT_COMMUNICATION_TEMPLATES);
      if (DEFAULT_COMMUNICATION_TEMPLATES.length > 0) {
        setSelectedTemplateId(DEFAULT_COMMUNICATION_TEMPLATES[0].id);
      }
    }
  };

  const handleDispatchDirect = () => {
    if (currentApplicant && onDispatchEmail && activeTemplate) {
      onDispatchEmail(currentApplicant, populatedData.subject, populatedData.content);
      onClose();
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${populatedData.subject}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
              .header { border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; }
              .title { font-size: 20px; font-weight: bold; color: #0f172a; }
              .meta { font-size: 13px; color: #64748b; margin-top: 4px; }
              .content { white-space: pre-wrap; font-size: 14px; }
              .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 12px; color: #94a3b8; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">${populatedData.subject}</div>
              <div class="meta">UAE Visa AI Hub • Amer Typing Center • Generated on ${new Date().toLocaleDateString()}</div>
            </div>
            <div class="content">${populatedData.content}</div>
            <div class="footer">Official UAE Immigration Communications Reference • GDRFA / ICP Standard</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div 
        id="template-manager-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col my-auto h-[92vh] max-h-[850px]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-sky-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Agency Communication &amp; Template Manager</h2>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 font-mono px-2 py-0.5 rounded-full border border-sky-500/40">
                  {templates.length} Active Templates
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pre-approved GDRFA &amp; ICP communication drafts, official embassy cover letters, and document request notices.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartCreate}
              id="btn-create-template"
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Template</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Content Layout: Sidebar List + Right Preview & Editor */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Column: Template Selector & Filters */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/60 flex flex-col shrink-0">
            
            {/* Search & Category Pills */}
            <div className="p-3 border-b border-slate-800 space-y-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search templates or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Category Filter Scroll */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                <button
                  onClick={() => setActiveCategory('ALL')}
                  className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    activeCategory === 'ALL'
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  All ({templates.length})
                </button>
                {(['email_update', 'cover_letter', 'document_request', 'fee_quote'] as TemplateCategory[]).map(cat => {
                  const cfg = CATEGORY_CONFIG[cat];
                  const count = templates.filter(t => t.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                        activeCategory === cat
                          ? 'bg-slate-800 text-sky-300 font-semibold border border-sky-500/50'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <span>{cfg.label.split(' ')[0]}</span>
                      <span className="text-[9px] opacity-70 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Template List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-slate-800/40">
              {filteredTemplates.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  No templates match your search filters.
                </div>
              ) : (
                filteredTemplates.map(tmpl => {
                  const catCfg = CATEGORY_CONFIG[tmpl.category] || CATEGORY_CONFIG.email_update;
                  const isSelected = tmpl.id === (activeTemplate?.id);
                  const Icon = catCfg.icon;

                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        setSelectedTemplateId(tmpl.id);
                        setIsEditing(false);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all text-left ${
                        isSelected
                          ? 'bg-sky-950/50 border border-sky-500/50 shadow-sm'
                          : 'hover:bg-slate-900/80 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${catCfg.color}`} />
                          <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">
                            {tmpl.name}
                          </h4>
                        </div>
                        {tmpl.isCustom && (
                          <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/40">
                            Custom
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {tmpl.description}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/50 text-[10px] font-mono text-slate-500">
                        <span>{tmpl.targetVisaType}</span>
                        <span className={`px-1.5 py-0.2 rounded ${catCfg.badgeBg}`}>
                          {catCfg.label.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Footer actions for templates */}
            <div className="p-2.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px]">
              <button
                onClick={handleResetToDefaults}
                className="text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="Restore default templates"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>

              <span className="text-[10px] text-slate-500 font-mono">
                {templates.filter(t => t.isCustom).length} custom saved
              </span>
            </div>
          </div>

          {/* Right Column: Dynamic Preview or Editor Form */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            {isEditing ? (
              /* Template Editor Mode */
              <div className="flex-1 flex flex-col p-4 space-y-3 overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-sky-400" />
                    <h3 className="text-sm font-bold text-white">
                      {isNewTemplate ? 'Create New Template' : `Edit "${editingTemplate.name}"`}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveTemplate}
                      className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Template</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Template Name</label>
                    <input
                      type="text"
                      value={editingTemplate.name || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                      placeholder="e.g., Express Approval Notification"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                    <select
                      value={editingTemplate.category || 'email_update'}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                    >
                      <option value="email_update">Client Email Updates</option>
                      <option value="cover_letter">GDRFA/ICP Cover Letters</option>
                      <option value="document_request">Document &amp; Photo Requests</option>
                      <option value="fee_quote">Fee Quotes &amp; Invoices</option>
                      <option value="rejection_advisory">Advisories &amp; Rejections</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Target Visa Type</label>
                    <input
                      type="text"
                      value={editingTemplate.targetVisaType || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, targetVisaType: e.target.value })}
                      placeholder="e.g. 30-Day Single Entry Tourist Visa / All"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Description / Purpose</label>
                    <input
                      type="text"
                      value={editingTemplate.description || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                      placeholder="Short memo explaining when to send this"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Subject Line */}
                <div className="text-xs">
                  <label className="block text-slate-400 mb-1 font-semibold">Subject / Document Heading</label>
                  <input
                    type="text"
                    value={editingTemplate.subject || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                    placeholder="e.g. 🇦🇪 UAE Visa Update - {{applicant_name}} [Ref: {{tracking_id}}]"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Variable Inserter Toolbar */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 space-y-1.5 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Code className="w-3 h-3 text-sky-400" />
                    Click to insert dynamic client variable:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {VARIABLE_TAGS.map(v => (
                      <button
                        key={v.tag}
                        type="button"
                        onClick={() => handleInsertVariable(v.tag)}
                        className="bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-700/80 px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors"
                        title={`Example value: ${v.example}`}
                      >
                        + {v.tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Template Content */}
                <div className="flex-1 flex flex-col text-xs min-h-[220px]">
                  <label className="block text-slate-400 mb-1 font-semibold">Template Body</label>
                  <textarea
                    value={editingTemplate.content || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                    rows={12}
                    className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-sky-500"
                    placeholder="Enter template text with {{applicant_name}} placeholders..."
                  />
                </div>
              </div>
            ) : activeTemplate ? (
              /* Template Interactive Preview Mode */
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Top Applicant Context & Controls Bar */}
                <div className="p-3.5 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                  {/* Left: Applicant Preview Switcher */}
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="text-xs text-slate-400 font-medium">Preview with Applicant:</span>
                    <select
                      id="select-template-preview-applicant"
                      value={activeApplicantId}
                      onChange={(e) => {
                        setActiveApplicantId(e.target.value);
                        const app = applications.find(a => a.id === e.target.value);
                        if (app && onSelectApplicant) onSelectApplicant(app);
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-semibold focus:outline-none focus:border-sky-500 max-w-[200px]"
                    >
                      {applications.map(app => (
                        <option key={app.id} value={app.id}>
                          {app.applicantName} ({app.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Right: Rendered vs Raw toggle + Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
                      <button
                        onClick={() => setPreviewMode('rendered')}
                        className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                          previewMode === 'rendered'
                            ? 'bg-sky-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        <span>Populated</span>
                      </button>
                      <button
                        onClick={() => setPreviewMode('raw')}
                        className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                          previewMode === 'raw'
                            ? 'bg-sky-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Code className="w-3 h-3" />
                        <span>Raw Tags</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleStartEdit(activeTemplate)}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3 text-slate-400" />
                      <span>Edit</span>
                    </button>

                    {activeTemplate.isCustom && (
                      <button
                        onClick={() => handleDeleteTemplate(activeTemplate.id)}
                        className="text-xs bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Delete custom template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Middle: Document Canvas Area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-900/40">
                  {/* Subject Bar */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-start justify-between gap-3">
                    <div className="space-y-0.5 flex-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block">
                        Subject Line / Document Heading
                      </span>
                      <p className="text-xs font-semibold text-sky-200 font-mono">
                        {previewMode === 'rendered' ? populatedData.subject : activeTemplate.subject}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopy(previewMode === 'rendered' ? populatedData.subject : activeTemplate.subject, 'subject')}
                      className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-300 flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                      title="Copy subject line"
                    >
                      {copiedType === 'subject' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Body Content Box */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 relative group">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-medium">
                          {activeTemplate.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Target: {activeTemplate.targetVisaType}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handlePrint}
                          className="text-[11px] text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Print</span>
                        </button>
                        <button
                          onClick={() => handleCopy(previewMode === 'rendered' ? populatedData.content : activeTemplate.content, 'body')}
                          className="text-[11px] text-sky-400 hover:text-sky-300 bg-slate-900 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedType === 'body' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied Body!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Body</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed tracking-normal overflow-x-auto selection:bg-sky-500/30">
                      {previewMode === 'rendered' ? populatedData.content : activeTemplate.content}
                    </pre>
                  </div>
                </div>

                {/* Bottom Action Dispatch Bar */}
                <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      Ready to communicate with <strong className="text-slate-200">{currentApplicant?.applicantName || 'Applicant'}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleCopy(
                        `${previewMode === 'rendered' ? populatedData.subject : activeTemplate.subject}\n\n${previewMode === 'rendered' ? populatedData.content : activeTemplate.content}`,
                        'full'
                      )}
                      className="flex-1 sm:flex-initial text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedType === 'full' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Entire Notice Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Subject &amp; Body</span>
                        </>
                      )}
                    </button>

                    {onDispatchEmail && currentApplicant && (
                      <button
                        id="btn-dispatch-template-email"
                        onClick={handleDispatchDirect}
                        className="flex-1 sm:flex-initial bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch Notice to Client</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
