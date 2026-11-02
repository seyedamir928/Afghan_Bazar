// Cloudflare Pages Function: /ad/<id>  → صفحهٔ پیش‌نمایش برای WhatsApp/Telegram/Google
// Environment variables: SUPABASE_URL, SUPABASE_KEY (anon key), SITE_NAME (اختیاری)
const SAFE_ID = /^[A-Za-z0-9_-]{1,60}$/;
const IMG_PREFIX = "https://snhyzmwgazifdqyvqsnu.supabase.co/storage/v1/object/public/ad-images/";
const SAFE_IMG = /^[A-Za-z0-9_./-]+$/;

const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export async function onRequest({ params, request, env }) {
  const id = String(params.id || "");
  const origin = new URL(request.url).origin;
  const spa = `${origin}/#ad-${encodeURIComponent(id)}`;
  if (!SAFE_ID.test(id)) return new Response("Not Found", { status: 404 });

  let ad = null;
  try {
    const r = await fetch(
      `${env.SUPABASE_URL}/rest/v1/ads?id=eq.${encodeURIComponent(id)}&status=eq.approved&select=id,data&limit=1`,
      { headers: { apikey: env.SUPABASE_KEY, Authorization: `Bearer ${env.SUPABASE_KEY}` } }
    );
    const rows = r.ok ? await r.json() : [];
    ad = rows[0] && rows[0].data;
  } catch (_) {}
  if (!ad) return new Response("Not Found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });

  const site = env.SITE_NAME || "افغان‌بازار";
  const price = Number(ad.p) > 0 ? Number(ad.p).toLocaleString("fa-IR") + " " + (ad.cur || "افغانی") : "توافقی";
  const title = `${String(ad.t || "آگهی").slice(0, 80)} — ${price}`;
  const desc = (String(ad.d || "").replace(/\s+/g, " ").slice(0, 160)) || `خرید و فروش در ${site}`;
  const first = (Array.isArray(ad.imgs) && ad.imgs[0]) || "";
  const img = typeof first === "string" && first.startsWith(IMG_PREFIX) && SAFE_IMG.test(first.slice(IMG_PREFIX.length))
    ? first : `${origin}/icon-512.png`;

  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | ${esc(site)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(request.url)}">
<meta property="og:site_name" content="${esc(site)}">
<meta property="og:type" content="product">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:url" content="${esc(request.url)}">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0; url=${esc(spa)}">
</head><body><p><a href="${esc(spa)}">${esc(ad.t || "آگهی")}</a></p>
<script>location.replace(${JSON.stringify(spa)});</script></body></html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" }
  });
}
