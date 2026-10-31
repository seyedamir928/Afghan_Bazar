/* افغان‌بازار — Service Worker (نسخه 32)
   - صفحه اصلی: اول شبکه، اگر آفلاین بود از حافظه (کاربر همیشه آخرین نسخه را می‌گیرد)
   - فایل‌های ثابت همین سایت: کش با به‌روزرسانی پس‌زمینه
   - هیچ درخواستی به Supabase یا CDN کش نمی‌شود
   - پشتیبانی از اعلان پوش */
const VERSION = 'v32';
const CACHE = 'ab-shell-' + VERSION;
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ab-shell-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); return res; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req)
        .then((res) => { if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; })
        .catch(() => hit);
      return hit || net;
    })
  );
});

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'افغان‌بازار', {
    body: d.body || '',
    icon: './icon-192.png',
    badge: './icon-192.png',
    data: { url: d.url || './' }
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  let target = './';
  try {
    const u = new URL((e.notification.data && e.notification.data.url) || './', self.location.origin);
    if (u.origin === self.location.origin) target = u.href;
  } catch (_) {}
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) { if (c.navigate) c.navigate(target); return c.focus(); } }
      return clients.openWindow(target);
    })
  );
});
