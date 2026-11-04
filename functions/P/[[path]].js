// /p/<province>  → صفحهٔ فرود ولایت
import { provBySlug, renderLanding } from "../_geo.js";
export async function onRequestGet({ params, request, env }) {
  const origin = new URL(request.url).origin;
  const prov = provBySlug(String(params.id || ""));
  if (prov < 0) return new Response(null, { status: 302, headers: { Location: origin + "/", "Cache-Control": "no-store" } });
  return renderLanding({ origin, env, cat: 0, prov });
}
