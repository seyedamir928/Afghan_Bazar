export async function onRequest(context) {
  const { params, request, env } = context;
  const id = params.id;
  
  // از Supabase دیتای آگهی را بگیر
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_KEY;
  const res = await fetch(`${supabaseUrl}/rest/v1/ads?id=eq.${encodeURIComponent(id)}&select=id,data`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  const rows = await res.json();
  if (!rows.length) return new Response("Not Found", { status: 404 });
  
  const ad = rows[0].data;
  const ogImage = (ad.imgs && ad.imgs[0]) || '/icon-512.png';
  const title = ad.t + ' — افغان‌بازار';
  const desc = (ad.d || '').substring(0, 160);
  
  // HTML ساده با meta tags
  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta property="og:url" content="${request.url}">
  <meta property="og:type" content="product">
  <meta http-equiv="refresh" content="0; url=/#ad-${encodeURIComponent(id)}">
</head>
<body>
  <p>در حال بارگذاری <a href="/#ad-${encodeURIComponent(id)}">آگهی</a>...</p>
  <script>location.href = "/#ad-${encodeURIComponent(id)}";</script>
</body>
</html>`;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
