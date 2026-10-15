import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar' | 'bn';

export interface Translations {
  [key: string]: {
    en: string;
    ar: string;
    bn?: string;
  };
}

export const translations = {
  // Navigation & Brand
  appTitle: {
    en: 'UAE & Dubai Visa AI Hub',
    ar: 'بوابة تأشيرات الإمارات ودبي الذكية',
    bn: 'ইউএই ও দুবাই ভিসা এআই হাব'
  },
  appSubtitle: {
    en: 'GDRFA & ICP Document Compliance • 6-Month Passport Rule • Golden Visa • Agency CRM',
    ar: 'مطابقة مستندات إقامة دبي والهيئة الاتحادية • قاعدة الـ 6 أشهر • الإقامة الذهبية • إدارة الوكالات',
    bn: 'জিডিআরএফএ ও আইসিপি কমপ্লায়েন্স • ৬ মাসের পাসপোর্ট নিয়ম • গোল্ডেন ভিসা • এজেন্সি সিআরএম'
  },
  brandBadge: {
    en: 'PRO IMMIGRATION SUITE',
    ar: 'منظومة الهجرة المتقدمة',
    bn: 'প্রো ইমিগ্রেশন স্যুট'
  },
  gdrfaCertified: {
    en: 'GDRFA DUBAI & ICP RULES 2026',
    ar: 'لوائح إقامة دبي والهيئة الاتحادية 2026',
    bn: 'জিডিআরএফএ দুবাই ও আইসিপি ২০২৬ নিয়মাবলী'
  },
  
  // Navigation Tabs
  tabPassportAudit: {
    en: 'Passport Audit (OCR)',
    ar: 'تدقيق الجوازات (OCR)',
    bn: 'পাসপোর্ট অডিট (OCR)'
  },
  tabPhotoSpec: {
    en: 'Photo Spec Audit',
    ar: 'مطابقة الصورة البيومترية',
    bn: 'ছবি স্পেসিফিকেশন অডিট'
  },
  tabBiometricLiveness: {
    en: 'Biometric Liveness',
    ar: 'التحقق الحيوي والوجه',
    bn: 'বায়োমেট্রিক লাইভনেস ভেরিফিকেশন'
  },
  tabGoldenVisa: {
    en: 'Golden Visa & Rules',
    ar: 'الإقامة الذهبية والقوانين',
    bn: 'গোল্ডেন ভিসা ও যোগ্যতা'
  },
  tabStatusTracker: {
    en: 'Status Tracker',
    ar: 'تتبع حالة المعاملة',
    bn: 'স্ট্যাটাস ট্র্যাকার'
  },
  tabFlights: {
    en: 'DXB / AUH Flights',
    ar: 'رحلات دبي وأبوظبي',
    bn: 'দুবাই ও আবুধাবি ফ্লাইট'
  },
  tabAgencyCrm: {
    en: 'Agency CRM Portal',
    ar: 'بوابة إدارة الوكالة',
    bn: 'এজেন্সি সিআরএম পোর্টাল'
  },
  
  // Top Navigation Actions
  agencyPortal: {
    en: 'Agency CRM',
    ar: 'نظام الوكالة',
    bn: 'এজেন্সি সিআরএম'
  },
  quickScan: {
    en: 'Quick 6-Mo Audit',
    ar: 'فحص الـ 6 أشهر السريع',
    bn: 'দ্রুত ৬-মাসের অডিট'
  },
  signIn: {
    en: 'Agent Sign In',
    ar: 'دخول الموظف',
    bn: 'এজেন্ট সাইন ইন'
  },
  signOut: {
    en: 'Sign Out',
    ar: 'تسجيل الخروج',
    bn: 'সাইন আউট'
  },
  agentPortalRole: {
    en: 'Immigration Agent',
    ar: 'وكيل هجرة معتمد',
    bn: 'অনুমোদিত ইমিগ্রেশন এজেন্ট'
  },

  // Alert Banner
  alertWarningTitle: {
    en: 'Crucial 2026 UAE Immigration Entry Rule Notice:',
    ar: 'تنبيه هام حول لوائح دخول دولة الإمارات لعام 2026:',
    bn: '২০২৬ সালের গুরুত্বপূর্ণ ইউএই ইমিগ্রেশন প্রবেশ নিয়মাবলী:'
  },
  alertWarningBody: {
    en: 'All Dubai (GDRFA) and Federal (ICP) tourist, work, and entry permits strictly require a minimum of 180 days (6 months) validity remaining on the applicant passport upon scheduled arrival. Ensure full optical OCR audit before paying government typing fees.',
    ar: 'تشترط إقامة دبي (GDRFA) والهيئة الاتحادية (ICP) لجميع تأشيرات السياحة والعمل سريان جواز السفر لمدة لا تقل عن 180 يوماً (6 أشهر) من تاريخ الدخول. يرجى التدقيق الإلكتروني قبل سداد الرسوم.',
    bn: 'দুবাই (GDRFA) এবং ফেডারেল (ICP) সকল ট্যুরিস্ট ও ওয়ার্ক ভিসায় প্রবেশকালে পাসপোর্টের মেয়াদ অবশ্যই কমপক্ষে ১৮০ দিন (৬ মাস) থাকতে হবে। সরকারি ফি প্রদানের পূর্বে সম্পূর্ণ ওসিআর অডিট সম্পন্ন করুন।'
  },

  // Footer
  footerDisclaimer: {
    en: 'Official pre-screening suite designed for UAE typing centers, Amer centers, registered travel agencies, and global applicants. Verified against Dubai GDRFA and Federal Authority for Identity & Citizenship (ICP) e-channel standards.',
    ar: 'المنظومة الرقمية للتدقيق المسبق المعتمدة لمراكز الطباعة، مراكز آمر، ووكالات السفر. متوافقة مع معايير الإدارة العامة للإقامة وشؤون الأجانب بدبي والهيئة الاتحادية للهوية والجنسية.',
    bn: 'ইউএই টাইপিং সেন্টার, আমের সেন্টার এবং নিবন্ধিত ট্রাভেল এজেন্সির জন্য তৈরি ডিজিটাল প্রি-স্ক্রীনিং স্যুট। জিডিআরএফএ দুবাই এবং ফেডারেল আইসিপি মান অনুযায়ী যাচাইকৃত।'
  },
  allRightsReserved: {
    en: 'All rights reserved.',
    ar: 'جميع الحقوق محفوظة.',
    bn: 'সর্বস্বত্ব সংরক্ষিত।'
  },
  securityProtocol: {
    en: 'ISO-27001 & ICAO Doc 9303 Compliant',
    ar: 'معتمد وفق معايير ISO-27001 و ICAO 9303',
    bn: 'আইএসও-২৭০০১ ও আইসিএও ডক ৯৩০৩ অনুসারী'
  },
  switchLanguage: {
    en: 'العربية / বাংলা',
    ar: 'English / বাংলা',
    bn: 'English / العربية'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'uae_visa_app_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        return (saved === 'ar' || saved === 'en' || saved === 'bn') ? saved : 'en';
      }
    } catch {
      // In restricted iframe or private mode
    }
    return 'en';
  });

  const isRTL = language === 'ar';

  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, language);
      }
    } catch {
      // Ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
      if (isRTL) {
        document.body.classList.add('font-arabic');
      } else {
        document.body.classList.remove('font-arabic');
      }
    }
  }, [language, isRTL]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => {
      if (prev === 'en') return 'bn';
      if (prev === 'bn') return 'ar';
      return 'en';
    });
  };

  const t = (key: keyof typeof translations): string => {
    const item = translations[key];
    if (!item) return String(key);
    return item[language] || item.en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
