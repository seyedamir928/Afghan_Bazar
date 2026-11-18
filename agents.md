# AGENTS.md — Afghan Bazar (افغان‌بازار)

Persian/Pashto (RTL) retail + wholesale classifieds PWA for Afghanistan. Plain static site, **no build step**.

## Architecture
- `index.html` — all markup and all CSS (single `<style>` block). Scripts load with `defer` in this order: `emoji-icons.js` → `medical.js` → `app.js`.
- `app.js` — all app logic (vanilla JS, Supabase client for auth/db/storage/realtime). Bump the `?v=` query in `index.html` and `VERSION` in `sw.js` when you change shipped JS.
- `medical.js` — builds `window.AB_MED`: the "Medicine & Health" (طبابت و صحت) categories for both tabs, their specialised form fields, the sign-up health-profile fields, and fa/ps i18n strings. `app.js` merges it into `catsLocalized`, `wholesaleCatsLocalized`, `i18n`, `categoryMeta` and `wholesaleCategoryMeta`.
- `emoji-icons.js` — replaces emojis in the DOM with SVG symbols (`SYM` + `MAP`). Add an icon there when introducing a new category emoji.
- `functions/` — **Cloudflare Pages Functions** (original host). They do not run on Netlify. `netlify.toml` proxies `/vendor/leaflet/*` and `/tiles/v2/*` so the map works on Netlify; `/api/rate` falls back client-side; `/ad/:id`, `/c/*`, sitemap/robots are not ported yet.
- Data lives in Supabase (see README for SQL scripts). Supabase URL/anon key are in `app.js`, `_headers`, `functions/ad/[id].js`.

## Conventions / non-obvious decisions
- Category IDs are **array indices** stored on ads (`c` retail, `wholesaleCat` wholesale). Never reorder or insert — only append. `functions/_geo.js` `CATS` must mirror the retail list.
- Medical group: retail index `MED_R` (16) and wholesale `MED_W` (9) are pseudo "all medical" filters (not selectable when posting); real sub-categories follow. They render in their own `.med-zone` bars (`#med-cats`, `#med-wholesale-cats`) and a home section `#med-tiles`, styled with `--med*` CSS variables (raspberry/magenta), separate from green retail and navy wholesale.
- Category field definitions: `{k, lKey, ty, ph, oKeys, req}`; select values are language-neutral keys (`opt…`) translated at display time. `req` fields and past expiry dates are validated in `validateMedFields()` (form step 3).
- The sign-up health profile is saved on the local `users[me].med` object only (the `profiles` table schema is not in this repo).
- UI text is Dari (fa) with Pashto (ps) translations; keep both in sync.
