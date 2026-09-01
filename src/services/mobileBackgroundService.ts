// Mobile Background & Real-Time Notification Engine for UAE Visa AI Hub
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'visa_status' | 'connection' | 'overstay_alert' | 'audit_pass' | 'b2b_outreach' | 'system';
  read: boolean;
  applicationId?: string;
}

export interface MobileBackgroundConfig {
  backgroundSyncEnabled: boolean;
  realtimeAlertsEnabled: boolean;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  screenWakeLockEnabled: boolean;
  reconnectAlertsEnabled: boolean;
}

const DEFAULT_CONFIG: MobileBackgroundConfig = {
  backgroundSyncEnabled: true,
  realtimeAlertsEnabled: true,
  soundEnabled: true,
  vibrateEnabled: true,
  screenWakeLockEnabled: false,
  reconnectAlertsEnabled: true
};

class MobileBackgroundService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private wakeLockSentinel: any = null;
  private config: MobileBackgroundConfig = DEFAULT_CONFIG;
  private listeners: Set<() => void> = new Set();
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isAppMinimized: boolean = false;
  private notifications: AppNotification[] = [];
  private audioCtx: AudioContext | null = null;
  private heartbeatInterval: any = null;
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.loadConfig();
    this.loadNotificationHistory();
    this.initListeners();
    this.initServiceWorker();
    this.initHeartbeat();
  }

  // Load user preferences from localStorage
  private loadConfig() {
    try {
      const saved = localStorage.getItem('uae_visa_mobile_bg_config');
      if (saved) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      this.config = DEFAULT_CONFIG;
    }
  }

  public saveConfig(newConfig: Partial<MobileBackgroundConfig>) {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem('uae_visa_mobile_bg_config', JSON.stringify(this.config));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }

    if (newConfig.screenWakeLockEnabled !== undefined) {
      if (newConfig.screenWakeLockEnabled) {
        this.requestScreenWakeLock();
      } else {
        this.releaseScreenWakeLock();
      }
    }

    this.notifySubscribers();
  }

  public getConfig(): MobileBackgroundConfig {
    return { ...this.config };
  }

  // Load stored notification history
  private loadNotificationHistory() {
    try {
      const saved = localStorage.getItem('uae_visa_notification_history');
      if (saved) {
        this.notifications = JSON.parse(saved);
      } else {
        // Initial sample notification
        this.notifications = [
          {
            id: 'notif-welcome',
            title: '🇦🇪 রিয়েল-টাইম সিস্টেম সক্রিয় (System Ready)',
            body: 'মোবাইল ব্যাকগ্রাউন্ড ট্র্যাকিং ও ইনস্ট্যান্ট ভিসা অ্যালার্ট চালু রয়েছে।',
            timestamp: new Date().toISOString(),
            type: 'system',
            read: false
          }
        ];
      }
    } catch {
      this.notifications = [];
    }
  }

  private saveNotificationHistory() {
    try {
      // Keep latest 50 notifications
      const trimmed = this.notifications.slice(0, 50);
      localStorage.setItem('uae_visa_notification_history', JSON.stringify(trimmed));
    } catch {
      // ignore
    }
    this.notifySubscribers();
  }

  // Register Service Worker
  private async initServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    try {
      // Register service worker at root
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      this.swRegistration = reg;
      console.log('UAE Visa AI: Service Worker active with scope:', reg.scope);

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'HEARTBEAT_PONG') {
          // Heartbeat acknowledged
        }
      });
    } catch (err) {
      console.warn('Service Worker registration skipped or restricted:', err);
    }
  }

  // Initialize event listeners for network and visibility
  private initListeners() {
    if (typeof window === 'undefined') return;

    // Online / Offline Detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleInternetReconnection();
      this.notifySubscribers();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifySubscribers();
    });

    // App Minimized / Hidden (Visibility Change)
    document.addEventListener('visibilitychange', () => {
      this.isAppMinimized = document.visibilityState === 'hidden';
      if (!this.isAppMinimized) {
        // Returned to foreground: verify wake lock if enabled
        if (this.config.screenWakeLockEnabled) {
          this.requestScreenWakeLock();
        }
      }
      this.notifySubscribers();
    });

    // BroadcastChannel for cross-tab sync
    try {
      if ('BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('uae_visa_realtime_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'EXTERNAL_NOTIFICATION') {
            this.handleIncomingNotification(event.data.notification, false);
          }
        };
      }
    } catch {
      // BroadcastChannel unavailable
    }
  }

  // Triggered when internet reconnects
  private handleInternetReconnection() {
    if (!this.config.reconnectAlertsEnabled) return;

    // Ping health check to warm connection
    fetch('/api/health')
      .then((res) => res.json())
      .then(() => {
        this.dispatchNotification({
          title: '🌐 ইন্টারনেট সংযোগ সংযুক্ত (Connected)',
          body: 'অ্যাপটি সফলভাবে পুনরায় ইন্টারনেটের সাথে যুক্ত হয়েছে। সকল ফাইল সিঙ্ক হচ্ছে।',
          type: 'connection'
        });
      })
      .catch(() => {
        this.dispatchNotification({
          title: '🌐 ইন্টারনেট সংযোগ সক্রিয়',
          body: 'মোবাইল ডাটা/ওয়াইফাই চালু রয়েছে। ব্যাকগ্রাউন্ড মনিটরিং সক্রিয়।',
          type: 'connection'
        });
      });
  }

  // Periodic heartbeat every 30s to keep connection and worker warm
  private initHeartbeat() {
    if (typeof window === 'undefined') return;

    this.heartbeatInterval = setInterval(() => {
      if (!this.config.backgroundSyncEnabled) return;

      // Ping SW
      if (this.swRegistration && this.swRegistration.active) {
        this.swRegistration.active.postMessage({ type: 'HEARTBEAT_PING' });
      }

      // If online, ping health
      if (this.isOnline) {
        fetch('/api/health').catch(() => {});
      }
    }, 30000);
  }

  // Check Notification Permission Status
  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  // Request Notification Permission
  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.notifySubscribers();
      if (permission === 'granted') {
        this.playNotificationSound();
        this.dispatchNotification({
          title: '🔔 রিয়েল-টাইম নোটিফিকেশন সক্রিয়!',
          body: 'অভিনন্দন! অ্যাপ মিনিমাইজ থাকলেও সকল ভিসা স্ট্যাটাস ও জরুরি সতর্কতা পাবেন।',
          type: 'system'
        });
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Notification permission request error:', err);
      return false;
    }
  }

  // Dispatch a notification (handles both foreground, minimized background, and SW)
  public async dispatchNotification(params: {
    title: string;
    body: string;
    type?: AppNotification['type'];
    applicationId?: string;
    delayMs?: number;
  }): Promise<void> {
    if (!this.config.realtimeAlertsEnabled) return;

    const notifItem: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: params.title,
      body: params.body,
      timestamp: new Date().toISOString(),
      type: params.type || 'system',
      read: false,
      applicationId: params.applicationId
    };

    if (params.delayMs && params.delayMs > 0) {
      // Schedule via SW if available so it triggers even when user minimizes the app
      if (this.swRegistration && this.swRegistration.active) {
        this.swRegistration.active.postMessage({
          type: 'SCHEDULE_NOTIFICATION',
          payload: {
            title: params.title,
            body: params.body,
            delayMs: params.delayMs,
            data: { url: '/', tab: 'agency-crm', applicationId: params.applicationId }
          }
        });
      } else {
        setTimeout(() => {
          this.handleIncomingNotification(notifItem, true);
        }, params.delayMs);
      }
      return;
    }

    this.handleIncomingNotification(notifItem, true);
  }

  private handleIncomingNotification(item: AppNotification, broadcast = true) {
    // Add to internal list
    this.notifications = [item, ...this.notifications];
    this.saveNotificationHistory();

    // Play pleasant sound if enabled
    if (this.config.soundEnabled) {
      this.playNotificationSound();
    }

    // Vibrate device if supported
    if (this.config.vibrateEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([180, 80, 200]);
      } catch {
        // ignore
      }
    }

    // Check system notification permission
    const permission = this.getPermissionStatus();
    if (permission === 'granted') {
      // If service worker is ready, use it for persistent background notification
      if (this.swRegistration && this.swRegistration.showNotification) {
        this.swRegistration.showNotification(item.title, {
          body: item.body,
          icon: '/icon-192.png',
          badge: '/favicon.svg',
          tag: item.id,
          renotify: true,
          vibrate: [200, 100, 200],
          data: { url: '/', tab: 'agency-crm', applicationId: item.applicationId }
        } as any);
      } else if (typeof Notification !== 'undefined') {
        try {
          new Notification(item.title, {
            body: item.body,
            icon: '/icon-192.png'
          });
        } catch {
          // fallback handled in-app
        }
      }
    }

    // Broadcast to other tabs
    if (broadcast && this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'EXTERNAL_NOTIFICATION',
          notification: item
        });
      } catch {
        // ignore
      }
    }
  }

  // Synthesize a clean, pleasant notification chime via Web Audio API
  private playNotificationSound() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      // Dual tone pleasant chime (F5 to A5)
      osc.frequency.setValueAtTime(698.46, now);
      osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // Audio autoplay policy might prevent before user gesture
    }
  }

  // Screen Wake Lock API (keeps mobile display on during active queue tracking)
  public async requestScreenWakeLock(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return false;
    }

    try {
      // @ts-ignore
      this.wakeLockSentinel = await navigator.wakeLock.request('screen');
      this.wakeLockSentinel.addEventListener('release', () => {
        this.wakeLockSentinel = null;
        this.notifySubscribers();
      });
      this.notifySubscribers();
      return true;
    } catch (err) {
      console.warn('Screen WakeLock error:', err);
      return false;
    }
  }

  public releaseScreenWakeLock() {
    if (this.wakeLockSentinel) {
      try {
        this.wakeLockSentinel.release();
      } catch {}
      this.wakeLockSentinel = null;
      this.notifySubscribers();
    }
  }

  // State Getters
  public getIsOnline(): boolean {
    return this.isOnline;
  }

  public getIsAppMinimized(): boolean {
    return this.isAppMinimized;
  }

  public getIsWakeLockActive(): boolean {
    return this.wakeLockSentinel !== null;
  }

  public getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  public getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  public markAllAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.saveNotificationHistory();
  }

  public clearAllNotifications() {
    this.notifications = [];
    this.saveNotificationHistory();
  }

  // Subscription management for React components
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifySubscribers() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Listener callback error:', err);
      }
    });
  }
}

// Export singleton instance
export const mobileBackgroundService = new MobileBackgroundService();
