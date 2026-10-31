# 🇦🇫 افغان‌بازار — Afghan Bazar

پلتفرم آگهی‌های عمده و پرچون افغانستان با نقشه شعاعی، مقایسه کالا، چت زندهٔ Supabase و PWA.

---

## 🧱 Tech Stack

| لایه | فناوری |
|---|---|
| Frontend | HTML + Vanilla JS + CSS (تک‌فایل `index.html`) |
| Backend / DB | [Supabase](https://supabase.com) (Postgres + Auth + Storage + Realtime) |
| Map | [Leaflet](https://leafletjs.com) + OpenStreetMap |
| Font | Vazirmatn (Google Fonts) |
| Hosting | Vercel / Netlify / Cloudflare Pages / هر static host |

---

## 📁 ساختار پروژه

```
afghan-bazar/
├── index.html          # کل اپ (SPA تک‌فایل)
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (PWA)
├── icon-192.png        # آیکون PWA
├── icon-512.png        # آیکون PWA
└── README.md
```

---

## 1. راه‌اندازی Supabase

### الف) پروژه بسازید
1. برو به [supabase.com](https://supabase.com) → **New Project**
2. نام، پسورد، منطقه (Frankfurt بهترین برای افغانستان) را انتخاب کنید
3. صبر کنید تا پروژه ساخته شود

### ب) اسکریپت SQL را اجرا کنید
1. در داشبورد → **SQL Editor** → **New query**
2. محتوای کامل فایل `setup.sql` (بالاتر در این README) را پیست کنید
3. **Run** بزنید

### ج) کلیدهای خود را در `index.html` جایگزین کنید

بالای `<script>` اصلی، این بخش:

```js
const SUPABASE_URL = 'https://snhyzmwgazifdqyvqsnu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

را با مقادیر **Project Settings → API** پروژهٔ خودتان جایگزین کنید:
- `URL` → `https://YOUR-PROJECT-ID.supabase.co`
- `anon public key` → کلید طولانی `eyJ...`

### د) Auth را تنظیم کنید
1. **Authentication → Providers → Email** → `Enable email provider` ✅
2. **Authentication → URL Configuration**:
   - `Site URL`: `https://your-domain.com`
   - `Redirect URLs`: `https://your-domain.com/*` و `http://localhost:*` (برای تست)
3. (اختیاری) **Authentication → Providers → Google** → تنظیم OAuth
   - Redirect URI گوگل: `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`

### ه) اولین ادمین را ثبت کنید
1. با ایمیل خودتان یک بار در سایت ثبت‌نام کنید (ورود با ایمیل + OTP)
2. در **SQL Editor** اجرا کنید:
```sql
INSERT INTO public.admins (user_id)
SELECT id FROM auth.users WHERE email = 'YOUR_ADMIN_EMAIL@example.com'
ON CONFLICT DO NOTHING;
```
3. حالا در منوی «من» گزینهٔ «پنل مدیریت» دیده می‌شود.

---

## 2. تست محلی

چون از Supabase CDN استفاده می‌شود، فقط یک static server لازم است.

### با Python:
```bash
python3 -m http.server 8080
```

### با Node:
```bash
npx serve .
```

### با PHP:
```bash
php -S localhost:8080
```

سپس برو به `http://localhost:8080`

> ⚠️ **ورود با گوگل** روی `localhost` و `http://` کار نمی‌کند (Supabase نیاز به `https` دارد). برای تست Google OAuth از `ngrok` یا Vercel Preview استفاده کنید. ورود با ایمیل/OTP روی localhost کار می‌کند.

---

## 3. فایل‌های PWA

### `manifest.json`
```json
{
  "name": "افغان‌بازار | Afghan Bazar",
  "short_name": "افغان‌بازار",
  "description": "بازار آگهی‌های عمده و پرچون افغانستان",
  "lang": "fa",
  "dir": "rtl",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#f2f6f3",
  "theme_color": "#0e7a4b",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### `sw.js` (نسخهٔ حداقلی و امن)
```js
const CACHE = 'afghan-bazar-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Supabase, fonts, tile servers → شبکه اول
  const url = new URL(req.url);
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('fonts.g') ||
    url.hostname.includes('unpkg.com') ||
    url.hostname.includes('jsdelivr.net') ||
    url.hostname.includes('tile.openstreetmap.org')
  ) return;

  // بقیه → cache-first با به‌روزرسانی پس‌زمینه
  e.respondWith(
    caches.match(req).then((cached) => {
      const fetchP = fetch(req).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || fetchP;
    })
  );
});
```

### آیکون‌ها
دو فایل PNG بسازید (192×192 و 512×512). می‌توانید از [favicon.io](https://favicon.io) یا [realfavicongenerator.net](https://realfavicongenerator.net) استفاده کنید و پسوند `.png` بدهید.

---

## 4. دیپلوی روی Vercel

### الف) آماده‌سازی Git
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/afghan-bazar.git
git push -u origin main
```

