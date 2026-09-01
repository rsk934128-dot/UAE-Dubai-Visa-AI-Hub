import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  Printer, 
  X, 
  FolderLock, 
  FileText, 
  ShieldCheck, 
  Smartphone, 
  Sparkles,
  Globe2,
  Mail,
  MessageCircle,
  Clock
} from 'lucide-react';
import { VisaApplication } from '../types';
import { formatDate } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

interface ApplicationQrCodeModalProps {
  application: VisaApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDocumentFolder?: (app: VisaApplication) => void;
  onOpenDossier?: (app: VisaApplication) => void;
}

type QrTarget = 'documents' | 'dossier' | 'tracking';

export const ApplicationQrCodeModal: React.FC<ApplicationQrCodeModalProps> = ({
  application,
  isOpen,
  onClose,
  onOpenDocumentFolder,
  onOpenDossier
}) => {
  const { language } = useLanguage();
  const [qrTarget, setQrTarget] = useState<QrTarget>('documents');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [qrColor, setQrColor] = useState<'slate' | 'amber' | 'classic'>('slate');
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !application) return null;

  // Build target destination URL based on selected mode
  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://uaevisa.app';

  const getTargetUrl = (target: QrTarget) => {
    switch (target) {
      case 'documents':
        return `${baseUrl}?tab=agency-crm&appId=${encodeURIComponent(application.id)}&action=documents`;
      case 'dossier':
        return `${baseUrl}?tab=agency-crm&appId=${encodeURIComponent(application.id)}&action=dossier`;
      case 'tracking':
        return `${baseUrl}?tab=tracking-portal&ref=${encodeURIComponent(application.id)}&passport=${encodeURIComponent(application.passportNumber)}`;
      default:
        return `${baseUrl}?tab=agency-crm&appId=${encodeURIComponent(application.id)}`;
    }
  };

  const activeUrl = getTargetUrl(qrTarget);

  // Generate QR Code data URL using qrcode library
  useEffect(() => {
    const darkColor = qrColor === 'amber' ? '#f59e0b' : qrColor === 'classic' ? '#000000' : '#0f172a';
    QRCode.toDataURL(activeUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: darkColor,
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
      });
  }, [activeUrl, qrColor, application.id]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_${application.id}_${application.applicantName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintLabel = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🇦🇪 UAE Visa Dossier Access for ${application.applicantName}\nFile Ref: ${application.id}\nPassport: ${application.passportNumber}\n\nScan QR or access directly:\n${activeUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        id="modal-application-qr-generator"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  {language === 'ar' ? 'مولد رمز الاستجابة السريعة للطلب' : 'Application QR Code Generator'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                  {application.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'ar' 
                  ? 'رمز قابل للمسح بالجوال للوصول المباشر إلى ملف المستندات الرقمية أو صفحة الحالة' 
                  : "Scannable mobile QR linking directly to applicant's digital document folder or status"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Target Destination Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'ar' ? 'حدد وجهة الرابط المشفر في الرمز:' : 'Select QR Scan Destination (What opens on mobile scan):'}</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setQrTarget('documents')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  qrTarget === 'documents'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <FolderLock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Digital Doc Folder</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  পাসপোর্ট স্ক্যান, অডিট হিস্ট্রি ও অ্যাটাচমেন্ট ফোল্ডার
                </p>
              </button>

              <button
                type="button"
                onClick={() => setQrTarget('dossier')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  qrTarget === 'dossier'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Dossier &amp; Status</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  আবেদনের বর্তমান স্ট্যাটাস ও সার্বিক তথ্যের লাইভ পেজ
                </p>
              </button>

              <button
                type="button"
                onClick={() => setQrTarget('tracking')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  qrTarget === 'tracking'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>GDRFA/ICP Portal</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  অফিসিয়াল ট্র্যাকিং ও ইমিগ্রেশন ক্লিয়ারেন্স ভিউ
                </p>
              </button>
            </div>
          </div>

          {/* Printable Docket Card Preview & QR Code Display */}
          <div 
            ref={printAreaRef}
            className="bg-white text-slate-900 rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-200 space-y-4"
          >
            {/* Docket Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                  UAE &amp; Dubai Visa AI Hub • Agency CRM
                </span>
                <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                  {application.applicantName}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 font-mono">
                  <span>Passport: <strong>{application.passportNumber}</strong></span>
                  <span>•</span>
                  <span>{application.nationality}</span>
                </div>
              </div>

              {/* Status Badge on Printable Card */}
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block">File Reference</span>
                <span className="font-mono font-bold text-amber-600 text-xs block">{application.id}</span>
                <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  application.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                  application.status === 'Audited - Passed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' :
                  application.status === 'Audited - Flagged' ? 'bg-red-100 text-red-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {application.status}
                </span>
              </div>
            </div>

            {/* QR Code and Meta Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* QR Image Box */}
              <div className="relative p-2 bg-slate-50 rounded-xl border border-slate-200 shrink-0 flex items-center justify-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR code for ${application.applicantName}`}
                    className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded"
                  />
                ) : (
                  <div className="w-36 h-36 flex items-center justify-center text-slate-400 text-xs">
                    Generating QR...
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                  <QrCode className="w-16 h-16 text-slate-900" />
                </div>
              </div>

              {/* Details and Instructions */}
              <div className="space-y-2 text-xs text-slate-600 flex-1">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    {qrTarget === 'documents' ? '📁 ডিজিটাল ডকুমেন্ট ফোল্ডার লিংক' :
                     qrTarget === 'dossier' ? '📑 লাইভ ডসিয়ার স্ট্যাটাস লিংক' : '🌐 অফিসিয়াল ইমিগ্রেশন পোর্টাল'}
                  </span>
                  <p className="text-xs text-slate-800 font-medium">
                    যেকোনো স্মার্টফোনের ক্যামেরা বা কিউআর স্ক্যানার দিয়ে স্ক্যান করলে তাৎক্ষণিক এই ক্লায়েন্টের {qrTarget === 'documents' ? 'সকল অডিট ডকুমেন্ট ফোল্ডার' : 'ভিসা স্ট্যাটাস পেইজ'} ওপেন হবে।
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Requested Visa</span>
                    <span className="font-semibold text-slate-800 truncate block">{application.visaType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Processing Agent</span>
                    <span className="font-semibold text-slate-800 block">{application.assignedAgent || 'Agency Desk'}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  Last Updated: {formatDate(application.updatedAt)}
                </div>
              </div>
            </div>

            {/* Encoded URL Bar */}
            <div className="bg-slate-100 p-2 rounded-lg border border-slate-200 flex items-center justify-between gap-2 text-[11px] font-mono text-slate-700">
              <span className="truncate">{activeUrl}</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 p-1 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Copy URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Action Buttons Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <button
              id="btn-download-qr-png"
              type="button"
              onClick={handleDownloadPng}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>

            <button
              id="btn-copy-qr-link"
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              id="btn-share-whatsapp-qr"
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </button>

            <button
              id="btn-print-qr-label"
              type="button"
              onClick={handlePrintLabel}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>Print Label</span>
            </button>
          </div>

          {/* Quick Direct In-App Test Jump */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              অ্যাপের ভেতরে সরাসরি এই ফোল্ডার পরীক্ষা করতে চান?
            </span>
            <div className="flex items-center gap-2">
              {onOpenDocumentFolder && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDocumentFolder(application);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 cursor-pointer text-xs font-medium flex items-center gap-1"
                >
                  <FolderLock className="w-3 h-3 text-amber-400" />
                  <span>Open Folder</span>
                </button>
              )}
              {onOpenDossier && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDossier(application);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 cursor-pointer text-xs font-medium flex items-center gap-1"
                >
                  <FileText className="w-3 h-3 text-sky-400" />
                  <span>Open Dossier</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Direct Mobile Access Protocol • High Error Correction
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
