import React from 'react';
import {
  Scan,
  Camera,
  Award,
  Building2,
  Search
} from 'lucide-react';
import { ActiveTab } from './MobileDrawerNavigation';
import { useLanguage } from '../context/LanguageContext';

interface MobileBottomNavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const MobileBottomNavbar: React.FC<MobileBottomNavbarProps> = ({
  activeTab,
  onSelectTab
}) => {
  const { language } = useLanguage();

  const items: {
    id: ActiveTab;
    labelEn: string;
    labelBn: string;
    labelAr: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'passport-scanner',
      labelEn: 'Passport',
      labelBn: 'পাসপোর্ট',
      labelAr: 'الجوازات',
      icon: <Scan className="w-5 h-5" />
    },
    {
      id: 'photo-auditor',
      labelEn: 'Photo',
      labelBn: 'ছবি অডিট',
      labelAr: 'الصورة',
      icon: <Camera className="w-5 h-5" />
    },
    {
      id: 'golden-visa',
      labelEn: 'Golden',
      labelBn: 'গোল্ডেন ভিসা',
      labelAr: 'الذهبية',
      icon: <Award className="w-5 h-5" />
    },
    {
      id: 'agency-crm',
      labelEn: 'CRM',
      labelBn: 'সিআরএম',
      labelAr: 'الوكالة',
      icon: <Building2 className="w-5 h-5" />
    },
    {
      id: 'tracking-portal',
      labelEn: 'Track',
      labelBn: 'ট্র্যাকিং',
      labelAr: 'تتبع',
      icon: <Search className="w-5 h-5" />
    }
  ];

  return (
    <nav
      id="mobile-bottom-navbar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-lg px-2 py-1.5 shadow-2xl safe-area-inset-bottom"
    >
      <div className="grid grid-cols-5 gap-1 items-center">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-tab-btn-${item.id}`}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute top-1 w-1 h-1 rounded-full bg-amber-400 shadow-xs shadow-amber-400" />
              )}
              
              <div className={`transition-transform ${isActive ? 'scale-110 mt-0.5' : ''}`}>
                {item.icon}
              </div>

              <span className={`text-[10px] tracking-tight mt-1 truncate max-w-full font-medium ${
                isActive ? 'font-bold text-amber-300' : 'text-slate-400'
              }`}>
                {language === 'ar' ? item.labelAr : item.labelBn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
