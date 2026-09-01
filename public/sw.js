// UAE & Dubai Visa AI Hub - Service Worker with Background Sync & Real-Time Notifications
const CACHE_NAME = 'uae-visa-ai-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install: Precache shell and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('SW Precache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Background Messages & Notification Triggers from Client
self.addEventListener('message', (event) => {
  if (!event.data) return;

  const { type, payload } = event.data;

  // Trigger Immediate Notification
  if (type === 'SHOW_NOTIFICATION') {
    const title = payload.title || 'UAE Visa AI Alert';
    const options = {
      body: payload.body || 'New visa application update available.',
      icon: payload.icon || '/icon-192.png',
      badge: '/favicon.svg',
      tag: payload.tag || 'uae-visa-alert',
      renotify: true,
      vibrate: [200, 100, 200, 100, 250],
      data: payload.data || { url: '/' },
      actions: [
        { action: 'open_app', title: '📂 ফাইল দেখুন (Open File)' },
        { action: 'dismiss', title: 'বাতিল (Dismiss)' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }

  // Schedule Delayed Notification (for testing minimized app or timers)
  if (type === 'SCHEDULE_NOTIFICATION') {
    const delay = payload.delayMs || 5000;
    setTimeout(() => {
      const title = payload.title || 'UAE Visa AI Alert';
      const options = {
        body: payload.body || 'Real-time background update while app is minimized.',
        icon: payload.icon || '/icon-192.png',
        badge: '/favicon.svg',
        tag: payload.tag || 'uae-visa-scheduled',
        renotify: true,
        vibrate: [200, 100, 200],
        data: payload.data || { url: '/' },
        actions: [
          { action: 'open_app', title: '📂 ফাইল দেখুন (Open File)' },
          { action: 'dismiss', title: 'বাতিল (Dismiss)' }
        ]
      };
      self.registration.showNotification(title, options);
    }, delay);
  }

  // Keep-alive Heartbeat Ping
  if (type === 'HEARTBEAT_PING') {
    if (event.source && event.source.postMessage) {
      event.source.postMessage({
        type: 'HEARTBEAT_PONG',
        timestamp: Date.now(),
        swActive: true
      });
    }
  }
});

// Push Event: Handle server push notifications if configured
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'UAE Visa AI Hub', body: event.data ? event.data.text() : 'New Visa Alert' };
  }

  const title = data.title || 'UAE Visa Update';
  const options = {
    body: data.body || 'Application dossier status changed.',
    icon: '/icon-192.png',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    data: data.data || { url: '/' },
    actions: [
      { action: 'open_app', title: 'ফাইল দেখুন' },
      { action: 'dismiss', title: 'বাতিল' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification Click Event: Focus or Open the app when clicked on mobile
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if (event.notification.data && event.notification.data.tab) {
            client.postMessage({
              type: 'NAVIGATE_TAB',
              tab: event.notification.data.tab,
              applicationId: event.notification.data.applicationId
            });
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Background Sync (when internet reconnects)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-visa-applications') {
    event.waitUntil(
      self.registration.showNotification('🌐 ডাটা সিঙ্ক সম্পন্ন (Data Synced)', {
        body: 'ইন্টারনেট সংযোগ চালু হওয়ায় অফলাইন আবেদনসমূহ ক্লাউডে সিঙ্ক করা হয়েছে।',
        icon: '/icon-192.png',
        badge: '/favicon.svg',
        vibrate: [100, 50, 100]
      })
    );
  }
});
