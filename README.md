# 🇦🇫 افغان‌بازار — Afghan Bazar

پلتفرم آگهی‌های **پرچون و عمده** افغانستان: جستجوی شعاعی روی نقشه، مقایسهٔ کالا، چت زنده بین خریدار و فروشنده، فروشگاه‌ها و امتیازدهی، پنل مدیریت، تشخیص خودکار آگهی ممنوعه، و PWA قابل نصب (فارسی و پشتو).

بدون مرحلهٔ build: یک سایت استاتیک (HTML + JavaScript ساده) که با **Supabase** (دیتابیس، ورود، ذخیرهٔ عکس، Realtime) و چند **Cloudflare Pages Function** کار می‌کند.

---

## امکانات

- آگهی پرچون و عمده، ۳۴ ولایت، دسته‌بندی، فیلتر قیمت/وضعیت/عکس/فروشگاه، مرتب‌سازی و نمایش‌های مختلف شبکه/لیست
- جستجوی شعاعی با نقشه (Leaflet) و جستجوی صوتی
- مقایسهٔ چند کالا، نشان «قیمت خوب» نسبت به میانگین، علاقه‌مندی‌ها
- چت درون‌برنامه‌ای (Realtime) با تیک خوانده‌شدن و هشدار کلاه‌برداری
- فروشگاه رسمی، نظر و امتیاز، گزارش تخلف (۳ گزارش مستقل ⇒ آگهی خودکار به «در انتظار بررسی» می‌رود)
- صفحهٔ آموزش ثبت آگهی در اولین ورود + دکمهٔ شناور «ثبت آگهی»
- PWA: نصب روی گوشی، حالت آفلاین، اعلان پوش، پیش‌نمایش لینک آگهی در واتساپ/تلگرام
- آیکن‌های SVG سبک به‌جای ایموجی، تم روشن/تیره

---

## ساختار پروژه

```
├── index.html                 صفحهٔ اصلی و همهٔ CSS
├── app.js                     منطق برنامه
├── emoji-icons.js             تبدیل خودکار ایموجی به آیکن SVG
├── sw.js                      Service Worker (کش آفلاین، اعلان پوش)
├── manifest.json              تنظیمات PWA
├── icon-maskable-512.png      تنها آیکن سایت و PWA
├── _headers                   هدرهای امنیتی و CSP (Cloudflare Pages)
├── robots.txt / sitemap.xml
├── security_tests.sh          آزمون‌های امنیتی (در ترمینال اجرا می‌شود)
├── functions/                 Cloudflare Pages Functions
│   ├── ad/[id].js             پیش‌نمایش (Open Graph) آگهی برای اشتراک‌گذاری
│   ├── api/rate.js            نرخ دلار به افغانی (۶ ساعت کش)
│   ├── tiles/[[path]].js      پروکسی تایل نقشه با چند منبع یدکی
│   └── vendor/leaflet/…       ارائهٔ Leaflet از دامنهٔ خود سایت
└── supabase_*.sql             اسکریپت‌های دیتابیس (ترتیب اجرا در بخش ۲)
```

---

## ۱) ساخت پروژهٔ Supabase

