// Cloudflare Pages Function — ارائه‌ی Leaflet از دامنه‌ی خود سایت
// آدرس‌ها: /vendor/leaflet/leaflet.js  و  /vendor/leaflet/leaflet.css
// (اگر فایل واقعی همین مسیر را در ریپو بگذارید، همان فایل استاتیک اولویت دارد.)
const FILES = {
  'leaflet.js': {
    type: 'application/javascript; charset=utf-8',
    urls: [
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
      'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js',
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    ],
  },
  'leaflet.css': {
    type: 'text/css; charset=utf-8',
    urls: [
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
      'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css',
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    ],
  },
};

export async function onRequestGet(context) {
  const { request, params } = context;
  const parts = Array.isArray(params.path) ? params.path : [params.path];
  const file = parts.length === 1 ? FILES[parts[0]] : null;
  if (!file) return new Response('not found', { status: 404 });

  const cache = caches.default;
  const key = new Request(new URL(request.url).origin + '/vendor/leaflet/' + parts[0]);
  const hit = await cache.match(key);
  if (hit) return hit;

  for (const u of file.urls) {
    try {
      const r = await fetch(u, { cf: { cacheTtl: 2592000, cacheEverything: true } });
      if (!r.ok) continue;
      const body = await r.text();
      if (body.length < 5000) continue; // پاسخ خراب/خالی
      const res = new Response(body, {
        status: 200,
        headers: { 'Content-Type': file.type, 'Cache-Control': 'public, max-age=86400, s-maxage=2592000' },
      });
      context.waitUntil(cache.put(key, res.clone()));
      return res;
    } catch (_) { /* منبع بعدی */ }
  }
  return new Response('leaflet upstream unavailable', { status: 502, headers: { 'Cache-Control': 'no-store' } });
}
