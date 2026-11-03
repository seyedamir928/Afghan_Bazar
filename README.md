# 🛒 Afghan Bazar (افغان بازار)

**Afghan Bazar** یک پلتفرم فروشگاهی آنلاین و مدرن (PWA) است که برای تسهیل خرید و فروش کالا و خدمات طراحی شده است. این پروژه با بهره‌گیری از قابلیت‌های اپلیکیشن‌های وب پیشرو (Progressive Web App)، تجربه‌ای سریع، سبک و شبیه به اپلیکیشن‌های موبایل را در مرورگر به کاربران ارائه می‌دهد.

---

## ✨ ویژگی‌های کلیدی (Features)

- **برنامه وب پیشرو (PWA):** قابلیت نصب روی صفحه اصلی موبایل و دسکتاپ بدون نیاز به دانلود از استورها.
- **عملکرد آفلاین:** بهره‌گیری از Service Worker (`sw.js`) برای کش کردن فایل‌های حیاتی و دسترسی سریع‌تر.
- **طراحی ریسپانسیو:** بهینه‌سازی کامل برای نمایشگرهای مختلف (موبایل، تبلت و دسکتاپ).
- **بهینه‌سازی سئو (SEO):** دارای ساختار استاندارد مپ سایت (`sitemap.xml`) و مدیریت ربات‌ها (`robots.txt`) جهت دیده‌شدن بهتر در موتورهای جستجو.
- **توابع ابری (Serverless Functions):** استفاده از پوشه `functions` برای پردازش‌های سمت سرور به صورت ماژولار و بهینه.

---

## 🛠️ ساختار پروژه (Project Structure)

```text
├── functions/          # توابع سمت سرور (Serverless Functions)
├── _headers            # پیکربندی هدرهای امنیتی و بهینه‌سازی سرور
├── app.js              # منطق اصلی برنامه و مدیریت رویدادها
├── index.html          # صفحه اصلی و ساختار ظاهری پلتفرم
├── manifest.json       # تنظیمات PWA (نام، آیکون‌ها و رنگ تم)
├── robots.txt          # راهنمای خزیدارهای موتورهای جستجو
├── sitemap.xml         # نقشه سایت برای بهبود سئو
└── sw.js               # توابع Service Worker برای مدیریت کش و کارکرد آفلاین
```

---

## 🚀 راه‌اندازی پروژه در سیستم محلی (Getting Started)

برای اجرای این پروژه روی سیستم خود، مراحل زیر را دنبال کنید:

1. **کلون کردن مخزن:**
   ```bash
   git clone https://github.com
   ```

2. **ورود به پوشه پروژه:**
   ```bash
   cd Afghan_Bazar
   ```

3. **اجرا:**
   از آنجایی که این پروژه از Service Worker استفاده می‌کند، باید آن را روی یک سرور محلی (Local Server) اجرا کنید. می‌توانید از افزونه `Live Server` در VS Code یا دستور زیر در Node.js استفاده کنید:
   ```bash
   # نصب سرور محلی
   npm install -g http-server
   
   # اجرای سرور
   http-server .
   ```

---

## 🌐 English Description

**Afghan Bazar** is a modern Progressive Web App (PWA) e-commerce platform built to provide a seamless shopping experience. It functions efficiently across devices, supports offline capabilities via Service Workers, and is fully optimized for search engines.

### Key Features:
- Fully installable PWA with app-like experience.
- Offline support and asset caching (`sw.js`).
- Highly responsive UI/UX.
- SEO optimized with proper `sitemap.xml` and `robots.txt`.

---

## 🤝 مشارکت (Contributing)

مشارکت‌ها باعث پیشرفت جامعه متن‌باز می‌شوند. اگر ایده‌ای برای بهبود پروژه دارید:
1. پروژه را **Fork** کنید.
2. یک برنچ برای ویژگی جدید بسازید (`git checkout -b feature/AmazingFeature`).
3. تغییرات خود را **Commit** کنید (`git commit -m 'Add some AmazingFeature'`).
4. به برنچ خود **Push** کنید (`git push origin feature/AmazingFeature`).
5. یک **Pull Request** ثبت کنید.
