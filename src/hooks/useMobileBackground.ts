import { useState, useEffect, useCallback } from 'react';
import {
  mobileBackgroundService,
  AppNotification,
  MobileBackgroundConfig
} from '../services/mobileBackgroundService';

export function useMobileBackground() {
  const [isOnline, setIsOnline] = useState(mobileBackgroundService.getIsOnline());
  const [isAppMinimized, setIsAppMinimized] = useState(mobileBackgroundService.getIsAppMinimized());
  const [permission, setPermission] = useState(mobileBackgroundService.getPermissionStatus());
  const [isWakeLockActive, setIsWakeLockActive] = useState(mobileBackgroundService.getIsWakeLockActive());
  const [notifications, setNotifications] = useState<AppNotification[]>(mobileBackgroundService.getNotifications());
  const [unreadCount, setUnreadCount] = useState(mobileBackgroundService.getUnreadCount());
  const [config, setConfig] = useState<MobileBackgroundConfig>(mobileBackgroundService.getConfig());

  useEffect(() => {
    const unsubscribe = mobileBackgroundService.subscribe(() => {
      setIsOnline(mobileBackgroundService.getIsOnline());
      setIsAppMinimized(mobileBackgroundService.getIsAppMinimized());
      setPermission(mobileBackgroundService.getPermissionStatus());
      setIsWakeLockActive(mobileBackgroundService.getIsWakeLockActive());
      setNotifications(mobileBackgroundService.getNotifications());
      setUnreadCount(mobileBackgroundService.getUnreadCount());
      setConfig(mobileBackgroundService.getConfig());
    });

    return unsubscribe;
  }, []);

  const updateConfig = useCallback((newConfig: Partial<MobileBackgroundConfig>) => {
    mobileBackgroundService.saveConfig(newConfig);
  }, []);

  const requestPermission = useCallback(async () => {
    return await mobileBackgroundService.requestNotificationPermission();
  }, []);

  const sendTestNotification = useCallback((delaySeconds: number = 0) => {
    const isDelayed = delaySeconds > 0;
    mobileBackgroundService.dispatchNotification({
      title: isDelayed 
        ? '📱 ব্যাকগ্রাউন্ড টেস্ট অ্যালার্ট (Minimized Alert)' 
        : '⚡ তাৎক্ষণিক মোবাইল টেস্ট অ্যালার্ট',
      body: isDelayed
        ? `অ্যাপ মিনিমাইজ করার পর এই নোটিফিকেশনটি ব্যাকগ্রাউন্ড থেকে সফলভাবে আসল!`
        : 'রিয়েল-টাইম পুশ সিস্টেম সম্পূর্ণ সক্রিয় রয়েছে। নতুন ভিসা আপডেটে স্বয়ংক্রিয় নোটিফিকেশন আসবে।',
      type: 'system',
      delayMs: delaySeconds * 1000
    });
  }, []);

  const toggleWakeLock = useCallback(async () => {
    if (isWakeLockActive) {
      mobileBackgroundService.releaseScreenWakeLock();
      mobileBackgroundService.saveConfig({ screenWakeLockEnabled: false });
    } else {
      const success = await mobileBackgroundService.requestScreenWakeLock();
      mobileBackgroundService.saveConfig({ screenWakeLockEnabled: success });
    }
  }, [isWakeLockActive]);

  const markAllAsRead = useCallback(() => {
    mobileBackgroundService.markAllAsRead();
  }, []);

  const clearAllNotifications = useCallback(() => {
    mobileBackgroundService.clearAllNotifications();
  }, []);

  return {
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
  };
}
