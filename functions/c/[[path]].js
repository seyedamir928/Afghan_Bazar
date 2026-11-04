// /c/<category>  و  /c/<category>/<province>  → صفحهٔ فرود برای ربات‌ها و پیش‌نمایش؛ کاربر عادی به برنامه با فیلتر می‌رود.
import { catBySlug, provBySlug, renderLanding } from "../_geo.js";
export async function onRequestGet({ params, request, env }) {
  const origin = new URL(request.url).origin;
  const parts = [].concat(params.path || []).map(String);
  const cat = catBySlug(parts[0] || "");
  const prov = parts[1] ? provBySlug(parts[1]) : -1;
  if (cat < 0 || parts.length > 2 || (parts[1] && prov < 0)) return new Response(null, { status: 302, headers: { Location: origin + "/", "Cache-Control": "no-store" } });
  return renderLanding({ origin, env, cat, prov });
}
