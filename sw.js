const CACHE_NAME = 'afghan-bazar-v2'; // نسخه را به v2 ارتقا دادیم تا کش‌های قدیمی پاک شوند
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;600;800&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// 1. نصب سرویس‌ورکر
self.addEventListener('install', (e) => {
  self.skipWaiting(); // مجبور کردن سرویس‌ورکر جدید به فعال شدن فوری
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// 2. فعال‌سازی و پاک‌سازی کش‌های قدیمی
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim()) // کنترل فوری تب‌های باز
  );
});

// 3. استراتژی دریافت اطلاعات (Fetch)
self.addEventListener('fetch', (e) => {
  // درخواست‌های مربوط به Supabase و متدهای غیر GET را کش نکن
  if (e.request.url.includes('supabase.co') || e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // اگر درخواست موفق بود، یک کپی از آن را کش کن (Network First)
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        return response;
      })
      .catch(() => caches.match(e.request)) // اگر اینترنت قطع بود، از کش بخوان
  );
});

// ==========================================
// 4. بخش حیاتی: پشتیبانی از Web Push (اعلان‌ها)
// ==========================================
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch(e) {
    data = { title: 'افغان‌بازار', body: event.data ? event.data.text() : 'پیام جدید دارید' };
  }

  const title = data.title || 'افغان‌بازار';
  const options = {
    body: data.body || 'پیام جدیدی در افغان‌بازار دارید',
    icon: data.icon || './icon-192.png',
    badge: data.badge || './icon-192.png',
    tag: data.tag || 'afghanbazar-general',
    data: { url: data.url || './' },
    vibrate: [100, 50, 100], // لرزش هنگام دریافت اعلان
    renotify: !!data.tag,    // اگر اعلان قبلی باز است، دوباره زنگ بزن
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// وقتی کاربر روی اعلان کلیک کرد چه شود؟
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || './';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // اگر سایت از قبل باز است، به آن تب برو
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // اگر سایت باز نیست، یک تب جدید باز کن
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
