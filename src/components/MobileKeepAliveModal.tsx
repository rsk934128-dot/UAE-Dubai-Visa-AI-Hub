import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  Wifi,
  WifiOff,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Volume2,
  VolumeX,
  Vibrate,
  Eye,
  EyeOff,
  ExternalLink,
  X,
  Play,
  RotateCw,
  Trash2,
  Check
} from 'lucide-react';
import { useMobileBackground } from '../hooks/useMobileBackground';
import { formatDate } from '../lib/utils';

interface MobileKeepAliveModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'en' | 'ar';
}

export const MobileKeepAliveModal: React.FC<MobileKeepAliveModalProps> = ({
  isOpen,
  onClose,
  language = 'en'
}) => {
  const {
    isOnline,
    isAppMinimized,
    permission,
    isWakeLockActive,
    notifications,
    unreadCount,
    config,
    updateConfig,
    requestPermission,
    sendTestNotification,
    toggleWakeLock,
    markAllAsRead,
    clearAllNotifications
  } = useMobileBackground();

  const [activeTab, setActiveTab] = useState<'status' | 'settings' | 'history'>('status');
  const [testCountdown, setTestCountdown] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleStart5SecTest = () => {
    setTestCountdown(5);
    sendTestNotification(5);

    const interval = setInterval(() => {
      setTestCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOpenInNewTab = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="modal-mobile-keep-alive"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  {language === 'ar' ? 'التشغيل الدائم وإشعارات الموبايل' : 'Mobile Keep-Alive & Real-Time Alerts'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  PWA Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ইন্টারনেট যুক্ত থাকলে ব্যাকগ্রাউন্ডে সর্বদা সক্রিয় ও মিনিমাইজ করলেও রিয়েল-টাইম নোটিফিকেশন
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

        {/* Status Indicators Strip */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 border-b border-slate-800/80 text-xs">
          {/* 1. Connection Status */}
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-red-400" />}
              ইন্টারনেট সংযোগ
            </span>
            <span className={`font-bold mt-1 text-xs ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
              {isOnline ? '🟢 Online (সংযুক্ত)' : '🔴 Offline (বিচ্ছিন্ন)'}
            </span>
          </div>

          {/* 2. Notification Permission */}
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              নোটিফিকেশন
            </span>
            <span className={`font-bold mt-1 text-xs ${permission === 'granted' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {permission === 'granted' ? '✓ Granted (অনুমোদিত)' : '⚠️ Action Needed'}
            </span>
          </div>

          {/* 3. Background State */}
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              {isAppMinimized ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-sky-400" />}
              অ্যাপের অবস্থা
            </span>
            <span className="font-bold mt-1 text-xs text-sky-400">
              {isAppMinimized ? '🌙 Minimized (ব্যাকগ্রাউন্ড)' : '☀️ Active (ফোরগ্রাউন্ড)'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>সক্রিয়তা ও টেস্ট কন্ট্রোল</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>ব্যাকগ্রাউন্ড সেটিংস</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>অ্যালার্ট হিস্ট্রি</span>
            {unreadCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: STATUS & TEST CONTROLS */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Permission Banner if not granted */}
              {permission !== 'granted' && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      সিস্টেম পুশ নোটিফিকেশন অনুমোদন প্রয়োজন
                    </p>
                    <p className="text-[11px] text-slate-300">
                      অ্যাপ মিনিমাইজ বা লক করা থাকলেও নোটিফিকেশন পেতে ব্রাউজার অনুমতি চালু করুন।
                    </p>
                  </div>
                  <button
                    id="btn-request-mobile-permission"
                    onClick={requestPermission}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer shrink-0 shadow-md flex items-center gap-1.5 justify-center"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    <span>অনুমতি দিন (Allow)</span>
                  </button>
                </div>
              )}

              {/* How Background Keep-Alive Works card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  সার্বক্ষণিক সচল থাকার পদ্ধতি (How Keep-Alive Works):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 space-y-1">
                    <span className="font-semibold text-amber-300 block">১. স্বয়ংক্রিয় হার্টবিট ও রি-কানেকশন</span>
                    <p className="text-[11px] text-slate-400">
                      সার্ভিস ওয়ার্কার প্রতি ৩০ সেকেন্ডে ব্যাকগ্রাউন্ড পিং পাঠায়। ইন্টারনেট চালু হওয়া মাত্র নতুন স্ট্যাটাস আপডেট গ্রহণ করে।
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 space-y-1">
                    <span className="font-semibold text-sky-300 block">২. মিনিমাইজ হলেও রিয়েল-টাইম পুশ</span>
                    <p className="text-[11px] text-slate-400">
                      অ্যাপটি মিনিমাইজ করলেও ব্যাকগ্রাউন্ড থ্রেড ও সার্ভিস ওয়ার্কার অ্যালার্ট প্রসেস করে মোবাইলের নোটিফিকেশন বারে পাঠায়।
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 space-y-1">
                    <span className="font-semibold text-emerald-300 block">৩. সাউন্ড ও মোবাইল ভাইব্রেশন</span>
                    <p className="text-[11px] text-slate-400">
                      ভিসা আবেদন অনুমোদন বা কোনো জরুরি সমস্যা হলে তাৎক্ষণিক ভাইব্রেশন ও অ্যালার্ম টোন বাজে।
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 space-y-1">
                    <span className="font-semibold text-purple-300 block">৪. স্ক্রিন ওয়েক-লক (Screen Wake)</span>
                    <p className="text-[11px] text-slate-400">
                      ডেস্ক বা টেবিলে মোবাইল রেখে কাজ করার সময় স্ক্রিন বন্ধ হওয়া বা স্লিপ মোড প্রতিরোধ করার ব্যবস্থা।
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Test Panel */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Play className="w-4 h-4 text-amber-400" />
                    নোটিফিকেশন টেস্ট ও ভেরিফিকেশন:
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Real Browser API</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Test 1: Delayed Minimized Test */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="text-xs font-semibold text-amber-300">
                      মিনিমাইজ টেস্ট (৫ সেকেন্ড কাউন্টডাউন)
                    </div>
                    <p className="text-[11px] text-slate-400">
                      বাটন চাপার পর ৫ সেকেন্ডের মধ্যে অ্যাপ মিনিমাইজ করুন বা অন্য অ্যাপে যান। ব্যাকগ্রাউন্ডে নোটিফিকেশন আসবে।
                    </p>
                    <button
                      id="btn-test-minimized-5s"
                      onClick={handleStart5SecTest}
                      disabled={testCountdown !== null}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        testCountdown !== null
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {testCountdown !== null
                          ? `মিনিমাইজ করুন! (${testCountdown}s বাকি)`
                          : 'টেস্ট শুরু করুন (৫ সেকেন্ড পর আসবে)'}
                      </span>
                    </button>
                  </div>

                  {/* Test 2: Instant Push Test */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="text-xs font-semibold text-sky-300">
                      তাৎক্ষণিক নোটিফিকেশন পরীক্ষা
                    </div>
                    <p className="text-[11px] text-slate-400">
                      সরাসরি ফোরগ্রাউন্ড পুশ ও সাউন্ড বাজিয়ে পরীক্ষা করুন।
                    </p>
                    <button
                      id="btn-test-instant-push"
                      onClick={() => sendTestNotification(0)}
                      className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <BellRing className="w-3.5 h-3.5 text-sky-400" />
                      <span>এখনই পাঠান (Instant Alert)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Standalone Mobile / New Tab Launcher */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    মোবাইলের আলাদা ট্যাব বা PWA হিসেবে খুলুন
                  </span>
                  <p className="text-[11px] text-slate-400">
                    আইফ্রেমের সীমাবদ্ধতা ছাড়া মোবাইলে সরাসরি হোমস্ক্রিনে যুক্ত করার জন্য আলাদা উইন্ডোতে চালান।
                  </p>
                </div>
                <button
                  onClick={handleOpenInNewTab}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <span>নতুন ট্যাবে খুলুন</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SETTINGS & TOGGLES */}
          {activeTab === 'settings' && (
            <div className="space-y-3">
              {/* Toggle 1: Background Sync */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
                    ব্যাকগ্রাউন্ড সিঙ্ক ও স্টে-অ্যালাইভ (Background Sync)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    ইন্টারনেট কানেকশন সক্রিয় থাকলে অ্যাপ ব্যাকগ্রাউন্ডে রেগুলার হার্টবিট বজায় রাখবে।
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.backgroundSyncEnabled}
                    onChange={(e) => updateConfig({ backgroundSyncEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Toggle 2: Real-time Alert Push */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    রিয়েল-টাইম নোটিফিকেশন প্রদান (Push Alerts)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    ভিসা স্ট্যাটাস চেঞ্জ বা ক্লায়েন্টের জরুরি নোটিসে তাৎক্ষণিক পুশ প্রেরণ।
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.realtimeAlertsEnabled}
                    onChange={(e) => updateConfig({ realtimeAlertsEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Toggle 3: Screen Wake Lock */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                    স্ক্রিন সবসময় অন রাখা (Screen Wake Lock)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    মোবাইল স্ক্রিন নিজে থেকে স্লিপ মোডে যাবে না, ফলে সার্বক্ষণিক মনিটরিং সহজ হয়।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleWakeLock}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isWakeLockActive 
                      ? 'bg-sky-500 text-slate-950 shadow-md' 
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {isWakeLockActive ? 'অন (Active)' : 'বন্ধ (Off)'}
                </button>
              </div>

              {/* Toggle 4: Audio Sound Chime */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    {config.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                    অ্যালার্ট সাউন্ড (Audio Tone)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    নতুন ভিসা অ্যালার্টে মনোরম নোটিফিকেশন চাইম বাজবে।
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.soundEnabled}
                    onChange={(e) => updateConfig({ soundEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Toggle 5: Mobile Vibration */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Vibrate className="w-3.5 h-3.5 text-purple-400" />
                    মোবাইল ভাইব্রেশন (Device Vibration)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    জরুরি ভিসা স্টেট চেঞ্জে ডিভাইস ভাইব্রেট করবে।
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.vibrateEnabled}
                    onChange={(e) => updateConfig({ vibrateEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Toggle 6: Reconnection Notification */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    ইন্টারনেট পুনঃসংযোগ নোটিফিকেশন
                  </span>
                  <p className="text-[11px] text-slate-400">
                    ইন্টারনেট বিচ্ছিন্ন হয়ে পুনরায় চালু হলে স্বয়ংক্রিয়ভাবে নোটিফিকেশন প্রদান।
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.reconnectAlertsEnabled}
                    onChange={(e) => updateConfig({ reconnectAlertsEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-300">
                  সর্বমোট প্রাপ্ত অ্যালার্ট: <strong className="text-white">{notifications.length}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>সব পড়া হয়েছে চিহ্নিত করুন</span>
                  </button>
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-slate-500 hover:text-red-400 cursor-pointer flex items-center gap-1 ml-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>ক্লিয়ার</span>
                  </button>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs bg-slate-950 rounded-xl border border-slate-800/80">
                  এখনো কোনো নোটিফিকেশন জমা হয়নি।
                </div>
              ) : (
                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-xl border transition-all text-xs space-y-1 ${
                        notif.read
                          ? 'bg-slate-950/60 border-slate-800/60 text-slate-400'
                          : 'bg-slate-950 border-amber-500/30 text-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          {notif.type === 'connection' && <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
                          {notif.type === 'visa_status' && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
                          {notif.type === 'system' && <Bell className="w-3.5 h-3.5 text-sky-400" />}
                          <span>{notif.title}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {formatDate(notif.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">{notif.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            মোবাইল ব্যাকগ্রাউন্ড সার্ভিস: <span className="text-emerald-400 font-bold">সক্রিয় (Online)</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
