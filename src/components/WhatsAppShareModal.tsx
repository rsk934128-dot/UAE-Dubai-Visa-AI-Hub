import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Copy,
  Check,
  User,
  Phone,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  FileText,
  Scan,
  MessageSquare,
  Globe,
  Edit3,
  RotateCcw,
  ShieldCheck,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  WhatsAppAuditPayload,
  WhatsAppStatusTemplateId,
  WHATSAPP_STATUS_TEMPLATES,
  generateWhatsAppStatusUpdateMessage,
  createWhatsAppShareUrl,
  sanitizeWhatsAppPhone,
  getPhoneCountryLabel,
  getRecommendedTemplateForStatus
} from '../utils/whatsappUtils';
import { useLanguage } from '../context/LanguageContext';
import { ApplicationAuditEvent } from '../types';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: WhatsAppAuditPayload | null;
  initialTemplateId?: WhatsAppStatusTemplateId;
  onLogAuditTrail?: (event: Partial<ApplicationAuditEvent>) => void;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  payload,
  initialTemplateId,
  onLogAuditTrail
}) => {
  const { language: appLanguage } = useLanguage();
  
  // Message configuration state
  const [selectedTemplateId, setSelectedTemplateId] = useState<WhatsAppStatusTemplateId>('approved');
  const [messageLanguage, setMessageLanguage] = useState<'en' | 'ar' | 'bn'>('en');
  const [phoneNumber, setPhoneNumber] = useState(payload?.recipientPhone || '');
  const [customNotes, setCustomNotes] = useState('');
  const [isManualEditing, setIsManualEditing] = useState(false);
  const [manualText, setManualText] = useState('');
  const [copied, setCopied] = useState(false);
  const [logToAuditTrail, setLogToAuditTrail] = useState(true);
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  // Sync initial state when payload or initialTemplateId opens
  useEffect(() => {
    if (payload) {
      setPhoneNumber(payload.recipientPhone || '');
      const rec = initialTemplateId || getRecommendedTemplateForStatus(payload.statusText);
      setSelectedTemplateId(rec);
      setCustomNotes(payload.notes || '');
      setIsManualEditing(false);
      setDispatchedSuccess(false);
      
      // Auto-set language preference: Arabic if app is in AR, or default English
      if (appLanguage === 'ar') {
        setMessageLanguage('ar');
      } else if (payload.nationality?.toLowerCase().includes('bangla')) {
        setMessageLanguage('bn');
      } else {
        setMessageLanguage('en');
      }
    }
  }, [payload, initialTemplateId, appLanguage]);

  if (!isOpen || !payload) return null;

  const currentPayload: WhatsAppAuditPayload = {
    ...payload,
    recipientPhone: phoneNumber,
    notes: customNotes || payload.notes
  };

  const generatedText = generateWhatsAppStatusUpdateMessage(
    currentPayload,
    selectedTemplateId,
    messageLanguage,
    customNotes
  );

  const activeMessageText = isManualEditing ? manualText : generatedText;

  const countryLabel = getPhoneCountryLabel(phoneNumber);
  const sanitizedPhone = sanitizeWhatsAppPhone(phoneNumber);

  const handleTemplateChange = (templateId: WhatsAppStatusTemplateId) => {
    setSelectedTemplateId(templateId);
    if (isManualEditing) {
      setIsManualEditing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeMessageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  const handleOpenWhatsApp = () => {
    // Generate URL with current active message and phone
    const encoded = encodeURIComponent(activeMessageText);
    const url = sanitizedPhone
      ? `https://api.whatsapp.com/send?phone=${sanitizedPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    // Trigger visual confetti
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {
      // ignore
    }

    // Log to Audit Trail if requested
    if (logToAuditTrail && onLogAuditTrail) {
      const templateMeta = WHATSAPP_STATUS_TEMPLATES.find(t => t.id === selectedTemplateId);
      onLogAuditTrail({
        type: 'whatsapp_alert',
        title: `WhatsApp Status Alert: ${templateMeta?.nameEn || selectedTemplateId}`,
        titleBn: `হোয়াটসঅ্যাপ স্ট্যাটাস নোটিশ: ${templateMeta?.nameBn || selectedTemplateId}`,
        actor: payload.agentName || 'Agency Visa Desk',
        details: {
          recipientPhone: sanitizedPhone || phoneNumber,
          whatsappTemplate: selectedTemplateId,
          whatsappMessagePreview: activeMessageText.slice(0, 300) + '...',
          deliveryStatus: 'Sent via WhatsApp',
          notes: customNotes || undefined
        }
      });
    }

    setDispatchedSuccess(true);
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 150);
  };

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'CheckCircle2': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Clock': return <Clock className="w-3.5 h-3.5 text-sky-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />;
      case 'AlertTriangle': return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      case 'Building': return <Building className="w-3.5 h-3.5 text-purple-400" />;
      case 'FileText': return <FileText className="w-3.5 h-3.5 text-blue-400" />;
      case 'Scan': return <Scan className="w-3.5 h-3.5 text-emerald-400" />;
      default: return <MessageSquare className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-2xl w-full p-4 sm:p-5 shadow-2xl space-y-4 max-h-[94vh] overflow-y-auto custom-scrollbar flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
              <MessageCircle className="w-5 h-5 fill-emerald-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Send WhatsApp Visa Status Update</span>
                </h3>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                  Direct Dispatch
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated multi-language status templates dispatched directly to client's phone
              </p>
            </div>
          </div>

          <button
            id="btn-close-whatsapp-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Applicant Summary Pill */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-300 font-bold flex items-center justify-center text-xs border border-amber-500/20">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{payload.applicantName}</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono border border-slate-700">
                  {payload.nationality}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Passport: <strong className="font-mono text-slate-200">{payload.passportNumber}</strong></span>
                <span>•</span>
                <span>Ref: <strong className="font-mono text-amber-400">{payload.referenceId || 'N/A'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
              payload.statusText === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
              payload.statusText === 'Audited - Passed' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
              payload.statusText === 'Audited - Flagged' ? 'bg-rose-950 text-rose-300 border-rose-800' :
              'bg-sky-950 text-sky-300 border-sky-800'
            }`}>
              Status: {payload.statusText || 'In Process'}
            </span>
            <span className="text-[11px] font-mono bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700">
              OCR: {payload.auditScore}/100
            </span>
          </div>
        </div>

        {/* 1. Template Chooser */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Select Automated Visa Status Template:</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Auto-matched to: <strong className="text-emerald-400">{payload.statusText || 'Current'}</strong>
            </span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {WHATSAPP_STATUS_TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplateId === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleTemplateChange(tmpl.id)}
                  className={`p-2 rounded-xl text-left transition-all border flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/70 border-emerald-500/80 text-white shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="p-1 rounded-md bg-slate-900 border border-slate-800">
                      {getTemplateIcon(tmpl.iconName)}
                    </span>
                    <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-semibold ${
                      isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-500'
                    }`}>
                      {tmpl.badge}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold line-clamp-1 leading-tight text-slate-200">
                    {tmpl.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Recipient Phone & Language Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Phone Number Input */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Client WhatsApp Phone Number:</span>
              </span>
              {countryLabel && (
                <span className="text-[10px] text-emerald-400 font-mono font-medium">
                  {countryLabel}
                </span>
              )}
            </label>

            <div className="relative">
              <input
                id="whatsapp-client-phone-input"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +971501234567 or 01712345678"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <span className="absolute right-2.5 top-2 text-[10px] text-slate-500 font-mono">
                {sanitizedPhone ? `Send to: ${sanitizedPhone}` : 'No phone specified'}
              </span>
            </div>
          </div>

          {/* Language Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>Message Language:</span>
            </label>

            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMessageLanguage('en');
                  setIsManualEditing(false);
                }}
                className={`py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  messageLanguage === 'en'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇬🇧 EN
              </button>
              <button
                type="button"
                onClick={() => {
                  setMessageLanguage('ar');
                  setIsManualEditing(false);
                }}
                className={`py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  messageLanguage === 'ar'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇦🇪 العربية
              </button>
              <button
                type="button"
                onClick={() => {
                  setMessageLanguage('bn');
                  setIsManualEditing(false);
                }}
                className={`py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  messageLanguage === 'bn'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇧🇩 বাংলা
              </button>
            </div>
          </div>
        </div>

        {/* 3. Optional Custom Remarks / Action Items */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Edit3 className="w-3 h-3 text-amber-400" />
              <span>Officer Remarks / Tracking Notes (Injected into template):</span>
            </span>
            <button
              type="button"
              onClick={() => {
                if (!isManualEditing) {
                  setManualText(generatedText);
                  setIsManualEditing(true);
                } else {
                  setIsManualEditing(false);
                }
              }}
              className="text-[11px] text-sky-400 hover:text-sky-300 underline cursor-pointer"
            >
              {isManualEditing ? 'Reset to Auto-Generator' : 'Direct Full-Text Edit'}
            </button>
          </div>
          
          {!isManualEditing ? (
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Please bring original degree for verification; Flight boarding on 28th Oct"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
            />
          ) : (
            <div className="space-y-1">
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                rows={6}
                className="w-full bg-slate-950 border border-sky-500/40 rounded-xl p-3 text-xs font-mono text-emerald-200 focus:outline-none focus:border-sky-500 leading-relaxed custom-scrollbar"
              />
              <span className="text-[10px] text-sky-400 block font-mono">
                Manual Edit Mode Active: Any custom changes here will be sent directly via WhatsApp.
              </span>
            </div>
          )}
        </div>

        {/* 4. Live WhatsApp Message Preview Bubble */}
        {!isManualEditing && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">Live WhatsApp Chat Preview</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  {activeMessageText.length} characters
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px] cursor-pointer font-medium"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Text'}</span>
              </button>
            </div>

            {/* WhatsApp Phone Mockup Bubble */}
            <div className="bg-[#0b141a] border border-slate-800 rounded-xl p-3.5 relative overflow-hidden shadow-inner">
              <div className="bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-xs p-3 text-xs font-sans whitespace-pre-wrap select-all leading-relaxed shadow-sm max-h-48 overflow-y-auto custom-scrollbar">
                {activeMessageText}
                <div className="text-[10px] text-emerald-200/70 text-right mt-1.5 flex items-center justify-end gap-1 font-mono">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <Check className="w-3 h-3 text-sky-400 stroke-[3]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Audit Trail Compliance Toggle */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={logToAuditTrail}
              onChange={(e) => setLogToAuditTrail(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4"
            />
            <span>
              Log dispatch event to application's official compliance audit history
            </span>
          </label>
          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
            Event: whatsapp_alert
          </span>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              id="btn-dispatch-whatsapp-direct"
              type="button"
              onClick={handleOpenWhatsApp}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>Share via WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
