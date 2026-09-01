import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Plane, 
  Users, 
  Briefcase, 
  Award, 
  Mail, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Filter, 
  Search, 
  Plus, 
  Sparkles, 
  HelpCircle, 
  ChevronRight, 
  Globe, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Download, 
  Trash2, 
  UserCheck, 
  Zap, 
  ShieldCheck, 
  ArrowUpRight,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  BookOpen,
  Edit3,
  Eye,
  RotateCcw,
  Save,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { B2BPartnerLead, B2BPartnerCategory, B2BOutreachCampaign } from '../types';
import { 
  INITIAL_B2B_PARTNERS, 
  B2B_CATEGORIES, 
  B2B_PITCH_TEMPLATES, 
  B2BPitchTemplate,
  TEMPLATE_VARIABLES
} from '../data/b2bPartnersData';
import { B2BTemplateLibraryModal } from './B2BTemplateLibraryModal';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY_PARTNERS = 'uae_visa_b2b_partners_v1';
const STORAGE_KEY_CAMPAIGNS = 'uae_visa_b2b_campaigns_v1';
const STORAGE_KEY_TEMPLATES = 'uae_visa_b2b_templates_v2';

export const B2BPartnerOutreachSection: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isBn = language === 'ar' || language === 'en'; // support dual toggle
  const [contentLang, setContentLang] = useState<'en' | 'bn'>('en');

  // Partners State
  const [partners, setPartners] = useState<B2BPartnerLead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PARTNERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored partners:', e);
    }
    return INITIAL_B2B_PARTNERS;
  });

  // Campaigns State
  const [campaigns, setCampaigns] = useState<B2BOutreachCampaign[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CAMPAIGNS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading stored campaigns:', e);
    }
    return [];
  });

  // Templates State (Editable Library)
  const [templates, setTemplates] = useState<B2BPitchTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEMPLATES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored templates:', e);
    }
    return B2B_PITCH_TEMPLATES;
  });

  // Selection & Filter State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['partner-1', 'partner-2', 'partner-7', 'partner-9']));
  const [activeCategory, setActiveCategory] = useState<B2BPartnerCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'uae' | 'bangladesh' | 'international'>('all');

  // Template Library Modal State
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);

  // Compose Modal / Drawer State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(B2B_PITCH_TEMPLATES[0].id);
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [previewWithData, setPreviewWithData] = useState(false);
  const [senderAgencyName, setSenderAgencyName] = useState(user?.displayName ? `${user.displayName} Visa Solutions` : 'Dubai Visa AI Hub');
  const [senderEmail, setSenderEmail] = useState(user?.email || 'sales@dubai-visa-ai.app');
  const [saveTemplateNotice, setSaveTemplateNotice] = useState(false);

  // Dispatch Progress State
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState(0);
  const [dispatchStatusMessage, setDispatchStatusMessage] = useState('');
  const [copiedEmailNotice, setCopiedEmailNotice] = useState(false);
  const [copiedBodyNotice, setCopiedBodyNotice] = useState(false);

  // Add Partner Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPartner, setNewPartner] = useState<Partial<B2BPartnerLead>>({
    companyName: '',
    category: 'typing_center',
    contactPerson: '',
    designation: 'Managing Director',
    email: '',
    phone: '',
    city: 'Dubai',
    country: 'United Arab Emirates',
    estimatedVolume: '500+ Visas/month',
    status: 'new',
    notes: ''
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PARTNERS, JSON.stringify(partners));
    } catch (e) {
      console.warn('Could not persist partners:', e);
    }
  }, [partners]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CAMPAIGNS, JSON.stringify(campaigns));
    } catch (e) {
      console.warn('Could not persist campaigns:', e);
    }
  }, [campaigns]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
    } catch (e) {
      console.warn('Could not persist templates:', e);
    }
  }, [templates]);

  // Selected Active Template from editable templates state
  const activeTemplate = useMemo(() => {
    return templates.find(t => t.id === selectedTemplateId) || templates[0] || B2B_PITCH_TEMPLATES[0];
  }, [templates, selectedTemplateId]);

  // Sync composer text on template or language change
  useEffect(() => {
    if (activeTemplate) {
      if (contentLang === 'bn') {
        setCustomSubject(activeTemplate.subjectBn);
        setCustomBody(activeTemplate.bodyBn);
      } else {
        setCustomSubject(activeTemplate.subject);
        setCustomBody(activeTemplate.body);
      }
    }
  }, [activeTemplate, contentLang]);

  // Template Management Handlers
  const handleSaveTemplate = (updated: B2BPitchTemplate) => {
    setTemplates(prev => {
      const idx = prev.findIndex(t => t.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      } else {
        return [updated, ...prev];
      }
    });
    setSelectedTemplateId(updated.id);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (selectedTemplateId === id) {
      setSelectedTemplateId(templates[0]?.id || B2B_PITCH_TEMPLATES[0].id);
    }
  };

  const handleResetTemplate = (id: string) => {
    const defaultTemplate = B2B_PITCH_TEMPLATES.find(t => t.id === id);
    if (defaultTemplate) {
      setTemplates(prev => prev.map(t => t.id === id ? { ...defaultTemplate } : t));
      if (selectedTemplateId === id) {
        if (contentLang === 'bn') {
          setCustomSubject(defaultTemplate.subjectBn);
          setCustomBody(defaultTemplate.bodyBn);
        } else {
          setCustomSubject(defaultTemplate.subject);
          setCustomBody(defaultTemplate.body);
        }
      }
    }
  };

  // Save current composer content as a new template in the library
  const handleSaveCurrentAsNewTemplate = () => {
    const newId = `custom_tpl_${Date.now()}`;
    const newTpl: B2BPitchTemplate = {
      id: newId,
      category: activeTemplate.category || 'operational',
      templateGroup: activeTemplate.templateGroup || 'client_operations',
      badge: 'Custom',
      title: `${activeTemplate.title} (Customized)`,
      titleBn: `${activeTemplate.titleBn} (কাস্টমাইজড)`,
      descriptionEn: 'Customized template saved directly from composer.',
      descriptionBn: 'কম্পোজার থেকে সরাসরি সংরক্ষিত কাস্টমাইজড টেমপ্লেট।',
      tags: ['Custom', 'User Created'],
      subject: contentLang === 'en' ? customSubject : activeTemplate.subject,
      subjectBn: contentLang === 'bn' ? customSubject : activeTemplate.subjectBn,
      body: contentLang === 'en' ? customBody : activeTemplate.body,
      bodyBn: contentLang === 'bn' ? customBody : activeTemplate.bodyBn,
      isCustom: true
    };

    setTemplates(prev => [newTpl, ...prev]);
    setSelectedTemplateId(newId);
    setSaveTemplateNotice(true);
    setTimeout(() => setSaveTemplateNotice(false), 2500);
  };

  // Re-sync current composer content from template original
  const handleRevertToTemplateDefaults = () => {
    if (activeTemplate) {
      if (contentLang === 'bn') {
        setCustomSubject(activeTemplate.subjectBn);
        setCustomBody(activeTemplate.bodyBn);
      } else {
        setCustomSubject(activeTemplate.subject);
        setCustomBody(activeTemplate.body);
      }
    }
  };

  // Helper to replace template variables with sample/actual partner data
  const renderResolvedVariables = (text: string, lead?: B2BPartnerLead) => {
    const compName = lead?.companyName || 'Al Barsha Amer Center';
    const contPerson = lead?.contactPerson || 'Mohammed Al-Hashimi';
    const client = lead?.contactPerson || 'Ali Raza';
    const refNo = 'GDRFA-2026-89412';
    const statusStr = 'Under Security Pre-Clearance';
    const vType = '30-Day Tourist Visa';
    const missingStr = '• High-resolution passport bio page scan\n• ICAO biometric white-background photo (35x45mm)';
    const expDate = '15-Nov-2026';
    const sendName = senderAgencyName || 'Visa Operations Desk';
    const agency = senderAgencyName || 'Dubai Visa AI Hub';
    const sendEmail = senderEmail || 'operations@dubai-visa-ai.app';

    return text
      .replace(/\{\{companyName\}\}/g, compName)
      .replace(/\{\{contactPerson\}\}/g, contPerson)
      .replace(/\{\{clientName\}\}/g, client)
      .replace(/\{\{appRef\}\}/g, refNo)
      .replace(/\{\{status\}\}/g, statusStr)
      .replace(/\{\{visaType\}\}/g, vType)
      .replace(/\{\{missingDocs\}\}/g, missingStr)
      .replace(/\{\{expiryDate\}\}/g, expDate)
      .replace(/\{\{senderName\}\}/g, sendName)
      .replace(/\{\{agencyName\}\}/g, agency)
      .replace(/\{\{senderEmail\}\}/g, sendEmail);
  };

  // Filtered Partners
  const filteredPartners = useMemo(() => {
    return partners.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch = searchQuery === '' || 
        p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.notes && p.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchRegion = true;
      if (regionFilter === 'uae') {
        matchRegion = p.country.toLowerCase().includes('emirates') || p.city.toLowerCase().includes('dubai') || p.city.toLowerCase().includes('abu dhabi') || p.city.toLowerCase().includes('sharjah');
      } else if (regionFilter === 'bangladesh') {
        matchRegion = p.country.toLowerCase().includes('bangladesh') || p.city.toLowerCase().includes('dhaka') || p.city.toLowerCase().includes('chittagong');
      } else if (regionFilter === 'international') {
        matchRegion = !p.country.toLowerCase().includes('emirates');
      }

      return matchCat && matchSearch && matchRegion;
    });
  }, [partners, activeCategory, searchQuery, regionFilter]);

  // Selection actions
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      filteredPartners.forEach(p => next.add(p.id));
      return next;
    });
  };

  const deselectAllFiltered = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      filteredPartners.forEach(p => next.delete(p.id));
      return next;
    });
  };

  // Selected partners list
  const selectedPartners = useMemo(() => {
    return partners.filter(p => selectedIds.has(p.id));
  }, [partners, selectedIds]);

  const selectedEmails = useMemo(() => {
    const list: string[] = [];
    selectedPartners.forEach(p => {
      if (p.email) list.push(p.email);
      if (p.secondaryEmail) list.push(p.secondaryEmail);
    });
    return Array.from(new Set(list));
  }, [selectedPartners]);

  // Update lead status
  const handleUpdateStatus = (id: string, status: B2BPartnerLead['status']) => {
    setPartners(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  // Add custom partner
  const handleAddCustomPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.companyName || !newPartner.email) return;

    const created: B2BPartnerLead = {
      id: `custom_${Date.now()}`,
      companyName: newPartner.companyName,
      category: newPartner.category || 'typing_center',
      contactPerson: newPartner.contactPerson || 'Business Lead',
      designation: newPartner.designation || 'Manager',
      email: newPartner.email,
      secondaryEmail: newPartner.secondaryEmail,
      phone: newPartner.phone,
      whatsapp: newPartner.whatsapp,
      city: newPartner.city || 'Dubai',
      country: newPartner.country || 'United Arab Emirates',
      estimatedVolume: newPartner.estimatedVolume || '300+ Visas/month',
      status: 'new',
      notes: newPartner.notes || 'Added manually by agency user',
      isCustom: true
    };

    setPartners(prev => [created, ...prev]);
    setSelectedIds(prev => new Set(prev).add(created.id));
    setIsAddModalOpen(false);
    setNewPartner({
      companyName: '',
      category: 'typing_center',
      contactPerson: '',
      designation: 'Managing Director',
      email: '',
      phone: '',
      city: 'Dubai',
      country: 'United Arab Emirates',
      estimatedVolume: '500+ Visas/month',
      status: 'new',
      notes: ''
    });
  };

  // Delete custom partner
  const handleDeletePartner = (id: string) => {
    setPartners(prev => prev.filter(p => p.id !== id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Export to CSV
  const handleExportCsv = () => {
    const rows = [
      ['Company Name', 'Category', 'Contact Person', 'Designation', 'Primary Email', 'Secondary Email', 'Phone', 'WhatsApp', 'City', 'Country', 'Est. Volume', 'Status', 'Notes'],
      ...filteredPartners.map(p => [
        `"${p.companyName.replace(/"/g, '""')}"`,
        p.category,
        `"${p.contactPerson.replace(/"/g, '""')}"`,
        `"${p.designation.replace(/"/g, '""')}"`,
        p.email,
        p.secondaryEmail || '',
        p.phone || '',
        p.whatsapp || '',
        `"${p.city.replace(/"/g, '""')}"`,
        `"${p.country.replace(/"/g, '""')}"`,
        `"${p.estimatedVolume.replace(/"/g, '""')}"`,
        p.status,
        `"${(p.notes || '').replace(/"/g, '""')}"`
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UAE_Visa_B2B_Partners_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy all emails
  const handleCopyAllEmails = () => {
    if (selectedEmails.length === 0) return;
    navigator.clipboard.writeText(selectedEmails.join(', '));
    setCopiedEmailNotice(true);
    setTimeout(() => setCopiedEmailNotice(false), 2500);
  };

  // Copy pitch body
  const handleCopyPitchBody = () => {
    const fullText = `Subject: ${customSubject}\n\n${customBody}`;
    navigator.clipboard.writeText(fullText);
    setCopiedBodyNotice(true);
    setTimeout(() => setCopiedBodyNotice(false), 2500);
  };

  // 1. One-Click Direct Gmail Web Compose Launcher
  const handleOpenGmailWeb = () => {
    if (selectedEmails.length === 0) return;

    // Use Gmail web composer URL format with BCC
    // mail.google.com/mail/?view=cm&fs=1&bcc=email1,email2&su=Subject&body=Body
    const bccParam = encodeURIComponent(selectedEmails.join(','));
    const suParam = encodeURIComponent(customSubject);
    const bodyParam = encodeURIComponent(customBody);

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&bcc=${bccParam}&su=${suParam}&body=${bodyParam}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');

    // Record campaign
    recordCampaign('gmail_web');

    // Mark selected as contacted
    markSelectedAsContacted();
  };

  // 2. Standard Mailto Launcher
  const handleOpenMailto = () => {
    if (selectedEmails.length === 0) return;
    const bccParam = encodeURIComponent(selectedEmails.join(','));
    const suParam = encodeURIComponent(customSubject);
    const bodyParam = encodeURIComponent(customBody);
    const mailtoUrl = `mailto:?bcc=${bccParam}&subject=${suParam}&body=${bodyParam}`;
    window.location.href = mailtoUrl;

    recordCampaign('mailto');
    markSelectedAsContacted();
  };

  // 3. Direct Server Dispatch via /api/send-b2b-bulk-email
  const handleDirectBulkSend = async () => {
    if (selectedEmails.length === 0) return;
    setIsDispatching(true);
    setDispatchProgress(15);
    setDispatchStatusMessage(`Initializing high-reliability dispatch to ${selectedEmails.length} partner inboxes...`);

    try {
      setDispatchProgress(45);
      const response = await fetch('/api/send-b2b-bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmails: selectedEmails,
          subject: customSubject,
          body: customBody,
          senderName: senderAgencyName,
          campaignName: activeTemplate.title
        })
      });

      const resData = await response.json();
      setDispatchProgress(90);

      if (!resData.success) {
        throw new Error(resData.error || 'Server bulk dispatch failed');
      }

      setDispatchProgress(100);
      setDispatchStatusMessage(`Successfully dispatched to ${resData.dispatchedCount} business partner inboxes!`);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

      recordCampaign('gmail_api');
      markSelectedAsContacted();

      setTimeout(() => {
        setIsDispatching(false);
        setIsComposerOpen(false);
      }, 1800);
    } catch (err: any) {
      console.error('Dispatch error:', err);
      setDispatchStatusMessage(`Note: ${err.message}. You can still use the 1-Click Gmail button directly.`);
      setIsDispatching(false);
    }
  };

  // Helper to mark selected leads as contacted
  const markSelectedAsContacted = () => {
    const nowIso = new Date().toISOString();
    setPartners(prev => prev.map(p => {
      if (selectedIds.has(p.id)) {
        return {
          ...p,
          status: p.status === 'new' ? 'contacted' : p.status,
          lastContactedAt: nowIso
        };
      }
      return p;
    }));
  };

  // Helper to record campaign history
  const recordCampaign = (method: B2BOutreachCampaign['dispatchMethod']) => {
    const campaign: B2BOutreachCampaign = {
      id: `camp_${Date.now()}`,
      name: activeTemplate.title,
      templateId: selectedTemplateId,
      subject: customSubject,
      body: customBody,
      recipientsCount: selectedEmails.length,
      recipientEmails: selectedEmails,
      sentAt: new Date().toISOString(),
      dispatchMethod: method,
      status: 'sent'
    };
    setCampaigns(prev => [campaign, ...prev].slice(0, 20));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Explanation: Who to contact for B2B SaaS */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/95 to-amber-950/20 border border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                B2B SaaS Business Engine & Gmail Outreach
              </span>
              <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30 text-xs font-semibold">
                {contentLang === 'bn' ? 'আমাদের অ্যাপ দিয়ে ব্যবসা করার গাইড' : 'B2B Partner Targeting & Acquisition'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {contentLang === 'bn' 
                ? 'আমাদের অ্যাপ দিয়ে ব্যবসা করতে কাদের কাদের জিমেইল পাঠাবেন?' 
                : 'Who Needs to Receive Emails to Do Business with Our SaaS?'}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              {contentLang === 'bn'
                ? 'আমাদের দুবাই ও ইউএই ভিসা এআই হাব একটি উচ্চমূল্যের বিটুবি প্ল্যাটফর্ম। টাইপিং সেন্টার, ট্রাভেল এজেন্সি, ম্যানপাওয়ার রিক্রুটার এবং করপোরেট পিআরও ফার্মগুলোর প্রতিদিন শত শত ভিসা প্রসেসিংয়ে পাসপোর্ট রিজেকশন ও ৩৫০+ দিরহাম ফি লোকসান রোধ করে। নিচে এদের প্রস্তুত ইমেইল লিস্ট ও ১-ক্লিকে বাল্ক জিমেইল পাঠানোর সুবিধা যুক্ত রয়েছে।'
                : 'Our UAE Visa AI Hub is an enterprise-grade B2B SaaS. Typing centers, travel agencies, recruitment firms, and corporate PROs process thousands of visas monthly—every rejected file costs them AED 350+ in non-refundable government fees. Use this built-in directory to reach verified decision makers with tailored high-conversion SaaS pitches in one click via Gmail.'}
            </p>
          </div>

          {/* Dual Language & Fast Action Pills */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 px-2 font-medium">Pitch Language:</span>
              <button
                type="button"
                onClick={() => setContentLang('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  contentLang === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setContentLang('bn')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  contentLang === 'bn'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                বাংলা
              </button>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>{contentLang === 'bn' ? 'নতুন পার্টনার / লিড যুক্ত করুন' : 'Add Custom Partner / Lead'}</span>
            </button>
          </div>
        </div>

        {/* 5 Core B2B Target Categories: "কাদের কাদের জিমেইল পাঠানো দরকার" */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          {B2B_CATEGORIES.map((cat) => {
            const count = partners.filter(p => p.category === cat.category).length;
            const isSelected = activeCategory === cat.category;
            return (
              <div
                key={cat.category}
                onClick={() => setActiveCategory(isSelected ? 'all' : cat.category)}
                className={`group p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${cat.badgeColor}`}>
                    {cat.nameEn.split(' ')[0]}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {count} Leads
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                  {contentLang === 'bn' ? cat.nameBn : cat.nameEn}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {contentLang === 'bn' ? cat.whyContactBn : cat.whyContactEn}
                </p>
                <div className="mt-2 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">{cat.saasValueProposition}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Bar: Search, Filters, Selection Counters, Compose Trigger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={contentLang === 'bn' ? 'কোম্পানির নাম, শহর বা ইমেইল খুঁজুন...' : 'Search company, city, email or contact...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setRegionFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                regionFilter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Regions
            </button>
            <button
              onClick={() => setRegionFilter('uae')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                regionFilter === 'uae' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇦🇪 UAE
            </button>
            <button
              onClick={() => setRegionFilter('bangladesh')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                regionFilter === 'bangladesh' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇧🇩 Bangladesh
            </button>
          </div>

          {/* Export to CSV */}
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download full partner lead list as CSV"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">CSV Export</span>
          </button>

          {/* Email Template Library Button */}
          <button
            onClick={() => setIsTemplateLibraryOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-500 text-amber-300 hover:text-amber-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Browse, edit and manage email templates"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>{contentLang === 'bn' ? 'টেমপ্লেট লাইব্রেরি' : 'Template Library'}</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full font-mono font-bold">
              {templates.length}
            </span>
          </button>
        </div>

        {/* Selection Stats & Big Compose Button */}
        <div className="flex items-center gap-2.5 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
          <div className="text-right">
            <div className="text-xs font-bold text-white">
              <span className="text-amber-400 font-mono">{selectedIds.size}</span> of {filteredPartners.length} Selected
            </div>
            <div className="text-[10px] text-slate-400">
              {selectedEmails.length} inboxes ready
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {selectedIds.size < filteredPartners.length ? (
              <button
                onClick={selectAllFiltered}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Select All
              </button>
            ) : (
              <button
                onClick={deselectAllFiltered}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}

            <button
              onClick={() => setIsComposerOpen(true)}
              disabled={selectedIds.size === 0}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                selectedIds.size > 0
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>{contentLang === 'bn' ? `জিমেইল পাঠান (${selectedIds.size})` : `Send Gmail Pitch (${selectedIds.size})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPartners.map((partner) => {
          const isSelected = selectedIds.has(partner.id);
          const catMeta = B2B_CATEGORIES.find(c => c.category === partner.category);

          return (
            <div
              key={partner.id}
              className={`relative rounded-2xl border p-4 transition-all ${
                isSelected
                  ? 'bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header: Checkbox, Name, Category Pill */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(partner.id)}
                    className="mt-1 w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900 cursor-pointer"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 leading-snug">
                      {partner.companyName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{partner.city}, {partner.country}</span>
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${catMeta?.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                  {partner.category.replace('_', ' ')}
                </span>
              </div>

              {/* Contact Person & Contact Inboxes */}
              <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 font-medium">Decision Maker:</span>
                  <span className="font-semibold text-white">{partner.contactPerson} ({partner.designation})</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 font-medium">Primary Gmail:</span>
                  <a 
                    href={`mailto:${partner.email}`}
                    className="font-mono text-amber-400 hover:text-amber-300 hover:underline truncate max-w-[190px]"
                    title={partner.email}
                  >
                    {partner.email}
                  </a>
                </div>

                {partner.secondaryEmail && (
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="text-slate-500 font-medium">Alt Email:</span>
                    <span className="font-mono text-slate-400 truncate max-w-[190px]">{partner.secondaryEmail}</span>
                  </div>
                )}

                {partner.phone && (
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="text-slate-500 font-medium">Phone / WhatsApp:</span>
                    <span className="font-mono text-slate-300">{partner.phone}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-300 pt-1">
                  <span className="text-slate-400 font-medium">Monthly Visa Est:</span>
                  <span className="text-emerald-400 font-bold font-mono text-[11px]">{partner.estimatedVolume}</span>
                </div>
              </div>

              {/* Notes & Business Rationale */}
              {partner.notes && (
                <div className="mt-3 p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                  💡 <span className="text-slate-300 font-medium">SaaS Synergy:</span> {partner.notes}
                </div>
              )}

              {/* Card Footer: Status Pill & Quick Individual Gmail Launch */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-medium">Status:</span>
                  <select
                    value={partner.status}
                    onChange={(e) => handleUpdateStatus(partner.id, e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 text-[11px] rounded-lg px-2 py-0.5 text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="new">🆕 New Lead</option>
                    <option value="contacted">✉️ Email Sent</option>
                    <option value="negotiating">💬 Negotiating</option>
                    <option value="partner_signed">🤝 Partner Signed</option>
                    <option value="follow_up">⏰ Follow Up</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  {partner.isCustom && (
                    <button
                      onClick={() => handleDeletePartner(partner.id)}
                      className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                      title="Delete custom partner lead"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIds(new Set([partner.id]));
                      setIsComposerOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                    title="Select template & compose email for this partner"
                  >
                    <Mail className="w-3 h-3 text-amber-400" />
                    <span>Gmail</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPartners.length === 0 && (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No partner leads matched your filters</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting your search query or selecting "All Regions".</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('all'); setRegionFilter('all'); }}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BULK GMAIL COMPOSER DRAWER / MODAL */}
      {/* ========================================================================= */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{contentLang === 'bn' ? 'বিটুবি বাল্ক জিমেইল ক্যাম্পেইন ডিসপ্যাচার' : 'B2B Bulk Gmail Campaign Dispatcher'}</span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                      {selectedEmails.length} Inboxes
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {contentLang === 'bn' 
                      ? 'নির্বাচিত পার্টনারদের জন্য উচ্চ-রূপান্তরকারী SaaS পিচ কাস্টমাইজ ও প্রেরণ করুন' 
                      : 'Customize & dispatch high-converting SaaS partnership pitches to selected inboxes'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsComposerOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Recipients Pill Box */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    Target Recipients ({selectedEmails.length} emails across {selectedPartners.length} partners):
                  </span>
                  <button
                    onClick={handleCopyAllEmails}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {copiedEmailNotice ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEmailNotice ? 'Copied to Clipboard!' : 'Copy All Emails (BCC Ready)'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
                  {selectedPartners.map(p => (
                    <span
                      key={p.id}
                      className="text-[11px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-lg flex items-center gap-1.5"
                    >
                      <span className="font-semibold text-white truncate max-w-[120px]">{p.companyName}</span>
                      <span className="text-slate-500 font-mono text-[10px]">({p.email})</span>
                      <button
                        onClick={() => toggleSelect(p.id)}
                        className="text-slate-500 hover:text-red-400 ml-0.5"
                        title="Remove recipient"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Template Selector & Controls */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-8 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Email Template:</span>
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">
                        {templates.length} templates available
                      </span>
                    </label>
                    <div className="flex gap-1.5">
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-medium cursor-pointer"
                      >
                        <optgroup label="📋 Client Operations & Tracking">
                          {templates
                            .filter(t => t.templateGroup === 'client_operations')
                            .map(t => (
                              <option key={t.id} value={t.id}>
                                [{t.badge}] {contentLang === 'bn' ? t.titleBn : t.title}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="💡 General Inquiries">
                          {templates
                            .filter(t => t.templateGroup === 'general_inquiry')
                            .map(t => (
                              <option key={t.id} value={t.id}>
                                [{t.badge}] {contentLang === 'bn' ? t.titleBn : t.title}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="🤝 B2B SaaS Pitches">
                          {templates
                            .filter(t => t.templateGroup === 'b2b_pitch' || (!t.templateGroup && !t.isCustom))
                            .map(t => (
                              <option key={t.id} value={t.id}>
                                [{t.badge}] {contentLang === 'bn' ? t.titleBn : t.title}
                              </option>
                            ))}
                        </optgroup>
                        {templates.some(t => t.isCustom) && (
                          <optgroup label="⭐ Custom Saved Templates">
                            {templates
                              .filter(t => t.isCustom)
                              .map(t => (
                                <option key={t.id} value={t.id}>
                                  [{t.badge}] {contentLang === 'bn' ? t.titleBn : t.title}
                                </option>
                              ))}
                          </optgroup>
                        )}
                      </select>

                      <button
                        type="button"
                        onClick={() => setIsTemplateLibraryOpen(true)}
                        className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                        title="Open full Template Library with search, preview & editor"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden md:inline">Browse Library</span>
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-4 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Content Language:
                    </label>
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setContentLang('en')}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          contentLang === 'en' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        🇬🇧 English
                      </button>
                      <button
                        type="button"
                        onClick={() => setContentLang('bn')}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          contentLang === 'bn' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        🇧🇩 বাংলা
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-toolbar: Template tools & dynamic variable chips */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleRevertToTemplateDefaults}
                      className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                      title="Revert subject and body back to active template defaults"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-400" />
                      <span>Revert Defaults</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveCurrentAsNewTemplate}
                      className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                      title="Save your current message edits as a new custom template in your library"
                    >
                      <Save className="w-3 h-3 text-amber-400" />
                      <span>Save as New Template</span>
                    </button>

                    {saveTemplateNotice && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-in fade-in">
                        ✓ Saved to Library!
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewWithData(!previewWithData)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                        previewWithData 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <Eye className="w-3 h-3 text-amber-400" />
                      <span>{previewWithData ? 'Edit Raw Mode' : 'Live Data Preview'}</span>
                    </button>
                  </div>
                </div>

                {/* Variable insertion chips bar */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2 space-y-1.5">
                  <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                    <span>Click to insert dynamic variable tag into message:</span>
                    <span className="text-[10px] text-slate-500 font-mono">Auto-replaces at dispatch</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {TEMPLATE_VARIABLES.map(v => (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => setCustomBody(prev => `${prev} ${v.key} `)}
                        className="px-2 py-0.5 bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 rounded text-[10px] font-mono transition-all cursor-pointer"
                        title={`${contentLang === 'bn' ? v.labelBn : v.labelEn} (e.g. ${v.example})`}
                      >
                        {v.key}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Sender Organization Name:</label>
                  <input
                    type="text"
                    value={senderAgencyName}
                    onChange={(e) => setSenderAgencyName(e.target.value)}
                    placeholder="Your Agency Name / Dubai Visa AI Hub"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Your Reply Email / Gmail:</label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="youremail@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Subject Line & Body (Editable OR Live Data Preview) */}
              {previewWithData ? (
                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-amber-500/30">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      Live Data Preview (Example Recipient: {selectedPartners[0]?.companyName || 'Al Barsha Amer Center'})
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewWithData(false)}
                      className="text-slate-400 hover:text-white underline text-[11px]"
                    >
                      Switch back to editor
                    </button>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400">Resolved Subject:</span>
                    <div className="p-2.5 bg-slate-900 rounded-lg text-xs font-semibold text-white border border-slate-800">
                      {renderResolvedVariables(customSubject, selectedPartners[0])}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400">Resolved Message Body:</span>
                    <div className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-slate-200 whitespace-pre-wrap border border-slate-800 leading-relaxed max-h-72 overflow-y-auto">
                      {renderResolvedVariables(customBody, selectedPartners[0])}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Subject Line */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-300">Email Subject Line:</label>
                      <span className="text-[10px] text-slate-500">{customSubject.length} characters</span>
                    </div>
                    <input
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Email Body */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-300">Message Body (Fully Editable):</label>
                      <button
                        type="button"
                        onClick={handleCopyPitchBody}
                        className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        {copiedBodyNotice ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedBodyNotice ? 'Copied!' : 'Copy Pitch Text'}</span>
                      </button>
                    </div>
                    <textarea
                      rows={10}
                      value={customBody}
                      onChange={(e) => setCustomBody(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-amber-500 resize-y"
                    />
                  </div>
                </>
              )}

              {/* Live Dispatch Progress Bar if Active */}
              {isDispatching && (
                <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/40 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-amber-400 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {dispatchStatusMessage}
                    </span>
                    <span className="font-mono text-white">{dispatchProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${dispatchProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer: Action Buttons (1-Click Gmail Web vs Direct API vs Mailto) */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>All {selectedEmails.length} partner emails are safely BCC-protected so recipient addresses stay private.</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Mailto */}
                <button
                  type="button"
                  onClick={handleOpenMailto}
                  disabled={isDispatching || selectedEmails.length === 0}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                  title="Open Default Desktop Mail Client (Outlook / Apple Mail)"
                >
                  Mailto App
                </button>

                {/* Direct High-Speed API Dispatch */}
                <button
                  type="button"
                  onClick={handleDirectBulkSend}
                  disabled={isDispatching || selectedEmails.length === 0}
                  className="px-3.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Direct server dispatch with real-time delivery receipt"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Direct Cloud Dispatch</span>
                </button>

                {/* Primary 1-Click Gmail Web Composer */}
                <button
                  type="button"
                  onClick={handleOpenGmailWeb}
                  disabled={isDispatching || selectedEmails.length === 0}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25"
                  title="Opens mail.google.com with all recipients, subject & body pre-filled"
                >
                  <Mail className="w-4 h-4" />
                  <span>1-Click Launch in Gmail Web</span>
                  <ExternalLink className="w-3 h-3 opacity-75" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD CUSTOM PARTNER LEAD MODAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>{contentLang === 'bn' ? 'নতুন পার্টনার বা বিজনেস লিড যুক্ত করুন' : 'Add New B2B Partner Lead'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomPartner} className="p-5 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Company / Agency Name *</label>
                <input
                  type="text"
                  required
                  value={newPartner.companyName}
                  onChange={(e) => setNewPartner({ ...newPartner, companyName: e.target.value })}
                  placeholder="e.g. Al Safa Typing Center or Padma Travel Dhaka"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Target Category *</label>
                  <select
                    value={newPartner.category}
                    onChange={(e) => setNewPartner({ ...newPartner, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="typing_center">Typing & Amer Center</option>
                    <option value="travel_agency">Travel & Tourism Agency</option>
                    <option value="manpower_recruitment">Manpower & Recruitment</option>
                    <option value="corporate_pro">Corporate PRO & Setup</option>
                    <option value="golden_visa">Golden Visa Consultancy</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Contact Person</label>
                  <input
                    type="text"
                    value={newPartner.contactPerson}
                    onChange={(e) => setNewPartner({ ...newPartner, contactPerson: e.target.value })}
                    placeholder="Managing Director / PRO"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Primary Gmail / Email *</label>
                  <input
                    type="email"
                    required
                    value={newPartner.email}
                    onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                    placeholder="partner@company.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={newPartner.phone}
                    onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                    placeholder="+971 50 ... or +880 17 ..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">City</label>
                  <input
                    type="text"
                    value={newPartner.city}
                    onChange={(e) => setNewPartner({ ...newPartner, city: e.target.value })}
                    placeholder="Dubai / Dhaka / Chittagong"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Country</label>
                  <input
                    type="text"
                    value={newPartner.country}
                    onChange={(e) => setNewPartner({ ...newPartner, country: e.target.value })}
                    placeholder="United Arab Emirates"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Notes & Partnership Goal</label>
                <textarea
                  rows={2}
                  value={newPartner.notes}
                  onChange={(e) => setNewPartner({ ...newPartner, notes: e.target.value })}
                  placeholder="Target for batch passport OCR or 30-day tourist visa automation..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all cursor-pointer shadow-md shadow-amber-500/20"
                >
                  Save Partner Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Activity History Log */}
      {campaigns.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Recent B2B Outreach Campaigns ({campaigns.length})</span>
            </h4>
            <span className="text-[11px] text-slate-500">Persisted in local history</span>
          </div>

          <div className="space-y-2">
            {campaigns.slice(0, 5).map(c => (
              <div key={c.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{c.name}</div>
                  <div className="text-[11px] text-slate-400 truncate max-w-md">Subject: {c.subject}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold text-[10px]">
                    {c.recipientsCount} Sent ({c.dispatchMethod})
                  </span>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    {new Date(c.sentAt).toLocaleDateString()} {new Date(c.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Template Library Modal */}
      <B2BTemplateLibraryModal
        isOpen={isTemplateLibraryOpen}
        onClose={() => setIsTemplateLibraryOpen(false)}
        templates={templates}
        activeTemplateId={selectedTemplateId}
        onSelectTemplate={(tpl) => {
          setSelectedTemplateId(tpl.id);
          setIsTemplateLibraryOpen(false);
          setIsComposerOpen(true);
        }}
        onSaveTemplate={handleSaveTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onResetTemplate={handleResetTemplate}
        contentLang={contentLang}
      />
    </div>
  );
};
