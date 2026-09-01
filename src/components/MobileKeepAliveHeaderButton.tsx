import React, { useState } from 'react';
import { Smartphone, Bell, Wifi, WifiOff, BellRing } from 'lucide-react';
import { useMobileBackground } from '../hooks/useMobileBackground';
import { MobileKeepAliveModal } from './MobileKeepAliveModal';

interface MobileKeepAliveHeaderButtonProps {
  language?: 'en' | 'ar';
}

export const MobileKeepAliveHeaderButton: React.FC<MobileKeepAliveHeaderButtonProps> = ({
  language = 'en'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isOnline, permission, unreadCount, isWakeLockActive } = useMobileBackground();

  return (
    <>
      <button
        id="btn-open-mobile-keep-alive"
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-sky-300 hover:text-sky-200 hover:border-sky-500/50"
        title="Mobile Keep-Alive & Real-Time Notifications (ইন্টারনেটে সার্বক্ষণিক সচল ও পুশ নোটিফিকেশন)"
      >
        {/* Status Indicator Dot */}
        <span className="relative flex h-2 w-2">
          {isOnline && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isOnline ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          ></span>
        </span>

        <Smartphone className="w-3.5 h-3.5 text-sky-400" />
        
        <span className="hidden md:inline font-bold">
          {language === 'ar' ? 'تشغيل دائم' : 'Mobile Live'}
        </span>

        {/* Bell badge if notifications enabled or unread */}
        {permission === 'granted' ? (
          <Bell className="w-3 h-3 text-amber-400" />
        ) : (
          <BellRing className="w-3 h-3 text-amber-400 animate-bounce" />
        )}

        {unreadCount > 0 && (
          <span className="ml-0.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-extrabold shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      <MobileKeepAliveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        language={language}
      />
    </>
  );
};
