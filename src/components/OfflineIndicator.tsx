import React from 'react';
import { WifiOff, RotateCw } from 'lucide-react';
import { useMobileBackground } from '../hooks/useMobileBackground';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = useMobileBackground();

  if (isOnline) return null;

  return (
    <div 
      id="mobile-offline-indicator"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-500/95 text-slate-950 px-3.5 py-2 text-xs font-bold shadow-2xl border border-amber-300 backdrop-blur-sm animate-in slide-in-from-bottom-2 duration-200"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
      </span>
      <WifiOff className="w-4 h-4 text-slate-950 shrink-0" />
      <span>ইন্টারনেট বিচ্ছিন্ন (Offline) — ইন্টারনেট পাওয়া মাত্র স্বয়ংক্রিয়ভাবে সিঙ্ক হবে</span>
    </div>
  );
};
