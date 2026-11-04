// Cloudflare Pages Function: /ad/<id>  → صفحهٔ پیش‌نمایش (Open Graph) برای WhatsApp / Telegram / Google
// متغیرهای محیطی (اختیاری): SUPABASE_URL, SUPABASE_KEY (anon key), SITE_NAME
// اگر تنظیم نشوند، همان مقادیر عمومی داخل app.js استفاده می‌شوند (anon key عمومی است).
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuaHl6bXdnYXppZmRxeXZxc251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTkxNjEsImV4cCI6MjEwODg3NTE2MX0.TuvApVWN-fTtd3aLQy0aerNgy3vJq1ZXuZehtytpNNo"; // anon key عمومی است (همان کلید داخل app.js)
const SAFE_ID = /^[A-Za-z0-9_-]{1,60}$/;
const DEFAULT_URL = "https://snhyzmwgazifdqyvqsnu.supabase.co";
const IMG_PREFIX = DEFAULT_URL + "/storage/v1/object/public/ad-images/";
const SAFE_IMG = /^[A-Za-z0-9_./-]+$/;

const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const redirect = (to) => new Response(null, { status: 302, headers: { Location: to, "Cache-Control": "no-store" } });

export async function onRequestGet({ params, request, env }) {
  const id = String(params.id || "");
  const origin = new URL(request.url).origin;
  if (!SAFE_ID.test(id)) return redirect(origin + "/");
  const spa = `${origin}/#ad-${encodeURIComponent(id)}`;

  const base = (env.SUPABASE_URL || DEFAULT_URL).replace(/\/+$/, "");
  const key = env.SUPABASE_KEY || DEFAULT_KEY;
  // اگر کلید تنظیم نشده باشد، کاربر مستقیم به خود سایت می‌رود (پیش‌نمایش ساخته نمی‌شود، ولی لینک خراب نمی‌شود)
  if (!key) return redirect(spa);

  let ad = null;
  try {
    const r = await fetch(
      `${base}/rest/v1/ads?id=eq.${encodeURIComponent(id)}&status=eq.approved&select=id,data&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    const rows = r.ok ? await r.json() : [];
    ad = rows[0] && rows[0].data;
  } catch (_) {}
  if (!ad || typeof ad !== "object") return redirect(spa);

  const site = String(env.SITE_NAME || "افغان‌بازار");
  const priceNum = Number(ad.p);
  const price = Number.isFinite(priceNum) && priceNum > 0
    ? priceNum.toLocaleString("fa-IR") + " " + (ad.cur === "USD" ? "دلار" : "افغانی")
    : "توافقی";
  const title = `${String(ad.t || "آگهی").slice(0, 80)} — ${price}`;
  const desc = (String(ad.d || "").replace(/\s+/g, " ").slice(0, 160)) || `خرید و فروش در ${site}`;
  const first = (Array.isArray(ad.imgs) && ad.imgs[0]) || "";
  const img = typeof first === "string" && first.startsWith(IMG_PREFIX) && SAFE_IMG.test(first.slice(IMG_PREFIX.length))
    ? first : `${origin}/icon-512.png`;
  const pageUrl = `${origin}/ad/${encodeURIComponent(id)}`;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org", "@type": "Product", name: String(ad.t || "آگهی").slice(0, 120),
    description: desc, image: [img],
    offers: Number.isFinite(priceNum) && priceNum > 0
      ? { "@type": "Offer", price: priceNum, priceCurrency: ad.cur === "USD" ? "USD" : "AFN", availability: "https://schema.org/InStock", url: pageUrl } : undefined
  }).replace(/</g, "\\u003c");
  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | ${esc(site)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(pageUrl)}">
<meta property="og:site_name" content="${esc(site)}">
<meta property="og:type" content="product">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:url" content="${esc(pageUrl)}">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${jsonLd}</script>
<style>body{font-family:system-ui,Tahoma,sans-serif;max-width:720px;margin:0 auto;padding:16px;line-height:1.8}img{max-width:100%;height:auto;border-radius:12px}.p{font-size:20px;font-weight:700;color:#0e7a4b}</style>
</head><body>
<h1>${esc(ad.t || "آگهی")}</h1>
${first && img === first ? `<img src="${esc(first)}" alt="${esc(ad.t || "")}">` : ""}
<p class="p">${esc(price)}</p>
<p>${esc(String(ad.d || "").slice(0, 1500))}</p>
<p><a href="${esc(spa)}">مشاهدهٔ آگهی و تماس با فروشنده در ${esc(site)}</a></p>
<script>if(!/bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|twitterbot|preview/i.test(navigator.userAgent))location.replace(${JSON.stringify(spa).replace(/</g, "\\u003c")});</script></body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin",
      // _headers روی پاسخ Functionها اعمال نمی‌شود؛ پس این‌جا (فقط همان اسکریپت درون‌خطی مجاز است)
      "Content-Security-Policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src https:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
    }
  });
}
