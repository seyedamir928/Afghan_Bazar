// کد مشترک صفحه‌های فرود «دسته» و «ولایت» (بدون onRequest؛ پس خودش آدرس نمی‌شود).
// ترتیب CATS و PROVS باید دقیقاً با cats و provinceCoords در app.js یکی باشد (اندیس = مقدار فیلد c و ci آگهی).
export const MIN_ADS = 3; // صفحهٔ فرود با کمتر از این تعداد آگهی noindex است و وارد sitemap نمی‌شود
export const CATS = [
  null,
  { slug: "real-estate", name: "املاک", e: "🏠" },
  { slug: "vehicles", name: "وسایل نقلیه", e: "🚗" },
  { slug: "mobile-tablet", name: "موبایل و تبلت", e: "📱" },
  { slug: "computers", name: "کمپیوتر و لپ‌تاپ", e: "💻" },
  { slug: "home-appliances", name: "لوازم خانگی", e: "🧺" },
  { slug: "furniture-decor", name: "مبلمان و دیکور", e: "🛋️" },
  { slug: "clothing", name: "لباس و پوشاک", e: "👕" },
  { slug: "agriculture-livestock", name: "زراعت و مالداری", e: "🐑" },
  { slug: "food-dried-fruit", name: "خوراک و خشکبار", e: "🌰" },
  { slug: "machinery-tools", name: "ماشین‌آلات و ابزار", e: "🔧" },
  { slug: "services", name: "خدمات", e: "🛠️" },
  { slug: "jobs", name: "استخدام", e: "💼" },
  { slug: "books-education", name: "کتاب و تحصیل", e: "📚" },
  { slug: "sports-entertainment", name: "ورزش و سرگرمی", e: "⚽" },
  { slug: "musical-instruments", name: "ساز و موسیقی", e: "🎸" }
];
const P = [
  ["kabul", "کابل"], ["herat", "هرات"], ["balkh", "بلخ (مزارشریف)"], ["kandahar", "قندهار"],
  ["nangarhar", "ننگرهار (جلال‌آباد)"], ["kunduz", "کندز"], ["ghazni", "غزنی"], ["bamyan", "بامیان"],
  ["parwan", "پروان (چاریکار)"], ["badakhshan", "بدخشان (فیض‌آباد)"], ["takhar", "تخار (تالقان)"],
  ["baghlan", "بغلان (پل‌خمری)"], ["samangan", "سمنگان (ایبک)"], ["jawzjan", "جوزجان (شبرغان)"],
  ["faryab", "فاریاب (میمنه)"], ["sar-e-pol", "سرپل"], ["badghis", "بادغیس (قلعه‌نو)"], ["ghor", "غور (فیروزکوه)"],
  ["nimroz", "نیمروز (زرنج)"], ["helmand", "هلمند (لشکرگاه)"], ["uruzgan", "ارزگان (ترین‌کوت)"],
  ["zabul", "زابل (قلات)"], ["paktia", "پکتیا (گردیز)"], ["paktika", "پکتیکا (شرنه)"], ["khost", "خوست"],
  ["kunar", "کنر (اسد‌آباد)"], ["laghman", "لغمان (مهترلام)"], ["nuristan", "نورستان (پارون)"],
  ["panjshir", "پنجشیر (بازارک)"], ["daykundi", "دایکندی (نیلی)"], ["maidan-wardak", "میدان وردک (میدان‌شهر)"],
  ["logar", "لوگر (پل‌علم)"], ["kapisa", "کاپیسا (محمود‌راقی)"], ["farah", "فراه"]
];
export const PROVS = P.map(([slug, name]) => ({ slug, name, short: name.replace(/\s*\(.*\)\s*/, "") }));
export const catBySlug = s => { const i = CATS.findIndex(c => c && c.slug === s); return i > 0 ? i : -1; };
export const provBySlug = s => PROVS.findIndex(p => p.slug === s);