1. در [supabase.com](https://supabase.com) پروژهٔ جدید بسازید.
2. **Authentication → Providers → Email** را فعال کنید (ورود با کد یک‌بارمصرف).
3. **Authentication → URL Configuration**:
   - `Site URL` = آدرس سایت شما (مثلاً `https://your-domain.com`)
   - `Redirect URLs` += `https://your-domain.com/**`
4. ورود با کپچا (Cloudflare Turnstile) استفاده می‌شود: در **Authentication → Attack Protection** کپچا را فعال و کلید Turnstile خودتان را بدهید، و `data-sitekey` در `index.html` را با کلید عمومی خودتان عوض کنید.
5. کلید `URL` و `anon public key` را از **Project Settings → API** بردارید و در `app.js` (متغیرهای `SUPABASE_URL` و `SUPABASE_KEY`) بگذارید. همین آدرس در `MY_STORAGE_URL` (نزدیک خط ۳۰۳۶) و در فایل‌های `functions/ad/[id].js` و `_headers` (بخش `connect-src` و `img-src`) هم آمده؛ همه را با پروژهٔ خودتان یکی کنید.

> کلید `anon` عمومی است و گذاشتنش در کد اشکال ندارد؛ امنیت واقعی با **RLS** است. کلید `service_role` را **هرگز** در کد نگذارید.

---

## ۲) اجرای اسکریپت‌های SQL

در **SQL Editor → New query** هر فایل را کامل پیست کنید و **Run** بزنید. همه قابل اجرای دوباره‌اند.

| ترتیب | فایل | کار |
|---|---|---|
| ۰ | جدول‌های پایه (`ads`, `messages`, `reviews`, `reports`, `admins`, `push_subscriptions`, ویوی `public_profiles` و سیاست‌های RLS آن‌ها) | ⚠️ فایل پایه (`setup.sql`) **در این بسته نیست**؛ باید قبل از بقیه موجود باشد |
| ۱ | `supabase_moderation.sql` | انتشار/رد خودکار آگهی، فهرست واژه‌های ممنوعه، توابع ادمین |
| ۲ | `supabase_antispam.sql` | تشخیص دورزدن فیلتر (س.ک.س، h3ro1n)، سقف ثبت آگهی، تعلیق خودکار با ۳ گزارش |
| ۳ | `supabase_forbidden_listings.sql` | سامانهٔ امتیازدهی آگهی ممنوعه (باید بعد از antispam اجرا شود) |
| ۴ | `supabase_hardening.sql` | شمارش امن بازدید/تماس (`bump_stat_safe`) |
| ۵ | `supabase_public_read.sql` | مهمان‌ها فقط آگهی‌های تاییدشده را ببینند |

بعد از اجرا بررسی کنید:

```sql
select * from public.mod_selftest();     -- باید همه PASS باشند
```

**اولین ادمین:** یک بار با ایمیل خودتان در سایت وارد شوید و سپس اجرا کنید:

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'YOUR_ADMIN_EMAIL@example.com'
on conflict do nothing;
```

همچنین: Storage ← باکت عمومی `ad-images` با سیاست آپلود فقط برای کاربر واردشده، و Realtime روی جدول `messages` فعال باشد.

---

## ۳) دیپلوی (Cloudflare Pages — پیشنهادی)

پوشهٔ `functions/` و فایل `_headers` فقط روی **Cloudflare Pages** کار می‌کنند.

1. پروژه را در یک مخزن Git بگذارید.
2. Cloudflare → **Pages → Create a project** → مخزن را وصل کنید.
3. Framework: **None** — Build command: خالی — Output directory: `/`
4. Deploy.

متغیرهای محیطی اختیاری (Settings → Environment variables):

| متغیر | کاربرد |
|---|---|
| `SUPABASE_URL`، `SUPABASE_KEY` | برای تابع پیش‌نمایش آگهی (اگر نگذارید، مقدار داخل کد استفاده می‌شود) |
| `SITE_NAME` | نام سایت در پیش‌نمایش لینک (پیش‌فرض: افغان‌بازار) |

اگر روی میزبان دیگری (Netlify، Vercel، هاست معمولی) بگذارید، سایت اصلی کار می‌کند ولی این‌ها کار نمی‌کنند: پیش‌نمایش لینک آگهی، نرخ دلار، پروکسی تایل نقشه و هدرهای امنیتی.

بعد از هر تغییر، عدد `VERSION` در `sw.js` را بالا ببرید تا کاربران قبلی نسخهٔ جدید را بگیرند.

---

## ۴) اجرای محلی

```bash
python3 -m http.server 8080     # یا: npx serve .
```

سپس `http://localhost:8080`. توجه: توابع `functions/` و هدرها محلی اجرا نمی‌شوند (نقشه و نرخ دلار ممکن است کار نکنند)، و ورود با گوگل روی `http://` کار نمی‌کند.

---

## ۵) آزمون امنیتی

`security_tests.sh` یک اسکریپت **bash** است (نه SQL). آن را در ترمینال (Mac/Linux، Git-Bash یا WSL، یا Termux روی گوشی) اجرا کنید، **فقط روی پروژهٔ خودتان**:

```bash
ANON_KEY=eyJ... bash security_tests.sh
```

هر خط `PASS` یا `FAIL` می‌دهد. هر `FAIL` یعنی یک سیاست RLS یا مجوز باید بسته شود.

---

## ۶) چک‌لیست قبل از لانچ

- [ ] فایل‌های SQL به ترتیب اجرا شدند و `mod_selftest()` همه PASS داد
- [ ] آدرس و کلید Supabase در `app.js`، `functions/ad/[id].js` و `_headers` یکی است
- [ ] Site URL و Redirect URLs در Supabase تنظیم شد؛ کپچا و کلید Turnstile درست است
- [ ] حداقل یک ادمین در `public.admins` هست
- [ ] RLS روی همهٔ جدول‌ها فعال است و `security_tests.sh` هیچ FAIL ندارد
- [ ] باکت `ad-images` و Realtime روی `messages` تنظیم شد
- [ ] دامنهٔ `robots.txt` و `sitemap.xml` را با دامنهٔ خودتان عوض کردید
- [ ] ثبت آگهی، چت، امتیاز، گزارش و نصب PWA را روی گوشی واقعی امتحان کردید

---

## ۷) عیب‌یابی

| مشکل | راه‌حل |
|---|---|
| «سرور متصل نیست» | `SUPABASE_URL` و `SUPABASE_KEY` را بررسی کنید |
| کد ایمیل نمی‌آید | پوشهٔ اسپم؛ SMTP پیش‌فرض Supabase محدود است؛ کپچا فعال و کلیدش درست باشد |
| میکروفون «مجاز نیست» | `_headers` باید `microphone=(self)` داشته باشد؛ مجوز میکروفون را در مرورگر بدهید |
| آپلود عکس شکست می‌خورد | سیاست Storage و حجم عکس را بررسی کنید |
| ✔✔ خواندن پیام نمی‌آید | ستون `read_at` و سیاست به‌روزرسانی جدول `messages` |
| پیام‌ها زنده نمی‌آیند | `alter publication supabase_realtime add table public.messages;` |
| پنل ادمین دیده نمی‌شود | ردیف شما در `public.admins` باید باشد |
| «خطا در ذخیره» هنگام ثبت آگهی | سیاست‌های RLS جدول `ads`؛ یا سقف روزانهٔ ثبت آگهی پر شده |
| نقشه لود نمی‌شود | فیلترینگ/اینترنت؛ تایل‌ها از `/tiles/` می‌آیند و نیاز به Pages Function دارند |
| PWA نصب نمی‌شود | باید `https` باشد و `manifest.json` و `sw.js` پاسخ ۲۰۰ بدهند |
| تغییرات به کاربران نمی‌رسد | `VERSION` در `sw.js` را بالا ببرید |

---

## ۸) نکات امنیتی

- همهٔ متن کاربر با `esc()` پاک‌سازی می‌شود و شناسه/آدرس تصویر آگهی هنگام بارگذاری اعتبارسنجی می‌شود (`cleanAd`).
- CSP در `_headers` هنوز `'unsafe-inline'` برای اسکریپت دارد؛ حذفش نیازمند تبدیل `onclick`های درون‌خطی به `addEventListener` است.
- وضعیت آگهی را تریگر سمت سرور تعیین می‌کند، نه کلاینت.
- جدول `messages`: مطمئن شوید گیرنده فقط ستون `read_at` را می‌تواند تغییر دهد.
- هر تغییر در RLS را با `security_tests.sh` دوباره بسنجید.

---

## تاریخچهٔ نسخه‌ها

- **v48:** دیدن آگهی برای عموم (`supabase_public_read.sql`)، تصویر تمام‌صفحه، بارگذاری مرحله‌ای
- **v49:** فیلتر کلمات با تشخیص دورزدن، سقف ثبت آگهی، تعلیق خودکار با ۳ گزارش (`supabase_antispam.sql`)
- **v50:** سامانهٔ کامل تشخیص آگهی ممنوعه (`supabase_forbidden_listings.sql`)
- **v51–v54:** دکمهٔ شناور ثبت آگهی، صفحهٔ آموزش، رفع مشکل میکروفون، گوشه‌های گرد، آیکن‌های SVG به‌جای ایموجی، اصلاح خوانایی و تک‌آیکن PWA
