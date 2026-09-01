import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  language?: 'en' | 'ar';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language = 'en' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop direct prompt flow
  if (isInstallable) {
    return (
      <button
        id="btn-install-pwa"
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        title="Install as Mobile App for Full Background Real-Time Notifications"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">
          {language === 'ar' ? 'تثبيت التطبيق' : 'Install App'}
        </span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          id="btn-install-ios-pwa"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          title="Install on iPhone / iPad for Web Push"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">
            {language === 'ar' ? 'تثبيت على آيفون' : 'Install iOS'}
          </span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    {language === 'ar' ? 'تثبيت التطبيق على آيفون / آيباد' : 'Install on iPhone / iPad'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                মোবাইল স্ক্রিনে সর্বদা সচল রাখা ও লক স্ক্রিনে ব্যাকগ্রাউন্ড নোটিফিকেশন পেতে হোমস্ক্রিনে যুক্ত করুন:
              </p>

              <div className="space-y-2 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <span>Safari ব্রাউজারের নিচে <strong>Share (<Share2 className="w-3.5 h-3.5 inline text-sky-400" />)</strong> বাটনে চাপ দিন।</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <span>তালিকা থেকে <strong>Add to Home Screen (হোম স্ক্রিনে যোগ করুন)</strong> নির্বাচন করুন।</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <span>হোমস্ক্রিন থেকে অ্যাপটি চালু করে <strong>Allow Notifications</strong> চাপুন।</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 py-2 text-xs font-bold text-slate-950 transition-colors cursor-pointer"
              >
                বুঝেছি (Got It)
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