const DEFAULT_URL = "https://snhyzmwgazifdqyvqsnu.supabase.co";
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuaHl6bXdnYXppZmRxeXZxc251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTkxNjEsImV4cCI6MjEwODg3NTE2MX0.TuvApVWN-fTtd3aLQy0aerNgy3vJq1ZXuZehtytpNNo"; // anon key عمومی است
const IMG_PREFIX = DEFAULT_URL + "/storage/v1/object/public/ad-images/";
const SAFE_IMG = /^[A-Za-z0-9_./-]+$/;
const SAFE_ID = /^[A-Za-z0-9_-]{1,60}$/;
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src https:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
const HDR = { "Content-Type": "text/html; charset=utf-8", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin", "Content-Security-Policy": CSP };

const redirectHome = origin => new Response(null, { status: 302, headers: { Location: origin + "/", "Cache-Control": "no-store" } });

// cat: اندیس دسته (۱..۱۵) یا 0؛ prov: اندیس ولایت یا -1
export function landingPath(cat, prov) {
  if (cat > 0 && prov >= 0) return `/c/${CATS[cat].slug}/${PROVS[prov].slug}`;
  if (cat > 0) return `/c/${CATS[cat].slug}`;
  return `/p/${PROVS[prov].slug}`;
}
const spaHash = (cat, prov) => "#" + [cat > 0 ? "cat-" + cat : "", prov >= 0 ? "prov-" + prov : ""].filter(Boolean).join("-");

export async function renderLanding({ origin, env, cat, prov }) {
  if (!(cat > 0 || prov >= 0)) return redirectHome(origin);
  const base = (env.SUPABASE_URL || DEFAULT_URL).replace(/\/+$/, "");
  const key = env.SUPABASE_KEY || DEFAULT_KEY;
  const site = String(env.SITE_NAME || "افغان‌بازار");
  const headers = { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" };

  let q = "status=eq.approved&select=id,created_at,data&order=created_at.desc&limit=30";
  if (cat > 0) q += `&data->>c=eq.${cat}`;
  if (prov >= 0) q += `&data->>ci=eq.${prov}`;
  let rows = null, total = 0;
  for (const extra of ["&or=(data->>isWholesale.is.null,data->>isWholesale.neq.true)", ""]) {
    try {
      const r = await fetch(`${base}/rest/v1/ads?${q}${extra}`, { headers });
      if (!r.ok) continue;
      const j = await r.json();
      if (!Array.isArray(j)) continue;
      rows = j.filter(x => x && x.data && !x.data.isWholesale && SAFE_ID.test(String(x.id)));
      const m = /\/(\d+)$/.exec(r.headers.get("content-range") || "");
      total = m ? +m[1] : rows.length;
      if (extra === "") total = rows.length >= 30 ? Math.max(total, rows.length) : rows.length; // بدون فیلتر عمده، شمارش دقیق نیست
      break;
    } catch (_) {}
  }
  const spa = origin + "/" + spaHash(cat, prov);
  if (rows === null) return new Response(null, { status: 302, headers: { Location: spa, "Cache-Control": "no-store" } }); // خطای موقت Supabase

  const cName = cat > 0 ? CATS[cat].name : "", pShort = prov >= 0 ? PROVS[prov].short : "", pFull = prov >= 0 ? PROVS[prov].name : "";
  const h1 = cat > 0 && prov >= 0 ? `${cName} در ${pShort}` : cat > 0 ? `${cName} در افغانستان` : `آگهی‌های ${pShort}`;
  const title = `خرید و فروش ${h1}`;
  const desc = `${rows.length ? "تازه‌ترین آگهی‌های " : "آگهی‌های "}${h1} در ${site}؛ ${cat > 0 ? "قیمت، عکس و تماس مستقیم با فروشنده." : "همهٔ دسته‌ها در یک جا."}`;
  const pageUrl = origin + landingPath(cat, prov);
  const thin = rows.length < MIN_ADS;

  const items = rows.map(x => {
    const a = x.data, id = String(x.id);
    const pn = Number(a.p);
    const price = Number.isFinite(pn) && pn > 0 ? pn.toLocaleString("fa-IR") + " " + (a.cur === "USD" ? "دلار" : "افغانی") : "توافقی";
    const first = Array.isArray(a.imgs) && typeof a.imgs[0] === "string" ? a.imgs[0] : "";
    const img = first.startsWith(IMG_PREFIX) && SAFE_IMG.test(first.slice(IMG_PREFIX.length)) ? first : "";
    const where = Number.isInteger(+a.ci) && PROVS[+a.ci] ? PROVS[+a.ci].short : "";
    return { id, title: String(a.t || "آگهی").slice(0, 90), price, img, where };
  });

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org", "@type": "CollectionPage", name: title, url: pageUrl, description: desc,
    mainEntity: { "@type": "ItemList", itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, url: `${origin}/ad/${encodeURIComponent(it.id)}`, name: it.title })) }
  }).replace(/</g, "\\u003c");

  const cards = items.map(it => `<li><a href="${esc(origin)}/ad/${encodeURIComponent(it.id)}">${it.img ? `<img src="${esc(it.img)}" alt="${esc(it.title)}" loading="lazy">` : ""}<b>${esc(it.title)}</b><span class="p">${esc(it.price)}</span>${it.where ? `<small>${esc(it.where)}</small>` : ""}</a></li>`).join("");

  // لینک‌های داخلی: از صفحهٔ دسته به ولایت‌ها و برعکس (برای خزیدن و کاربر)
  let related = "";
  if (cat > 0 && prov < 0) related = PROVS.map((p, i) => `<a href="${esc(origin)}${landingPath(cat, i)}">${esc(cName)} در ${esc(p.short)}</a>`).join("");
  else if (cat > 0 && prov >= 0) related = `<a href="${esc(origin)}${landingPath(cat, -1)}">همهٔ ${esc(cName)} در افغانستان</a><a href="${esc(origin)}${landingPath(0, prov)}">همهٔ آگهی‌های ${esc(pShort)}</a>`;
  else related = CATS.slice(1).map((c, i) => `<a href="${esc(origin)}${landingPath(i + 1, prov)}">${esc(c.name)} در ${esc(pShort)}</a>`).join("");

  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | ${esc(site)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${thin ? "noindex,follow" : "index,follow"}">
<link rel="canonical" href="${esc(pageUrl)}">
<meta property="og:site_name" content="${esc(site)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(pageUrl)}">
<meta property="og:image" content="${esc(items[0] && items[0].img ? items[0].img : origin + "/icon-maskable-512.png")}">
<script type="application/ld+json">${jsonLd}</script>
<style>body{font-family:system-ui,Tahoma,sans-serif;max-width:860px;margin:0 auto;padding:16px;line-height:1.8}ul.l{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}ul.l a{display:block;text-decoration:none;color:inherit;border:1px solid #dfe8e2;border-radius:14px;padding:8px;height:100%}ul.l img{width:100%;height:130px;object-fit:cover;border-radius:10px}ul.l b{display:block;font-size:14px}.p{color:#0e7a4b;font-weight:700;font-size:14px}small{display:block;color:#55665d}nav.r{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}nav.r a{font-size:13px;padding:4px 12px;border:1px solid #dfe8e2;border-radius:99px;text-decoration:none;color:#0e7a4b}</style>
</head><body>
<h1>${esc(h1)}${prov >= 0 && pFull !== pShort ? ` <small>(${esc(pFull)})</small>` : ""}</h1>
${rows.length ? `<p>${esc(desc)}</p><ul class="l">${cards}</ul>` : `<p>هنوز آگهی‌ای در این بخش ثبت نشده است. اولین آگهی را شما بگذارید.</p>`}
<p><a href="${esc(spa)}">مشاهدهٔ همهٔ آگهی‌ها و فیلتر کردن در ${esc(site)}</a></p>
<nav class="r" aria-label="بخش‌های مرتبط">${related}</nav>
<script>if(!/bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|twitterbot|preview/i.test(navigator.userAgent))location.replace(${JSON.stringify(spa).replace(/</g, "\\u003c")});</script></body></html>`;

  return new Response(html, { headers: { ...HDR, "Cache-Control": "public, max-age=600" } });
}
