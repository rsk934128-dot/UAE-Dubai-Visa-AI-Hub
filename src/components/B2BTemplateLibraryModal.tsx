import React, { useState, useMemo } from 'react';
import { 
  Mail, 
  Search, 
  Plus, 
  Edit3, 
  Copy, 
  Check, 
  Trash2, 
  RotateCcw, 
  Sparkles, 
  Tag, 
  Save, 
  Eye, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { B2BPitchTemplate, TEMPLATE_VARIABLES } from '../data/b2bPartnersData';

interface B2BTemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: B2BPitchTemplate[];
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  onSaveTemplate: (updated: B2BPitchTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onResetTemplate: (templateId: string) => void;
  contentLang: 'en' | 'bn';
  onToggleLang: (lang: 'en' | 'bn') => void;
}

export const B2BTemplateLibraryModal: React.FC<B2BTemplateLibraryModalProps> = ({
  isOpen,
  onClose,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  onResetTemplate,
  contentLang,
  onToggleLang
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<'all' | 'client_operations' | 'b2b_partnerships' | 'general' | 'custom'>('all');
  
  // Editor State
  const [editingTemplate, setEditingTemplate] = useState<B2BPitchTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<B2BPitchTemplate | null>(null);
  const [activeEditorField, setActiveEditorField] = useState<'subject' | 'body'>('body');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesGroup = 
        groupFilter === 'all' ? true :
        groupFilter === 'custom' ? !!t.isCustom :
        t.templateGroup === groupFilter;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesGroup;

      const matchesSearch = 
        t.title.toLowerCase().includes(q) ||
        t.titleBn.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.subjectBn.toLowerCase().includes(q) ||
        t.badge.toLowerCase().includes(q) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)));

      return matchesGroup && matchesSearch;
    });
  }, [templates, groupFilter, searchQuery]);

  if (!isOpen) return null;

  // Handle start editing
  const handleStartEdit = (t: B2BPitchTemplate) => {
    setEditingTemplate({ ...t });
    setIsCreatingNew(false);
    setPreviewTemplate(null);
  };

  // Handle start create new
  const handleStartCreateNew = () => {
    const newId = `custom_tpl_${Date.now()}`;
    setEditingTemplate({
      id: newId,
      category: 'operational',
      templateGroup: 'client_operations',
      badge: 'Custom Template',
      title: 'Custom Operational Email',
      titleBn: 'কাস্টম ইমেইল টেমপ্লেট',
      descriptionEn: 'Custom user-created email template for visa operations or partnerships.',
      descriptionBn: 'ব্যবহারকারী কর্তৃক তৈরিকৃত কাস্টম ইমেইল টেমপ্লেট।',
      tags: ['Custom', 'User Created'],
      subject: 'UAE Visa Update: Ref #{{appRef}} - {{companyName}}',
      subjectBn: 'ইউএই ভিসা আপডেট: রেফারেন্স #{{appRef}} - {{companyName}}',
      body: `Dear {{clientName}},\n\nRegarding your UAE Visa application under reference: {{appRef}} with {{companyName}}.\n\nStatus: {{status}}\n\nPlease reply with any questions.\n\nBest regards,\n{{senderName}}\n{{agencyName}}`,
      bodyBn: `শ্রদ্ধেয় {{clientName}},\n\nআপনার ইউএই ভিসা আবেদন রেফারেন্স: {{appRef}} ({{companyName}}) সংক্রান্ত তথ্য।\n\nবর্তমান অবস্থা: {{status}}\n\nধন্যবাদ,\n{{senderName}}\n{{agencyName}}`,
      isCustom: true
    });
    setIsCreatingNew(true);
    setPreviewTemplate(null);
  };

  // Handle save edit
  const handleSaveEditor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    onSaveTemplate({
      ...editingTemplate,
      isModified: !editingTemplate.isCustom,
      lastModified: new Date().toISOString()
    });

    setSaveSuccessNotice(true);
    setTimeout(() => {
      setSaveSuccessNotice(false);
      setEditingTemplate(null);
      setIsCreatingNew(false);
    }, 1200);
  };

  // Insert variable into active editor field
  const handleInsertVariable = (varKey: string) => {
    if (!editingTemplate) return;

    if (activeEditorField === 'subject') {
      const current = contentLang === 'bn' ? editingTemplate.subjectBn : editingTemplate.subject;
      const updated = `${current} ${varKey}`;
      if (contentLang === 'bn') {
        setEditingTemplate({ ...editingTemplate, subjectBn: updated });
      } else {
        setEditingTemplate({ ...editingTemplate, subject: updated });
      }
    } else {
      const current = contentLang === 'bn' ? editingTemplate.bodyBn : editingTemplate.body;
      const updated = `${current}\n${varKey}`;
      if (contentLang === 'bn') {
        setEditingTemplate({ ...editingTemplate, bodyBn: updated });
      } else {
        setEditingTemplate({ ...editingTemplate, body: updated });
      }
    }
  };

  // Copy template text
  const handleCopyTemplate = (t: B2BPitchTemplate) => {
    const subj = contentLang === 'bn' ? t.subjectBn : t.subject;
    const bdy = contentLang === 'bn' ? t.bodyBn : t.body;
    navigator.clipboard.writeText(`Subject: ${subj}\n\n${bdy}`);
    setCopiedId(t.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {contentLang === 'bn' ? 'ইমেইল টেমপ্লেট লাইব্রেরি ও কাস্টমাইজার' : 'Email Template Library & Customizer'}
                </h3>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  {templates.length} Templates
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {contentLang === 'bn'
                  ? 'ভিসা স্ট্যাটাস আপডেট, মিসিং ডকুমেন্টস রিকোয়েস্ট, তথ্য অনুসন্ধান ও বিটুবি পার্টনারশিপ পিচ'
                  : 'Visa Application Updates, Missing Documents Requests, General Inquiries & B2B SaaS Pitches'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => onToggleLang('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  contentLang === 'en' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                🇬🇧 EN
              </button>
              <button
                type="button"
                onClick={() => onToggleLang('bn')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  contentLang === 'bn' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                🇧🇩 বাংলা
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Sub-header Filter Bar */}
        {!editingTemplate && (
          <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Group Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setGroupFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  groupFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All ({templates.length})
              </button>

              <button
                onClick={() => setGroupFilter('client_operations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  groupFilter === 'client_operations'
                    ? 'bg-sky-500 text-slate-950 shadow-sm font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-sky-300 border border-slate-800'
                }`}
              >
                📋 Client Operations & Updates
              </button>

              <button
                onClick={() => setGroupFilter('general')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  groupFilter === 'general'
                    ? 'bg-purple-500 text-white shadow-sm font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-purple-300 border border-slate-800'
                }`}
              >
                💡 General Inquiries
              </button>

              <button
                onClick={() => setGroupFilter('b2b_partnerships')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  groupFilter === 'b2b_partnerships'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-emerald-300 border border-slate-800'
                }`}
              >
                🤝 B2B SaaS Pitches
              </button>

              {templates.some(t => t.isCustom) && (
                <button
                  onClick={() => setGroupFilter('custom')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    groupFilter === 'custom'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-950 text-amber-400 hover:text-amber-300 border border-amber-500/30'
                  }`}
                >
                  ⭐ Custom ({templates.filter(t => t.isCustom).length})
                </button>
              )}
            </div>

            {/* Search Input & Add New Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates, tags, subjects..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={handleStartCreateNew}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New Template</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* ============================================================= */}
          {/* INLINE TEMPLATE EDITOR VIEW */}
          {/* ============================================================= */}
          {editingTemplate ? (
            <form onSubmit={handleSaveEditor} className="space-y-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {isCreatingNew ? 'Create New Email Template' : `Edit Template: ${contentLang === 'bn' ? editingTemplate.titleBn : editingTemplate.title}`}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Changes will be persistently saved to your browser's template library.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTemplate(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>

              {saveSuccessNotice && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Template saved successfully into your local library!</span>
                </div>
              )}

              {/* Title & Badge & Group */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Template Title ({contentLang === 'bn' ? 'বাংলা' : 'English'}):
                  </label>
                  <input
                    type="text"
                    required
                    value={contentLang === 'bn' ? editingTemplate.titleBn : editingTemplate.title}
                    onChange={(e) => {
                      if (contentLang === 'bn') {
                        setEditingTemplate({ ...editingTemplate, titleBn: e.target.value });
                      } else {
                        setEditingTemplate({ ...editingTemplate, title: e.target.value });
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Badge Label:</label>
                  <input
                    type="text"
                    value={editingTemplate.badge}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, badge: e.target.value })}
                    placeholder="e.g. Status Update"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category Group:</label>
                  <select
                    value={editingTemplate.templateGroup}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, templateGroup: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="client_operations">📋 Client Operations</option>
                    <option value="general">💡 General Inquiries</option>
                    <option value="b2b_partnerships">🤝 B2B SaaS Pitches</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Variable Chips Helper */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Insert Smart Dynamic Variable:
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>Target:</span>
                    <button
                      type="button"
                      onClick={() => setActiveEditorField('subject')}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${activeEditorField === 'subject' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}
                    >
                      Subject
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveEditorField('body')}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${activeEditorField === 'body' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}
                    >
                      Body
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {TEMPLATE_VARIABLES.map(v => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => handleInsertVariable(v.key)}
                      className="px-2 py-1 bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 rounded-lg text-[11px] font-mono transition-all flex items-center gap-1 cursor-pointer group"
                      title={`Insert ${v.labelEn} (e.g. ${v.example})`}
                    >
                      <span>{v.key}</span>
                      <span className="text-[10px] text-slate-500 group-hover:text-amber-400/80">({contentLang === 'bn' ? v.labelBn : v.labelEn})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Line */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Subject Line ({contentLang === 'bn' ? 'বাংলা' : 'English'}):</span>
                  <span className="text-[10px] text-slate-500">Supports variables like {'{{appRef}}'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={contentLang === 'bn' ? editingTemplate.subjectBn : editingTemplate.subject}
                  onChange={(e) => {
                    if (contentLang === 'bn') {
                      setEditingTemplate({ ...editingTemplate, subjectBn: e.target.value });
                    } else {
                      setEditingTemplate({ ...editingTemplate, subject: e.target.value });
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Body Textarea */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Message Body ({contentLang === 'bn' ? 'বাংলা' : 'English'}):</span>
                  <span className="text-[10px] text-slate-500">Fully editable text</span>
                </label>
                <textarea
                  rows={10}
                  required
                  value={contentLang === 'bn' ? editingTemplate.bodyBn : editingTemplate.body}
                  onChange={(e) => {
                    if (contentLang === 'bn') {
                      setEditingTemplate({ ...editingTemplate, bodyBn: e.target.value });
                    } else {
                      setEditingTemplate({ ...editingTemplate, body: e.target.value });
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-amber-500 resize-y"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Template to Library</span>
                </button>
              </div>
            </form>
          ) : (
            /* ============================================================= */
            /* TEMPLATE CARDS GRID VIEW */
            /* ============================================================= */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredTemplates.map(tpl => {
                  const isSelected = selectedTemplateId === tpl.id;
                  const displayTitle = contentLang === 'bn' ? tpl.titleBn : tpl.title;
                  const displaySubject = contentLang === 'bn' ? tpl.subjectBn : tpl.subject;
                  const displayDesc = contentLang === 'bn' ? tpl.descriptionBn : tpl.descriptionEn;
                  const displayBody = contentLang === 'bn' ? tpl.bodyBn : tpl.body;

                  // Group badge color
                  const groupBadge = 
                    tpl.templateGroup === 'client_operations' ? 'bg-sky-500/10 text-sky-300 border-sky-500/30' :
                    tpl.templateGroup === 'general' ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
                    'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';

                  return (
                    <div
                      key={tpl.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border-amber-500/60 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* Header Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] bg-slate-950 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md font-mono font-bold">
                              {tpl.badge}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${groupBadge}`}>
                              {tpl.templateGroup === 'client_operations' ? 'Operations' : tpl.templateGroup === 'general' ? 'General' : 'B2B Pitch'}
                            </span>
                            {tpl.isCustom && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold">
                                Custom
                              </span>
                            )}
                            {tpl.isModified && !tpl.isCustom && (
                              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                                Customized
                              </span>
                            )}
                          </div>

                          {isSelected && (
                            <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                              Active in Composer
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="text-sm font-bold text-white hover:text-amber-300 transition-colors">
                            {displayTitle}
                          </h4>
                          {displayDesc && (
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                              {displayDesc}
                            </p>
                          )}
                        </div>

                        {/* Subject Preview Box */}
                        <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                            Subject:
                          </div>
                          <div className="text-xs text-slate-200 font-medium line-clamp-1 font-mono">
                            {displaySubject}
                          </div>
                        </div>

                        {/* Tags Preview */}
                        {tpl.tags && tpl.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {tpl.tags.map(tag => (
                              <span key={tag} className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/60">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Actions Footer */}
                      <div className="pt-3.5 mt-3 border-t border-slate-800/70 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          {/* Copy */}
                          <button
                            type="button"
                            onClick={() => handleCopyTemplate(tpl)}
                            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-colors cursor-pointer"
                            title="Copy subject and body"
                          >
                            {copiedId === tpl.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(tpl)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            title="Edit this template in library"
                          >
                            <Edit3 className="w-3 h-3 text-amber-400" />
                            <span>Edit</span>
                          </button>

                          {/* Reset if modified */}
                          {tpl.isModified && !tpl.isCustom && (
                            <button
                              type="button"
                              onClick={() => onResetTemplate(tpl.id)}
                              className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-colors cursor-pointer"
                              title="Reset back to factory template defaults"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          )}

                          {/* Delete if custom */}
                          {tpl.isCustom && (
                            <button
                              type="button"
                              onClick={() => onDeleteTemplate(tpl.id)}
                              className="p-1.5 rounded-lg bg-slate-950 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 text-xs transition-colors cursor-pointer"
                              title="Delete custom template"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Select & Use in Composer */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTemplate(tpl.id);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                              : 'bg-slate-800 hover:bg-amber-500 text-white hover:text-slate-950'
                          }`}
                        >
                          <span>{isSelected ? 'Selected' : 'Select & Use'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800">
                  <Mail className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-white">No templates found</h4>
                  <p className="text-xs text-slate-400 mt-1">Try changing your search query or group filter.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setGroupFilter('all'); }}
                    className="mt-3 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Templates are pre-aligned with UAE ICP & GDRFA Dubai immigration specifications.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
