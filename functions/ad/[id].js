// Cloudflare Pages Function: /ad/<id>  → صفحهٔ پیش‌نمایش (Open Graph) برای WhatsApp / Telegram / Google
// متغیرهای محیطی (اختیاری): SUPABASE_URL, SUPABASE_KEY (anon key), SITE_NAME
// اگر تنظیم نشوند، همان مقادیر عمومی داخل app.js استفاده می‌شوند (anon key عمومی است).
import { CATS, PROVS, landingPath } from "../_geo.js";
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuaHl6bXdnYXppZmRxeXZxc251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTkxNjEsImV4cCI6MjEwODg3NTE2MX0.TuvApVWN-fTtd3aLQy0aerNgy3vJq1ZXuZehtytpNNo"; // anon key عمومی است (همان کلید داخل app.js)
const SAFE_ID = /^[A-Za-z0-9_-]{1,60}$/;
const DEFAULT_URL = "https://snhyzmwgazifdqyvqsnu.supabase.co";
const IMG_PREFIX = DEFAULT_URL + "/storage/v1/object/public/ad-images/";
const SAFE_IMG = /^[A-Za-z0-9_./-]+$/;

const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const CSP = "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src https:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
// آگهی حذف‌شده / منقضی / تاییدنشده: کد ۴۱۰ + noindex تا گوگل آن را از نتایج بردارد (به‌جای ریدایرکت به صفحهٔ اصلی)
const gone = (origin, site) => new Response(`<!DOCTYPE html>
<html lang="fa" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>آگهی در دسترس نیست | ${esc(site)}</title>
<style>body{font-family:system-ui,Tahoma,sans-serif;max-width:560px;margin:0 auto;padding:48px 20px;line-height:2;text-align:center}.a{display:inline-block;margin-top:12px;padding:10px 22px;border-radius:99px;background:#0e7a4b;color:#fff;text-decoration:none;font-weight:700}</style>
</head><body>
<h1>این آگهی دیگر در دسترس نیست</h1>
<p>ممکن است فروخته شده، حذف یا منقضی شده باشد، یا هنوز تایید نشده باشد.</p>
<a class="a" href="${esc(origin)}/">دیدن آگهی‌های تازه در ${esc(site)}</a>
</body></html>`, {
  status: 410,
  headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": CSP }
});
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

  const siteName = String(env.SITE_NAME || "افغان‌بازار");
  let ad = null, fetched = false;
  try {
    const r = await fetch(
      `${base}/rest/v1/ads?id=eq.${encodeURIComponent(id)}&status=eq.approved&select=id,data&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    const rows = r.ok ? await r.json() : [];
    fetched = r.ok && Array.isArray(rows);
    if (fetched && rows.length === 0) return gone(origin, siteName);   // وجود ندارد یا تایید نیست → ۴۱۰
    ad = rows[0] && rows[0].data;
  } catch (_) {}
  if (!ad || typeof ad !== "object") return redirect(spa);             // خطای شبکه/سرور → کاربر به برنامه برود

  const site = siteName;
  const priceNum = Number(ad.p);
  const price = Number.isFinite(priceNum) && priceNum > 0
    ? priceNum.toLocaleString("fa-IR") + " " + (ad.cur === "USD" ? "دلار" : "افغانی")
    : "توافقی";
  const title = `${String(ad.t || "آگهی").slice(0, 80)} — ${price}`;
  const desc = (String(ad.d || "").replace(/\s+/g, " ").slice(0, 160)) || `خرید و فروش در ${site}`;
  const first = (Array.isArray(ad.imgs) && ad.imgs[0]) || "";
  const okImg = u => typeof u === "string" && u.startsWith(IMG_PREFIX) && SAFE_IMG.test(u.slice(IMG_PREFIX.length));
  const thumb = ad.th && typeof ad.th === "object" ? ad.th[first] : "";
  // برای واتساپ/تلگرام تصویر کوچک (th) بهتر است؛ عکس بزرگ گاهی رد می‌شود
  const img = okImg(thumb) ? thumb : okImg(first) ? first : `${origin}/icon-maskable-512.png`;
  const pageUrl = `${origin}/ad/${encodeURIComponent(id)}`;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org", "@type": "Product", name: String(ad.t || "آگهی").slice(0, 120),
    description: desc, image: [img],
    offers: Number.isFinite(priceNum) && priceNum > 0
      ? { "@type": "Offer", price: priceNum, priceCurrency: ad.cur === "USD" ? "USD" : "AFN", availability: "https://schema.org/InStock", url: pageUrl } : undefined
  }).replace(/</g, "\\u003c");
  // همهٔ عکس‌های معتبر (حداکثر ۸)
  const gallery = (Array.isArray(ad.imgs) ? ad.imgs : []).filter(okImg).slice(0, 8);
  const ci = Number(ad.ci), cat = Number(ad.c);
  const prov = Number.isInteger(ci) && ci >= 0 && ci < PROVS.length ? PROVS[ci] : null;
  const catO = Number.isInteger(cat) && cat > 0 && cat < CATS.length ? CATS[cat] : null;
  const crumbs = [];
  if (catO) crumbs.push(`<a href="${esc(origin + landingPath(cat, -1))}">${esc(catO.name)}</a>`);
  if (prov) crumbs.push(catO ? `<a href="${esc(origin + landingPath(cat, ci))}">${esc(prov.short)}</a>` : `<a href="${esc(origin + "/p/" + prov.slug)}">${esc(prov.short)}</a>`);
  const phone = String(ad.ph || "").replace(/[^\d+]/g, "").slice(0, 16);
  const wa = phone ? (/^\+?93/.test(phone) ? phone.replace(/\D/g, "") : "93" + phone.replace(/\D/g, "").replace(/^0/, "")) : "";
  const waText = encodeURIComponent(`سلام، این آگهی را دیدم: ${String(ad.t || "").slice(0, 80)}\n${pageUrl}`);

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
<style>
*{box-sizing:border-box}body{font-family:system-ui,Tahoma,sans-serif;max-width:720px;margin:0 auto;padding:16px;line-height:1.9;color:#14231b;background:#fff}
a{color:#0e7a4b}.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:14px}
.crumbs a{margin-inline-end:6px}.crumbs a+a::before{content:"‹ ";color:#777}
h1{font-size:22px;margin:8px 0}.p{font-size:22px;font-weight:700;color:#0e7a4b;margin:4px 0 12px}
.g{display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;scroll-snap-type:x mandatory}
.g img{flex:0 0 100%;max-width:100%;max-height:420px;object-fit:contain;background:#f3f6f4;border-radius:12px;scroll-snap-align:center}
.d{white-space:pre-line;margin:12px 0}.btns{display:flex;flex-wrap:wrap;gap:10px;margin:16px 0}
.b{flex:1 1 140px;text-align:center;padding:12px 16px;border-radius:99px;text-decoration:none;font-weight:700;color:#fff;background:#0e7a4b}
.b.w{background:#25d366}.b.o{background:#fff;color:#0e7a4b;border:2px solid #0e7a4b}
.f{margin-top:24px;font-size:13px;color:#667}
@media(prefers-color-scheme:dark){body{background:#0f1a14;color:#e8f0ec}.g img{background:#1a2820}.b.o{background:transparent}.f{color:#9ab}}
</style>
</head><body>
<div class="top"><a href="${esc(origin)}/"><b>${esc(site)}</b></a><span class="crumbs">${crumbs.join("")}</span></div>
<h1>${esc(ad.t || "آگهی")}</h1>
<p class="p">${esc(price)}</p>
${gallery.length ? `<div class="g">${gallery.map((u, i) => `<img src="${esc(u)}" alt="${esc((ad.t || "") + " " + (i + 1))}"${i ? ' loading="lazy"' : ""}>`).join("")}</div>` : ""}
<p class="d">${esc(String(ad.d || "").slice(0, 3000))}</p>
<div class="btns">
${phone ? `<a class="b" href="tel:${esc(phone)}" rel="nofollow">تماس: ${esc(phone)}</a><a class="b w" href="https://wa.me/${esc(wa)}?text=${waText}" rel="nofollow noopener">واتساپ</a>` : ""}
<a class="b o" href="${esc(spa)}" rel="nofollow">چت با فروشنده و امکانات بیشتر در برنامه</a>
</div>
<p class="f">قبل از پرداخت، کالا را حضوری ببینید و از پرداخت پیش‌پرداخت به افراد ناشناس خودداری کنید.</p>
</body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin",
      // _headers روی پاسخ Functionها اعمال نمی‌شود؛ پس این‌جا (فقط همان اسکریپت درون‌خطی مجاز است)
      "Content-Security-Policy": CSP
    }
  });
}
