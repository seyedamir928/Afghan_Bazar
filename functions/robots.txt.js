// Cloudflare Pages Function: /robots.txt  → دامنهٔ sitemap خودکار از درخواست خوانده می‌شود
export function onRequestGet({ request }) {
  const origin = new URL(request.url).origin;
  const body = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /tiles/\n\nSitemap: ${origin}/sitemap.xml\n`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" }
  });
}