### ب) وصل کردن به Vercel
1. برو به [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** → ریپوی خود را انتخاب کنید
3. تنظیمات پیش‌فرض کافی است (Framework Preset: **Other**)
4. **Deploy** بزنید

### ج) دامنهٔ سفارشی
1. **Settings → Domains** → دامنهٔ خود را اضافه کنید
2. در DNS registrar خود، رکورد `CNAME` را طبق راهنمای Vercel ست کنید

### د) Supabase را با دامنهٔ جدید همگام کنید
در Supabase → **Authentication → URL Configuration**:
- `Site URL` = `https://your-domain.com`
- `Redirect URLs` += `https://your-domain.com/**`

---

## 5. دیپلوی روی Netlify

### الف) از Git
1. برو به [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
2. ریپوی GitHub را انتخاب کنید
3. تنظیمات:
   - **Build command**: خالی (empty)
   - **Publish directory**: `.` یا `/` (ریشه)
4. **Deploy site** بزنید

### ب) از CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### ج) دامنهٔ سفارشی
**Domain settings → Add custom domain** → DNS را در registrar تنظیم کنید (Netlify در صفحه راهنمایی می‌کند)

### د) Supabase Redirect
همانند Vercel: `Site URL` و `Redirect URLs` را با دامنهٔ Netlify به‌روز کنید.

---

## 6. Cloudflare Pages (جایگزین)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Pages** → **Create a project**
2. Git را وصل کنید
3. Build settings: خالی
4. Framework: **None**
5. Deploy

مزیت: CDN رایگان و پرسرعت. برای افغانستان گاهی از Vercel پایدارتر است.

---

## 7. متغیرهای محیطی (اختیاری — پیشرفته)

کد فعلی Supabase URL/KEY را **hardcode** دارد. اگر می‌خواهید:

- **امنیت بیشتر**: anon key عمومی است و لو رفتنش خطر جدی ندارد (RLS جلوی بقیه را می‌گیرد). پس این مشکل حادی نیست.
- **چند محیطی** (dev/prod): یک build step با Vercel/Netlify اضافه کنید تا `{{SUPABASE_URL}}` را با env جایگزین کند.

### روش ساده با Vercel
فایل `vercel.json` بسازید:
```json
{
  "buildCommand": "sed -i \"s|__SUPABASE_URL__|$SUPABASE_URL|g; s|__SUPABASE_KEY__|$SUPABASE_KEY|g\" index.html",
  "outputDirectory": "."
}
```
در `index.html` این‌طور بنویسید:
```js
const SUPABASE_URL = '__SUPABASE_URL__';
const SUPABASE_KEY = '__SUPABASE_KEY__';
```
و در **Vercel → Settings → Environment Variables** دو متغیر را ست کنید.

---

## 8. چک‌لیست قبل از لانچ

- [ ] اسکریپت SQL کامل اجرا شد
- [ ] `SUPABASE_URL` و `SUPABASE_KEY` در `index.html` به‌روز است
- [ ] `manifest.json` و `sw.js` روی سرور قابل دسترسی‌اند
- [ ] `icon-192.png` و `icon-512.png` روی سرور موجودند
- [ ] Auth Email در Supabase فعال است
- [ ] Site URL و Redirect URLs در Supabase تنظیم شده
- [ ] حداقل یک ادمین در `public.admins` وجود دارد
- [ ] RLS روی همهٔ جدول‌ها فعال است
- [ ] Storage policy روی bucket `ad-images` اعمال شده
- [ ] Realtime روی `messages` فعال است
- [ ] تست ثبت آگهی + چت + امتیاز + گزارش در محیط production

---

## 9. عیب‌یابی

| مشکل | راه‌حل |
|---|---|
| «سرور متصل نیست» | `SUPABASE_URL` و `SUPABASE_KEY` را چک کنید |
| ایمیل OTP نمی‌آید | **Authentication → Email Templates** را چک کنید؛ پوشهٔ اسپم؛ SMTP پیش‌فرض Supabase محدودیت دارد — [Resend](https://resend.com) یا [SendGrid](https://sendgrid.com) وصل کنید |
| ورود گوگل خطای redirect | URL در Supabase و Google Cloud Console باید یکی باشد |
| آپلود عکس fail می‌شود | Storage policy چک شود؛ اندازه عکس <10MB باشد |
| پیام‌ها ارسال می‌شوند ولی ✔✔ نمی‌آید | policy `messages_update_read_at` و ستون `read_at` چک شود |
| پیام‌ها realtime نمی‌آیند | `ALTER PUBLICATION supabase_realtime ADD TABLE public.messages` اجرا شده باشد |
| ادمین دیده نمی‌شود | یک رکورد در `public.admins` برای `auth.uid()` خودتان باشد |
| PWA نصب نمی‌شود | باید `https` باشد، `manifest.json` 200 بدهد، `sw.js` valid باشد |
| نقشهٔ Leaflet لود نمی‌شود | اینترنت/فیلترینگ؛ tile از `openstreetmap.org` می‌آید |
| «خطا در ذخیره» هنگام ثبت آگهی | RLS `ads_insert_own` و `ads_update_own` چک شود |

---

## 10. امنیت — نکات مهم

- **`anon key` عمومی است**. این اشتباه نیست — Supabase برای این طراحی شده. **RLS** لایهٔ امنیتی واقعی است.
- **هرگز `service_role key` را در کلاینت نگذارید** — آن کلید همه‌چیز را دور می‌زند.
- **Storage**: بدون policy `insert`، فایل‌ها آپلود نمی‌شوند.
- **RLS را خاموش نکنید**. اگر تست می‌کنید و خطا می‌گیرید، مشکل از policy است نه از RLS.
- **OTP**: Supabase خودش rate-limit دارد. کلاینت هم ۶۰ ثانیه cooldown دارد.
- **XSS**: تمام ورودی کاربر با `esc()` پاک‌سازی می‌شود.
- **CSRF**: Supabase Auth با JWT کار می‌کند، CSRF مشکل رایجی نیست.

---

## 11. عملکرد و بهینه‌سازی

- **`all()` memoized** با TTL ۶۰ ثانیه — ویرایش آگهی بلافاصله در UI نمایان می‌شود.
- **Skeleton loading** برای perceived performance.
- **Pull-to-refresh** برای موبایل.
- **View Transitions API** برای انیمیشن روان بین تب‌ها.
- **Lazy loading** روی تصاویر آگهی (`loading="lazy"`).
- **Compress images** سمت کلاینت قبل از آپلود (`compressImage` با canvas).
- **CDN برای Supabase Storage** به‌صورت پیش‌فرض فعال است.

---

## 12. لایسنس

MIT — استفادهٔ آزاد برای هر هدف.

---

## 🎯 منابع

- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
