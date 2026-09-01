import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export const translations = {
  // Navigation & Brand
  appTitle: {
    en: 'UAE & Dubai Visa AI Hub',
    ar: 'بوابة تأشيرات الإمارات ودبي الذكية'
  },
  appSubtitle: {
    en: 'GDRFA & ICP Document Compliance • 6-Month Passport Rule • Golden Visa • Agency CRM',
    ar: 'مطابقة مستندات إقامة دبي والهيئة الاتحادية • قاعدة الـ 6 أشهر • الإقامة الذهبية • إدارة الوكالات'
  },
  brandBadge: {
    en: 'PRO IMMIGRATION SUITE',
    ar: 'منظومة الهجرة المتقدمة'
  },
  gdrfaCertified: {
    en: 'GDRFA DUBAI & ICP RULES 2026',
    ar: 'لوائح إقامة دبي والهيئة الاتحادية 2026'
  },
  
  // Navigation Tabs
  tabPassportAudit: {
    en: 'Passport Audit (OCR)',
    ar: 'تدقيق الجوازات (OCR)'
  },
  tabPhotoSpec: {
    en: 'Photo Spec Audit',
    ar: 'مطابقة الصورة البيومترية'
  },
  tabBiometricLiveness: {
    en: 'Biometric Liveness',
    ar: 'التحقق الحيوي والوجه'
  },
  tabGoldenVisa: {
    en: 'Golden Visa & Rules',
    ar: 'الإقامة الذهبية والقوانين'
  },
  tabStatusTracker: {
    en: 'Status Tracker',
    ar: 'تتبع حالة المعاملة'
  },
  tabFlights: {
    en: 'DXB / AUH Flights',
    ar: 'رحلات دبي وأبوظبي'
  },
  tabAgencyCrm: {
    en: 'Agency CRM Portal',
    ar: 'بوابة إدارة الوكالة'
  },
  
  // Top Navigation Actions
  agencyPortal: {
    en: 'Agency CRM',
    ar: 'نظام الوكالة'
  },
  quickScan: {
    en: 'Quick 6-Mo Audit',
    ar: 'فحص الـ 6 أشهر السريع'
  },
  signIn: {
    en: 'Agent Sign In',
    ar: 'دخول الموظف'
  },
  signOut: {
    en: 'Sign Out',
    ar: 'تسجيل الخروج'
  },
  agentPortalRole: {
    en: 'Immigration Agent',
    ar: 'وكيل هجرة معتمد'
  },

  // Alert Banner
  alertWarningTitle: {
    en: 'Crucial 2026 UAE Immigration Entry Rule Notice:',
    ar: 'تنبيه هام حول لوائح دخول دولة الإمارات لعام 2026:'
  },
  alertWarningBody: {
    en: 'All Dubai (GDRFA) and Federal (ICP) tourist, work, and entry permits strictly require a minimum of 180 days (6 months) validity remaining on the applicant passport upon scheduled arrival. Ensure full optical OCR audit before paying government typing fees.',
    ar: 'تشترط إقامة دبي (GDRFA) والهيئة الاتحادية (ICP) لجميع تأشيرات السياحة والعمل سريان جواز السفر لمدة لا تقل عن 180 يوماً (6 أشهر) من تاريخ الدخول. يرجى التدقيق الإلكتروني قبل سداد الرسوم.'
  },

  // Footer
  footerDisclaimer: {
    en: 'Official pre-screening suite designed for UAE typing centers, Amer centers, registered travel agencies, and global applicants. Verified against Dubai GDRFA and Federal Authority for Identity & Citizenship (ICP) e-channel standards.',
    ar: 'المنظومة الرقمية للتدقيق المسبق المعتمدة لمراكز الطباعة، مراكز آمر، ووكالات السفر. متوافقة مع معايير الإدارة العامة للإقامة وشؤون الأجانب بدبي والهيئة الاتحادية للهوية والجنسية.'
  },
  allRightsReserved: {
    en: 'All rights reserved.',
    ar: 'جميع الحقوق محفوظة.'
  },
  securityProtocol: {
    en: 'ISO-27001 & ICAO Doc 9303 Compliant',
    ar: 'معتمد وفق معايير ISO-27001 و ICAO 9303'
  },
  switchLanguage: {
    en: 'العربية',
    ar: 'English'
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
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  const isRTL = language === 'ar';

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    if (isRTL) {
      document.body.classList.add('font-arabic');
    } else {
      document.body.classList.remove('font-arabic');
    }
  }, [language, isRTL]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'en' ? 'ar' : 'en'));
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
