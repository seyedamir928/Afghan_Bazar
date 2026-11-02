// Cloudflare Pages Function — پروکسی تایل‌های نقشه
// آدرس: /tiles/{z}/{x}/{y}.png  یا  /tiles/{z}/{x}/{y}@2x.png
// چرا؟ مرورگر کاربر در افغانستان مستقیم به سرور تایل‌ها دسترسی ندارد؛ اما به سایت خودتان دارد.
// سرور Cloudflare تایل را می‌گیرد، کش می‌کند و از همان دامنه‌ی سایت تحویل می‌دهد.
const UA = 'AfghanBazar/1.0 (+https://afghan-bazar.pages.dev)';

export async function onRequestGet(context) {
  const { request, params } = context;
  const parts = Array.isArray(params.path) ? params.path : [params.path];
  if (parts.length !== 3) return new Response('bad request', { status: 400 });

  const [z, x, yRaw] = parts;
  const m = /^(\d{1,7})(@2x)?\.png$/.exec(yRaw || '');
  if (!/^\d{1,2}$/.test(z || '') || !/^\d{1,7}$/.test(x || '') || !m) {
    return new Response('bad request', { status: 400 });
  }
  const zi = +z;
  if (zi < 0 || zi > 19) return new Response('bad zoom', { status: 400 });
  const max = Math.pow(2, zi);
  if (+x >= max || +m[1] >= max) return new Response('out of range', { status: 400 });

  const y = m[1];
  const retina = !!m[2];
  const origin = new URL(request.url).origin;

  const cache = caches.default;
  const key = new Request(`${origin}/tiles/${z}/${x}/${y}${retina ? '@2x' : ''}.png`);
  const hit = await cache.match(key);
  if (hit) return hit;

  const sub = 'abcd'[(+x + +y) % 4];
  const upstreams = [
    `https://${sub}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}${retina ? '@2x' : ''}.png`,
    `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  ];

  for (const u of upstreams) {
    try {
      const r = await fetch(u, {
        headers: { 'User-Agent': UA, 'Referer': origin + '/', 'Accept': 'image/png,image/*' },
        cf: { cacheTtl: 604800, cacheEverything: true },
      });
      const type = r.headers.get('content-type') || '';
      if (r.ok && type.startsWith('image/')) {
        const body = await r.arrayBuffer();
        const res = new Response(body, {
          status: 200,
          headers: {
            'Content-Type': type,
            'Cache-Control': 'public, max-age=86400, s-maxage=604800',
            'X-Tile-Source': new URL(u).hostname,
          },
        });
        context.waitUntil(cache.put(key, res.clone()));
        return res;
      }
    } catch (_) { /* منبع بعدی */ }
  }
  return new Response('tile upstream unavailable', { status: 502, headers: { 'Cache-Control': 'no-store' } });
}
