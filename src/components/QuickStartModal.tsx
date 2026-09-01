import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Scan,
  Building2,
  Camera,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  FileCheck,
  Zap,
  TrendingUp,
  Award,
  Search,
  BookOpen,
  MousePointerClick,
  ShieldCheck,
  Smartphone,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'passport-scanner' | 'photo-auditor' | 'golden-visa' | 'agency-crm' | 'tracking-portal' | 'b2b-outreach') => void;
}

export const QuickStartModal: React.FC<QuickStartModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight' && currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep(prev => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('uae_visa_ai_onboarding_completed', 'true');
    }
    onClose();
  };

  const handleFinish = (targetTab?: 'passport-scanner' | 'agency-crm' | 'b2b-outreach') => {
    localStorage.setItem('uae_visa_ai_onboarding_completed', 'true');
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    onClose();
    if (targetTab) {
      onNavigateTab(targetTab);
    }
  };

  const steps = [
    {
      id: 'welcome',
      badge: 'Welcome Guide',
      title: 'Welcome to UAE & Dubai Visa AI Hub',
      subtitle: 'Your all-in-one AI compliance engine and B2B typing center desk',
      icon: Sparkles,
      iconBg: 'from-amber-400 to-amber-600',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Designed specifically for travel agencies, visa consultants, typing centers, and applicants. Our platform eliminates immigration rejections across <strong className="text-amber-300">GDRFA Dubai</strong> and <strong className="text-amber-300">ICP Federal Smart Services</strong> by auditing every file before submission.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Scan className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">AI Passport OCR &amp; 6M Rule</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Instant MRZ reading, spelling verification &amp; 6-month validity audit.</p>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Agency CRM &amp; Intake Desk</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Dossier management, WhatsApp templates &amp; 3-month peak demand forecast.</p>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Photo Spec &amp; Liveness Test</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">40×55mm white backdrop check &amp; real-time anti-spoofing facial match.</p>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Golden Visa &amp; ICP Portals</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">10-category eligibility calculator &amp; direct official status query bridge.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ocr-scanner',
      badge: 'Step 1: OCR Scanner',
      title: 'How to Use the Passport OCR Scanner',
      subtitle: 'Extract bio-data, verify ICAO MRZ codes, and audit 6-month validity',
      icon: Scan,
      iconBg: 'from-amber-400 to-amber-600',
      content: (
        <div className="space-y-3.5">
          <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/90 leading-relaxed">
              <strong>Gemini 3.7 Flash Vision Engine:</strong> Reads standard ICAO Doc 9303 passports and instantly catches critical errors (expired dates, blurred MRZ lines, missing nationality codes).
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5 p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
              <div>
                <strong className="text-white">Upload or Pick Sample Passport:</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">Drag &amp; drop a clear photo of the passport bio-data page or click any pre-loaded test passport (Valid, Expired, or Bangladeshi demo).</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
              <div>
                <strong className="text-white">Review the 6-Month UAE Entry Clearance:</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">Check the countdown timer and passport validity badge. If validity is under 180 days, the AI warns you before portal submission.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
              <div>
                <strong className="text-white">1-Click "Send to Agency CRM":</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">Click the gold button to automatically transfer name, passport number, and audit score directly into an active agency client intake.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'crm-features',
      badge: 'Step 2: Agency CRM',
      title: 'Operating the Agency CRM & Typing Desk',
      subtitle: 'Manage client dossiers, forecast seasonal peaks, and automate updates',
      icon: Building2,
      iconBg: 'from-sky-400 to-sky-600',
      content: (
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-sky-300 text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                <span>3-Month Demand Forecast</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Predicts winter tourism surges (GITEX, DSF, New Year) using historical Recharts trends.
              </p>
            </div>

            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-xs">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp &amp; Email Alerts</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Generate 1-click multilingual status updates with ready-to-send WhatsApp links.
              </p>
            </div>

            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
                <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Document Vault &amp; Audit Trail</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Securely store applicant passport scans, photos, and compliance audit certificates.
              </p>
            </div>

            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-purple-300 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Live Fee Calculator</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Calculate official GDRFA/ICP government fees with custom agency markup &amp; BDT conversion.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Ready to try your first intake?</span>
            <button
              onClick={() => handleFinish('agency-crm')}
              className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-all text-xs flex items-center gap-1 cursor-pointer"
            >
              Open CRM Desk
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'photo-liveness',
      badge: 'Step 3: Biometric Photo & Liveness',
      title: 'Validating Photos & Live Selfie Matching',
      subtitle: 'Pass UAE immigration biometric requirements on the first attempt',
      icon: Camera,
      iconBg: 'from-emerald-400 to-emerald-600',
      content: (
        <div className="space-y-3.5">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              UAE Official Photo Specification Checklist:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dimensions: 40×55 mm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Face Ratio: 70% – 80%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pure Off-White Background</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>No glare or deep shadows</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-1 text-xs">
            <span className="font-bold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Webcam Liveness &amp; Facial Recognition:
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Use the built-in webcam scanner for live applicants. The AI performs 3D anti-spoofing depth checks and mathematically compares eye distance and facial geometry against the passport photo.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'get-started',
      badge: 'Quick Launch',
      title: 'You are all set to begin!',
      subtitle: 'Choose where you want to start auditing visa applications today',
      icon: Sparkles,
      iconBg: 'from-amber-400 to-amber-600',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleFinish('passport-scanner')}
              className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/40 hover:border-amber-400 text-left transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-105 transition-transform">
                <Scan className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors flex items-center justify-between">
                <span>Passport OCR</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">
                Batch passport audit & 6-month check.
              </p>
            </button>

            <button
              onClick={() => handleFinish('agency-crm')}
              className="p-3.5 rounded-xl bg-gradient-to-br from-sky-500/20 via-slate-900 to-slate-950 border border-sky-500/40 hover:border-sky-400 text-left transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-2 group-hover:scale-105 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-white group-hover:text-sky-300 transition-colors flex items-center justify-between">
                <span>Agency CRM</span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-400 group-hover:translate-x-1 transition-transform" />
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">
                Client pipeline & automated templates.
              </p>
            </button>

            <button
              onClick={() => handleFinish('b2b-outreach')}
              className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-950 border border-emerald-500/40 hover:border-emerald-400 text-left transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
                <span>B2B SaaS Outreach</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">
                Bulk Gmail pitches to Typing Centers & Agencies.
              </p>
            </button>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              You can reopen this guide anytime from the top navigation bar.
            </span>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        id="quick-start-modal-dialog"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="border-b border-slate-800 p-4 sm:p-5 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentStepData.iconBg} text-slate-950 flex items-center justify-center shadow-md font-bold shrink-0`}>
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full inline-block">
                {currentStepData.badge} • Step {currentStep + 1} of {steps.length}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                {currentStepData.title}
              </h2>
            </div>
          </div>

          <button
            id="btn-close-quick-start-modal"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-1">
          <div
            className="bg-gradient-to-r from-amber-500 to-amber-400 h-1 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <p className="text-xs text-slate-400 font-medium -mt-1">
            {currentStepData.subtitle}
          </p>

          {currentStepData.content}
        </div>

        {/* Modal Footer Controls */}
        <div className="border-t border-slate-800 p-4 sm:p-5 bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Step Dots & Checkbox */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-1.5">
              {steps.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentStep
                      ? 'w-6 bg-amber-500'
                      : 'w-2 bg-slate-800 hover:bg-slate-700'
                  }`}
                  aria-label={`Jump to step ${idx + 1}`}
                />
              ))}
            </div>

            <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-400"
              />
              <span>Don't show again</span>
            </label>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep > 0 && (
              <button
                id="btn-quick-start-prev"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                id="btn-quick-start-next"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                id="btn-quick-start-finish"
                onClick={() => handleFinish()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Get Started
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
