// Cloudflare Pages Function: /sitemap.xml  → نقشهٔ پویا: صفحهٔ اصلی + آگهی‌های تاییدشده + صفحه‌های فرود دسته/ولایت (فقط وقتی آگهی کافی دارند)
// دامنه خودکار از همان درخواست خوانده می‌شود؛ با عوض شدن دامنه چیزی لازم نیست تغییر کند.
// متغیرهای محیطی (اختیاری): SUPABASE_URL, SUPABASE_KEY (anon key)
import { MIN_ADS, CATS, PROVS, landingPath } from "./_geo.js";
const DEFAULT_URL = "https://snhyzmwgazifdqyvqsnu.supabase.co";
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuaHl6bXdnYXppZmRxeXZxc251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTkxNjEsImV4cCI6MjEwODg3NTE2MX0.TuvApVWN-fTtd3aLQy0aerNgy3vJq1ZXuZehtytpNNo"; // anon key عمومی است
const SAFE_ID = /^[A-Za-z0-9_-]{1,60}$/;
const PAGE = 1000;      // سقف هر درخواست Supabase
const MAX_PAGES = 5;    // حداکثر ۵۰۰۰ آگهی در نقشه (سقف مجاز sitemap ۵۰٬۰۰۰ است)

export async function onRequestGet({ request, env }) {
  const origin = new URL(request.url).origin;
  const base = (env.SUPABASE_URL || DEFAULT_URL).replace(/\/+$/, "");
  const key = env.SUPABASE_KEY || DEFAULT_KEY;
  const hdr = { apikey: key, Authorization: `Bearer ${key}` };

  const urls = [`  <url><loc>${origin}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`];
  const adUrls = [];
  const nCat = {}, nProv = {}, nBoth = {};
  let complete = true, rich = true;
  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const sel = rich ? "id,created_at,c:data->c,ci:data->ci,w:data->isWholesale" : "id,created_at";
      let r = await fetch(`${base}/rest/v1/ads?status=eq.approved&select=${sel}&order=created_at.desc&limit=${PAGE}&offset=${page * PAGE}`, { headers: hdr });
      if (!r.ok && rich && page === 0) {   // اگر select پیشرفته جواب نداد، به حالت ساده برگرد (فقط صفحه‌های فرود حذف می‌شوند)
        rich = false;
        r = await fetch(`${base}/rest/v1/ads?status=eq.approved&select=id,created_at&order=created_at.desc&limit=${PAGE}&offset=0`, { headers: hdr });
      }
      if (!r.ok) { complete = false; break; }
      const rows = await r.json();
      if (!Array.isArray(rows)) { complete = false; break; }
      for (const row of rows) {
        const id = String(row && row.id || "");
        if (!SAFE_ID.test(id)) continue;
        const d = String(row.created_at || "").slice(0, 10);
        const lastmod = /^\d{4}-\d{2}-\d{2}$/.test(d) ? `<lastmod>${d}</lastmod>` : "";
        adUrls.push(`  <url><loc>${origin}/ad/${encodeURIComponent(id)}</loc>${lastmod}<changefreq>weekly</changefreq><priority>0.6</priority></url>`);
        if (rich && !row.w) {
          const c = Number(row.c), ci = Number(row.ci);
          const okC = Number.isInteger(c) && c > 0 && c < CATS.length, okP = Number.isInteger(ci) && ci >= 0 && ci < PROVS.length;
          if (okC) nCat[c] = (nCat[c] || 0) + 1;
          if (okP) nProv[ci] = (nProv[ci] || 0) + 1;
          if (okC && okP) nBoth[c + "_" + ci] = (nBoth[c + "_" + ci] || 0) + 1;
        }
      }
      if (rows.length < PAGE) break;
    }
  } catch (_) { complete = false; }

  const landing = [];
  const add = (cat, prov, prio) => landing.push(`  <url><loc>${origin}${landingPath(cat, prov)}</loc><changefreq>daily</changefreq><priority>${prio}</priority></url>`);
  Object.keys(nCat).forEach(c => { if (nCat[c] >= MIN_ADS) add(+c, -1, "0.8"); });
  Object.keys(nProv).forEach(p => { if (nProv[p] >= MIN_ADS) add(0, +p, "0.8"); });
  Object.keys(nBoth).forEach(k => { if (nBoth[k] >= MIN_ADS) { const [c, p] = k.split("_"); add(+c, +p, "0.7"); } });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.concat(landing, adUrls).join("\n")}\n</urlset>\n`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // اگر دریافت از Supabase ناقص بود، کش کوتاه تا زود دوباره امتحان شود
      "Cache-Control": complete ? "public, max-age=3600" : "public, max-age=120",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
