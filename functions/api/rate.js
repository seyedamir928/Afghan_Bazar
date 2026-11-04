// Cloudflare Pages Function: /api/rate → نرخ تقریبی دلار به افغانی (برای نمایش و مرتب‌سازی قیمت‌های دلاری)
// از سمت سرور گرفته می‌شود تا CSP مرورگر (connect-src 'self') بازتر نشود؛ ۶ ساعت کش می‌شود.
// توجه: نرخ رسمی/بین‌المللی است و ممکن است با نرخ بازار (صرافی) کمی فرق کند.
export async function onRequestGet(context) {
  const cache = caches.default;
  const key = new Request(new URL(context.request.url).origin + '/api/rate');
  const hit = await cache.match(key);
  if (hit) return hit;

  const sources = [
    async () => { const r = await fetch('https://open.er-api.com/v6/latest/USD', { cf: { cacheTtl: 21600, cacheEverything: true } }); const d = await r.json(); return d && d.rates && d.rates.AFN; },
    async () => { const r = await fetch('https://api.frankfurter.app/latest?from=USD&to=AFN', { cf: { cacheTtl: 21600, cacheEverything: true } }); const d = await r.json(); return d && d.rates && d.rates.AFN; },
  ];
  for (const get of sources) {
    try {
      const rate = Number(await get());
      if (Number.isFinite(rate) && rate > 30 && rate < 300) {
        const res = new Response(JSON.stringify({ rate: Math.round(rate * 100) / 100, updated: new Date().toISOString() }), {
          headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=21600', 'X-Content-Type-Options': 'nosniff' },
        });
        context.waitUntil(cache.put(key, res.clone()));
        return res;
      }
    } catch (_) { /* منبع بعدی */ }
  }
  return new Response(JSON.stringify({ error: 'unavailable' }), { status: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
