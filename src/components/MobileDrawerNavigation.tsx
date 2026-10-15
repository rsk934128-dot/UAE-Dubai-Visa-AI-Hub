import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Scan,
  Camera,
  Award,
  Building2,
  Search,
  Mail,
  Smartphone,
  Globe,
  LogIn,
  UserPlus,
  LogOut,
  Sparkles,
  BookOpen,
  Cloud,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  BellRing,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useMobileBackground } from '../hooks/useMobileBackground';
import { usePWAInstall } from '../hooks/usePWAInstall';

export type ActiveTab = 'passport-scanner' | 'photo-auditor' | 'golden-visa' | 'agency-crm' | 'tracking-portal' | 'b2b-outreach';

interface MobileDrawerNavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenQuickStart: () => void;
  onOpenPWABuilder: () => void;
  onConnectGmail?: () => void;
  isGmailConnected?: boolean;
}

export const MobileDrawerNavigation: React.FC<MobileDrawerNavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenQuickStart,
  onOpenPWABuilder,
  onConnectGmail,
  isGmailConnected = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userProfile, openAuthModal, logout } = useAuth();
  const { language, toggleLanguage, t, isRTL } = useLanguage();
  const { isOnline, unreadCount } = useMobileBackground();
  const { isInstallable, install } = usePWAInstall();

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navItems: {
    id: ActiveTab;
    titleEn: string;
    titleBn: string;
    titleAr: string;
    descEn: string;
    descBn: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'passport-scanner',
      titleEn: '1. Passport OCR & 6-Month Rule',
      titleBn: '১. পাসপোর্ট স্ক্যান ও ১৮০ দিনের রুল',
      titleAr: '١. تدقيق الجوازات وقاعدة الـ 6 أشهر',
      descEn: 'ICAO Doc 9303 MRZ scanner, expiry audit & batch check',
      descBn: 'ICAO MRZ নির্ভুল স্ক্যান ও ৬ মাসের মেয়াদ অডিট',
      icon: <Scan className="w-5 h-5 text-amber-400" />,
      badge: 'Gemini AI',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
    },
    {
      id: 'photo-auditor',
      titleEn: '2. Photo Spec & Background Audit',
      titleBn: '২. বায়োমেট্রিক ছবি ও ব্যাকগ্রাউন্ড অডিট',
      titleAr: '٢. فحص خلفية ومعايير الصورة',
      descEn: 'UAE standard 40x55mm, 100% white background & face ratio',
      descBn: '৪০x৫৫ মিমি, সাদা ব্যাকগ্রাউন্ড ও ফেস ফ্রেম যাচাই',
      icon: <Camera className="w-5 h-5 text-sky-400" />,
      badge: 'ICAO',
      badgeColor: 'bg-sky-500/10 text-sky-300 border-sky-500/30'
    },
    {
      id: 'golden-visa',
      titleEn: '3. Golden & Green Visa Calculator',
      titleBn: '৩. ১০ বছরের গোল্ডেন ভিসা ক্যালকুলেটর',
      titleAr: '٣. حاسبة الإقامة الذهبية والخضراء',
      descEn: '10-Yr Investor, Skilled Pro (AED 30k+), Coders HQ eligibility',
      descBn: 'বিনিয়োগকারী, স্পেশালিস্ট ও কোডারদের যোগ্যতা নির্ণয়',
      icon: <Award className="w-5 h-5 text-emerald-400" />,
      badge: '10-Year',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'agency-crm',
      titleEn: '4. Agency CRM & Typing Desk',
      titleBn: '৪. এজেন্সি সিআরএম ও টাইপিং সেন্টার',
      titleAr: '٤. نظام إدارة الوكالة ومكتب الطباعة',
      descEn: 'Dossiers, Recharts Status Doughnut, and Fee Invoices',
      descBn: 'আবেদনকারী ডসিয়ার, স্ট্যাটাস পাই চার্ট ও চালান',
      icon: <Building2 className="w-5 h-5 text-indigo-400" />,
      badge: 'CRM Hub',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
    },
    {
      id: 'tracking-portal',
      titleEn: '5. GDRFA & ICP Visa Tracking',
      titleBn: '৫. GDRFA দুবাই ও ICP ট্র্যাকিং পোর্টাল',
      titleAr: '٥. تتبع حالة إقامة دبي والهيئة الاتحادية',
      descEn: 'Live Dubai immigration & Federal smart channel query',
      descBn: 'স্মার্ট গেট ও দুবাই রেসিডেন্সি সরাসরি ট্র্যাকিং',
      icon: <Search className="w-5 h-5 text-purple-400" />
    },
    {
      id: 'b2b-outreach',
      titleEn: '6. B2B Outreach & Bulk Alerts',
      titleBn: '৬. B2B পার্টনার ও জিমেইল ক্যাম্পেইন',
      titleAr: '٦. شراكات B2B وحملات البريد',
      descEn: 'Agency partnership pipeline & automated notifications',
      descBn: 'এজেন্সি পার্টনারশিপ ও ক্লায়েন্ট এলার্ট সিস্টেম',
      icon: <Mail className="w-5 h-5 text-pink-400" />,
      badge: 'SaaS',
      badgeColor: 'bg-pink-500/10 text-pink-300 border-pink-500/30'
    }
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    onSelectTab(tab);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Trigger Button (Visible only on mobile/tablet) */}
      <button
        id="btn-open-mobile-drawer"
        type="button"
        onClick={() => setIsOpen(true)}
        className="md:hidden flex items-center justify-center p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-all cursor-pointer shadow-sm relative active:scale-95"
        aria-label="Open Mobile Navigation Menu"
        title="Open Mobile Navigation Drawer"
      >
        <Menu className="w-5 h-5" />
        {/* Unread or status dot */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-mono text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 transition-opacity duration-300 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer Panel */}
      <aside
        id="mobile-side-drawer"
        className={`fixed top-0 bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-[85%] max-w-sm bg-slate-950 border-r ${
          isRTL ? 'border-l border-r-0' : 'border-r'
        } border-slate-800/90 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header with Logo & Close Button */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-b from-slate-900/90 to-slate-950">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.svg"
              alt="UAE Visa AI Logo"
              className="w-9 h-9 rounded-xl object-contain shadow-md shadow-amber-500/20 border border-amber-500/30 bg-slate-900/80 p-0.5"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  UAE Visa AI Hub
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-amber-400/90 font-mono font-medium">
                {isOnline ? 'Online • GDRFA & ICP Ready' : 'Offline Mode • Local DB'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-mobile-drawer"
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
            aria-label="Close Mobile Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account / Sign In Mini-Bar */}
        <div className="px-4 py-3 bg-slate-900/40 border-b border-slate-800/70">
          {user ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    (userProfile?.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()
                  )}
                </div>
                <div className="truncate text-left rtl:text-right">
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {userProfile?.displayName || user.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono truncate">
                    Cloud Synced
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors cursor-pointer shrink-0"
                title={language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  openAuthModal('login');
                  setIsOpen(false);
                }}
                className="flex-1 text-xs font-semibold py-2 px-3 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('signIn')}</span>
              </button>
              <button
                onClick={() => {
                  openAuthModal('register');
                  setIsOpen(false);
                }}
                className="flex-1 text-xs font-bold py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تسجيل وكالة' : 'Register'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          <div className="px-2 pb-1.5 pt-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            {language === 'ar' ? 'أقسام المنظومة' : 'Portal Modules'}
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-drawer-item-${item.id}`}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full text-left rtl:text-right p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 border ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/5'
                    : 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-800/60 hover:border-slate-700/80'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 border ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-800/70 border-slate-700/60 text-slate-400'
                  }`}
                >
                  {item.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span
                      className={`text-xs font-bold truncate ${
                        isActive ? 'text-amber-300 font-extrabold' : 'text-slate-200'
                      }`}
                    >
                      {language === 'ar' ? item.titleAr : item.titleBn}
                    </span>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold border shrink-0 ${
                          item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 line-clamp-1">
                    {language === 'ar' ? item.descEn : item.descBn}
                  </p>
                </div>

                <ChevronRight
                  className={`w-4 h-4 shrink-0 self-center transition-transform ${
                    isRTL ? 'rotate-180' : ''
                  } ${isActive ? 'text-amber-400 translate-x-0.5' : 'text-slate-600'}`}
                />
              </button>
            );
          })}

          {/* Quick Utility Section */}
          <div className="pt-3">
            <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              {language === 'ar' ? 'أدوات سريعة' : 'Quick Actions'}
            </div>

            <div className="space-y-1.5">
              {/* Language Switcher Button */}
              <button
                type="button"
                onClick={() => {
                  toggleLanguage();
                }}
                className="w-full text-left rtl:text-right p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/70 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>{language === 'en' ? 'اللغة (العربية)' : 'Language (English / বাংলা)'}</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400 font-bold px-2 py-0.5 rounded bg-slate-800 border border-amber-500/20">
                  {language === 'en' ? '🇦🇪 عربي' : '🇬🇧 EN'}
                </span>
              </button>

              {/* Quick Start Guide */}
              <button
                type="button"
                onClick={() => {
                  onOpenQuickStart();
                  setIsOpen(false);
                }}
                className="w-full text-left rtl:text-right p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/70 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>{language === 'ar' ? 'دليل البدء السريع' : 'কুইক স্টার্ট ও ইউজার গাইড'}</span>
                </div>
                <span className="text-[10px] text-slate-500">Tutorial</span>
              </button>

              {/* PWABuilder App Store Hub */}
              <button
                type="button"
                onClick={() => {
                  onOpenPWABuilder();
                  setIsOpen(false);
                }}
                className="w-full text-left rtl:text-right p-2.5 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-800/50 text-xs font-semibold text-emerald-300 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>PWABuilder Store Package</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  100%
                </span>
              </button>

              {/* Install PWA directly if installable on Android/Chrome */}
              {isInstallable && (
                <button
                  type="button"
                  onClick={() => {
                    install();
                    setIsOpen(false);
                  }}
                  className="w-full text-left rtl:text-right p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold flex items-center justify-between shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>{language === 'ar' ? 'تثبيت التطبيق على الهاتف' : 'মোবাইলে ইনস্টল করুন'}</span>
                  </div>
                  <span className="text-[9px] font-mono uppercase bg-slate-950 text-amber-400 px-1.5 py-0.5 rounded font-black">
                    APK / PWA
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer with Regulatory Badge */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>UAE GDRFA &amp; ICP Pre-Screening</span>
          </div>
          <p className="text-[9px] text-slate-400 font-mono mt-0.5">
            180-Day Rule • ICAO Doc 9303 Compliant
          </p>
        </div>
      </aside>
    </>
  );
};
