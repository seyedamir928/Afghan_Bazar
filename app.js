// ==========================================
// ثبت Service Worker برای PWA
// ==========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('Service Worker registered successfully.'))
      .catch((err) => console.log('Service Worker registration failed:', err));
  });
}

// ==========================================
// پیشنهاد نصب اپلیکیشن (PWA)
// ==========================================
(function(){
  var SNOOZE_DAYS = 14, deferredPrompt = null;
  function snoozed(){
    try { var t = +localStorage.getItem('ab_pwa_snooze'); return t && (Date.now() - t) < SNOOZE_DAYS*864e5; }
    catch(e){ return false; }
  }
  function isStandalone(){
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }
  
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.__pwaDeferredPrompt = function(){ return deferredPrompt; };
    if (isStandalone() || snoozed()) return;
    const fab = document.getElementById("install-fab");
    if (fab) { fab.style.display = "block"; fab.onclick = () => { 
      fab.style.display = "none"; 
      deferredPrompt.prompt(); 
      deferredPrompt.userChoice.finally(()=>{ deferredPrompt = null; });
    }; }
  });
  window.addEventListener("appinstalled", () => {
    const fab = document.getElementById("install-fab");
    if (fab) fab.style.display = "none";
  });

  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    deferredPrompt = e;
    if (isStandalone() || snoozed()) return;
    var b = document.getElementById('pwa-install-banner');
    if (b) setTimeout(function(){ b.classList.add('show'); }, 2500);
  });
  document.addEventListener('DOMContentLoaded', function(){
    var banner = document.getElementById('pwa-install-banner');
    var installBtn = document.getElementById('pwa-install-btn');
    var dismissBtn = document.getElementById('pwa-dismiss-btn');
    if (installBtn) installBtn.onclick = function(){
      if (banner) banner.classList.remove('show');
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function(){ deferredPrompt = null; });
    };
    if (dismissBtn) dismissBtn.onclick = function(){
      if (banner) banner.classList.remove('show');
      try { localStorage.setItem('ab_pwa_snooze', String(Date.now())); } catch(e){}
    };
  });
  window.addEventListener('appinstalled', function(){
    var b = document.getElementById('pwa-install-banner');
    if (b) b.classList.remove('show');
    deferredPrompt = null;
    try { localStorage.setItem('ab_pwa_hint_stop', '1'); } catch(e){}
  });

  function hintStopped(){
    try { return localStorage.getItem('ab_pwa_hint_stop') === '1'; } catch(e){ return false; }
  }
  function showInstallHint(){
    if (isStandalone() || hintStopped()) return;
    var el = document.getElementById('pwa-hint-bubble');
    if (!el) return;
    el.classList.add('show');
    setTimeout(function(){ el.classList.remove('show'); }, 4000);
  }
  function scheduleInstallHint(){
    if (isStandalone() || hintStopped()) return;
    var delay = 20000 + Math.random() * 40000;
    setTimeout(function(){
      showInstallHint();
      scheduleInstallHint();
    }, delay);
  }
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(scheduleInstallHint, 6000 + Math.random() * 6000);
  });
})();

// ==========================================
// اتصال به Supabase (سیستم پیامک واقعی)
// ==========================================
const SUPABASE_URL = 'https://snhyzmwgazifdqyvqsnu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuaHl6bXdnYXppZmRxeXZxc251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTkxNjEsImV4cCI6MjEwODg3NTE2MX0.TuvApVWN-fTtd3aLQy0aerNgy3vJq1ZXuZehtytpNNo';
let supabaseClient = null;
const sb=()=>supabaseClient;
try {
  if (window.supabase) supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch(e) { console.error("خطا در اتصال به سرور:", e); }

// ==========================================
// سیستم چند زبانه (i18n)
// ==========================================
let currentLang = (() => { try { return localStorage.getItem("ab_lang") || "fa"; } catch(e){ return "fa"; } })();

const i18n = {
  fa: {
    login: "ورود", postAd: "+ ثبت آگهی", postRetail: "+ ثبت پرچون", postWholesale: "+ ثبت عمده",
    navRetail: "پرچون (خرده)", navWholesale: "عمده (تجار)",
    heroPill: "🇦🇫 بازار آنلاین پرچون افغانستان", heroTitle: "هر چیزی که می‌خواهید،<br><em>نزدیک خودتان</em>",
    heroDesc: "خرید و فروش امن و رایگان خرده‌فروشی در ۳۴ ولایت؛ با فروشگاه‌های رسمی، نقشه شعاعی و مقایسه کالاها.",
    searchPlaceholder: "جستجو در عنوان و توضیحات پرچون: موتر، خانه، موبایل…", searchBtn: "جستجو",
    statAds: "آگهی پرچون", statProv: "ولایت", statCats: "دسته‌بندی",
    recentSec: "اخیراً دیده‌اید", recentSecSub: "برای مرور سریع",
    featSec: "آگهی‌های ویژه پرچون", featSecSub: "فوری و تازه",
    popCats: "دسته‌های محبوب پرچون", topProv: "ولایت‌های پرآگهی",
    filterTitle: "قیمت پرچون (افغانی)", from: "از", to: "تا",
    filterAdv: "ویژگی‌های تخصصی", filterCond: "وضعیت کالا", condAll: "همه", condNew: "نو و آکبند", condUsed: "دست دوم / کارکرده",
    filterPhoto: "فقط آگهی‌های دارای عکس", filterShop: "فقط فروشگاه‌های رسمی",
    filterRadius: "🌐 جستجوی شعاعی نقشه", radiusBtn: "فیلتر شعاعی روی نقشه", radiusInactive: "شعاع فعال نیست",
    filterUrgent: "فقط آگهی‌های فوری", resetFilters: "پاک‌کردن فیلترها",
    filterMobile: "فیلترهای پیشرفته جستجو", close: "بستن",
    sortNew: "جدیدترین", sortLo: "ارزان‌ترین", sortHi: "گران‌ترین", sortPop: "محبوب‌ترین (بازدید)",
    emptyTitle: "آگهی‌ای پیدا نشد", emptySub: "فیلترها را تغییر دهید یا دامنه جستجو را وسیع‌تر کنید.",
    wholePill: "📦 بازار عمده‌فروشی افغانستان", wholeTitle: "خرید و فروش عمده،<br><em>کارتن و تناژ بالا</em>",
    wholeDesc: "ویژه تجار، دکان‌داران و واردکنندگان. تأمین مستقیم کالا از بندرهای مرزی و عمده‌فروشی‌های سراسر کشور.",
    wholeSearchPh: "جستجو در آگهی‌های عمده: برنج، روغن، لوازم الکترونیکی…", wholeSearchBtn: "جستجوی عمده",
    wholeStatCats: "دسته‌بندی عمده", wholeSortNew: "جدیدترین عمده", wholeSortLo: "کمترین قیمت عمده", wholeSortHi: "بیشترین قیمت عمده",
    addTitle: "ثبت آگهی جدید", editTitle: "ویرایش آگهی", adTitlePh: "مثلاً: موتر کرولا مدل ۲۰۱۲ پاک و سفید",
    adPhonePh: "شماره تماس برای خریداران *", adPhoneDesc: "07…", adCat: "دسته بندی", adProv: "ولایت اصلی",
    adMultiProv: "انتشار در چندین ولایت (تجار و شرکت‌های پخش):", adCond: "وضعیت کالا", adMapLoc: "منطقه دقیق در ولایت",
    adBrand: "مدل / برند (برای مقایسه)", adSpec: "مشخصات کلیدی", adMoq: "حداقل سفارش", adUnit: "واحد فروش",
    adMapPick: "موقعیت دقیق روی نقشه ولایت (انتخاب با پین)", adMapDesc: "با تغییر ولایت در فرم بالا، نقشه به مرکز آن ولایت منتقل می‌شود.",
    adPrice: "قیمت (افغانی، ۰ = توافقی)", adCurAFN: "افغانی", adCurUSD: "دلار", adNeg: "قابل مذاکره",
    adShopTools: "🚀 ابزارهای تجاری و فروشگاهی", adIsShop: "ثبت به عنوان «فروشگاه رسمی / شرکت پخش»",
    adShopName: "نام فروشگاه یا شرکت", adUrgent: "آگهی فوری و ویژه (نردبان بالا)",
    adImages: "تصاویر کالا (گالری و دوربین همزمان)", adGallery: "📁 انتخاب از گالری", adCamera: "📷 عکس با دوربین",
    adImgStatus: "تصویری انتخاب نشده است", adDesc: "توضیحات تکمیلی", adDescPh: "جزئیات کامل کالا، شرایط عمده‌فروشی یا مشخصات را بنویسید...",
    adSave: "انتشار نهایی آگهی", adCancel: "انصراف", adDraft: "پیش‌نویس آگهی قبلی موجود است. بارگذاری شود؟",
    authTitle: "حساب کاربری و احراز هویت", authIn: "ورود", authUp: "ثبت‌نام", authName: "نام کامل",
    authGoogle: "🔐 ورود با حساب گوگل", authOr: "یا با کد تایید:", authEmail: "ایمیل", authPhone: "پیامک (فعلاً از دسترس خارج است)",
    authPhoneLabel: "شماره موبایل (سلام، روشن، اتصالات)", authOTP: "کد تایید (OTP)", authSendOTP: "ارسال کد",
    authTerms: "قوانین و <a href='#' id='auth-terms-link' style='color:var(--ac);'>حریم خصوصی</a> را می‌پذیرم",
    chatTitle: "گفتگو با فروشنده", chatPh: "پیام خود را بنویسید...", send: "ارسال", chatEmpty: "هنوز پیامی فرستاده نشده است.",
    seller: "فروشنده", buyer: "خریدار", member: "عضو افغان‌بازار", fldArea:"متراژ (متر مربع)", fldRooms:"تعداد اتاق", fldFloor:"طبقه", fldParking:"پارکینگ", fldDeal:"نوع معامله", fldYear:"سال ساخت", fldKm:"کیلومتر", fldFuel:"سوخت", fldGear:"گیربکس", fldColor:"رنگ", fldBrand:"برند", fldRam:"رم (GB)", fldStorage:"حافظه (GB)", fldBattery:"وضعیت باتری", fldCpu:"پردازنده", fldScreen:"اندازهٔ صفحه", optHas:"دارد", optNotHas:"ندارد", optSell:"فروش", optRent:"کرایه", optMortgage:"گرو", optPetrol:"پترول", optDiesel:"دیزل", optElectric:"برقی", optHybrid:"هایبرید", optGas:"گاز", optAuto:"اتوماتیک", optManual:"دستی", optApple:"Apple", optSamsung:"Samsung", optXiaomi:"Xiaomi", optHuawei:"Huawei", optOther:"سایر", optNew:"نو", optOver80:"۸۰٪ به بالا", optLess:"کمتر", specSection:"📋 مشخصات تخصصی", specFull:"📋 مشخصات کامل:", prevBtn:"قبلی", nextBtn:"بعدی", stepChooseCategory:"دسته‌بندی آگهی", stepChooseHint:"دسته‌ای که آگهی شما در آن قرار می‌گیرد انتخاب کنید تا فیلدهای مناسب ظاهر شوند.", stepContentTitle:"عنوان و تصاویر", stepSpecsTitle:"مشخصات", stepPriceTitle:"قیمت و موقعیت", fldWarranty:"گارانتی", fldUnit:"واحد", fldServiceType:"نوع خدمت", fldHomeService:"خدمات در محل", fldWorkHours:"ساعات کاری", fldJobType:"نوع استخدام", fldSalary:"حقوق ماهانه (افغانی)", fldExperience:"سابقهٔ کار", fldGender:"جنسیت", optToyota:"تویوتا", optHonda:"هوندا", optNissan:"نیسان", optFord:"فورد", optHyundai:"هیوندای", optKia:"کیا", optFullTime:"تمام وقت", optPartTime:"نیمه وقت", optContract:"پروژه‌ای", optAny:"هر دو", optMale:"مرد", optFemale:"زن", optKg:"کیلوگرم", optTon:"تن", optBag:"کیسه", trustReliable: "🟢 قابل اعتماد", trustGood: "🟡 نسبتاً خوب", trustNew: "🟠 فروشنده جدید", trustLow: "⚪ اطلاعات کم", verified: "شماره تاییدشده",
    rateShop: "امتیازدهی به این فروشگاه", noReviews: "هنوز نظری ثبت نشده.", writeReviewPh: "نظر خود را درباره فروشگاه بنویسید...", submit: "ثبت",
    viewProfile: "(مشاهده پروفایل)", noteTitle: "یادداشت شخصی شما روی این آگهی:", notePh: "مثلاً: قیمت نهایی توافق شد...", save: "ذخیره",
    adLocation: "موقعیت روی نقشه:", adCall: "تماس:", adClose: "بستن", adEdit: "ویرایش", adRenew: "تمدید", adDelete: "حذف این آگهی",
    reportAd: "گزارش تخلف یا کلاه‌برداری", wakeLock: "روشن ماندن صفحه هنگام مشاهده",
    toastLoginNeeded: "برای ادامه، وارد حساب خود شوید.", toastSaved: "با موفقیت ذخیره شد ✅", toastError: "خطایی رخ داد. دوباره تلاش کنید.",
    toastDeleted: "حذف شد.", toastCopied: "کپی شد ✅",
    statusPending: "⏳ در انتظار تایید ادمین",
    statusRejected: "✕ رد شده توسط ادمین",
    wholesaleTitleShort: "آگهی‌های عمده و تناژ بالا",
    howItWorks: "چطور کار می‌کند؟",
    step1Title: "حساب بسازید",
    step1Text: "فقط با ایمیل یا حساب گوگل.",
    step2Title: "آگهی بگذارید",
    step2Text: "عنوان، قیمت، ولایت و عکس‌ها را ثبت کنید.",
    step3Title: "تماس یا چت",
    step3Text: "خریداران مستقیماً با شما ارتباط می‌گیرند.",
    safeTitle: "🛡️ نکات خرید امن",
    safe1: "پیش از پرداخت بیعانه، کالا را حضوری بررسی کنید.",
    safe2: "برای ملاقات، مکان‌های عمومی انتخاب کنید.",
    safe3: "هرگز پول را پیش از تحویل کالا کارت‌به‌کارت نکنید.",
    safe4: "قیمت بسیار پایین‌تر از نرخ بازار نشانه‌ی احتیاط است.",
    myAds: "آگهی‌های من و آمار بازدید",
    editProfile: "ویرایش نام پروفایل",
    myFavs: "نشان‌شده‌ها و یادداشت‌ها",
    myShop: "مدیریت فروشگاه رسمی من و نظرات",
    myInbox: "صندوق پیام‌های من",
    allAds: "همه آگهی‌ها",
    logout: "خروج از حساب",
  },
  ps: {
    login: "ننوتل", postAd: "+ اعلان ثبت کړئ", postRetail: "+ پرچون ثبت کړئ", postWholesale: "+ عمده ثبت کړئ",
    navRetail: "پرچون", navWholesale: "عمده (سوداګر)",
    heroPill: "🇦🇫 د افغانستان آنلاین پرچون بازار", heroTitle: "هر څه چې غواړئ،<br><em>ستاسو تر څنګ</em>",
    heroDesc: "په ۳۴ ولایتونو کې خوندي او وړیا پرچون پیرود او پلور؛ د رسمي پلورنځیو، نقشې او د توکو پرتله کولو سره.",
    searchPlaceholder: "په پرچون اعلانونو کې پلټنه: موټر، کور، موبایل…", searchBtn: "پلټنه",
    statAds: "پرچون اعلانونه", statProv: "ولایتونه", statCats: "کټګورۍ",
    recentSec: "وروستي لیدل شوي", recentSecSub: "د چټکې کتنې لپاره",
    featSec: "ځانګړي پرچون اعلانونه", featSecSub: "بیړني او نوي",
    popCats: "مشهورې پرچون کټګورۍ", topProv: "ډیر اعلانونه لرونکي ولایتونه",
    filterTitle: "د پرچون بیه (افغانۍ)", from: "له", to: "تر",
    filterAdv: "تخصصي ځانګړتیاوې", filterCond: "د توکي حالت", condAll: "ټول", condNew: "نوی او بکس", condUsed: "دست دوم / کارول شوی",
    filterPhoto: "یوازې هغه اعلانونه چې عکس لري", filterShop: "یوازې رسمي پلورنځي",
    filterRadius: "🌐 د نقشې شعاعي پلټنه", radiusBtn: "په نقشه کې شعاعي فلټر", radiusInactive: "شعاع فعاله نه ده",
    filterUrgent: "یوازې بیړني اعلانونه", resetFilters: "فلټرونه پاک کړئ",
    filterMobile: "پرمختللي پلټنې فلټرونه", close: "بندول",
    sortNew: "نوي", sortLo: "ارزانه", sortHi: "ګرانې", sortPop: "مشهور (لیدنې)",
    emptyTitle: "هیڅ اعلان ونه موندل شو", emptySub: "فلټرونه بدل کړئ یا د پلټنې ساحه پراخه کړئ.",
    wholePill: "📦 د افغانستان عمده پلور بازار", wholeTitle: "عمده پیرود او پلور،<br><em>کارتن او لویه اندازه</em>",
    wholeDesc: "د سوداګرو، دوکاندارانو او واردونکو لپاره. د پولو له بندرونو او ټول هیواد څخه مستقیم توکي.",
    wholeSearchPh: "په عمده اعلانونو کې پلټنه: وریجې، غوړي، بریښنایي توکي…", wholeSearchBtn: "عمده پلټنه",
    wholeStatCats: "عمده کټګورۍ", wholeSortNew: "نوي عمده", wholeSortLo: "ټیټه بیه", wholeSortHi: "لوړه بیه",
    addTitle: "نوی اعلان ثبت کړئ", editTitle: "اعلان سمول", adTitlePh: "لکه: کرولا موټر، ۲۰۱۲ ماډل، پاک او سپین",
    adPhonePh: "د پیرودونکو لپاره د اړیکې شمیره *", adPhoneDesc: "07…", adCat: "کټګوري", adProv: "اصلي ولایت",
    adMultiProv: "په ډیرو ولایتونو کې خپرول (سوداګر او ویشونکي شرکتونه):", adCond: "د توکي حالت", adMapLoc: "په ولایت کې دقیقه سیمه",
    adBrand: "ماډل / برانډ (د پرتلې لپاره)", adSpec: "کلیدي مشخصات", adMoq: "لږترلږه فرمایش", adUnit: "د پلور واحد",
    adMapPick: "په ولایت نقشه کې دقیق موقعیت (د پین سره انتخاب)", adMapDesc: "په پورتنۍ فورمه کې د ولایت په بدلولو سره، نقشه د هغه ولایت مرکز ته ځي.",
    adPrice: "بیه (افغانۍ، ۰ = توافقي)", adCurAFN: "افغانۍ", adCurUSD: "ډالر", adNeg: "د خبرو وړ",
    adShopTools: "🚀 سوداګریز او پلورنځي وسایل", adIsShop: "د «رسمي پلورنځي / ویشونکي شرکت» په توګه ثبت کړئ",
    adShopName: "د پلورنځي یا شرکت نوم", adUrgent: "بیړنی او ځانګړی اعلان (پورته پورته)",
    adImages: "د توکو عکسونه (ګالري او کامره یوځای)", adGallery: "📁 له ګالري څخه انتخاب", adCamera: "📷 د کامرې سره عکس",
    adImgStatus: "هیڅ عکس نه دی انتخاب شوی", adDesc: "اضافي توضیحات", adDescPh: "د توکي بشپړ جزئیات، د عمده پلور شرایط یا مشخصات ولیکئ...",
    adSave: "اعلان خپور کړئ", adCancel: "لغوه کول", adDraft: "د مخکیني اعلان مسوده شتون لري. بار شي؟",
    authTitle: "کارن حساب او تصدیق", authIn: "ننوتل", authUp: "نوم لیکنه", authName: "بشپړ نوم",
    authGoogle: "🔐 د ګوګل حساب سره ننوتل", authOr: "یا د تایید کوډ سره:", authEmail: "ایمیل", authPhone: "پیامک (اوس مهال بند دی)",
    authPhoneLabel: "د موبایل شمیره (سلام، روشن، اتصالات)", authOTP: "د تایید کوډ (OTP)", authSendOTP: "کوډ ولیږه",
    authTerms: "قوانین او <a href='#' id='auth-terms-link' style='color:var(--ac);'>محرمیت</a> منم",
    chatTitle: "د پلورونکي سره خبرې", chatPh: "خپل پیغام ولیکئ...", send: "لېږل", chatEmpty: "تر دې دمه هیڅ پیغام نه دی لیږل شوی.",
    seller: "پلورونکی", buyer: "پیرودونکی", member: "د افغان بازار غړی", fldArea:"مساحت (مربع متر)", fldRooms:"د خونو شمېر", fldFloor:"پوړ", fldParking:"پارکینګ", fldDeal:"د معاملې ډول", fldYear:"د جوړېدو کال", fldKm:"کیلومتره", fldFuel:"سوخت", fldGear:"ګیربکس", fldColor:"رنګ", fldBrand:"برانډ", fldRam:"رام (GB)", fldStorage:"حافظه (GB)", fldBattery:"د بیټرۍ حالت", fldCpu:"پروسیسر", fldScreen:"د سکرین اندازه", optHas:"لري", optNotHas:"نلري", optSell:"پلور", optRent:"کرایه", optMortgage:"ګرو", optPetrol:"پټرول", optDiesel:"ډیزل", optElectric:"بریښنایي", optHybrid:"هایبرید", optGas:"ګاز", optAuto:"اتوماتیک", optManual:"لاسي", optApple:"Apple", optSamsung:"Samsung", optXiaomi:"Xiaomi", optHuawei:"Huawei", optOther:"نور", optNew:"نوی", optOver80:"۸۰٪ پورته", optLess:"لږ", specSection:"📋 تخصصي مشخصات", specFull:"📋 بشپړ مشخصات:", prevBtn:"مخکینی", nextBtn:"بل", stepChooseCategory:"د اعلان کټګوري", stepChooseHint:"هغه کټګوري غوره کړئ چې اعلان پکې ځای پرځای کیږي.", stepContentTitle:"سرلیک او عکسونه", stepSpecsTitle:"مشخصات", stepPriceTitle:"بیه او موقعیت", fldWarranty:"تضمین", fldUnit:"واحد", fldServiceType:"د خدمت ډول", fldHomeService:"په کور کې خدمت", fldWorkHours:"کاري ساعتونه", fldJobType:"د استخدام ډول", fldSalary:"میاشتنی معاش (افغانۍ)", fldExperience:"کاري تجربه", fldGender:"جنسیت", optToyota:"تویوتا", optHonda:"هوندا", optNissan:"نیسان", optFord:"فورد", optHyundai:"هیوندای", optKia:"کیا", optFullTime:"بشپړ وخت", optPartTime:"نیمه وخت", optContract:"پروژه", optAny:"دواړه", optMale:"نر", optFemale:"ښځه", optKg:"کیلو", optTon:"ټن", optBag:"بوجۍ", trustReliable: "🟢 د باور وړ", trustGood: "🟡 نسبتاً ښه", trustNew: "🟠 نوی پلورونکی", trustLow: "⚪ لږ معلومات", verified: "تصدیق شوې شمیره",
    rateShop: "دې پلورنځي ته امتیاز ورکړئ", noReviews: "تر دې دمه هیڅ نظر نه دی ثبت شوی.", writeReviewPh: "د پلورنځي په اړه خپل نظر ولیکئ...", submit: "ثبت",
    viewProfile: "(پروفایل وګورئ)", noteTitle: "په دې اعلان ستاسو شخصي یادښت:", notePh: "لکه: وروستۍ بیه موافقه شوه...", save: "وساتل",
    adLocation: "په نقشه کې موقعیت:", adCall: "زنګ:", adClose: "بندول", adEdit: "سمول", adRenew: "نوي کول", adDelete: "دا اعلان حذف کړئ",
    reportAd: "سرغړونه یا درغلي راپور کړئ", wakeLock: "د کتلو پر مهال سکرین روښانه وساتئ",
    toastLoginNeeded: "د دوام لپاره، خپل حساب ته ننوځئ.", toastSaved: "په بریالیتوب سره وساتل شو ✅", toastError: "یوه ستونزه رامنځته شوه. بیا هڅه وکړئ.",
    toastDeleted: "حذف شو.", toastCopied: "کاپي شو ✅",
    statusPending: "⏳ د اډمین لخوا د تایید په تمه",
    statusRejected: "✕ د اډمین لخوا رد شوی",
    wholeTitleShort: "عمده اعلانونه او لویه اندازه",
    howItWorks: "دا څنګه کار کوي؟",
    step1Title: "حساب جوړ کړئ",
    step1Text: "یوازې د ایمیل یا ګوګل سره.",
    step2Title: "اعلان ثبت کړئ",
    step2Text: "سرلیک، بیه، ولایت او عکسونه ولیکئ.",
    step3Title: "زنګ او خبرې",
    step3Text: "پیرودونکي مستقیم ستاسو سره اړیکه نیسي.",
    safeTitle: "🛡️ د خوندي پیرودلو یادښتونه",
    safe1: "د بیعانې مخکې توکی حضوري وګورئ.",
    safe2: "د لیدنې لپاره عامه او بوخت ځایونه غوره کړئ.",
    safe3: "هیڅکله د توکي له سپارلو مخکې پیسې کارت ته مه لیږئ.",
    safe4: "له بازار څخه ډیره ټیټه بیه د احتیاط نښه ده.",
    myAds: "زما اعلانونه او لیدنې",
    editProfile: "پروفایل نوم بدل کړئ",
    myFavs: "خوښ شوي او یادښتونه",
    myShop: "زما رسمي پلورنځی او نظرونه",
    myInbox: "زما پیغامونه",
    allAds: "ټول اعلانونه",
    logout: "له حسابه وتل",
  }
};

function t(key) {
  return (i18n[currentLang] && i18n[currentLang][key]) ? i18n[currentLang][key] : i18n['fa'][key] || key;
}

const catsLocalized = {
  fa: [["همه","🗂️"],["املاک","🏠"],["وسایل نقلیه","🚗"],["موبایل و تبلت","📱"],["کمپیوتر و لپ‌تاپ","💻"],["لوازم خانگی","🧺"],["مبلمان و دیکور","🛋️"],["لباس و پوشاک","👕"],["زراعت و مالداری","🐑"],["خوراک و خشکبار","🌰"],["ماشین‌آلات و ابزار","🔧"],["خدمات","🛠️"],["استخدام","💼"],["کتاب و تحصیل","📚"],["ورزش و سرگرمی","⚽"],["ساز و موسیقی","🎸"]],
  ps: [["ټول","🗂️"],["املاک","🏠"],["وسایط نقلیه","🚗"],["موبایل او ټابلیټ","📱"],["کمپیوټر او لیپ ټاپ","💻"],["کورني توکي","🧺"],["فرنیچر او ډیکور","🛋️"],["جامې او پوښاک","👕"],["کرنه او مالدارۍ","🐑"],["خوراکي توکي او وچه مېوه","🌰"],["ماشینونه او وسایل","🔧"],["خدمات","🛠️"],["استخدام","💼"],["کتاب او زده کړه","📚"],["ورزش او تفریح","⚽"],["آله او موسیقي","🎸"]]
};

const wholesaleCatsLocalized = {
  fa: [["همه عمده","📦"],["مواد غذایی و خواربار عمده (برنج، روغن، آرد)","🌾"],["خشکبار و میوه خشک تناژ بالا (کشمش، بادام، پسته)","🌰"],["موبایل و گجت دیجیتال (کارتن و عمده)","📱"],["لوازم خانگی و برقی (عمده و کارتن)","🧺"],["پوشاک و تکه (عمده‌فروشی بازار)","👕"],["آهن‌آلات و مصالح ساختمانی (تناژ بالا)","🏗️"],["لوازم یدکی موتر و ماشین‌آلات (عمده)","⚙️"],["مواد شوینده و بهداشتی (کارتن و عمده)","🧼"]],
  ps: [["ټول عمده","📦"],["خوراکي توکي (وریجې، غوړي، اوړه)","🌾"],["وچه مېوه (ممیز، بادام، پسته)","🌰"],["موبایل او ډیجیټل توکي (کارتن)","📱"],["کورني او بریښنایي توکي (کارتن)","🧺"],["جامې او ټوکر (عمده پلورنځی)","👕"],["اوسپنه او ساختماني توکي (لویه اندازه)","🏗️"],["د موټر پرزې او ماشین الات","⚙️"],["پاکوونکي او روغتیایي توکي","🧼"]]
};

let cats = catsLocalized[currentLang];
let wholesaleCats = wholesaleCatsLocalized[currentLang];

const provinceCoords = [
  {name: "کابل", lat: 34.5553, lng: 69.2075},
  {name: "هرات", lat: 34.3529, lng: 62.2040},
  {name: "مزارشریف", lat: 36.7062, lng: 67.1106},
  {name: "قندهار", lat: 31.6289, lng: 65.7371},
  {name: "جلال‌آباد", lat: 34.4265, lng: 70.4515},
  {name: "کندز", lat: 36.6667, lng: 68.8500},
  {name: "غزنی", lat: 33.5539, lng: 68.4175},
  {name: "بامیان", lat: 34.8345, lng: 67.8273},
  {name: "چاریکار", lat: 35.0117, lng: 69.2714},
  {name: "فیض‌آباد", lat: 37.1167, lng: 70.5833},
  {name: "تالقان", lat: 36.7369, lng: 69.5345},
  {name: "پل‌خمری", lat: 35.9436, lng: 68.7153},
  {name: "ایبک", lat: 36.2642, lng: 68.0153},
  {name: "شبرغان", lat: 36.6598, lng: 65.7483},
  {name: "میمنه", lat: 35.9214, lng: 64.7525},
  {name: "سرپل", lat: 36.2304, lng: 65.9298},
  {name: "قلعه‌نو", lat: 34.9856, lng: 63.1292},
  {name: "فیروزکوه", lat: 34.5215, lng: 64.6531},
  {name: "زرنج", lat: 31.0960, lng: 61.8534},
  {name: "لشکرگاه", lat: 31.5902, lng: 64.3650},
  {name: "ترین‌کوت", lat: 32.6282, lng: 66.5861},
  {name: "قلات", lat: 32.1062, lng: 66.9105},
  {name: "گردیز", lat: 33.5975, lng: 69.2259},
  {name: "شرنه", lat: 32.8800, lng: 68.8778},
  {name: "خوست", lat: 33.3333, lng: 69.9167},
  {name: "اسد‌آباد", lat: 34.8878, lng: 71.1453},
  {name: "مهترلام", lat: 34.6461, lng: 70.2092},
  {name: "پارون", lat: 35.1394, lng: 70.9231},
  {name: "بازارک", lat: 35.3181, lng: 69.5194},
  {name: "نیلی", lat: 33.7231, lng: 66.1389},
  {name: "میدان‌شهر", lat: 34.3917, lng: 68.7247},
  {name: "پل‌علم", lat: 33.9975, lng: 69.0233},
  {name: "محمود‌راقی", lat: 35.0039, lng: 69.3242},
  {name: "فراه", lat: 32.3742, lng: 62.1136}
];
const cities = provinceCoords.map(p => p.name);

const seed = [];
const $=s=>document.querySelector(s),nf=n=>n.toLocaleString("fa-IR"),fmt=n=>n?nf(n)+" افغانی":"توافقی";
const esc=s=>{const d=document.createElement("div");d.textContent=(s==null)?"":String(s);return d.innerHTML.replace(/"/g,"&quot;").replace(/'/g,"&#39;")};
const ago=h=>h<2?"چند دقیقه پیش":h<24?nf(Math.floor(h))+" ساعت پیش":h<48?"دیروز":nf(Math.floor(h/24))+" روز پیش";
const mem={};const S=(()=>{try{localStorage.setItem("__ab_test__","1");localStorage.removeItem("__ab_test__");return localStorage}catch(e){return{getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=v},removeItem:k=>{delete mem[k]}}}})();
const get=(k,d)=>{try{return JSON.parse(S.getItem(k))??d}catch(e){return d}};
const _rawPut=(k,v)=>{try{S.setItem(k,JSON.stringify(v));return true}catch(e){console.warn("ذخیره‌سازی انجام نشد:",k,e);return false}};
const put=(k,v)=>{ const r=_rawPut(k,v); if(k==="ab_ads" && typeof invalidateAllCache==="function") invalidateAllCache(); return r; };

const normalizePhone = (v) => {
  let s = normDigits(String(v || "")).replace(/[\s\-()]/g, "");
  if (s.startsWith("+93")) s = "0" + s.slice(3);
  else if (s.startsWith("0093")) s = "0" + s.slice(4);
  else if (s.startsWith("93") && s.length === 11) s = "0" + s.slice(2);
  return s;
};
const normDigits=s=>String(s??"").replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d));

function recordSearch(q){
  if (!q || q.length < 2) return;
  try {
    let h = get("ab_searches", []);
    if (!Array.isArray(h)) h = [];
    h = h.filter(x => x !== q);
    h.unshift(q);
    h = h.slice(0, 8);
    put("ab_searches", h);
    renderSearchHistory();
  } catch(e){}
}
function renderSearchHistory(){
  const box = $("#search-history");
  if (!box) return;
  const h = get("ab_searches", []);
  if (!Array.isArray(h) || h.length === 0) { box.style.display = "none"; return; }
  box.style.display = "block";
  box.innerHTML = '<span style="opacity:.7;">اخیر:</span> ' +
    h.map(q => `<button type="button" class="capsule-btn" data-hist="${esc(q)}" style="font-size:11px;padding:2px 8px;margin:2px 2px 0 0;border:1px solid var(--bd);">${esc(q)}</button>`).join("") +
    ` <button type="button" class="link" id="clear-hist" style="font-size:11px;">پاک‌کردن</button>`;
  box.querySelectorAll("[data-hist]").forEach(b => {
    b.onclick = () => { $("#q").value = b.dataset.hist; currentPage = 1; draw(); };
  });
  const c = box.querySelector("#clear-hist");
  if (c) c.onclick = () => { put("ab_searches", []); renderSearchHistory(); };
}
document.addEventListener("DOMContentLoaded", renderSearchHistory);

const normFa=s=>normDigits(s).replace(/ي/g,"ی").replace(/ك/g,"ک").replace(/[\u064B-\u065F\u200c]/g,"").toLowerCase();
const USD_AFN = (() => { try { const r = +localStorage.getItem("ab_usd_rate"); return Number.isFinite(r) && r > 0 ? r : 70; } catch(e) { return 70; } })();
const EXPIRE_H=24*60;
const afn=a=>a.cur==="USD"?a.p*USD_AFN:a.p;
const pcmp=(a,b)=>{const x=a.p>0?afn(a):Infinity,y=b.p>0?afn(b):Infinity;return x===y?0:x<y?-1:1};
const fmtAd=a=>a.p?nf(a.p)+(a.cur==="USD"?" دلار":" افغانی")+(a.isWholesale&&a.unit?" / "+esc(a.unit):"")+(a.neg?" (قابل مذاکره)":""):"توافقی";
const adUrl=id=>location.href.split("#")[0]+"#ad-"+encodeURIComponent(id);

let users=get("ab_users",{})||{};
let mine=Array.isArray(get("ab_ads",[]))?get("ab_ads",[]):[];
let me=get("ab_sess",null);
let myId=null, adminFlag=false;
let favs=[];
const UK=k=>k+"_"+(me||"anon");
let notes=get(UK("ab_notes"),{})||{};
let messages=get(UK("ab_msgs"),{})||{};
let shopReviews=get("ab_shop_reviews",{})||{};
let notifications=Array.isArray(get(UK("ab_notifs"),[]))?get(UK("ab_notifs"),[]):[];
let cat=0,wholesaleCat=0,view="all",mode="in",after=null;
let currentPage=1, wholesaleCurrentPage=1, itemsPerPage=8;
let currentAppTab = "retail";

let compareList = [];
let radiusFilterActive = false;
let radiusCenterLat = 34.5553;
let radiusCenterLng = 69.2075;
let radiusMaxKm = 50;

if(me&&!users[me])me=null;
const loadFavs=()=>{const f=me?get("ab_fav_"+me,[]):[];favs=Array.isArray(f)?f:[];notes=get(UK("ab_notes"),{})||{};messages=get(UK("ab_msgs"),{})||{};const nn=get(UK("ab_notifs"),[]);notifications=Array.isArray(nn)?nn:[];};loadFavs();
let _allCache = null, _allCacheKey = "", _trustArr = null, _trustMap = null;
function all(){
  const m = Array.isArray(mine) ? mine : [];
  const key = m.length + "|" + m.map(a => a.id + ":" + a.ts + ":" + (a.views||0)).join(",") + "|" + Math.floor(Date.now() / 6e4);
  if (key === _allCacheKey && _allCache) return _allCache;
  _allCacheKey = key;
  _allCache = m
    .map(a => ({ ...a, age: (Date.now() - a.ts) / 36e5 }))
    .filter(a => a.age < EXPIRE_H || a.owner === me)
    .concat(seed);
  return _allCache;
}
function invalidateAllCache(){ _allCacheKey = ''; _allCache = null; _trustArr = null; _trustMap = null; }
async function sha(s){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}

const cityOptionsHTML = '<option value="-1">🌐 ولایت</option>' + provinceCoords.map((x,i)=>`<option value="${i}">${x.name}</option>`).join("");
document.getElementById("header-city-select").innerHTML = cityOptionsHTML;
document.getElementById("f-ci").innerHTML = provinceCoords.map((x,i)=>`<option value="${i}">${x.name}</option>`).join("");

function addNotification(text) {
  if(!Array.isArray(notifications)) notifications = [];
  notifications.unshift({ text, time: Date.now(), read: false });
  put(UK("ab_notifs"), notifications);
  updateNotifBadge();
}

function updateNotifBadge() {
  if(!Array.isArray(notifications)) notifications = [];
  const unread = notifications.filter(n => !n.read).length;
  const badge = document.getElementById("notif-count-badge");
  if(unread > 0) {
    badge.textContent = unread;
    badge.style.display = "inline-block";
  } else {
    badge.style.display = "none";
  }
  const bell = document.querySelector('.notif-bell-btn');
  if (bell) {
    bell.classList.toggle('has-new', unread > 0);
  }
}

document.getElementById("notif-bell-btn").onclick = () => {
  if(!Array.isArray(notifications)) notifications = [];
  notifications.forEach(n => n.read = true);
  put(UK("ab_notifs"), notifications);
  updateNotifBadge();
  const container = document.getElementById("notif-list-container");
  container.innerHTML = notifications.length ? notifications.map(n => `
    <div style="background:var(--bg);border:1px solid var(--bd);padding:10px;border-radius:10px;font-size:12px;">
      <div>${esc(n.text)}</div>
      <div class="mu" style="font-size:10px;margin-top:3px;">${ago((Date.now() - n.time)/36e5)}</div>
    </div>
  `).join("") : '<div class="mu" style="text-align:center;padding:20px;">هیچ اعلانی وجود ندارد.</div>';
  document.getElementById("notif-dlg").showModal();
};
document.getElementById("close-notif-dlg").onclick = () => document.getElementById("notif-dlg").close();

function populateModalCategorySelect(isWholesale) {
  const selectEl = document.getElementById("f-c");
  if(isWholesale) {
    selectEl.innerHTML = wholesaleCats.slice(1).map((x,i)=>`<option value="${i+1}">${x[0]}</option>`).join("");
  } else {
    selectEl.innerHTML = cats.slice(1).map((x,i)=>`<option value="${i+1}">${x[0]}</option>`).join("");
  }
}

function buildMultiProvinceCheckboxes() {
  const grid = document.getElementById("multi-provinces-grid");
  grid.innerHTML = provinceCoords.map((p, i) => `
    <label class="chk" style="font-size:11px;"><input type="checkbox" class="multi-prov-chk" value="${i}"> ${p.name}</label>
  `).join("");
}
buildMultiProvinceCheckboxes();

document.getElementById("header-city-select").addEventListener("change", (e) => {
  currentPage = 1;
  wholesaleCurrentPage = 1;
  draw();
});

let __brandTapCount=0, __brandTapTimer=null;
function isIOS(){ return /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1); }
function isPWAStandalone(){ return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true; }
window.brandClick = function(e){
  __brandTapCount++;
  clearTimeout(__brandTapTimer);
  __brandTapTimer=setTimeout(()=>{ __brandTapCount=0; },500);
  if(__brandTapCount<2){ resetAllFilters(e); return; }
  try { localStorage.setItem('ab_pwa_hint_stop', '1'); } catch(err){}
  const __hb=document.getElementById("pwa-hint-bubble"); if(__hb) __hb.classList.remove("show");
  __brandTapCount=0;
  if(e) e.preventDefault();
  if(isPWAStandalone()){ toast("افغان‌بازار از قبل نصب است ✅"); return; }
  const dp = window.__pwaDeferredPrompt && window.__pwaDeferredPrompt();
  if(dp){
    dp.prompt();
    dp.userChoice.finally(()=>{ window.__pwaDeferredPrompt=function(){return null;}; });
    return;
  }
  if(isIOS()){ document.getElementById("ios-install-dlg").showModal(); return; }
  toast("برای نصب، از منوی مرورگر (⋮) گزینه «Install app» یا «Add to Home screen» را بزنید.");
};
window.resetAllFilters = (e) => {
  if(e) e.preventDefault();
  ["#q","#pmin","#pmax","#q-wholesale","#wmin","#wmax"].forEach(s=>{const el=document.querySelector(s);if(el)el.value="";});
  if(document.getElementById("sort")) document.getElementById("sort").value = "new";
  if(document.getElementById("sort-wholesale")) document.getElementById("sort-wholesale").value = "new";
  document.getElementById("urg").checked=false; document.getElementById("f-has-photo").checked=false; document.getElementById("f-shop-only").checked=false;
  document.getElementById("header-city-select").value = -1;
  document.getElementById("f-cond").value=""; cat=0; wholesaleCat=0; view="all"; currentPage=1; wholesaleCurrentPage=1;
  radiusFilterActive = false;
  document.getElementById("radius-status-badge").textContent = "شعاع فعال نیست";
  draw();
  document.getElementById("listing").scrollIntoView({behavior:"smooth"});
};

function drawCats(){
  document.getElementById("cats").innerHTML=cats.map((x,i)=>`<button class="cat ${i==cat?'on':''}" data-i="${i}" role="tab" aria-selected="${i==cat}"><i>${x[1]}</i>${x[0]}</button>`).join("");
  document.getElementById("wholesale-cats").innerHTML=wholesaleCats.map((x,i)=>`<button class="cat wholesale-cat ${i==wholesaleCat?'on':''}" data-i="${i}" role="tab" aria-selected="${i==wholesaleCat}"><i>${x[1]}</i>${x[0]}</button>`).join("");
}

window.openTextPrompt = function(title, defaultValue = "") {
  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.innerHTML = `
      <div class="dialog-content-pad">
        <h2 style="margin:0 0 10px;font-size:16px;">${esc(title)}</h2>
        <input id="__prompt_input" value="${esc(defaultValue)}" style="width:100%;">
        <div class="row" style="margin-top:14px;">
          <button class="capsule-btn primary" id="__prompt_ok">تأیید</button>
          <button class="capsule-btn" id="__prompt_cancel">انصراف</button>
        </div>
      </div>`;
    document.body.appendChild(dialog);
    dialog.showModal();
    const input = dialog.querySelector("#__prompt_input");
    input.focus();
    input.select();
    const cleanup = (v) => { dialog.close(); dialog.remove(); resolve(v); };
    dialog.querySelector("#__prompt_ok").onclick = () => cleanup(input.value.trim());
    dialog.querySelector("#__prompt_cancel").onclick = () => cleanup(null);
    input.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); cleanup(input.value.trim()); } };
    dialog.onclick = (e) => { if (e.target === dialog) cleanup(null); };
  });
};

let _toastTimer=null;
function toast(m){
  const t=document.getElementById("toast"); if(!t) return;
  const dlg=document.querySelector("dialog[open]");
  const host=dlg||document.body;
  if(t.parentNode!==host) host.appendChild(t);
  t.textContent=m; t.classList.add("s");
  clearTimeout(_toastTimer);
  _toastTimer=setTimeout(()=>t.classList.remove("s"), Math.min(6000, Math.max(2200, String(m).length*65)));
}

function getShopAverageRating(ownerPhone) {
  const revs = shopReviews[ownerPhone] || [];
  if(revs.length === 0) return { avg: "—", count: 0 };
  const sum = revs.reduce((acc, r) => acc + r.rating, 0);
  return { avg: (sum / revs.length).toFixed(1), count: revs.length };
}

function priceInsight(ad) {
  if (!ad.p || ad.p <= 0 || ad.isWholesale) return null;
  const sameCat = all().filter(x =>
    !x.isWholesale && x.c === ad.c && x.ci === ad.ci &&
    x.p > 0 && x.id !== ad.id &&
    (!x.status || x.status === "approved")
  );
  if (sameCat.length < 3) return null;
  const avg = sameCat.reduce((s, x) => s + afn(x), 0) / sameCat.length;
  const myPrice = afn(ad);
  const diff = ((myPrice - avg) / avg) * 100;
  const isPs = currentLang === 'ps';
  let verdict, color, icon;
  if (diff < -15) { verdict = isPs ? "له منځني څخه ډیر ارزانه" : "خیلی ارزان‌تر از میانگین"; color = "#0e7a4b"; icon = "🟢"; }
  else if (diff < -5) { verdict = isPs ? "لږ ارزانه" : "کمی ارزان‌تر از میانگین"; color = "#37b676"; icon = "🟢"; }
  else if (diff <= 5) { verdict = isPs ? "منصفانه بیه" : "قیمت منصفانه"; color = "#62736a"; icon = "⚪"; }
  else if (diff <= 15) { verdict = isPs ? "لږ ګرانه" : "کمی گران‌تر از میانگین"; color = "#e08c00"; icon = "🟡"; }
  else { verdict = isPs ? "له منځني څخه ډیر ګرانه" : "گران‌تر از میانگین"; color = "#d6324a"; icon = "🔴"; }
  return { avg: Math.round(avg), diff: diff.toFixed(0), count: sameCat.length, verdict, color, icon };
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371;
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1);
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
function deg2rad(deg) { return deg * (Math.PI/180); }

function toWhatsAppNumber(ph) {
  const clean = String(ph || '').replace(/[^\d]/g, '');
  if (clean.startsWith('93')) return clean;
  if (clean.startsWith('0')) return '93' + clean.slice(1);
  return '93' + clean;
}


// ===== Map reliability (Leaflet) =====
let _leafletP=null;
window.__mapDiag=window.__mapDiag||[];
document.addEventListener('securitypolicyviolation',e=>{ try{ window.__mapDiag.push('CSP-blocked: '+String(e.blockedURI).replace(/^https?:\/\//,'').split('/')[0]+' ('+e.violatedDirective+')'); }catch(_){} });
const TILE_SOURCES=[
  {u:'/tiles/{z}/{x}/{y}{r}.png',s:'abc',a:'© OpenStreetMap © CARTO'},   // پروکسی خود سایت (برای شبکه‌های فیلترشده مثل افغانستان)
  {u:'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',s:'abcd',a:'© OpenStreetMap © CARTO'},
  {u:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',s:'abc',a:'© OpenStreetMap'},
  {u:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',s:'abc',a:'Tiles © Esri'},
  {u:'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',s:'abc',a:'© OpenTopoMap'}
];
// تا وقتی کانتینر نقشه (مثلاً داخل dialog در حال انیمیشن) اندازهٔ واقعی بگیرد، چندبار invalidateSize می‌زنیم
function srcName(i){ const u=(TILE_SOURCES[i||0]||{}).u||''; return u.startsWith('/')?'local-proxy':u.split('/')[2]; }
function fixMapSize(map, ms){
  if(!map) return;
  const step=50, max=Math.max(1,Math.ceil((ms||1200)/step)); let n=0, iv=null;
  const once=()=>{ try{ const el=map.getContainer(); if(el && el.offsetWidth && el.offsetHeight) map.invalidateSize({animate:false}); }catch(_){} };
  once();
  iv=setInterval(()=>{ once(); if(++n>=max){ clearInterval(iv); iv=null; } },step);
  try{ map.on('unload',()=>{ if(iv) clearInterval(iv); }); }catch(_){}
}
function prepMapContainer(el){ if(!el) return; el.style.position='relative'; el.style.zIndex='0'; el.style.isolation='isolate'; }
function tileDiagOverlay(map){
  try{
    const el=map.getContainer(); if(!el || el.querySelector('[data-tile-diag]')) return;
    const d=document.createElement('div'); d.setAttribute('data-tile-diag','1');
    d.style.cssText='position:absolute;inset:auto 6px 6px 6px;z-index:1000;background:rgba(0,0,0,.72);color:#fff;font:10px/1.5 monospace;direction:ltr;padding:6px 8px;border-radius:8px;pointer-events:none;word-break:break-all';
    d.textContent='tiles failed: '+((window.__mapDiag||[]).slice(-5).join(' | ')||'no-diagnostics');
    el.appendChild(d);
  }catch(_){}
}
function hookLeaflet(){
  if(window._lfHooked||typeof L==='undefined') return;
  window._lfHooked=1;
  try{
    const pin='<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42"><path d="M15 1C7.3 1 1 7.2 1 14.8 1 25 15 41 15 41s14-16 14-26.2C29 7.2 22.7 1 15 1z" fill="#0e7a4b" stroke="#fff" stroke-width="2"/><circle cx="15" cy="15" r="5.5" fill="#fff"/></svg>';
    L.Marker.prototype.options.icon=L.icon({iconUrl:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(pin),iconSize:[30,42],iconAnchor:[15,41],popupAnchor:[0,-36]});
  }catch(_){}
  L.Map.addInitHook(function(){
    const m=this;
    prepMapContainer(m.getContainer());
    fixMapSize(m,1600);
    if(window.ResizeObserver){
      let last=0;
      const ro=new ResizeObserver(()=>{ const el=m.getContainer(); if(!el||!el.offsetWidth||!el.offsetHeight) return; const now=Date.now(); if(now-last<120) return; last=now; try{ m.invalidateSize({animate:false}); }catch(_){} });
      try{ ro.observe(m.getContainer()); }catch(_){}
      m.on('unload',()=>ro.disconnect());
    }
  });
  L.TileLayer.addInitHook(function(){
    if(!this.options._osm) return;
    const self=this; let errs=0, ok=false, timer=null, exhausted=false;
    const arm=()=>{ clearTimeout(timer); timer=setTimeout(()=>{ if(!ok && self._map && !exhausted){ window.__mapDiag.push('tile-timeout: '+srcName(self.options._srcIdx)); next(); } },8000); };
    const next=()=>{
      const cur=self.options._srcIdx||0, idx=cur+1;
      if(idx>=TILE_SOURCES.length){ exhausted=true; clearTimeout(timer); toast('تصاویر نقشه بارگذاری نمی‌شود؛ اینترنت را بررسی کنید.'); if(self._map) tileDiagOverlay(self._map); return; }
      const prev=TILE_SOURCES[cur], s=TILE_SOURCES[idx];
      self.options._srcIdx=idx; errs=0; ok=false;
      self.options.subdomains=s.s.split(''); self.options.attribution=s.a; self.options.detectRetina=/\{r\}/.test(s.u);
      try{ if(self._map&&self._map.attributionControl){ self._map.attributionControl.removeAttribution(prev.a); self._map.attributionControl.addAttribution(s.a); } }catch(_){}
      self.setUrl(s.u); arm();
    };
    this.on('tileload',()=>{ ok=true; clearTimeout(timer); });
    this.on('tileerror',()=>{ if(ok) return; if(++errs===1) window.__mapDiag.push('tile-error: '+srcName(self.options._srcIdx)); if(errs>=3) next(); });
    this.on('add',arm);
    this.on('remove',()=>clearTimeout(timer));
  });
}
function ensureLeaflet(){
  if(typeof L!=='undefined'){ hookLeaflet(); return Promise.resolve(true); }
  if(_leafletP) return _leafletP;
  const loadJs=(u,ms)=>new Promise((res,rej)=>{
    const s=document.createElement('script'); s.src=u; s.async=true;
    const to=setTimeout(()=>{ s.remove(); rej(new Error('timeout')); },ms);
    s.onload=()=>{ clearTimeout(to); res(); };
    s.onerror=()=>{ clearTimeout(to); s.remove(); rej(new Error('load-failed')); };
    document.head.appendChild(s);
  });
  _leafletP=(async()=>{
    // استایل نقشه: چند منبع پشتیبان (اگر یکی فیلتر/کند بود، دیگری کار می‌کند)
    if(!document.querySelector('link[data-lf]')){
      ['./vendor/leaflet/leaflet.css','https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css','https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css','https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'].forEach(href=>{
        try{ const l=document.createElement('link'); l.rel='stylesheet'; l.href=href; l.dataset.lf='1'; document.head.appendChild(l); }catch(_){}
      });
    }
    const urls=[
      './vendor/leaflet/leaflet.js',
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
      'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js',
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    ];
    for(let round=0; round<2; round++){
      for(const u of urls){
        if(typeof L!=='undefined'){ hookLeaflet(); return true; }
        try{ await loadJs(u, 12000); if(typeof L!=='undefined'){ hookLeaflet(); return true; } window.__mapDiag.push(u.replace(/^https?:\/\//,'').split('/')[0]+': not-leaflet'); }
        catch(e){ window.__mapDiag.push((u.startsWith('.')?'local':u.replace(/^https?:\/\//,'').split('/')[0])+': '+(e&&e.message||'err')); }
      }
    }
    return typeof L!=='undefined';
  })();
  _leafletP.then(ok=>{ if(!ok) _leafletP=null; });
  return _leafletP;
}
function mapFail(el, retry){
  if(typeof el==='string') el=document.getElementById(el);
  if(!el) return;
  const diag=(window.__mapDiag||[]).slice(-6).join(' | ');
  el.innerHTML='<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:12px;text-align:center;font-size:12px;color:var(--mu)"><div>🗺️ کتابخانه‌ی نقشه بارگذاری نشد</div><button type="button" class="capsule-btn primary" data-retry>تلاش دوباره</button><small style="direction:ltr;opacity:.65;font-size:10px;word-break:break-all">'+esc(diag||'no-diagnostics')+'</small></div>';
  const b=el.querySelector('[data-retry]'); if(b) b.onclick=()=>{ _leafletP=null; window.__mapDiag=[]; el.innerHTML='<div style="padding:12px;text-align:center;font-size:12px;color:var(--mu)">در حال بارگذاری…</div>'; ensureLeaflet().then(ok=>{ if(ok){ el.innerHTML=''; retry&&retry(); } else mapFail(el,retry); }); };
}
function baseTiles(){
  const s=TILE_SOURCES[0];
  return L.tileLayer(s.u,{maxZoom:19,subdomains:s.s.split(''),attribution:s.a,detectRetina:true,_osm:true,_srcIdx:0});
}
try{ hookLeaflet(); }catch(_){}

// ===== Trust score =====
function sellerAdCount(a){
  const arr=all();
  if(_trustArr!==arr){ _trustMap=new Map(); arr.forEach(x=>{ if((x.status||'approved')!=='approved') return; const k=String(x.owner||x.ph); _trustMap.set(k,(_trustMap.get(k)||0)+1); }); _trustArr=arr; }
  return _trustMap.get(String(a.owner||a.ph))||0;
}
function calculateTrustScore(ad){
  let sc=0;
  if(ad.verified) sc+=25;
  if(ad.isShop) sc+=25;
  const r=ad.isShop?getShopAverageRating(ad.ph):{avg:"—"};
  if(r.avg!=="—") sc+=Math.min(25,(parseFloat(r.avg)/5)*25);
  const n=sellerAdCount(ad);
  sc+= n>=3?15:(n>=1?8:0);
  if(sc>=75) return {label:t("trustReliable"),color:"#0e7a4b"};
  if(sc>=50) return {label:t("trustGood"),color:"#e08c00"};
  if(sc>=25) return {label:t("trustNew"),color:"#d97706"};
  return {label:t("trustLow"),color:"#62736a"};
}
function trustBadgeHTML(a){ const r=calculateTrustScore(a); return `<div style="font-size:10px;font-weight:600;color:${r.color};margin-top:2px;">${r.label}</div>`; }

// ===== OG tags (client-side only; crawlers of WhatsApp/Telegram need a server page) =====
const _ogDefaults={};
function _setOG(prop,content){
  let el=document.querySelector(`meta[property="${prop}"]`);
  if(!(prop in _ogDefaults)) _ogDefaults[prop]=el?el.getAttribute('content'):null;
  if(!el){ el=document.createElement('meta'); el.setAttribute('property',prop); document.head.appendChild(el); }
  el.setAttribute('content',content||'');
}
function updateOGTags(ad){
  _setOG('og:title',ad.t+' — '+fmtAd(ad));
  _setOG('og:description',((ad.d||'').substring(0,150)||'خرید و فروش در افغان‌بازار')+' | '+(cities[ad.ci]||'افغانستان'));
  _setOG('og:type','product');
  _setOG('og:url',adUrl(ad.id));
  const img=(Array.isArray(ad.imgs)&&ad.imgs[0])||ad.img;
  if(img&&/^https:/.test(img)) _setOG('og:image',img);
}
function resetOGTags(){
  Object.keys(_ogDefaults).forEach(k=>{ const el=document.querySelector(`meta[property="${k}"]`); if(!el) return; if(_ogDefaults[k]===null) el.remove(); else el.setAttribute('content',_ogDefaults[k]); });
}

// ===== Expiry =====
function expiringMine(){
  return (Array.isArray(mine)?mine:[]).filter(x=>{
    if(x.owner!==me||!x.ts) return false;
    const left=EXPIRE_H-(Date.now()-x.ts)/36e5;
    return left>0&&left<72;
  });
}
function checkExpiringAds(){
  if(!me) return;
  const n=expiringMine().length;
  if(!n) return;
  try{ const last=+localStorage.getItem('ab_exp_notice')||0; if(Date.now()-last<864e5) return; localStorage.setItem('ab_exp_notice',String(Date.now())); }catch(_){}
  addNotification(`⚠️ ${nf(n)} آگهی شما در آستانهٔ انقضا هستند. برای تمدید به «آگهی‌های من» بروید.`);
}

// ===== Voice search =====
function initVoiceSearch(inputId){
  const input=document.getElementById(inputId);
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!input||!SR||input.parentNode.querySelector('[data-mic]')) return;
  const host=input.parentNode;
  if(getComputedStyle(host).position==='static') host.style.position='relative';
  input.style.paddingRight='38px';
  const mic=document.createElement('button');
  mic.type='button'; mic.setAttribute('data-mic','1'); mic.textContent='🎤'; mic.title='جستجوی صوتی'; mic.setAttribute('aria-label','جستجوی صوتی');
  mic.style.cssText='position:absolute;right:6px;top:50%;transform:translateY(-50%);background:none;border:0;font-size:18px;cursor:pointer;padding:2px 4px;z-index:2;';
  host.appendChild(mic);
  let recog=null;
  const start=lang=>{
    recog=new SR(); recog.lang=lang; recog.interimResults=false; recog.continuous=false;
    mic.textContent='⏺️';
    recog.onresult=ev=>{ input.value=ev.results[0][0].transcript; input.dispatchEvent(new Event('input',{bubbles:true})); };
    recog.onerror=ev=>{
      if(ev.error==='not-allowed') toast('اجازهٔ میکروفون داده نشد.');
      else if(ev.error==='language-not-supported'&&lang!=='fa-IR'){ recog=null; start('fa-IR'); return; }
      else if(ev.error!=='aborted') toast('صدا شنیده نشد، دوباره تلاش کن.');
    };
    recog.onend=()=>{ if(recog){ mic.textContent='🎤'; recog=null; } };
    try{ recog.start(); }catch(_){ mic.textContent='🎤'; recog=null; }
  };
  mic.onclick=e=>{ e.preventDefault(); if(recog){ try{recog.stop();}catch(_){} return; } start(currentLang==='ps'?'ps-AF':'fa-IR'); };
}


// ===== Category-specific fields =====
const categoryMeta = {
  "1": {condition:false,specRow:true,fields:[{k:"area",lKey:"fldArea",ty:"number",ph:"مثلاً ۱۵۰"},{k:"rooms",lKey:"fldRooms",ty:"number",ph:"مثلاً ۳"},{k:"floor",lKey:"fldFloor",ty:"text",ph:"مثلاً ۲"},{k:"parking",lKey:"fldParking",ty:"select",oKeys:["optHas","optNotHas"]},{k:"deal",lKey:"fldDeal",ty:"select",oKeys:["optSell","optRent","optMortgage"]}]},
  "2": {condition:true,specRow:false,fields:[{k:"brand",lKey:"fldBrand",ty:"select",oKeys:["optToyota","optHonda","optNissan","optFord","optHyundai","optKia","optOther"]},{k:"year",lKey:"fldYear",ty:"number",ph:"مثلاً ۲۰۱۵"},{k:"km",lKey:"fldKm",ty:"number",ph:"مثلاً ۸۰۰۰۰"},{k:"fuel",lKey:"fldFuel",ty:"select",oKeys:["optPetrol","optDiesel","optElectric","optHybrid","optGas"]},{k:"gear",lKey:"fldGear",ty:"select",oKeys:["optAuto","optManual"]},{k:"color",lKey:"fldColor",ty:"text",ph:"مثلاً سفید"}]},
  "3": {condition:true,specRow:false,fields:[{k:"brand",lKey:"fldBrand",ty:"select",oKeys:["optApple","optSamsung","optXiaomi","optHuawei","optOther"]},{k:"ram",lKey:"fldRam",ty:"number",ph:"مثلاً ۸"},{k:"storage",lKey:"fldStorage",ty:"number",ph:"مثلاً ۱۲۸"},{k:"battery",lKey:"fldBattery",ty:"select",oKeys:["optNew","optOver80","optLess"]}]},
  "4": {condition:true,specRow:true,fields:[{k:"cpu",lKey:"fldCpu",ty:"text",ph:"مثلاً Core i7"},{k:"ram",lKey:"fldRam",ty:"number",ph:"مثلاً ۸"},{k:"storage",lKey:"fldStorage",ty:"number",ph:"مثلاً ۵۱۲"},{k:"screen",lKey:"fldScreen",ty:"text",ph:"مثلاً ۱۵.۶ اینچ"}]},
  "5": {condition:true,specRow:true,fields:[{k:"warranty",lKey:"fldWarranty",ty:"select",oKeys:["optHas","optNotHas"]}]},
  "8": {condition:true,specRow:true,fields:[{k:"unit",lKey:"fldUnit",ty:"select",oKeys:["optKg","optTon","optBag"]}]},
  "9": {condition:false,specRow:true,fields:[]},
  "11": {condition:false,specRow:false,fields:[{k:"serviceType",lKey:"fldServiceType",ty:"text",ph:"مثلاً تعمیر موبایل"},{k:"homeService",lKey:"fldHomeService",ty:"select",oKeys:["optHas","optNotHas"]},{k:"workHours",lKey:"fldWorkHours",ty:"text",ph:"مثلاً ۸ صبح تا ۵ عصر"}]},
  "12": {condition:false,specRow:false,fields:[{k:"jobType",lKey:"fldJobType",ty:"select",oKeys:["optFullTime","optPartTime","optContract"]},{k:"salary",lKey:"fldSalary",ty:"number",ph:"مثلاً ۲۰۰۰۰"},{k:"experience",lKey:"fldExperience",ty:"text",ph:"مثلاً ۲ سال"},{k:"gender",lKey:"fldGender",ty:"select",oKeys:["optAny","optMale","optFemale"]}]}
};
const DEFAULT_CAT_META = {condition:true,specRow:true,fields:[]};
const getCatMeta = id => categoryMeta[String(id)] || DEFAULT_CAT_META;
const categoryFields = Object.fromEntries(Object.entries(categoryMeta).map(([k,v])=>[k,v.fields]));
// select values are stored as language-neutral keys (optPetrol…) and translated on display
const extraLabel=v=>/^opt[A-Z]/.test(String(v))?t(String(v)):String(v);
function refreshCategoryFields(values){
  const box=document.getElementById("category-fields"); if(!box) return;
  const wholesale=document.getElementById("form-is-wholesale-hidden").value==="true";
  const meta=wholesale?DEFAULT_CAT_META:getCatMeta(document.getElementById("f-c").value);
  if(values===undefined){ values={}; document.querySelectorAll("#category-fields [data-extra-key]").forEach(el=>{ if(el.value) values[el.dataset.extraKey]=el.value; }); }
  values=values||{};
  const condRow=document.getElementById("retail-cond-row"), specRow=document.getElementById("retail-spec-row");
  if(condRow) condRow.style.display=(!wholesale&&meta.condition)?"grid":"none";
  if(specRow) specRow.style.display=(!wholesale&&meta.specRow)?"grid":"none";
  if(!wholesale&&!meta.condition) document.getElementById("form-cond").value="new";
  const fields=wholesale?[]:meta.fields;
  if(!fields.length){ box.innerHTML=""; return; }
  box.innerHTML=`<div style="margin:12px 0 2px;font-size:13px;font-weight:700;color:var(--ac);">${t('specSection')}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:0 8px;">`+fields.map(f=>{
    const v=values[f.k]==null?"":String(values[f.k]);
    const inp=f.ty==="select"
      ? `<select data-extra-key="${f.k}"><option value="">—</option>${f.oKeys.map(k=>`<option value="${k}"${(v===k||v===t(k))?" selected":""}>${esc(t(k))}</option>`).join("")}</select>`
      : `<input data-extra-key="${f.k}" type="${f.ty}" maxlength="40" value="${esc(v)}" placeholder="${esc(f.ph||"")}"${f.ty==="number"?' inputmode="numeric" min="0"':""}>`;
    return `<div><label>${t(f.lKey)}</label>${inp}</div>`;
  }).join("")+"</div>";
}
function collectExtras(){
  const out={};
  document.querySelectorAll("#category-fields [data-extra-key]").forEach(el=>{ const v=el.value.trim().slice(0,40); if(v) out[el.dataset.extraKey]=v; });
  return Object.keys(out).length?out:undefined;
}
function extrasHTML(a){
  const fields=categoryFields[String(a.c)]; if(!fields||!a.extras||typeof a.extras!=="object") return "";
  const rows=fields.filter(f=>a.extras[f.k]!=null&&a.extras[f.k]!=="").map(f=>`<div class="kv"><span class="mu">${t(f.lKey)}</span><span>${esc(extraLabel(a.extras[f.k]))}</span></div>`).join("");
  return rows?`<div style="margin-top:8px;padding:10px;background:var(--bg);border-radius:10px;"><b style="font-size:12px;">${t('specFull')}</b>${rows}</div>`:"";
}
document.getElementById("category-fields").addEventListener("input",()=>saveFormDraft());
document.getElementById("category-fields").addEventListener("change",()=>saveFormDraft());
function animateNumber(el,target,duration=900){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||target<2){ el.textContent=nf(target); return; }
  const start=performance.now();
  (function tick(now){ const p=Math.min((now-start)/duration,1); el.textContent=nf(Math.round(target*(1-Math.pow(1-p,3)))); if(p<1) requestAnimationFrame(tick); })(start);
}

window.openSellerProfile = function(ownerKey) {
  if (!ownerKey) return;
  const sellerAds = all().filter(a => 
    String(a.owner || a.ph) === String(ownerKey) && 
    (a.status || "approved") === "approved"
  );
  if (sellerAds.length === 0) { toast("اطلاعاتی از این فروشنده یافت نشد."); return; }
  const sample = sellerAds[0];
  const rating = sample.isShop ? getShopAverageRating(sample.ph) : { avg: "—", count: 0 };
  const dialog = document.createElement("dialog");
  dialog.style.cssText = "width:min(560px,95vw);";
  dialog.innerHTML = `
    <div class="dialog-content-pad">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--bd);padding-bottom:10px;margin-bottom:12px;">
        <h2 style="margin:0;font-size:17px;">👤 ${esc(sample.sellerName || "کاربر")}</h2>
        <button class="capsule-btn" data-close-profile style="border:1px solid var(--bd);">✕</button>
      </div>
      ${sample.isShop ? `<div class="badge-verified" style="margin-bottom:8px;">🏪 ${esc(sample.shopName || "")} — ⭐ ${rating.avg} (${rating.count} نظر)</div>` : ""}
      <div class="mu" style="font-size:12px;margin-bottom:10px;">${nf(sellerAds.length)} آگهی منتشرشده</div>
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr));">
        ${sellerAds.slice(0, 12).map(renderCard).join("")}
      </div>
    </div>`;
  document.body.appendChild(dialog);
  dialog.showModal();
  dialog.querySelector("[data-close-profile]").onclick = () => { dialog.close(); dialog.remove(); };
  dialog.onclick = e => { if (e.target === dialog) { dialog.close(); dialog.remove(); } };
};

function renderCard(a){
  const mainImg = (Array.isArray(a.imgs) && a.imgs.length > 0) ? a.imgs[0] : (a.img || "");
  const shopRatingInfo = a.isShop ? getShopAverageRating(a.ph) : null;
  const isCompared = compareList.includes(a.id);
  let locLabel = cities[a.ci] || "نامشخص";
  if(a.isWholesale && Array.isArray(a.provinces) && a.provinces.length > 0) {
    const names = a.provinces.map(idx => cities[idx]).filter(Boolean);
    locLabel = names.length > 2 ? names.slice(0,2).join("، ") + " +" + (names.length - 2) : names.join("، ");
  }
  return `<div class="ad" data-id="${a.id}" tabindex="0" role="button">
    <div class="ph" style="--h:${(a.c||1)*23}">
      ${mainImg ? `<img src="${mainImg}" alt="${esc(a.t)}" loading="lazy">` : `<span>${a.isWholesale ? '📦' : (cats[a.c]?.[1] || '📦')}</span>`}
    </div>
    ${a.u?'<span class="badge">فوری</span>':''}
    ${(() => {
      const pi = priceInsight(a);
      if (!pi || +pi.diff > -5) return '';
      return `<span class="badge" style="background:#0e7a4b;color:#fff;top:10px;right:auto;left:110px;z-index:3;">💰 قیمت خوب</span>`;
    })()}
    ${a.isWholesale?'<span class="badge wholesale-badge" style="top:10px;left:70px;right:auto;">📦 عمده</span>':(a.isShop?`<span class="badge" style="background:var(--ac);color:#fff;top:10px;left:70px;right:auto;">🏪 فروشگاه (${shopRatingInfo?.avg || '—'} ★)</span>`:'')}
    <button class="fav ${favs.includes(a.id)?'on':''}" data-f="${a.id}" aria-label="نشان‌کردن آگهی" aria-pressed="${favs.includes(a.id)}">${favs.includes(a.id)?'♥':'♡'}</button>
    ${!a.isWholesale ? `<button class="compare-checkbox ${isCompared?'checked':''}" data-comp="${a.id}" aria-label="افزودن به مقایسه" aria-pressed="${isCompared}" title="افزودن به مقایسه">⚖️</button>` : ''}
    <div class="i"><b>${esc(a.t)}</b><div class="price">${fmtAd(a)}</div><div class="mu"><span title="${a.ts ? new Date(a.ts).toISOString() : ''}">${ago(a.age)}</span> · ${locLabel}</div>${trustBadgeHTML(a)}${(view==="mine"||view==="admin")?`<div class="mu" style="margin-top:4px;font-size:11px;">👁️ ${nf(a.views||0)} · 📞 ${nf(a.calls||0)}</div>`:''}${(view==="fav"&&notes[me]&&notes[me][a.id])?`<div style="margin-top:4px;background:var(--chip);padding:3px 6px;border-radius:4px;font-size:11px;">📝 ${esc(notes[me][a.id])}</div>`:''}${view==="admin"?`<div style="margin-top:6px;display:flex;gap:4px;align-items:center;flex-wrap:wrap;"><span style="font-size:10px;padding:2px 6px;border-radius:4px;background:${(a.status||"approved")==="approved"?"var(--chip)":((a.status||"approved")==="pending"?"#fff3cd":"#f8d7da")};color:${(a.status||"approved")==="approved"?"var(--ac)":((a.status||"approved")==="pending"?"#856404":"#721c24")};">${(a.status||"approved")==="approved"?"✓ منتشرشده":((a.status||"approved")==="pending"?"⏳ در انتظار":"✕ رد شده")}</span>${!seed.some(x=>String(x.id)===String(a.id))?`${(a.status||"approved")!=="approved"?`<button class="capsule-btn" data-approve="${a.id}" style="padding:2px 8px;font-size:10px;background:#0e7a4b;color:#fff;">✅ تایید</button>`:''}${(a.status||"approved")!=="rejected"?`<button class="capsule-btn" data-reject="${a.id}" style="padding:2px 8px;font-size:10px;background:#d6324a;color:#fff;">❌ رد</button>`:''}`:`<span style="font-size:9px;color:var(--mu);">نمونه</span>`}</div>`:''}${view==="mine" && (a.status||"approved")!=="approved"?`<div style="margin-top:4px;font-size:10px;padding:2px 6px;border-radius:4px;display:inline-block;background:${(a.status||"approved")==="pending"?"#fff3cd":"#f8d7da"};color:${(a.status||"approved")==="pending"?"#856404":"#721c24"};">${(a.status||"approved")==="pending"? t('statusPending') : t('statusRejected')}</div>`:''}</div>
  </div>`;
}

let adminTab="all";
function draw(){
  if(view==="admin" && !adminFlag){ view="all"; adminTab="all"; }
  const q=document.getElementById("q").value.trim(),city=+document.getElementById("header-city-select").value,s=document.getElementById("sort").value;
  const pminV = document.getElementById("pmin").value, pmaxV = document.getElementById("pmax").value;
  const mn = pminV === "" ? 0 : (+pminV || 0);
  const mx = pmaxV === "" ? Infinity : (+pmaxV || 0);
  const pf = pminV !== "" || pmaxV !== "";
  const u=document.getElementById("urg").checked;
  const condFilter = document.getElementById("f-cond").value;
  const hasPhotoFilter = document.getElementById("f-has-photo").checked;
  const shopOnlyFilter = document.getElementById("f-shop-only").checked;

  let allAds = all();
  let retailAds = allAds.filter(a => !a.isWholesale);
  let wholesaleAds = allAds.filter(a => a.isWholesale);

  let r = retailAds.filter(a=>{
    if(cat && a.c != cat) return false;
    if(city >= 0 && a.ci != city) return false;
    if(q && !normFa((a.t||"")+" "+(a.d||"")+" "+(a.brand||"")+" "+(a.spec||"")).includes(normFa(q))) return false;
    if(pf && (afn(a) < mn || afn(a) > mx)) return false;
    if(u && !a.u) return false;
    if(condFilter && a.cond != condFilter) return false;
    if(hasPhotoFilter && !((Array.isArray(a.imgs)&&a.imgs.length>0) || a.img)) return false;
    if(shopOnlyFilter && !a.isShop) return false;
    if(view=="mine" && a.owner != me) return false;
    if(view=="fav" && !favs.includes(a.id)) return false;
    if(view !== "admin" && view !== "mine" && view !== "shop" && (a.status||"approved") !== "approved") return false;
    if(view=="shop" && (a.owner != me || !a.isShop)) return false;
    if(radiusFilterActive) {
      const adLat = a.lat || provinceCoords[a.ci]?.lat || 34.5553;
      const adLng = a.lng || provinceCoords[a.ci]?.lng || 69.2075;
      const dist = getDistanceFromLatLonInKm(radiusCenterLat, radiusCenterLng, adLat, adLng);
      if(dist > radiusMaxKm) return false;
    }
    return true;
  });
  
  if(view === "admin"){ 
    if(adminTab === 'pending') r = r.filter(a => (a.status||"approved") === "pending");
    else if(adminTab === 'rejected') r = r.filter(a => (a.status||"approved") === "rejected");
    
    const targetBanner = (currentAppTab === 'wholesale') ? document.getElementById("dynamic-shop-banner-wholesale") : document.getElementById("dynamic-shop-banner");
    if(targetBanner) {
      targetBanner.innerHTML = `
        <div class="shop-banner" style="justify-content:space-around; margin-bottom:10px; background:linear-gradient(135deg, #1b3b6f, #152c48);">
          <div style="text-align:center;"><b id="adm-users" style="font-size:20px;display:block;">...</b><span style="font-size:11px;">کل کاربران</span></div>
          <div style="text-align:center;"><b id="adm-ads" style="font-size:20px;display:block;">...</b><span style="font-size:11px;">کل آگهی‌ها</span></div>
          <div style="text-align:center;"><b id="adm-pending" style="font-size:20px;display:block;color:#ffc107;">...</b><span style="font-size:11px;">در انتظار تایید</span></div>
        </div>
        <div class="mtabs" style="margin:6px 0 10px;">
          <button type="button" data-atab="all" class="${adminTab==='all'?'on':''}">همه آگهی‌ها</button>
          <button type="button" data-atab="pending" class="${adminTab==='pending'?'on':''}">⏳ در انتظار</button>
          <button type="button" data-atab="rejected" class="${adminTab==='rejected'?'on':''}">✕ رد شده</button>
          <button type="button" data-atab="reports" class="${adminTab==='reports'?'on':''}">🚩 گزارش‌ها</button>
        </div>
      `;
      if(sb() && adminFlag) {
        sb().rpc('get_admin_stats').then(({data}) => {
          if(data) {
            const u = document.getElementById('adm-users'); if(u) u.textContent = nf(data.users);
            const a = document.getElementById('adm-ads'); if(a) a.textContent = nf(data.ads);
            const p = document.getElementById('adm-pending'); if(p) p.textContent = nf(data.pending);
          }
        });
      }
    }
  }
  
  if(view=="admin"){
    const rank = a => (a.status||"approved")==="pending"?0:((a.status||"approved")==="approved"?1:2);
    r.sort((a,b)=> rank(a)-rank(b) || a.age-b.age);
  }
  else if(s=="lo") r.sort(pcmp);
  else if(s=="hi") r.sort((a,b)=>afn(b)-afn(a));
  else if(s=="pop") r.sort((a,b)=>(b.views||0)-(a.views||0));
  else r.sort((a,b)=>a.age-b.age);
  
  const titleMap = {
    all: cat ? (cats[cat]?.[0]||t('condAll')) : t('navRetail'), 
    mine: t('navRetail'),
    fav: t('emptyTitle'),
    admin: '<svg class="icon icon-sm"><use href="#i-shield"></use></svg> پنل مدیریت',
    shop: '<svg class="icon icon-sm"><use href="#i-store"></use></svg> فروشگاه'
  };
  const _t = titleMap[view] || titleMap.all;
  document.getElementById("title").innerHTML = _t + `<span>${nf(r.length)} آگهی</span>`;
  renderActiveFilters("active-filters", false);
  renderActiveFilters("active-filters-wholesale", true);
  
  if(view == "shop" && me && users[me]) {
    const userShopName = users[me]?.shopName || "فروشگاه رسمی من";
    const myShopKey = (mine.find(x=>x.owner===me&&x.isShop&&x.ph)||{}).ph || me;
    const myRating = getShopAverageRating(myShopKey);
    const myRevs = shopReviews[myShopKey] || [];
    document.getElementById("dynamic-shop-banner").innerHTML = `
      <div class="shop-banner" style="flex-direction:column;align-items:flex-start;gap:10px;">
        <div style="display:flex;justify-content:space-between;width:100%;align-items:center;flex-wrap:wrap;gap:8px;">
          <div>
            <h3>🏪 ${esc(userShopName)}</h3>
            <p>امتیاز فروشگاه: <b>${myRating.avg} ★</b> (از ${myRating.count} نظر)</p>
          </div>
          <button class="capsule-btn primary" id="edit-shop-name-btn" style="background:#fff;color:var(--ac);font-weight:bold;">ویرایش نام فروشگاه</button>
        </div>
        <div style="width:100%;background:rgba(255,255,255,0.1);padding:10px;border-radius:10px;font-size:12px;">
          <b>آخرین نظرات مشتریان:</b>
          ${myRevs.length ? myRevs.map(rv=>`<div style="margin-top:5px;border-top:1px solid rgba(255,255,255,0.2);padding-top:3px;">⭐ ${rv.rating}/5 — <b>${esc(rv.buyer||'کاربر')}:</b> ${esc(rv.comment||'')}</div>`).join("") : '<div style="margin-top:4px;opacity:0.8;">هنوز نظری ثبت نشده است.</div>'}
        </div>
      </div>
    `;
    const editShopBtn = document.getElementById("edit-shop-name-btn");
    if(editShopBtn) {
      editShopBtn.onclick = async () => {
        const newName = await openTextPrompt("نام جدید فروشگاه خود را وارد کنید:", userShopName);
        if (!newName) return;
        users[me].shopName = newName;
        put("ab_users", users);
        mine.forEach(ad => { if(ad.owner === me && ad.isShop) { ad.shopName = newName; syncAd(ad); } });
        put("ab_ads", mine);
        invalidateAllCache();
        toast("نام فروشگاه به‌روز شد ✅");
        draw();
      };
    }
  } else if(view === "mine" && me && users[me]) {
    const myAds = mine.filter(x=>x.owner===me);
    const tv = myAds.reduce((s,x)=>s+(Number(x.views)||0),0);
    const tc = myAds.reduce((s,x)=>s+(Number(x.calls)||0),0);
    document.getElementById("dynamic-shop-banner").innerHTML = `<div class="shop-banner" style="justify-content:space-around;"><div style="text-align:center;"><b style="font-size:20px;display:block;">${nf(myAds.length)}</b><span style="font-size:11px;opacity:0.8;">آگهی</span></div><div style="text-align:center;"><b style="font-size:20px;display:block;">${nf(tv)}</b><span style="font-size:11px;opacity:0.8;">بازدید</span></div><div style="text-align:center;"><b style="font-size:20px;display:block;">${nf(tc)}</b><span style="font-size:11px;opacity:0.8;">تماس</span></div></div>`;
    const expiring = expiringMine();
    if(expiring.length) {
      const btn = document.createElement("button");
      btn.className = "capsule-btn primary";
      btn.style.cssText = "margin-top:10px;width:100%;padding:10px;font-size:13px;";
      btn.textContent = `🔄 تمدید ${nf(expiring.length)} آگهی در آستانهٔ انقضا`;
      btn.onclick = async () => {
        btn.disabled = true; btn.textContent = "در حال تمدید...";
        const now = Date.now();
        for(const ad of expiring) { ad.ts = now; try { await syncAd(ad); } catch(_) {} }
        put("ab_ads", mine); draw();
        toast(`✅ ${nf(expiring.length)} آگهی تمدید شد`);
      };
      document.getElementById("dynamic-shop-banner").appendChild(btn);
    }
  } else if(view !== "admin") {
    document.getElementById("dynamic-shop-banner").innerHTML = "";
  }
  
  if(view === "admin" && adminTab === 'reports') {
    if(currentAppTab === 'wholesale') {
        document.getElementById("wholesale-list").innerHTML = '';
        document.getElementById("wholesale-pagination").innerHTML = '';
    } else {
        document.getElementById("list").innerHTML = '';
        document.getElementById("pagination").innerHTML = '';
    }
    renderReports();
    return;
  }
  const totalPages = Math.ceil(r.length / itemsPerPage) || 1;
  if(currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedItems = r.slice(start, start + itemsPerPage);

  if (paginatedItems.length) {
    document.getElementById("list").innerHTML = paginatedItems.map(renderCard).join("");
  } else if (view === "all") {
    const suggestions = [];
    const q = document.getElementById("q").value.trim();
    if (q) {
      const similar = retailAds.filter(a => {
        const words = q.split(/\s+/).filter(w => w.length > 2);
        const text = normFa((a.t||"") + " " + (a.d||""));
        return words.some(w => text.includes(normFa(w)));
      }).slice(0, 4);
      if (similar.length) suggestions.push({ title: "شاید این‌ها را می‌خواستید:", ads: similar });
    }
    const filterCount = [
      cat > 0, document.getElementById("pmin").value, document.getElementById("pmax").value,
      document.getElementById("urg").checked, document.getElementById("f-cond").value,
      document.getElementById("f-has-photo").checked, document.getElementById("f-shop-only").checked,
      radiusFilterActive
    ].filter(Boolean).length;
    
    let html = `<div class="empty" style="text-align:center;grid-column:1/-1;">
      <div style="font-size:56px;margin-bottom:8px;">🔍</div>
      <div style="font-weight:700;font-size:15px;margin-bottom:6px;">آگهی‌ای پیدا نشد</div>
      <div class="mu" style="margin-bottom:14px;">${filterCount >= 2 ? `${nf(filterCount)} فیلتر فعال داری — شاید خیلی محدود کرده‌ای.` : 'فیلترها را تغییر بده یا دامنهٔ جستجو را بازتر کن.'}</div>
      <button class="capsule-btn primary" onclick="resetAllFilters()" style="margin:0 auto 16px;">پاک‌کردن همهٔ فیلترها</button>
    `;
    if (suggestions.length) {
      suggestions.forEach(s => {
        html += `<div style="margin-top:20px;text-align:right;">
          <div class="sh" style="margin-bottom:8px;"><h2 style="font-size:15px;">${s.title}</h2></div>
          <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr));">${s.ads.map(renderCard).join("")}</div>
        </div>`;
      });
    }
    html += `</div>`;
    document.getElementById("list").innerHTML = html;
  } else {
    const _emptyMap = {
      mine:  { icon: "📭", title: t('emptyTitle'), sub: t('emptySub') },
      shop:  { icon: "🏪", title: currentLang === 'ps' ? "ستاسو پلورنځی لا تر اوسه هیڅ توکی نلري" : "فروشگاه شما هنوز محصولی ندارد", sub: "" },
      fav:   { icon: "💔", title: currentLang === 'ps' ? "تاسو هیڅ خوښ شوی اعلان نلرئ" : "آگهی نشان‌شده‌ای ندارید", sub: "" },
      admin: { icon: "🛡️", title: "آگهی‌ای نیست", sub: "" }
    };
    const em = _emptyMap[view] || { icon: "🔍", title: t('emptyTitle'), sub: t('emptySub') };
    document.getElementById("list").innerHTML = `<div class="empty" style="text-align:center;">
      <div style="font-size:56px;margin-bottom:8px;">${em.icon}</div>
      <div style="font-weight:700;font-size:15px;margin-bottom:6px;color:var(--tx);">${em.title}</div>
      <div class="mu" style="margin-bottom:14px;">${em.sub}</div>
    </div>`;
  }
  
  let paginationHTML = '';
  if(totalPages > 1) {
    paginationHTML += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">قبلی</button>`;
    let pages = [];
    for(let i=1; i<=totalPages; i++) {
      if(i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        pages.push(i);
      } else if(pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    pages.forEach(p => {
      if(p === '...') {
        paginationHTML += `<span style="padding:0 4px;color:var(--mu);">…</span>`;
      } else {
        paginationHTML += `<button class="${p === currentPage ? 'active' : ''}" onclick="changePage(${p})">${nf(p)}</button>`;
      }
    });
    paginationHTML += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">بعدی</button>`;
  }
  document.getElementById("pagination").innerHTML = paginationHTML;

  const qWholesale = (document.getElementById("q-wholesale").value || "").trim();
  const sortWholesale = document.getElementById("sort-wholesale").value;
  
  let filteredWholesale = wholesaleAds.filter(a => {
    if(wholesaleCat && a.wholesaleCat != wholesaleCat) return false;
    if(city >= 0) {
      const matchSingle = (a.ci === city);
      const matchMulti = (Array.isArray(a.provinces) && a.provinces.includes(city));
      if(!matchSingle && !matchMulti) return false;
    }
    if(qWholesale && !normFa((a.t||"")+" "+(a.d||"")+" "+(a.brand||"")+" "+(a.spec||"")).includes(normFa(qWholesale))) return false;
    const wminV = document.getElementById("wmin").value, wmaxV = document.getElementById("wmax").value;
    const wmn = wminV === "" ? 0 : (+wminV || 0);
    const wmx = wmaxV === "" ? Infinity : (+wmaxV || 0);
    if((wmn||wmx<Infinity) && (afn(a)<wmn || afn(a)>wmx)) return false;
    if(view !== "admin" && view !== "mine" && (a.status||"approved") !== "approved") return false;
    if(view=="mine" && a.owner != me) return false;
    if(view=="fav" && !favs.includes(a.id)) return false;
    if(radiusFilterActive) {
      const provinceList = Array.isArray(a.provinces) && a.provinces.length
        ? a.provinces
        : [a.ci];
      const hasInRadius = provinceList.some(ci => {
        const prov = provinceCoords[ci];
        if (!prov) return false;
        const dist = getDistanceFromLatLonInKm(radiusCenterLat, radiusCenterLng, prov.lat, prov.lng);
        return dist <= radiusMaxKm;
      });
      if (!hasInRadius) return false;
    }
    return true;
  });
  if(view === "admin") {
    if(adminTab === 'pending') filteredWholesale = filteredWholesale.filter(a => (a.status||"approved") === "pending");
    else if(adminTab === 'rejected') filteredWholesale = filteredWholesale.filter(a => (a.status||"approved") === "rejected");
  }
  
  if(sortWholesale === "lo") filteredWholesale.sort(pcmp);
  else if(sortWholesale === "hi") filteredWholesale.sort((a,b)=>afn(b)-afn(a));
  else filteredWholesale.sort((a,b)=>a.age-b.age);
  
  const wholesaleCategoryName = wholesaleCat ? (wholesaleCats[wholesaleCat]?.[0]||"همه") : "همه آگهی‌های عمده";
  document.getElementById("wholesale-title").innerHTML = `${wholesaleCategoryName} <span>${nf(filteredWholesale.length)} آگهی</span>`;

  const wholesaleTotalPages = Math.ceil(filteredWholesale.length / itemsPerPage) || 1;
  if(wholesaleCurrentPage > wholesaleTotalPages) wholesaleCurrentPage = wholesaleTotalPages;
  const wStart = (wholesaleCurrentPage - 1) * itemsPerPage;
  const wPaginated = filteredWholesale.slice(wStart, wStart + itemsPerPage);

  if (wPaginated.length) {
    document.getElementById("wholesale-list").innerHTML = wPaginated.map(renderCard).join("");
  } else {
    document.getElementById("wholesale-list").innerHTML = `<div class="empty" style="text-align:center;">
      <div style="font-size:56px;margin-bottom:8px;">📦</div>
      <div style="font-weight:700;font-size:15px;margin-bottom:6px;color:var(--tx);">هیچ آگهی عمده‌ای پیدا نشد</div>
      <div class="mu" style="margin-bottom:14px;">فیلترها را تغییر دهید یا دامنه جستجو را وسیع‌تر کنید.</div>
      <button class="capsule-btn primary" onclick="resetAllFilters()" style="margin:0 auto;">پاک‌کردن فیلترها</button>
    </div>`;
  }

  let wPaginationHTML = '';
  if(wholesaleTotalPages > 1) {
    wPaginationHTML += `<button ${wholesaleCurrentPage === 1 ? 'disabled' : ''} onclick="changeWholesalePage(${wholesaleCurrentPage - 1})">قبلی</button>`;
    let wPages = [];
    for(let i=1; i<=wholesaleTotalPages; i++) {
      if(i === 1 || i === wholesaleTotalPages || (i >= wholesaleCurrentPage - 2 && i <= wholesaleCurrentPage + 2)) {
        wPages.push(i);
      } else if(wPages[wPages.length - 1] !== '...') {
        wPages.push('...');
      }
    }
    wPages.forEach(p => {
      if(p === '...') {
        wPaginationHTML += `<span style="padding:0 4px;color:var(--mu);">…</span>`;
      } else {
        wPaginationHTML += `<button class="${p === wholesaleCurrentPage ? 'active' : ''}" onclick="changeWholesalePage(${p})">${nf(p)}</button>`;
      }
    });
    wPaginationHTML += `<button ${wholesaleCurrentPage === wholesaleTotalPages ? 'disabled' : ''} onclick="changeWholesalePage(${wholesaleCurrentPage + 1})">بعدی</button>`;
  }
  document.getElementById("wholesale-pagination").innerHTML = wPaginationHTML;

  document.getElementById("wholesale-stats").innerHTML = [[wholesaleAds.length, currentLang==='ps'?'عمده اعلانونه':'آگهی عمده'],[34, currentLang==='ps'?'سوداګریز ولایتونه':'ولایت تجاری'],[wholesaleCats.length-1, currentLang==='ps'?'عمده کټګورۍ':'دسته‌بندی عمده']].map(x=>`<div><b>${nf(x[0])}</b><span>${x[1]}</span></div>`).join("");

  drawCats();extras();document.getElementById("acc").textContent=(me&&users[me])?users[me].name:"ورود / ثبت‌نام";
  updateCompareBar();
  updateNotifBadge();
}

window.changePage = (p) => { currentPage = p; draw(); document.getElementById("listing").scrollIntoView({behavior:"smooth"}); };
window.changeWholesalePage = (p) => { wholesaleCurrentPage = p; draw(); window.scrollTo({top: 0, behavior: 'smooth'}); };

const _debouncedWholesaleDraw = debounce(()=>{wholesaleCurrentPage = 1; draw();},300);
["#q-wholesale","#wmin","#wmax"].forEach(x=>document.querySelector(x).addEventListener("input", _debouncedWholesaleDraw));
document.getElementById("sort-wholesale").addEventListener("change", () => { wholesaleCurrentPage = 1; draw(); });
document.getElementById("search-wholesale-btn").onclick = () => { recordSearch(document.getElementById("q-wholesale").value.trim()); wholesaleCurrentPage = 1; draw(); };

document.getElementById("wholesale-cats").onclick = e => {
  const b = e.target.closest(".cat");
  if(b) { wholesaleCat = +b.dataset.i; wholesaleCurrentPage = 1; draw(); }
};

document.querySelectorAll(".bnav-item").forEach(btn => {
  btn.onclick = () => {
    if (currentAppTab === btn.dataset.target) return;
    const doSwitch = () => {
      if(document.getElementById("add").open) closeAdForm();
      document.querySelectorAll(".bnav-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentAppTab = btn.dataset.target;
      const postBtn = document.getElementById("header-post-btn");
      if(currentAppTab === "retail") {
        document.getElementById("view-retail").style.display = "block";
        document.getElementById("view-wholesale").style.display = "none";
        postBtn.textContent = "+ ثبت پرچون";
        postBtn.style.background = "var(--ac)";
      } else {
        document.getElementById("view-retail").style.display = "none";
        document.getElementById("view-wholesale").style.display = "block";
        postBtn.textContent = "+ ثبت عمده";
        postBtn.style.background = "#1b3b6f";
      }
      window.scrollTo({top: 0, behavior: 'smooth'});
      if (typeof window.__applyLang === "function") window.__applyLang();
      draw();
    };

    if (document.startViewTransition &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(doSwitch);
    } else {
      doSwitch();
    }
  };
});

document.getElementById("cats").onclick=e=>{const b=e.target.closest(".cat");if(b){cat=+b.dataset.i;view="all";currentPage=1;draw();document.getElementById("listing").scrollIntoView({behavior:"smooth"})}};
function debounce(fn, ms=300){let t;return(...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),ms);};}
const _debouncedDraw = debounce(()=>{currentPage=1;draw();},300);
["#q","#pmin","#pmax"].forEach(s=>document.querySelector(s).addEventListener("input",_debouncedDraw));
["#sort","#urg","#f-cond","#f-has-photo","#f-shop-only"].forEach(s=>document.querySelector(s).addEventListener("change",()=>{currentPage=1;draw();}));
document.getElementById("search-btn").onclick = () => {
  recordSearch(document.getElementById("q").value.trim());
  currentPage = 1; draw();
  document.getElementById("listing").scrollIntoView({ behavior: "smooth" });
};
document.getElementById("q").addEventListener("keydown", e=>{ if(e.key==="Enter"){ e.preventDefault(); recordSearch(document.getElementById("q").value.trim()); currentPage=1; draw(); document.getElementById("listing").scrollIntoView({behavior:"smooth"}); } });
document.getElementById("q-wholesale").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); recordSearch(document.getElementById("q-wholesale").value.trim()); wholesaleCurrentPage = 1; draw(); window.scrollTo({top:0, behavior:"smooth"}); } });
document.getElementById("reset").onclick=()=>resetAllFilters();

document.getElementById("ftog").onclick=()=>document.getElementById("flt").classList.toggle("o");
const closeFiltersDrawerBtn = document.getElementById("close-filters-drawer");
if(closeFiltersDrawerBtn) {
  closeFiltersDrawerBtn.onclick = () => document.getElementById("flt").classList.remove("o");
}

function need(fn){if(me&&users[me])return fn();after=fn;openAuth()}

let radiusMap = null;
let radiusMarker = null;
let radiusCircle = null;
// هر بار دیالوگِ حاوی نقشه باز شد، اندازه را دوباره محاسبه کن
document.addEventListener('toggle',e=>{
  const dlg=e.target; if(!dlg||dlg.tagName!=='DIALOG'||!dlg.open) return;
  try{
    if(dlg.id==='radius-dlg') fixMapSize(radiusMap,1600);
    else if(dlg.id==='add') fixMapSize(mapPicker,1600);
    else if(dlg.id==='dlg') fixMapSize(window._adViewMap,1200);
  }catch(_){}
},true);

function destroyRadiusMap() {
  if(radiusMap) { try{ radiusMap.remove(); }catch(e){}; }
  radiusMap = null; radiusMarker = null; radiusCircle = null;
}

document.getElementById("open-radius-modal-btn").onclick = () => {
  if(typeof L === 'undefined') { toast('در حال بارگذاری نقشه...'); ensureLeaflet().then(ok => { if(ok) document.getElementById("open-radius-modal-btn").click(); else toast('نقشه در دسترس نیست؛ اینترنت را بررسی کنید.'); }); return; }
  const rdlg = document.getElementById("radius-dlg");
  if(rdlg.open) return;
  destroyRadiusMap();
  rdlg.showModal();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if(!rdlg.open) return;
    prepMapContainer(document.getElementById('radius-map-container'));
    radiusMap = L.map('radius-map-container').setView([radiusCenterLat, radiusCenterLng], 10);
    fixMapSize(radiusMap, 1600);
    baseTiles().addTo(radiusMap);
    radiusMarker = L.marker([radiusCenterLat, radiusCenterLng], {draggable: true}).addTo(radiusMap);
    radiusCircle = L.circle([radiusCenterLat, radiusCenterLng], {
      radius: radiusMaxKm * 1000, color: '#0e7a4b', fillColor: '#37b676', fillOpacity: 0.2
    }).addTo(radiusMap);
    const updateMapCenter = (lat, lng) => {
      radiusCenterLat = lat; radiusCenterLng = lng;
      radiusMarker.setLatLng([lat, lng]); radiusCircle.setLatLng([lat, lng]);
    };
    radiusMarker.on('dragend', function() {
      const pos = radiusMarker.getLatLng();
      updateMapCenter(pos.lat, pos.lng);
    });
    radiusMap.on('click', function(e) { updateMapCenter(e.latlng.lat, e.latlng.lng); });
    document.getElementById("radius-slider").oninput = function() {
      radiusMaxKm = +this.value;
      document.getElementById("radius-val").textContent = radiusMaxKm + " ک‌م";
      if(radiusCircle) radiusCircle.setRadius(radiusMaxKm * 1000);
    };
    document.getElementById("radius-slider").value = radiusMaxKm;
    document.getElementById("radius-val").textContent = radiusMaxKm + " ک‌م";
  }));
};

document.getElementById("radius-gps-btn").onclick = () => {
  if (!navigator.geolocation) { toast("مرورگر از موقعیت‌یابی پشتیبانی نمی‌کند."); return; }
  navigator.geolocation.getCurrentPosition(
    p => {
      radiusCenterLat = p.coords.latitude;
      radiusCenterLng = p.coords.longitude;
      if (radiusMap && radiusMarker && radiusCircle) {
        radiusMap.setView([radiusCenterLat, radiusCenterLng], 10);
        radiusMarker.setLatLng([radiusCenterLat, radiusCenterLng]);
        radiusCircle.setLatLng([radiusCenterLat, radiusCenterLng]);
      }
    },
    () => toast("اجازه دسترسی به موقعیت داده نشد."),
    { timeout: 8000 }
  );
};
document.getElementById("apply-radius-btn").onclick = () => {
  radiusFilterActive = true;
  document.getElementById("radius-status-badge").textContent = `فعال: شعاع ${radiusMaxKm} ک‌م`;
  destroyRadiusMap();
  document.getElementById("radius-dlg").close();
  currentPage = 1;
  draw();
  toast("فیلتر شعاعی روی نقشه اعمال شد.");
};

document.getElementById("clear-radius-btn").onclick = () => {
  radiusFilterActive = false;
  document.getElementById("radius-status-badge").textContent = "شعاع فعال نیست";
  destroyRadiusMap();
  document.getElementById("radius-dlg").close();
  draw();
  toast("فیلتر شعاعی غیرفعال شد.");
};

function updateCompareBar() {
  const bar = document.getElementById("compare-bar");
  const countEl = document.getElementById("compare-count");
  const idSet = new Set(all().map(a => a.id));
  compareList = compareList.filter(id => idSet.has(id));
  countEl.textContent = compareList.length;
  if(compareList.length > 0) bar.classList.add("active");
  else bar.classList.remove("active");
}

document.body.onclick = e => {
  const approveBtn = e.target.closest("[data-approve]");
  if(approveBtn){ e.stopPropagation(); adminSetStatus(approveBtn.dataset.approve, "approved"); return; }
  const rejectBtn = e.target.closest("[data-reject]");
  if(rejectBtn){ e.stopPropagation(); adminSetStatus(rejectBtn.dataset.reject, "rejected"); return; }
  const compBtn = e.target.closest(".compare-checkbox");
  if(compBtn) {
    e.stopPropagation();
    const id = compBtn.dataset.comp;
    const targetAd = all().find(x => x.id === id);
    if(targetAd && targetAd.isWholesale) { toast("مقایسه فقط برای آگهی‌های پرچون است."); return; }
    if(compareList.includes(id)) {
      compareList = compareList.filter(x => x != id);
      toast("از لیست مقایسه حذف شد.");
    } else {
      if(compareList.length >= 4) { toast("حداکثر ۴ کالا را می‌توانید همزمان مقایسه کنید."); return; }
      compareList.push(id);
      toast("به لیست مقایسه اضافه شد.");
    }
    updateCompareBar();
    compBtn.classList.toggle("checked", compareList.includes(id));
    return;
  }

  const f = e.target.closest(".fav");
  if(f) {
    e.stopPropagation();
    return need(()=>{
      const id=f.dataset.f;
      favs=favs.includes(id)?favs.filter(x=>x!=id):favs.concat(id);
      put("ab_fav_"+me,favs);
      if(favs.includes(id)) addNotification(`آگهی به نشان‌شده‌ها اضافه شد.`);
      draw();
    });
  }
  const b = e.target.closest(".ad");
  if(b) openAd(b.dataset.id);
};

document.getElementById("clear-compare-btn").onclick = () => {
  compareList = [];
  updateCompareBar();
  draw();
  toast("لیست مقایسه پاک شد.");
};

document.getElementById("show-compare-modal-btn").onclick = () => {
  const adsToCompare = all().filter(a => compareList.includes(a.id) && !a.isWholesale);
  if(adsToCompare.length === 0) { toast("کالایی برای مقایسه نیست."); return; }
  let html = `<table style="width:100%;border-collapse:collapse;text-align:right;font-size:12px;">
    <tr style="border-bottom:2px solid var(--bd);">
      <th style="padding:8px;background:var(--bg);">ویژگی</th>
      ${adsToCompare.map(a => `<th style="padding:8px;background:var(--bg);text-align:center;">${esc((a.t||'').substring(0,20))}...</th>`).join("")}
    </tr>
    <tr style="border-bottom:1px solid var(--bd);">
      <td style="padding:8px;font-weight:bold;color:var(--mu);">تصویر</td>
      ${adsToCompare.map(a => `<td style="padding:8px;text-align:center;"><img src="${(Array.isArray(a.imgs)&&a.imgs[0])||a.img||''}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;"></td>`).join("")}
    </tr>
    <tr style="border-bottom:1px solid var(--bd);">
      <td style="padding:8px;font-weight:bold;color:var(--mu);">قیمت</td>
      ${adsToCompare.map(a => `<td style="padding:8px;text-align:center;font-weight:800;color:var(--ac);">${fmtAd(a)}</td>`).join("")}
    </tr>
    <tr style="border-bottom:1px solid var(--bd);">
      <td style="padding:8px;font-weight:bold;color:var(--mu);">ولایت</td>
      ${adsToCompare.map(a => `<td style="padding:8px;text-align:center;">${cities[a.ci]||'—'}</td>`).join("")}
    </tr>
    <tr style="border-bottom:1px solid var(--bd);">
      <td style="padding:8px;font-weight:bold;color:var(--mu);">وضعیت کالا</td>
      ${adsToCompare.map(a => `<td style="padding:8px;text-align:center;">${a.cond === 'new' ? 'نو' : 'کارکرده'}</td>`).join("")}
    </tr>
    <tr style="border-bottom:1px solid var(--bd);"><td style="padding:8px;font-weight:bold;color:var(--mu);">مدل / برند</td>${adsToCompare.map(a => `<td style="padding:8px;text-align:center;">${esc(a.brand||'—')}</td>`).join("")}</tr>
    <tr style="border-bottom:1px solid var(--bd);"><td style="padding:8px;font-weight:bold;color:var(--mu);">مشخصات</td>${adsToCompare.map(a => `<td style="padding:8px;text-align:center;">${esc(a.spec||'—')}</td>`).join("")}</tr>
    <tr style="border-bottom:1px solid var(--bd);">
      <td style="padding:8px;font-weight:bold;color:var(--mu);">فروشنده</td>
      ${adsToCompare.map(a => `<td style="padding:8px;text-align:center;">${esc(a.sellerName || 'کاربر')}</td>`).join("")}
    </tr>
    <tr>
      <td style="padding:8px;font-weight:bold;color:var(--mu);">عملیات</td>
      ${adsToCompare.map(a => `<td style="padding:8px;text-align:center;"><button class="capsule-btn primary" onclick="document.getElementById('compare-dlg').close(); openAd('${a.id}')" style="font-size:10px;padding:3px 6px;">مشاهده</button></td>`).join("")}
    </tr>
  </table>`;
  document.getElementById("compare-table-container").innerHTML = html;
  document.getElementById("compare-dlg").showModal();
};

document.getElementById("close-compare-dlg").onclick = () => document.getElementById("compare-dlg").close();

function closeDetailDialog() {
  if(currentChatChannel && sb()) { try { sb().removeChannel(currentChatChannel); } catch(e) {} currentChatChannel = null; }
  if(window._adViewMap) { try { window._adViewMap.remove(); } catch(e) {} window._adViewMap = null; }
  document.getElementById("dlg").close();
}

function openAd(id){
  (function trackRecentView(){
    try {
      let rv = get("ab_recent", []);
      if (!Array.isArray(rv)) rv = [];
      rv = rv.filter(x => String(x) !== String(id));
      rv.unshift(String(id));
      rv = rv.slice(0, 12);
      put("ab_recent", rv);
    } catch(e) {}
  })();
  if(window._adViewMap) { try { window._adViewMap.remove(); } catch(e) {} window._adViewMap = null; }
  const a = all().find(x => String(x.id) === String(id));
  if (!a) { toast("آگهی یافت نشد یا حذف شده است."); return; }
  const imgList = (Array.isArray(a.imgs) && a.imgs.length > 0) ? a.imgs : (a.img ? [a.img] : []);
  const initialImg = imgList.length > 0 ? imgList[0] : "";
  const mineIdx = mine.findIndex(x => String(x.id) === String(id));
  if(mineIdx !== -1) {
    mine[mineIdx].views = (Number(mine[mineIdx].views) || 20) + 1;
    a.views = mine[mineIdx].views;
    put("ab_ads", mine);
  } else {
    a.views = (Number(a.views) || 20) + 1;
  }
  const today = new Date().toDateString();
  const viewKey = `ab_viewed_${id}_${today}`;
  if (!get(viewKey, false)) {
      bumpStat(id, "views");
      put(viewKey, true);
  }
  const userNote = (notes[me] && notes[me][id]) ? notes[me][id] : "";
  const displayCatName = a.isWholesale ? (wholesaleCats[a.wholesaleCat] ? wholesaleCats[a.wholesaleCat][0] : "عمده") : (cats[a.c] ? cats[a.c][0] : "متفرقه");
  const shopRating = a.isShop ? getShopAverageRating(a.ph) : { avg: "—", count: 0 };
  const shopOwnerPhone = a.ph;
  let locText = cities[a.ci] || "نامشخص";
  if(a.isWholesale && Array.isArray(a.provinces) && a.provinces.length > 0) {
    const names = a.provinces.map(idx => cities[idx]).filter(Boolean);
    locText = names.length > 3 ? names.slice(0,3).join("، ") + " +" + (names.length - 3) : names.join("، ");
  }

  document.getElementById("det").innerHTML=`
    <div class="ph" id="main-photo-box" style="aspect-ratio:16/9;--h:${(a.c||1)*23}">
      ${initialImg ? `<img id="active-modal-img" src="${initialImg}" alt="${esc(a.t)}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0">` : `<span>${a.isWholesale ? '📦' : (cats[a.c]?.[1] || '📦')}</span>`}
    </div>
    ${imgList.length > 1 ? `<div class="thumbs-row" id="modal-thumbs">${imgList.map((im, idx)=>`<img src="${im}" class="${idx===0?'active':''}" data-idx="${idx}">`).join("")}</div>` : ''}
    
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;gap:8px;flex-wrap:wrap;">
      <h2 style="margin:0;font-size:17px">${esc(a.t)}</h2>
      <div style="display:flex;gap:5px;">
        ${a.ph ? `<a href="https://wa.me/${toWhatsAppNumber(a.ph)}?text=${encodeURIComponent('سلام، این آگهی را دیدم: ' + a.t + '\n' + 'قیمت: ' + fmtAd(a) + '\n' + adUrl(a.id))}" target="_blank" class="capsule-btn" style="background:#25d366;color:#fff;padding:3px 8px;font-size:11px;font-weight:bold;">💬 واتساپ به فروشنده</a>` : ''}
        <a href="https://t.me/share/url?url=${encodeURIComponent(adUrl(a.id))}&text=${encodeURIComponent(a.t)}" target="_blank" class="capsule-btn" style="background:#0088cc;color:#fff;padding:3px 8px;font-size:11px;">تلگرام</a>
        <button class="capsule-btn" id="share-btn" style="padding:3px 8px;font-size:11px;border:1px solid var(--bd); display:flex; align-items:center; gap:4px;"><svg class="icon icon-sm"><use href="#i-link"></use></svg> کپی</button>
      </div>
    </div>
    
    <div class="price" style="font-size:18px;margin-top:3px;">${fmtAd(a)}</div>
    
    <div class="stat-box">
      <span><svg class="icon icon-sm"><use href="#i-eye"></use></svg> ${nf(a.views)} بازدید</span>
      <span><svg class="icon icon-sm"><use href="#i-phone"></use></svg> ${nf(a.calls || 3)} تماس</span>
      <span><svg class="icon icon-sm"><use href="${a.isWholesale ? '#i-package' : '#i-tag'}"></use></svg> ${a.isWholesale ? 'عمده‌فروشی' : 'پرچون'}</span>
    </div>

    ${(() => {
      const pi = priceInsight(a);
      if (!pi) return '';
      return `<div style="background:linear-gradient(135deg, color-mix(in srgb, ${pi.color} 12%, transparent), transparent); border:1px solid ${pi.color}; border-radius:12px; padding:10px 12px; margin:8px 0;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          <div>
            <div style="font-size:12px; font-weight:700; color:${pi.color};">${pi.icon} ${pi.verdict}</div>
            <div class="mu" style="font-size:11px; margin-top:2px;">میانگین ${nf(pi.count)} آگهی مشابه در ${cities[a.ci] || 'این منطقه'}: <b>${nf(pi.avg)} افغانی</b></div>
          </div>
          <div style="text-align:left;">
            <div style="font-size:16px; font-weight:800; color:${pi.color};">${pi.diff > 0 ? '+' : ''}${nf(+pi.diff)}٪</div>
            <div class="mu" style="font-size:10px;">نسبت به میانگین</div>
          </div>
        </div>
      </div>`;
    })()}

    <div style="margin:8px 0">
      <div class="kv"><span class="mu">دسته</span><span>${displayCatName}</span></div>
      ${a.moq?`<div class="kv"><span class="mu">حداقل سفارش</span><span>${nf(a.moq)} ${esc(a.unit||"")}</span></div>`:""}${a.brand?`<div class="kv"><span class="mu">مدل / برند</span><span>${esc(a.brand)}</span></div>`:""}${a.spec?`<div class="kv"><span class="mu">مشخصات</span><span>${esc(a.spec)}</span></div>`:""}
      <div class="kv"><span class="mu">ولایت / پوشش</span><span>${locText} ${a.mapLoc ? '— ' + esc(a.mapLoc) : ''}</span></div>
      <div class="kv"><span class="mu">زمان ثبت</span><span title="${a.ts ? new Date(a.ts).toISOString() : ''}">${ago(a.age)}</span></div>
    </div>
    <p style="font-size:13px;">${esc(a.d)||"بدون توضیحات"}</p>${extrasHTML(a)}

    <div style="margin-top:12px;">
      <b style="font-size:12px;display:block;margin-bottom:4px;"><svg class="icon icon-sm"><use href="#i-map-pin"></use></svg> موقعیت روی نقشه:</b>
      <div id="ad-view-map" style="width:100%;height:150px;border-radius:10px;border:1px solid var(--bd);"></div>
    </div>
    
    ${me && users[me] ? `
      <div style="background:var(--bg);border:1px solid var(--bd);padding:8px 10px;border-radius:10px;margin-top:10px;">
        <label for="personal-note-input" style="font-size:11px;margin-bottom:3px;display:flex;align-items:center;gap:4px;"><svg class="icon icon-sm"><use href="#i-note"></use></svg> ${t('noteTitle')}</label>
        <div style="display:flex;gap:6px;">
          <input id="personal-note-input" value="${esc(userNote)}" placeholder="${t('notePh')}" style="font-size:12px;padding:4px 8px;">
          <button class="capsule-btn primary" id="save-note-btn" style="padding:4px 10px;font-size:11px;">${t('save')}</button>
        </div>
      </div>
    ` : ''}

    <div class="seller-card">
      <div>
        <b style="font-size:13px;display:block;cursor:pointer;" data-seller-key="${esc(String(a.owner || a.ph))}" onclick="openSellerProfile(this.dataset.sellerKey)">
          <svg class="icon icon-sm"><use href="#i-user"></use></svg> ${t('seller')}: ${esc(a.sellerName || 'کاربر')}
          ${a.isShop ? '— <span style="color:var(--ac);">['+esc(a.shopName || 'فروشگاه')+'] (⭐ '+(shopRating?.avg || '–')+')</span>' : ''}
          <small style="color:var(--mu);font-size:10px;">${t('viewProfile')}</small>
        </b>
        <span class="mu" style="font-size:11px;">${t('member')}</span>${trustBadgeHTML(a)}
      </div>
      <div>
        ${a.verified !== false ? '<span class="badge-verified"><svg class="icon icon-sm"><use href="#i-check"></use></svg> شماره تاییدشده</span>' : ''}
      </div>
    </div>

    ${a.isShop ? `
      <div style="background:var(--card);border:1px solid var(--bd);padding:10px;border-radius:10px;margin-top:10px;">
        <h4 style="margin:0 0 6px;font-size:13px;color:var(--ac);"><svg class="icon icon-sm"><use href="#i-star"></use></svg> ${t('rateShop')} <span class="mu">(${shopRating.avg} ★ از ${nf(shopRating.count)} نظر)</span></h4>
        <div style="max-height:110px;overflow-y:auto;font-size:11px;margin-bottom:6px;">${(shopReviews[a.ph]||[]).slice(-5).reverse().map(rv=>`<div style="border-bottom:1px solid var(--bd);padding:3px 0;">⭐ ${nf(rv.rating)}/۵ — <b>${esc(rv.buyer||"کاربر")}</b>: ${esc(rv.comment||"")}</div>`).join("")||`<span class="mu">${t('noReviews')}</span>`}</div>
        <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;">
          <select id="review-stars" style="padding:3px;border-radius:6px;border:1px solid var(--bd);font-size:11px;">
            <option value="5">⭐⭐⭐⭐⭐ (۵ ستاره - عالی)</option>
            <option value="4">⭐⭐⭐⭐ (۴ ستاره)</option>
            <option value="3">⭐⭐⭐ (۳ ستاره)</option>
            <option value="2">⭐⭐ (۲ ستاره)</option>
            <option value="1">⭐ (۱ ستاره)</option>
          </select>
        </div>
        <div style="display:flex;gap:6px;">
          <input id="review-comment-input" placeholder="${t('writeReviewPh')}" style="font-size:11px;padding:4px 8px;flex:1;">
          <button class="capsule-btn primary" id="submit-review-btn" style="padding:4px 10px;font-size:11px;">${t('submit')}</button>
        </div>
      </div>
    ` : ''}

    <h3 style="font-size:14px;margin-top:14px;"><svg class="icon icon-sm"><use href="#i-chat"></use></svg> ${t('chatTitle')}</h3>
    <div class="chat-box" id="chat-messages"></div>
    <div style="display:flex;gap:6px;margin-top:6px;">
      <input id="chat-input" placeholder="${t('chatPh')}" style="flex:1;border:1px solid var(--bd);background:var(--bg);border-radius:8px;padding:6px 10px;font-size:12px;">
      <button class="capsule-btn primary" id="send-chat" style="padding:6px 12px;font-size:12px;">${t('send')}</button>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:11px;">
      <button type="button" class="capsule-btn" id="wake-toggle-btn" style="margin-top:8px;width:100%;border:1px solid var(--bd);font-size:12px;"><svg class="icon icon-sm"><use href="#i-lightbulb"></use></svg> ${t('wakeLock')}</button>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:11px;">
      <span style="color:#d6324a;cursor:pointer;" id="report-ad-btn"><svg class="icon icon-sm"><use href="#i-warning"></use></svg> ${t('reportAd')}</span>
      <span class="mu">کد: <bdi dir="ltr">${a.id}</bdi></span>
    </div>

    <div class="row" style="margin-top:14px;flex-wrap:wrap;">
      ${a.ph ? `<a class="capsule-btn" href="https://wa.me/${toWhatsAppNumber(a.ph)}?text=${encodeURIComponent('سلام، برای این آگهی تماس می‌گیرم: ' + a.t + ' — ' + fmtAd(a) + '\n' + adUrl(a.id))}" target="_blank" rel="noopener" style="background:#25d366;color:#fff;display:flex;align-items:center;justify-content:center;gap:6px;font-weight:bold;" onclick="recordCall('${a.id}')">💬 واتساپ</a>` : ''}
      <a class="capsule-btn primary" href="tel:${esc(a.ph)}" style="display:flex;align-items:center;justify-content:center;gap:6px;" onclick="recordCall('${a.id}')"><svg class="icon icon-sm"><use href="#i-phone"></use></svg> ${t('adCall')} <bdi dir="ltr">${esc(a.ph)}</bdi></a>
      <button class="capsule-btn" id="x" style="border:1px solid var(--bd);flex:1 1 100%;">${t('adClose')}</button>
    </div>
    ${a.owner&&a.owner==me?'<div style="display:flex;gap:6px;margin-top:6px;"><button class="capsule-btn" id="edit-ad-btn" style="flex:1;border:1px solid var(--bd);"><svg class="icon icon-sm"><use href="#i-edit"></use></svg> ویرایش</button><button class="capsule-btn" id="renew-ad-btn" style="flex:1;border:1px solid var(--bd);"><svg class="icon icon-sm"><use href="#i-refresh"></use></svg> تمدید</button></div>':''}
    ${((a.owner&&a.owner==me)||adminFlag) && !seed.some(x=>String(x.id)===String(a.id))?'<button class="link danger" id="del" style="color:#d6324a;display:block;margin:8px auto 0;font-size:12px;"><svg class="icon icon-sm"><use href="#i-trash"></use></svg> حذف این آگهی</button>':''}
  `;

  document.getElementById("dlg").showModal();
  updateOGTags(a);
  const drawAdMap = () => {
    const container = document.getElementById('ad-view-map');
    if(!container || typeof L === 'undefined') return;
    if(window._adViewMap) { try { window._adViewMap.remove(); } catch(e) {} window._adViewMap = null; }
    const latNum = Number(a.lat);
    const lngNum = Number(a.lng);
    const lat = Number.isFinite(latNum) && latNum >= 20 && latNum <= 40 ? latNum : 34.5553;
    const lng = Number.isFinite(lngNum) && lngNum >= 55 && lngNum <= 80 ? lngNum : 69.2075;
    prepMapContainer(container);
    const map = L.map('ad-view-map').setView([lat, lng], 13);
    fixMapSize(map, 1200);
    baseTiles().addTo(map);
    L.marker([lat, lng]).addTo(map).bindPopup(esc(a.t)).openPopup();
    window._adViewMap = map;
  };
  ensureLeaflet().then(ok => {
    if(ok) drawAdMap();
    else mapFail('ad-view-map', drawAdMap);
  });

  const submitRevBtn = document.getElementById("submit-review-btn");
  if(submitRevBtn) {
    submitRevBtn.onclick = () => {
      if(!me||!users[me]) return need(()=>openAd(id));
      if(shopOwnerPhone===me || (a.ownerId && a.ownerId===myId)){toast("نمی‌توانید به فروشگاه خود امتیاز بدهید.");return;}
      const stars = +document.getElementById("review-stars").value;
      const comment = document.getElementById("review-comment-input").value.trim() || "بدون نظر متنی";
      if(!shopReviews[shopOwnerPhone]) shopReviews[shopOwnerPhone] = [];
      shopReviews[shopOwnerPhone] = shopReviews[shopOwnerPhone].filter(r=>r.buyerId!==me && r.buyerId!==myId);
      shopReviews[shopOwnerPhone].push({
        rating: stars, comment, buyer: users[me].name, buyerId: myId||me, date: Date.now()
      });
      put("ab_shop_reviews", shopReviews); remoteReview(a, stars, comment);
      toast("امتیاز و نظر شما با موفقیت ثبت شد!");
      addNotification(`کاربر به فروشگاه شما امتیاز داد.`);
      document.getElementById("review-comment-input").value = "";
      document.getElementById("review-stars").value = "5";
    };
  }

  document.getElementById("share-btn").onclick = () => shareAdCard(a);

  const saveNoteBtn = document.getElementById("save-note-btn");
  if(saveNoteBtn) {
    saveNoteBtn.onclick = () => {
      const noteVal = document.getElementById("personal-note-input").value.trim();
      if(!notes[me]) notes[me] = {};
      notes[me][id] = noteVal;
      put(UK("ab_notes"), notes);
      toast("یادداشت شخصی ذخیره شد.");
    };
  }

  const editBtn = document.getElementById("edit-ad-btn");
  if(editBtn) { editBtn.onclick = () => { closeDetailDialog(); openEditModal(a); }; }

  const renewBtn = document.getElementById("renew-ad-btn");
  if(renewBtn) {
    renewBtn.onclick = () => {
      const mi = mine.findIndex(x => String(x.id) === String(id));
      if(mi !== -1) {
        mine[mi].ts = Date.now(); syncAd(mine[mi]);
        put("ab_ads", mine);
      }
      closeDetailDialog();
      draw();
      toast("آگهی تمدید شد و به بالا آمد.");
    };
  }

  window.recordCall = (adId) => {
    const callKey = "ab_called_" + adId;
    const lastCalled = get(callKey, 0);
    const now = Date.now();
    if(now - lastCalled > 24 * 3600 * 1000) {
      put(callKey, now);
      const savedAd = mine.find(x => String(x.id) === String(adId));
      if(savedAd) {
        savedAd.calls = (Number(savedAd.calls) || 0) + 1;
        a.calls = savedAd.calls;
        put("ab_ads", mine);
      } else {
        a.calls = (Number(a.calls) || 0) + 1;
      }
      bumpStat(adId, "calls");
    }
    const callStat = document.querySelector("#det .stat-box");
    if(callStat) {
      const callItem = Array.from(callStat.children).find(el => el.textContent.includes("تماس"));
      if(callItem) callItem.innerHTML = '<svg class="icon icon-sm"><use href="#i-phone"></use></svg> ' + nf(a.calls) + " تماس";
    }
  };
  const wakeBtn = document.getElementById('wake-toggle-btn');
  if (wakeBtn) {
    wakeBtn.onclick = () => WakeLockManager.toggle();
  }
  document.getElementById("report-ad-btn").onclick = async () => { 
    if(!myId){ toast("برای ثبت گزارش، وارد حساب شوید."); return; }
    const reasons = [
      { val: "fraud", label: "💰 کلاه‌برداری یا بیعانه" },
      { val: "forbidden", label: "🚫 کالای ممنوعه" },
      { val: "duplicate", label: "📋 آگهی تکراری" },
      { val: "wrong_price", label: "💸 قیمت اشتباه یا فریبنده" },
      { val: "wrong_cat", label: "📂 دستهٔ اشتباه" },
      { val: "other", label: "❓ مورد دیگر" }
    ];
    const dlg = document.createElement("dialog");
    dlg.innerHTML = `<div class="dialog-content-pad">
      <h2 style="font-size:16px;margin:0 0 10px;">🚩 گزارش تخلف</h2>
      <p class="mu" style="font-size:12px;margin-bottom:10px;">دلیل گزارش را انتخاب کنید:</p>
      ${reasons.map(r => `<label class="chk" style="margin:6px 0;padding:8px;border:1px solid var(--bd);border-radius:8px;cursor:pointer;"><input type="radio" name="rep-reason" value="${r.val}"> <span>${r.label}</span></label>`).join("")}
      <label style="margin-top:10px;display:block;">توضیح (اختیاری)</label>
      <textarea id="rep-note" rows="2" placeholder="جزئیات بیشتر..." style="width:100%;"></textarea>
      <div class="row" style="margin-top:12px;">
        <button class="capsule-btn primary" data-ok style="background:#d6324a;">ثبت گزارش</button>
        <button class="capsule-btn" data-cancel>انصراف</button>
      </div>
    </div>`;
    document.body.appendChild(dlg);
    dlg.showModal();
    dlg.querySelector("[data-cancel]").onclick = () => { dlg.close(); dlg.remove(); };
    dlg.querySelector("[data-ok]").onclick = async () => {
      const reason = dlg.querySelector('input[name="rep-reason"]:checked')?.value;
      const note = dlg.querySelector("#rep-note").value.trim();
      if (!reason) { toast("لطفاً یک دلیل انتخاب کنید."); return; }
      dlg.close(); dlg.remove();
      const ok = await reportRemoteWithReason(id, reason, note);
      toast(ok ? "گزارش شما ثبت شد. متشکریم ✅" : "⚠️ گزارش ذخیره نشد؛ اینترنت را چک کنید.");
      if (ok) addNotification(`گزارش تخلف برای آگهی ${id} ثبت شد.`);
    };
    dlg.onclick = e => { if (e.target === dlg) { dlg.close(); dlg.remove(); } };
  };

  const thumbsContainer = document.getElementById("modal-thumbs");
  if(thumbsContainer) {
    thumbsContainer.onclick = (ev) => {
      const thumb = ev.target.closest("img");
      if(!thumb) return;
      document.querySelectorAll("#modal-thumbs img").forEach(im=>im.classList.remove("active"));
      thumb.classList.add("active");
      document.getElementById("active-modal-img").src = thumb.src;
    };
  }
  
  const renderChat = () => {
    const list = messages[id] || [];
    const chatBox = document.getElementById("chat-messages");
    const isAtBottom = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < 150;
    chatBox.innerHTML = list.length ? list.map(m=>{
      const mine = m.sender == me;
      const tick = mine ? (m.readAt ? ' <span title="خوانده شد" style="opacity:.8;">✔✔</span>' : ' <span title="ارسال شد" style="opacity:.6;">✔</span>') : '';
      return `<div class="chat-msg ${mine?'me':'other'}"><b>${esc(m.name || 'کاربر')}:</b> ${esc(m.text)}${tick}</div>`;
    }).join("") : `<div class="mu" style="text-align:center;font-size:12px;">${t('chatEmpty')}</div>`;
    if(isAtBottom || chatBox.scrollTop === 0) {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
  };
  renderChat();
  loadChat(a).then(renderChat);

  document.getElementById("send-chat").onclick = () => {
    if(!me||!users[me]) return need(()=>openAd(id));
    const txt = document.getElementById("chat-input").value.trim();
    if(!txt) return;
    if(!messages[id]) messages[id]=[];
    messages[id].push({sender: me, senderId: myId, name: users[me].name, text: txt, time: Date.now()}); sendRemote(a, txt);
    put(UK("ab_msgs"), messages);
    document.getElementById("chat-input").value = "";
    renderChat();
    addNotification(`پیام جدیدی در آگهی ثبت شد.`);
  };

  document.getElementById("x").onclick=()=>closeDetailDialog();
  const d=document.getElementById("del");
  if(d)d.onclick=async()=>{
    if(seed.some(x=>String(x.id)===String(id))){ toast("این آگهی نمونه است و قابل حذف نیست."); return; }
    const ok = await new Promise((res) => {
      const d = document.createElement("dialog");
      d.innerHTML = `<div class="dialog-content-pad">
        <h2 style="font-size:16px;">حذف آگهی</h2>
        <p style="font-size:13px;">آیا از حذف این آگهی مطمئن هستید؟ این عمل قابل بازگشت نیست.</p>
        <div class="row" style="margin-top:14px;">
          <button class="capsule-btn primary" data-ok style="background:#d6324a;">بله، حذف کن</button>
          <button class="capsule-btn" data-cancel>انصراف</button>
        </div>
      </div>`;
      document.body.appendChild(d);
      d.showModal();
      d.querySelector("[data-ok]").onclick = () => { d.close(); d.remove(); res(true); };
      d.querySelector("[data-cancel]").onclick = () => { d.close(); d.remove(); res(false); };
      d.onclick = (e) => { if (e.target === d) { d.close(); d.remove(); res(false); } };
    });
    if (!ok) return;
    const delOk=await remoteDelete(id,!!a.ownerId);
    if(!delOk){ toast("حذف روی سرور انجام نشد. دسترسی یا اتصال را بررسی کنید."); return; }
    mine=mine.filter(x=>x.id!=id);
    put("ab_ads",mine);
    closeDetailDialog();
    currentPage=1;
    draw();
    toast("آگهی حذف شد");
  }
}

document.getElementById("dlg").onclick=e=>{if(e.target==document.getElementById("dlg"))closeDetailDialog()};

function setMode(m){
  mode=m;
  document.querySelectorAll(".tabs button").forEach(b=>b.classList.toggle("on",b.dataset.m==m));
  document.getElementById("nm-w").hidden=m!="up";
  document.getElementById("otp-section").style.display = "block";
  document.getElementById("a-go").textContent = m=="up" ? t('authUp') : t('authIn');
  document.getElementById("a-e").textContent="";
}
function openAuth(){
  setMode("in");
  document.getElementById("auth").showModal();
  setTimeout(() => {
    const el = document.getElementById("a-mail") || document.getElementById("a-p");
    if (el) el.focus();
  }, 100);
}
document.querySelector(".tabs").onclick=e=>{const b=e.target.closest("button");if(b)setMode(b.dataset.m)};
document.getElementById("a-x").onclick=()=>{after=null;document.getElementById("auth").close()};

function startOtpCooldown(){const b=document.getElementById("send-otp-btn");let n=60;b.disabled=true;b.textContent=nf(n)+" ثانیه";const iv=setInterval(()=>{n--;if(n<=0){clearInterval(iv);b.disabled=false;b.textContent="ارسال کد"}else b.textContent=nf(n)+" ثانیه"},1000)}
let authMethod="email";
function setMethod(m){if(m==="phone"){document.getElementById("a-e").textContent="ورود با پیامک فعلاً از دسترس خارج است. لطفاً با ایمیل یا گوگل وارد شوید.";return;}authMethod=m;document.querySelectorAll("#auth-methods button").forEach(b=>b.classList.toggle("on",b.dataset.am==m));document.getElementById("ph-box").hidden=m!=="phone";document.getElementById("mail-box").hidden=m!=="email";}
document.getElementById("auth-methods").onclick=e=>{const b=e.target.closest("button");if(b)setMethod(b.dataset.am)};
async function sendEmailOtp(){
  const last = get("ab_otp_last", 0);
  if (Date.now() - last < 60000) {
    const wait = Math.ceil((60000 - (Date.now() - last)) / 1000);
    document.getElementById("a-e").textContent = `لطفاً ${nf(wait)} ثانیه صبر کنید.`;
    return;
  }
  const em=document.getElementById("a-mail").value.trim().toLowerCase();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){document.getElementById("a-e").textContent="ایمیل را درست وارد کنید.";return;}
  document.getElementById("send-otp-btn").disabled=true; document.getElementById("a-e").textContent="در حال ارسال کد...";
  put("ab_otp_last", Date.now());
  const turnstileToken = document.querySelector('.cf-turnstile input[name="cf-turnstile-response"]')?.value;
  if (!turnstileToken) { document.getElementById("a-e").textContent = "لطفاً تأیید کنید که ربات نیستید."; return; }

  const {error}=await supabaseClient.auth.signInWithOtp({
    email:em,
    options:{ shouldCreateUser:true, captchaToken: turnstileToken }
  });
  if(error){document.getElementById("a-e").textContent="خطا: "+error.message;document.getElementById("send-otp-btn").disabled=false;return;}
  document.getElementById("a-e").textContent="کد به ایمیل شما ارسال شد ✅ (پوشه اسپم را هم ببینید)"; startOtpCooldown();
}
async function verifyEmailOtp(){
  const em=document.getElementById("a-mail").value.trim().toLowerCase(), otp=normDigits(document.getElementById("a-otp").value.trim()), n=document.getElementById("a-n").value.trim();
  const er=m=>document.getElementById("a-e").textContent=m;
  if(!em) return er("ایمیل را وارد کنید.");
  if(!otp) return er("کد تایید را وارد کنید.");
  if(mode=="up" && n.length<2) return er("نام را وارد کنید.");
  if (mode === "up" && !document.getElementById("a-terms").checked) return er("لطفاً قوانین و حریم خصوصی را بپذیرید.");
  er("در حال بررسی کد...");
  const {data,error}=await supabaseClient.auth.verifyOtp({email:em,token:otp,type:"email"});
  if(error) return er("خطا: کد اشتباه یا منقضی شده است.");
  const user=data.user, base=String(em).split("@")[0];
  me=em; myId=user.id;
  if(!users[me]) users[me]={name:n||base,verified:true,shopName:(n||base)+" دکان"}; else if(n) users[me].name=n;
  put("ab_users",users); put("ab_sess",me); loadFavs();
  toast("خوش آمدید "+users[me].name);
  document.getElementById("auth").close(); ["#a-n","#a-mail","#a-p","#a-otp"].forEach(x=>document.querySelector(x).value="");
  draw(); addNotification("به افغان‌بازار خوش آمدید!");
  try { await afterLogin(me); } catch(_) {}
  if(after){const f=after;after=null;f();}
}
document.getElementById("g-login").onclick=async()=>{
  if(!supabaseClient){document.getElementById("a-e").textContent="خطا: سرور متصل نیست.";return;}
  if(location.protocol==="file:"){document.getElementById("a-e").textContent="ورود با گوگل فقط روی سایت آنلاین (https) کار می‌کند.";return;}
  const {error}=await supabaseClient.auth.signInWithOAuth({provider:"google",options:{redirectTo:location.href.split("#")[0]}});
  if(error) document.getElementById("a-e").textContent="خطا: "+error.message;
};
document.getElementById("send-otp-btn").onclick = async () => {
  if (!supabaseClient) { document.getElementById("a-e").textContent = "خطا: سرور متصل نیست. اینترنت را چک کنید."; return; }
  if(authMethod==="email") return sendEmailOtp();
  document.getElementById("a-e").textContent = "ورود با پیامک فعلاً از دسترس خارج است. لطفاً از ایمیل یا گوگل استفاده کنید.";
};

document.getElementById("a-go").onclick = async () => {
  if (!supabaseClient) { document.getElementById("a-e").textContent = "خطا: سرور متصل نیست."; return; }
  if(authMethod==="email") return verifyEmailOtp();
  document.getElementById("a-e").textContent = "ورود با پیامک فعلاً از دسترس خارج است. لطفاً از ایمیل یا گوگل استفاده کنید.";
};

document.getElementById("acc").onclick=()=>{
  if(!me||!users[me])return openAuth();
  const nm=users[me].name||"کاربر";
  document.getElementById("me-n").textContent=nm;
  document.getElementById("me-p").textContent=me;
  document.getElementById("me-avatar").textContent=(Array.from(nm.trim())[0]||"؟").toUpperCase();
  const isPhone = /^07\d{8}$/.test(me);
  let badges = isPhone
    ? '<span class="badge-verified"><svg class="icon icon-sm"><use href="#i-check"></use></svg> شماره تاییدشده</span>'
    : '<span class="badge-verified">✓ حساب تاییدشده</span>';
  if(adminFlag) badges += '<span class="badge-verified" style="background:rgba(244,183,63,.9);color:#2a1d00;border-color:transparent;"><svg class="icon icon-sm"><use href="#i-shield"></use></svg> مدیر</span>';
  document.getElementById("me-verified-badge-box").innerHTML = badges;
  const myAds = mine.filter(a => !a.owner || a.owner === me);
  document.getElementById("me-stat-ads").textContent = nf(myAds.length);
  document.getElementById("me-stat-views").textContent = nf(myAds.reduce((s,x)=>s+(Number(x.views)||0),0));
  document.getElementById("me-stat-favs").textContent = nf(Array.isArray(favs)?favs.length:0);

  const adminBtn = document.getElementById("admin-btn");
  adminBtn.hidden = !adminFlag;
  if(adminFlag) {
      adminBtn.innerHTML = (view === 'admin')
      ? '<svg class="icon icon-sm"><use href="#i-x"></use></svg> خروج از پنل مدیریت'
      : '<svg class="icon icon-sm"><use href="#i-shield"></use></svg> ورود به پنل مدیریت';
  }
  document.getElementById("me").showModal();
};
document.getElementById("me-close").onclick=()=>document.getElementById("me").close();

document.getElementById("me").onclick = async e => {
  if(e.target==document.getElementById("me"))return document.getElementById("me").close();
  const b=e.target.closest("button");if(!b)return;
  if(!b.dataset.v) return;
  if(b.dataset.v=="edit-profile"){
    const newName = await openTextPrompt("نام جدید خود را وارد کنید:", users[me]?.name || "");
    if (!newName || newName.length < 2) return;
    users[me].name = newName;
    put("ab_users", users);
    if(sb() && myId) Promise.resolve(sb().from("profiles").upsert({id:myId,name:users[me].name})).catch(()=>{});
    draw();
    toast("نام پروفایل به‌روز شد");
    return;
  }
  if(b.dataset.v=="inbox"){
    document.getElementById("me").close();
    loadInbox();
    document.getElementById("inbox-dlg").showModal();
    return;
  }
  if(b.dataset.v=="out"){
    if(supabaseClient) await supabaseClient.auth.signOut().catch(()=>{});
    try {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith("ab_ad_draft_") ||
            k.startsWith("ab_fav_") ||
            k.startsWith("ab_notes_") ||
            k.startsWith("ab_msgs_") ||
            k.startsWith("ab_notifs_") ||
            k.startsWith("ab_last_ph_") ||
            k.startsWith("ab_called_")) {
          localStorage.removeItem(k);
        }
      });
    } catch(e) {}
    S.removeItem("ab_ad_draft_" + me);
    S.removeItem("ab_ad_draft_anon");
    me = null; myId = null; adminFlag = false;
    mine = []; put("ab_ads", mine);
    compareList = []; updateCompareBar();
    put("ab_sess", null);
    favs = []; notes = {}; messages = {}; notifications = [];
    updateNotifBadge();
    view = "all";
  }
  else if(b.dataset.v=="admin"){
    if(!adminFlag){ toast("دسترسی مجاز نیست."); return; }
    if(view === 'admin') {
      view = 'all'; 
      adminTab = 'all';
      toast("از پنل مدیریت خارج شدید.");
    } else {
      view = 'admin'; 
      adminTab = 'all';
      toast("به پنل مدیریت وارد شدید.");
    }
    cat=0; wholesaleCat=0; currentPage=1; wholesaleCurrentPage=1; 
    document.getElementById("me").close();
    draw();
    return;
  }
  else view=b.dataset.v;
  if(b.dataset.v==="all"){
    document.getElementById("q").value=""; document.getElementById("pmin").value=""; document.getElementById("pmax").value="";
    document.getElementById("q-wholesale").value=""; document.getElementById("wmin").value=""; document.getElementById("wmax").value="";
    document.getElementById("header-city-select").value="-1";
    document.getElementById("urg").checked=false; document.getElementById("f-cond").value="";
    document.getElementById("f-has-photo").checked=false; document.getElementById("f-shop-only").checked=false;
    radiusFilterActive=false;
    document.getElementById("radius-status-badge").textContent="شعاع فعال نیست";
  }
  cat=0; wholesaleCat=0; currentPage=1; wholesaleCurrentPage=1; document.getElementById("me").close();

  draw();
};

let mapPicker = null;
let pickerMarker = null;

function initMapPicker(lat, lng, _attempts = 0) {
  if(typeof L === 'undefined') { ensureLeaflet().then(ok => { if(ok) initMapPicker(lat, lng, _attempts); else { toast('نقشه بارگذاری نشد؛ اینترنت را بررسی کنید.'); mapFail('map-picker-container', () => initMapPicker(lat, lng)); } }); return; }
  if(!Number.isFinite(lat) || !Number.isFinite(lng)) { lat = 34.5553; lng = 69.2075; }
  const mapContainer = document.getElementById('map-picker-container');
  if(!mapContainer || !document.getElementById("add").open) {
    if (_attempts < 60) setTimeout(() => initMapPicker(lat, lng, _attempts + 1), 100);
    return;
  }
  if(mapPicker) { try{ mapPicker.remove(); }catch(e){}; mapPicker = null; }
  pickerMarker = null;
  prepMapContainer(mapContainer);
  mapPicker = L.map('map-picker-container').setView([lat, lng], 13);
  fixMapSize(mapPicker, 1600);
  baseTiles().addTo(mapPicker);
  pickerMarker = L.marker([lat, lng], {draggable: true}).addTo(mapPicker);
  pickerMarker.on('dragend', function() {
    const pos = pickerMarker.getLatLng();
    document.getElementById("form-lat").value = pos.lat;
    document.getElementById("form-lng").value = pos.lng;
  });
  mapPicker.on('click', function(e) {
    pickerMarker.setLatLng(e.latlng);
    document.getElementById("form-lat").value = e.latlng.lat;
    document.getElementById("form-lng").value = e.latlng.lng;
  });
}

document.getElementById("f-ci").onchange = function() {
  const idx = +this.value;
  const prov = provinceCoords[idx] || provinceCoords[0];
  document.getElementById("form-lat").value = prov.lat;
  document.getElementById("form-lng").value = prov.lng;
  if(mapPicker && pickerMarker) {
    mapPicker.setView([prov.lat, prov.lng], 13);
    pickerMarker.setLatLng([prov.lat, prov.lng]);
  }
};

const DRAFT_KEY = () => "ab_ad_draft_" + (me || "anon");

document.getElementById("f-c").addEventListener("change", () => refreshCategoryFields());
document.getElementById("f-t").addEventListener("input", function(){
  const c = document.getElementById("title-counter");
  if (!c) return;
  const n = this.value.length;
  c.textContent = nf(n) + " / " + nf(60);
  c.style.color = n > 55 ? "#d6324a" : n > 45 ? "#e08c00" : "var(--mu)";
});

function saveFormDraft() {
  if(!document.getElementById("add").open) return;
  if(document.getElementById("edit-ad-id").value) return; // در حالت ویرایش پیش‌نویس ذخیره نشود
  const draft = {
    t: document.getElementById("f-t").value, ph: document.getElementById("f-ph").value, c: document.getElementById("f-c").value, ci: document.getElementById("f-ci").value,
    p: document.getElementById("f-p").value, cur: document.getElementById("f-cur").value, neg: document.getElementById("f-neg").checked,
    moq: document.getElementById("f-moq").value, unit: document.getElementById("f-unit").value, brand: document.getElementById("form-brand").value,
    spec: document.getElementById("form-spec").value, d: document.getElementById("f-d").value, cond: document.getElementById("form-cond").value,
    mapLoc: document.getElementById("form-map").value, shopName: document.getElementById("form-shop-name").value,
    lat: document.getElementById("form-lat").value, lng: document.getElementById("form-lng").value,
    isShop: document.getElementById("form-is-shop").checked, urg: document.getElementById("form-urg").checked, w: document.getElementById("form-is-wholesale-hidden").value,
    provinces: [...document.querySelectorAll(".multi-prov-chk:checked")].map(c=>+c.value),
    extras: collectExtras()
  };
  if(!draft.t && !draft.d) return;
  put(DRAFT_KEY(), draft);
}

["#f-t","#f-ph","#f-c","#f-ci","#f-p","#f-cur","#f-neg","#f-moq","#f-unit","#form-brand","#form-spec","#f-d","#form-cond","#form-map","#form-shop-name","#form-is-shop","#form-urg"].forEach(sel => {
  document.querySelector(sel).addEventListener("input", saveFormDraft);
  document.querySelector(sel).addEventListener("change", saveFormDraft);
});

document.addEventListener("visibilitychange",()=>{ if(document.hidden) try{saveFormDraft()}catch(e){} });
window.addEventListener("pagehide",()=>{ try{saveFormDraft()}catch(e){} });
document.getElementById("camera-file-input").addEventListener("click",()=>{ try{saveFormDraft(); S.setItem("ab_cam_pending","1");}catch(e){} });
if(S.getItem("ab_cam_pending")){
  S.removeItem("ab_cam_pending");
  setTimeout(()=>toast("⚠️ مرورگر هنگام دوربین بسته شد و عکس نرسید. پیش‌نویس حفظ شده؛ دوباره «ثبت آگهی» را بزنید و عکس را از «گالری» انتخاب کنید."),1500);
}

// ===== Multi-step form =====
let currentFormStep = 1;
const TOTAL_STEPS = 4;
function goToStep(n){
  n=Math.max(1,Math.min(TOTAL_STEPS,n)); currentFormStep=n;
  document.querySelectorAll("#add .form-step").forEach(el=>el.classList.toggle("active",+el.dataset.step===n));
  document.querySelectorAll("#step-progress .step-dot").forEach(el=>{ const k=+el.dataset.step; el.classList.toggle("active",k===n); el.classList.toggle("done",k<n); });
  document.getElementById("cancel").textContent = n===1 ? t("adCancel") : t("prevBtn");
  document.getElementById("save").textContent = n<TOTAL_STEPS ? t("nextBtn") : t("adSave");
  const body=document.querySelector("#add .modal-body"); if(body) body.scrollTop=0;
  if(n===TOTAL_STEPS) setTimeout(()=>initMapPicker(parseFloat(document.getElementById("form-lat").value)||34.5553,parseFloat(document.getElementById("form-lng").value)||69.2075),260);
}
function buildCategoryTiles(){
  const box=document.getElementById("step-cat-tiles"); if(!box) return;
  const wholesale=document.getElementById("form-is-wholesale-hidden").value==="true";
  const cur=String(document.getElementById("f-c").value);
  box.innerHTML=(wholesale?wholesaleCats:cats).slice(1).map((x,i)=>`<button type="button" class="step-cat-tile${String(i+1)===cur?" on":""}" data-val="${i+1}"><span class="tile-icon">${x[1]}</span><span>${esc(x[0])}</span></button>`).join("");
  box.onclick=e=>{
    const b=e.target.closest(".step-cat-tile"); if(!b) return;
    box.querySelectorAll(".step-cat-tile").forEach(x=>x.classList.remove("on")); b.classList.add("on");
    const sel=document.getElementById("f-c"); sel.value=b.dataset.val; sel.dispatchEvent(new Event("change",{bubbles:true}));
  };
}
function validateStep(n){
  if(n===1&&!document.getElementById("f-c").value){ toast("لطفاً یک دسته‌بندی انتخاب کنید"); return false; }
  if(n===4){
    const pv=document.getElementById("f-p").value;
    if(pv!==""&&(!Number.isFinite(+pv)||+pv<0)){ toast("قیمت نامعتبر است."); document.getElementById("f-p").focus(); return false; }
  }
  if(n===2){
    if(document.getElementById("f-t").value.trim().length<4){ document.getElementById("err-t").textContent="عنوان آگهی باید حداقل ۴ حرف باشد."; document.getElementById("f-t").focus(); return false; }
    document.getElementById("err-t").textContent="";
    if(!/^07\d{8}$/.test(normalizePhone(document.getElementById("f-ph").value))){ document.getElementById("f-ph").focus(); toast("شماره تماس را به‌صورت ۷… وارد کنید."); return false; }
  }
  return true;
}
document.getElementById("header-post-btn").onclick = () => need(()=>{
  const isWholesaleMode = (currentAppTab === "wholesale");
  document.getElementById("modal-title-text").innerHTML = isWholesaleMode
  ? `<svg class="icon icon-sm"><use href="#i-edit"></use></svg> ${t('postWholesale')}`
  : `<svg class="icon icon-sm"><use href="#i-edit"></use></svg> ${t('postRetail')}`;
  setTimeout(() => { const t = document.getElementById("f-t"); if(t) t.focus(); }, 200);
  document.getElementById("modal-header-bg").style.background = isWholesaleMode ? "linear-gradient(135deg, #1b3b6f, #152c48)" : "linear-gradient(135deg, var(--ac), var(--ac2))";
  document.getElementById("edit-ad-id").value = "";
  
  document.getElementById("f-ph").value = /^07\d{8}$/.test(me)?me:(get("ab_last_ph_"+me,"")||"");
  const draft = get(DRAFT_KEY(), null);
  let loadedDraft = null;
  if (draft && String(draft.w || "false") === String(isWholesaleMode)) {
    if (confirm(t("adDraft"))) {
      loadedDraft = draft;
    } else {
      S.removeItem(DRAFT_KEY());
    }
  }
  if(loadedDraft) {
    document.getElementById("f-t").value = loadedDraft.t || "";
    if(loadedDraft.ph) document.getElementById("f-ph").value = loadedDraft.ph;
    document.getElementById("f-p").value = loadedDraft.p || "";
    document.getElementById("f-d").value = loadedDraft.d || "";
    document.getElementById("form-map").value = loadedDraft.mapLoc || "";
    document.getElementById("form-shop-name").value = loadedDraft.shopName || "";
    document.getElementById("form-is-shop").checked = loadedDraft.isShop || false;
    document.getElementById("form-cond").value = loadedDraft.cond || "used";
    document.getElementById("f-cur").value = loadedDraft.cur || "AFN";
    document.getElementById("f-neg").checked = !!loadedDraft.neg;
    document.getElementById("f-moq").value = loadedDraft.moq || "";
    document.getElementById("f-unit").value = loadedDraft.unit || "کارتن";
    document.getElementById("form-brand").value = loadedDraft.brand || "";
    document.getElementById("form-spec").value = loadedDraft.spec || "";
    document.getElementById("form-urg").checked = !!loadedDraft.urg;
    if(Number.isFinite(Number(loadedDraft.lat))) document.getElementById("form-lat").value = loadedDraft.lat;
    if(Number.isFinite(Number(loadedDraft.lng))) document.getElementById("form-lng").value = loadedDraft.lng;
  } else {
    ["#f-t","#f-p","#f-d","#form-map","#form-shop-name","#f-moq","#form-brand","#form-spec"].forEach(s=>document.querySelector(s).value="");
    document.getElementById("form-is-shop").checked = isWholesaleMode;
    document.getElementById("form-cond").value = "used";
    document.getElementById("f-cur").value = "AFN";
    document.getElementById("f-neg").checked = false;
    document.getElementById("form-urg").checked = false;
  }
  document.getElementById("form-is-wholesale-hidden").value = isWholesaleMode ? "true" : "false";
  document.getElementById("retail-cond-row").style.display = isWholesaleMode ? "none" : "grid"; 
  document.getElementById("retail-spec-row").style.display = isWholesaleMode ? "none" : "grid"; 
  document.getElementById("wholesale-row").style.display = isWholesaleMode ? "grid" : "none"; 
  document.getElementById("form-urg").closest("label").style.display = isWholesaleMode ? "none" : "";
  document.getElementById("form-shop-name").style.display = isWholesaleMode ? "block" : "none";
  
  if(isWholesaleMode) {
    document.getElementById("single-ci-box").style.display = "none";
    document.getElementById("multi-provinces-box").style.display = "block";
    const savedProv = loadedDraft && Array.isArray(loadedDraft.provinces) ? loadedDraft.provinces : [];
    document.querySelectorAll(".multi-prov-chk").forEach(c => c.checked = savedProv.includes(+c.value));
  } else {
    document.getElementById("single-ci-box").style.display = "block";
    document.getElementById("multi-provinces-box").style.display = "none";
    document.getElementById("f-ci").value = loadedDraft && loadedDraft.ci ? loadedDraft.ci : 0;
  }
  if(isWholesaleMode && me && users[me] && !document.getElementById("form-shop-name").value) {
    document.getElementById("form-shop-name").value = users[me].shopName || (users[me].name + " شرکت پخش");
  }
  
  populateModalCategorySelect(isWholesaleMode);
  { const fc = document.getElementById("f-c"); const want = loadedDraft && loadedDraft.c ? String(loadedDraft.c) : "1";
    fc.value = [...fc.options].some(o=>o.value===want) ? want : "1"; }

  combinedImagesList = []; imgEpoch++;
  updatePreviewGrid();
  
  const modalEl = document.getElementById("add");
  modalEl.close();
  modalEl.showModal();

  const initialProv = provinceCoords[Number(document.getElementById("f-ci").value)] || provinceCoords[0];
  if(!loadedDraft) { document.getElementById("form-lat").value = initialProv.lat; document.getElementById("form-lng").value = initialProv.lng; }
  refreshCategoryFields(loadedDraft && loadedDraft.extras ? loadedDraft.extras : undefined);
  buildCategoryTiles();
  goToStep(1);
});

document.getElementById("form-is-shop").onchange = function() {
  const isWholesaleMode = (document.getElementById("form-is-wholesale-hidden").value === "true");
  document.getElementById("form-shop-name").style.display = (this.checked || isWholesaleMode) ? "block" : "none";
  if((this.checked || isWholesaleMode) && me && users[me] && !document.getElementById("form-shop-name").value) {
    document.getElementById("form-shop-name").value = users[me].shopName || (users[me].name + (isWholesaleMode ? " شرکت پخش" : " فروشگاه"));
  }
};

function closeAdForm() {
  if(mapPicker) { try { mapPicker.remove(); } catch(e) {} mapPicker = null; pickerMarker = null; }
  document.getElementById("add").close();
}
document.getElementById("cancel").onclick=()=>{ if(currentFormStep>1) goToStep(currentFormStep-1); else closeAdForm(); };
document.getElementById("cancel-top").onclick=closeAdForm;

function openEditModal(ad) {
  const isWholesaleMode = ad.isWholesale;
  document.getElementById("modal-title-text").innerHTML = isWholesaleMode
  ? '<svg class="icon icon-sm"><use href="#i-edit"></use></svg> ویرایش آگهی عمده‌فروشی'
  : '<svg class="icon icon-sm"><use href="#i-edit"></use></svg> ویرایش آگهی پرچون';
  document.getElementById("modal-header-bg").style.background = isWholesaleMode ? "linear-gradient(135deg, #1b3b6f, #152c48)" : "linear-gradient(135deg, var(--ac), var(--ac2))";
  document.getElementById("edit-ad-id").value = ad.id;
  document.getElementById("f-t").value = ad.t; document.getElementById("f-ph").value = ad.ph || "";
  populateModalCategorySelect(isWholesaleMode);
  document.getElementById("f-c").value = isWholesaleMode ? ad.wholesaleCat : ad.c;

  if(isWholesaleMode) {
    document.getElementById("single-ci-box").style.display = "none";
    document.getElementById("multi-provinces-box").style.display = "block";
    document.querySelectorAll(".multi-prov-chk").forEach(c => {
      c.checked = Array.isArray(ad.provinces) && ad.provinces.includes(+c.value);
    });
  } else {
    document.getElementById("single-ci-box").style.display = "block";
    document.getElementById("multi-provinces-box").style.display = "none";
    document.getElementById("f-ci").value = (ad.ci != null) ? ad.ci : 0;
  }

  document.getElementById("form-cond").value = ad.cond || "used";
  document.getElementById("form-map").value = ad.mapLoc || "";
  document.getElementById("f-p").value = ad.p;
  document.getElementById("f-d").value = ad.d || "";
  document.getElementById("form-is-shop").checked = ad.isShop || false;
  document.getElementById("form-shop-name").style.display = ad.isShop ? "block" : "none";
  document.getElementById("form-shop-name").value = ad.shopName || "";
  document.getElementById("form-urg").checked = ad.u || false;
  document.getElementById("f-cur").value=ad.cur||"AFN"; document.getElementById("f-neg").checked=!!ad.neg; document.getElementById("f-moq").value=ad.moq||""; document.getElementById("f-unit").value=ad.unit||"کارتن"; document.getElementById("form-brand").value=ad.brand||""; document.getElementById("form-spec").value=ad.spec||"";
  document.getElementById("form-is-wholesale-hidden").value = isWholesaleMode ? "true" : "false";
  document.getElementById("retail-cond-row").style.display = isWholesaleMode ? "none" : "grid"; 
  document.getElementById("retail-spec-row").style.display = isWholesaleMode ? "none" : "grid"; 
  document.getElementById("wholesale-row").style.display = isWholesaleMode ? "grid" : "none"; 
  document.getElementById("form-urg").closest("label").style.display = isWholesaleMode ? "none" : "";
  document.getElementById("form-lat").value = ad.lat || provinceCoords[ad.ci]?.lat || 34.5553;
  document.getElementById("form-lng").value = ad.lng || provinceCoords[ad.ci]?.lng || 69.2075;
  
  combinedImagesList = []; imgEpoch++;
  if(Array.isArray(ad.imgs) && ad.imgs.length > 0) {
    ad.imgs.forEach(im => combinedImagesList.push({ src: im, type: 'ذخیره شده' }));
  } else if(ad.img) {
    combinedImagesList.push({ src: ad.img, type: 'ذخیره شده' });
  }
  refreshCategoryFields(ad.extras);
  updatePreviewGrid();
  document.getElementById("add").showModal();
  buildCategoryTiles();
  goToStep(2);
}

const MAX_IMGS=6;
async function compressImage(file){
  const MAXD=1280;
  let src=null, bmp=null, url=null;
  try{
    if(window.createImageBitmap){
      try{ bmp=await createImageBitmap(file,{imageOrientation:"from-image"}); }catch(e){ bmp=null; }
    }
    if(!bmp){
      url=URL.createObjectURL(file);
      src=await new Promise((res,rej)=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=()=>rej(new Error("decode")); im.src=url; });
    }
    const w=(bmp||src).width, h=(bmp||src).height;
    if(!w||!h) throw new Error("empty-image");
    const k=Math.min(1,MAXD/Math.max(w,h));
    const c=document.createElement("canvas");
    c.width=Math.max(1,Math.round(w*k)); c.height=Math.max(1,Math.round(h*k));
    const ctx=c.getContext("2d");
    ctx.fillStyle="#fff"; ctx.fillRect(0,0,c.width,c.height);
    ctx.drawImage(bmp||src,0,0,c.width,c.height);
    const out=c.toDataURL("image/jpeg",.75);
    c.width=c.height=0;
    if(!out||out.length<500||out==="data:,") throw new Error("canvas-failed");
    return out;
  } finally {
    if(bmp&&bmp.close) try{bmp.close()}catch(e){}
    if(url) URL.revokeObjectURL(url);
  }
}
let combinedImagesList = [];
let imgEpoch = 0;
let pendingImgJobs = [];
function addImageFile(file, type){
  const ep = imgEpoch;
  const job = compressImage(file).then(src=>{
    if(ep!==imgEpoch) return;
    combinedImagesList.push({src,type}); updatePreviewGrid();
  }).catch(err=>{
    console.warn("خواندن تصویر ناموفق:",err);
    toast("⚠️ این عکس خوانده نشد (فرمت یا حجم پشتیبانی نمی‌شود). از گالری عکس دیگری انتخاب کنید.");
  }).finally(()=>{ pendingImgJobs=pendingImgJobs.filter(j=>j!==job); });
  pendingImgJobs.push(job);
  return job;
}

function updatePreviewGrid() {
  const grid = document.getElementById("preview-grid");
  const status = document.getElementById("img-status");
  if(combinedImagesList.length === 0) {
    grid.innerHTML = "";
    status.textContent = "تصویری انتخاب نشده است";
    return;
  }
  status.textContent = `✅ ${combinedImagesList.length} تصویر آماده است`;
  grid.innerHTML = combinedImagesList.map((item, idx) => `
    <div class="preview-item">
      <img src="${item.src}" alt="تصویر">
      <span class="badge-type">${item.type}</span>
      <button class="del-img" data-index="${idx}" type="button">✕</button>
    </div>
  `).join("");
}

document.getElementById("preview-grid").onclick = (e) => {
  const btn = e.target.closest(".del-img");
  if(!btn) return;
  const idx = +btn.dataset.index;
  combinedImagesList.splice(idx, 1);
  updatePreviewGrid();
};

const MAX_FILE_MB = 60;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
document.getElementById("gallery-file-input").onchange = function(e) {
  const files = e.target.files;
  if(!files || files.length === 0) return;
  const room = Math.max(MAX_IMGS - combinedImagesList.length, 0);
  if(files.length > room) toast("حداکثر "+nf(MAX_IMGS)+" تصویر مجاز است.");
  Array.from(files).slice(0, room).forEach(file => {
    if (file.size > MAX_FILE_BYTES) { toast(`فایل ${file.name} بزرگ است (بیشتر از ${nf(MAX_FILE_MB)} مگابایت)`); return; }
    addImageFile(file, 'گالری');
  });
  this.value = "";
};

document.getElementById("camera-file-input").onchange = function(e) {
  const file = e.target.files[0];
  if(!file) return;
  if(combinedImagesList.length >= MAX_IMGS){ toast("حداکثر "+nf(MAX_IMGS)+" تصویر مجاز است."); this.value=""; return; }
  if (file.size > MAX_FILE_BYTES) { toast(`فایل بزرگ است (بیشتر از ${nf(MAX_FILE_MB)} مگابایت)`); this.value=""; return; }
  addImageFile(file, 'دوربین');
  this.value = "";
};

document.getElementById("save").onclick=async()=>{
  if(currentFormStep<TOTAL_STEPS){ if(validateStep(currentFormStep)) goToStep(currentFormStep+1); return; }
  // پیش از انتشار همهٔ مرحله‌ها دوباره بررسی می‌شوند و اگر خطایی بود کاربر به همان مرحله برمی‌گردد
  for(const s of [1,2,3,4]){
    if(!validateStep(s)){ if(s!==currentFormStep){ goToStep(s); validateStep(s); } return; }
  }
  const titleField = document.getElementById("f-t");
  const adTitle = titleField.value.trim();
  const errT = document.getElementById("err-t");
  if(adTitle.length < 4) {
    titleField.style.borderColor = "#d6324a";
    errT.textContent = "عنوان آگهی باید حداقل ۴ حرف باشد.";
    return;
  } else {
    titleField.style.borderColor = "var(--bd)";
    errT.textContent = "";
  }
  
  const phv = normalizePhone(document.getElementById("f-ph").value);
  if(!/^07\d{8}$/.test(phv)){ toast("شماره تماس را به‌صورت ۷… وارد کنید."); document.getElementById("f-ph").focus(); return; }
  put("ab_last_ph_"+me,phv);
  const saveBtn = document.getElementById("save");
  const _origSaveText = saveBtn.textContent;
  let imgUrls;
  try {
    saveBtn.disabled = true;
    if(pendingImgJobs.length){ saveBtn.textContent="در حال آماده‌سازی عکس‌ها..."; await Promise.allSettled(pendingImgJobs.slice()); }
    await ensureSession();
    imgUrls = [];
    if (combinedImagesList.length > 0) {
      let done = 0, failedUploads = 0;
      for(const i of combinedImagesList) {
        try {
          const u = await uploadImg(i.src);
          if(u) imgUrls.push(u);
          else failedUploads++;
        } catch(err) {
          console.warn("آپلود تصویر ناموفق بود:", err);
          failedUploads++;
        }
        done++;
        saveBtn.textContent = `آپلود ${nf(done)}/${nf(combinedImagesList.length)}...`;
      }
      if (failedUploads > 0) {
        saveBtn.disabled = false; saveBtn.textContent = _origSaveText;
        toast(`⚠️ ${nf(failedUploads)} عکس آپلود نشد (اینترنت ضعیف یا نشست منقضی). آگهی ثبت نشد؛ دوباره «انتشار» را بزنید.`);
        return;
      }
    }
  } catch(e) {
    saveBtn.disabled = false;
    saveBtn.textContent = _origSaveText;
    toast("آپلود تصویر ناموفق بود؛ دوباره تلاش کنید.");
    return;
  }
  saveBtn.disabled = false;
  saveBtn.textContent = _origSaveText;
  const editId = document.getElementById("edit-ad-id").value;
  const isShopChecked = document.getElementById("form-is-shop").checked;
  const shopNameVal = document.getElementById("form-shop-name").value.trim() || ((users[me]?.name||"کاربر") + " فروشگاه");
  const isUrg = document.getElementById("form-urg").checked ? 1 : 0;
  const isWholesaleVal = (document.getElementById("form-is-wholesale-hidden").value === "true");
  let latVal = parseFloat(document.getElementById("form-lat").value);
  let lngVal = parseFloat(document.getElementById("form-lng").value);
  if(!Number.isFinite(latVal) || latVal < -90 || latVal > 90) latVal = 34.5553;
  if(!Number.isFinite(lngVal) || lngVal < -180 || lngVal > 180) lngVal = 69.2075;
  
  let selectedProvinces = [];
  if(isWholesaleVal) {
    document.querySelectorAll(".multi-prov-chk:checked").forEach(c => selectedProvinces.push(+c.value));
    if(selectedProvinces.length === 0) selectedProvinces = [0];
  }

  try {
    if(editId) {
      const targetAd = mine.find(x => x.id === editId);
      if(targetAd) {
        targetAd.t = adTitle;
        if(isWholesaleVal) {
          targetAd.wholesaleCat = +document.getElementById("f-c").value;
          targetAd.c = 1;
          targetAd.provinces = selectedProvinces;
          targetAd.ci = selectedProvinces[0];
        } else {
          targetAd.c = +document.getElementById("f-c").value;
          targetAd.ci = +document.getElementById("f-ci").value;
        }
        targetAd.p = +document.getElementById("f-p").value || 0;
        targetAd.d = document.getElementById("f-d").value.trim();
        targetAd.cond = document.getElementById("form-cond").value; targetAd.ph = phv;
        targetAd.brand=document.getElementById("form-brand").value.trim(); targetAd.spec=document.getElementById("form-spec").value.trim(); targetAd.cur=document.getElementById("f-cur").value; targetAd.neg=document.getElementById("f-neg").checked; targetAd.moq=+document.getElementById("f-moq").value||0; targetAd.unit=document.getElementById("f-unit").value;
        targetAd.mapLoc = document.getElementById("form-map").value.trim();
        targetAd.isShop = isShopChecked;
        targetAd.shopName = shopNameVal;
        targetAd.u = isUrg;
        targetAd.isWholesale = isWholesaleVal;
        targetAd.lat = latVal;
        targetAd.lng = lngVal;
        targetAd.extras = collectExtras();
        targetAd.imgs = imgUrls;
        put("ab_ads", mine);
        syncAd(targetAd).then(st=>{ if(st) toast(adMsg(st,"ویرایش")); put("ab_ads", mine); draw(); }).catch(()=>{ put("ab_ads", mine); draw(); });
        addNotification(`آگهی ویرایش شد.`);
      } else {
        toast("آگهی برای ویرایش پیدا نشد.");
        return;
      }
    } else {
      const ts=Date.now();
      mine.unshift({
        id: (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)), ts, t: adTitle,
        c: isWholesaleVal ? 1 : +document.getElementById("f-c").value,
        wholesaleCat: isWholesaleVal ? +document.getElementById("f-c").value : 1,
        ci: isWholesaleVal ? selectedProvinces[0] : +document.getElementById("f-ci").value,
        provinces: isWholesaleVal ? selectedProvinces : undefined,
        p:+document.getElementById("f-p").value||0,
        d:document.getElementById("f-d").value.trim(),
        ph:phv, u: isUrg, owner:me, ownerId: myId,
        imgs: imgUrls,
        cond: document.getElementById("form-cond").value,
        mapLoc: document.getElementById("form-map").value.trim(),
        brand:document.getElementById("form-brand").value.trim(), spec:document.getElementById("form-spec").value.trim(), cur:document.getElementById("f-cur").value, neg:document.getElementById("f-neg").checked, moq:+document.getElementById("f-moq").value||0, unit:document.getElementById("f-unit").value,
        sellerName: users[me] ? users[me].name : "کاربر",
        verified: /^07\d{8}$/.test(me),
        isShop: isShopChecked, shopName: shopNameVal,
        isWholesale: isWholesaleVal,
        lat: latVal, lng: lngVal, extras: collectExtras(),
        status: adminFlag ? "approved" : "pending",
        views: 1, calls: 0
      });
      if(!put("ab_ads",mine)){ mine.shift(); toast("حافظه پر است؛ تعداد یا حجم عکس‌ها را کم کنید."); return; }
      syncAd(mine[0]).then(st=>{ if(st) toast(adMsg(st,"ثبت")); put("ab_ads", mine); draw(); }).catch(()=>{ put("ab_ads", mine); draw(); });
      addNotification(`آگهی جدید ثبت شد.`);
    }
    S.removeItem(DRAFT_KEY());
    document.getElementById("add").close();
    ["#f-t","#f-p","#f-d","#form-map","#edit-ad-id","#form-shop-name"].forEach(s=>document.querySelector(s).value="");
    document.getElementById("form-is-shop").checked = false;
    document.getElementById("form-urg").checked = false;
    combinedImagesList = []; imgEpoch++;
    updatePreviewGrid();
    cat=0; wholesaleCat=0; view="mine"; currentPage=1; wholesaleCurrentPage=1; draw();
  } catch(err) {
    toast("خطا در ذخیره‌سازی.");
  }
};

const card=renderCard;
function extras(){
  (function renderRecent(){
    const ids = get("ab_recent", []);
    const rail = document.getElementById("recent-rail");
    const sec = document.getElementById("recent-sec");
    if (!rail || !sec) return;
    const ads = (Array.isArray(ids) ? ids : [])
      .map(id => all().find(x => String(x.id) === String(id)))
      .filter(Boolean)
      .slice(0, 8);
    if (ads.length === 0) { sec.style.display = "none"; return; }
    sec.style.display = "block";
    rail.innerHTML = ads.map(card).join("");
  })();
  const A=all().filter(a => !a.isWholesale);
  document.getElementById("stats").innerHTML=[[A.length,t('statAds')],[provinceCoords.length,t('statProv')],[cats.length-1,t('statCats')]].map(x=>`<div><b data-count="${x[0]}">${nf(x[0])}</b><span>${x[1]}</span></div>`).join("");
  if(!window._statsAnimated && A.length){ window._statsAnimated=true; document.querySelectorAll("#stats b[data-count]").forEach(b=>animateNumber(b,+b.dataset.count)); }
  document.getElementById("feat").innerHTML=A.filter(a=>a.u).sort((a,b)=>a.age-b.age).map(card).join("")||'<div class="mu">فعلاً آگهی ویژه‌ای نیست.</div>';
  document.getElementById("tiles").innerHTML=cats.slice(1,13).map((x,i)=>`<button class="tag tile" style="--h:${(i+1)*23}" data-i="${i+1}"><span>${x[1]}</span>${x[0]}</button>`).join("");
  const cc={};A.forEach(a=>cc[a.ci]=(cc[a.ci]||0)+1);
  document.getElementById("tc").innerHTML=Object.entries(cc).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([i,n])=>`<button class="ccity" data-i="${i}">${cities[i]}<span>${nf(n)}</span></button>`).join("")
}
const go=()=>document.getElementById("listing").scrollIntoView({behavior:"smooth"});
document.getElementById("tiles").onclick=e=>{const b=e.target.closest(".tile");if(b){cat=+b.dataset.i;view="all";currentPage=1;draw();go()}};
document.getElementById("tc").onclick=e=>{const b=e.target.closest(".ccity");if(b){document.getElementById("header-city-select").value=+b.dataset.i;currentPage=1;draw();go()}};

document.getElementById("dlg").addEventListener("close", () => {
  resetOGTags();
  if(window._adViewMap) { try { window._adViewMap.remove(); } catch(e) {} window._adViewMap = null; }
});
document.getElementById("radius-dlg").addEventListener("close", () => destroyRadiusMap());
document.getElementById("add").addEventListener("close", () => {
  if(mapPicker) { try { mapPicker.remove(); } catch(e) {} mapPicker = null; pickerMarker = null; }
});

async function loadScriptOnce(url){
  return new Promise((res,rej)=>{ const el=document.createElement("script"); el.src=url; el.onload=res; el.onerror=()=>rej(new Error("load-failed")); document.head.appendChild(el); });
}
async function ensureClient(){
  if(sb()) return true;
  for(const u of ["https://unpkg.com/@supabase/supabase-js@2","https://cdnjs.cloudflare.com/ajax/libs/supabase-js/2.39.7/supabase.min.js"]){
    try{
      await withTimeout(loadScriptOnce(u),12000);
      if(window.supabase){ supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY); return true; }
    }catch(e){ console.warn("بارگذاری کتابخانه‌ی سرور ناموفق:",u,e); }
  }
  return false;
}
async function ensureSession(){
  if(!sb()) await ensureClient();
  if(myId) return true;
  try{
    const {data}=await sb().auth.getSession();
    const ses=data&&data.session;
    if(ses){ myId=ses.user.id; const ident=ses.user.email||ses.user.phone; if(ident) me=ident; return true; }
  }catch(e){ console.warn("بررسی نشست ناموفق بود:",e); }
  return false;
}
function dataUrlToBlob(src){
  const m=/^data:([^;,]+)?(;base64)?,([\s\S]*)$/.exec(src);
  if(!m) throw new Error("bad-data-url");
  const mime=m[1]||"image/jpeg";
  const bin=m[2]?atob(m[3]):decodeURIComponent(m[3]);
  const u8=new Uint8Array(bin.length);
  for(let k=0;k<bin.length;k++) u8[k]=bin.charCodeAt(k);
  if(u8.length<200) throw new Error("empty-image");
  return new Blob([u8],{type:mime});
}
const withTimeout=(p,ms)=>Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error("timeout")),ms))]);
async function uploadImg(src){
  if(!src||!src.startsWith("data:")) return src;
  if(!sb()) throw new Error("اتصال به سرور برقرار نیست؛ عکس آپلود نشد.");
  if(!myId) throw new Error("نشست معتبر نیست؛ عکس آپلود نشد (دوباره وارد حساب شوید).");
  const blob=dataUrlToBlob(src);
  const path=`${myId}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.jpg`;
  let lastErr=null;
  for(let attempt=0;attempt<3;attempt++){
    try{
      const {error}=await withTimeout(sb().storage.from("ad-images").upload(path,blob,{contentType:"image/jpeg",cacheControl:"31536000"}),45000);
      if(!error) return sb().storage.from("ad-images").getPublicUrl(path).data.publicUrl;
      lastErr=error;
      if(error.statusCode==="403"||error.statusCode==="401"||error.status===401||error.status===403) break;
    }catch(e){ lastErr=e; }
    await new Promise(r=>setTimeout(r,800*(attempt+1)));
  }
  throw lastErr||new Error("upload-failed");
}
async function syncAd(ad){
  if(!sb()){
    toast("⚠️ اتصال به سرور برقرار نیست؛ آگهی فقط روی همین دستگاه ذخیره شد.");
    return null;
  }
  if(!myId){
    toast("⚠️ نشست شما معتبر نیست؛ آگهی فقط روی همین دستگاه ذخیره شد. لطفاً دوباره وارد حساب شوید.");
    return null;
  }
  try{
    const {id,owner,ownerId,age,status,...rest}=ad;
    const {data,error}=await sb().from("ads").upsert({id:String(id),owner_id:myId,status: adminFlag ? "approved" : "pending",data:rest}).select("status").single();
    if(error){console.warn(error);toast("ذخیره روی سرور انجام نشد؛ فقط در این دستگاه ذخیره شد.");return null;}
    ad.status=data.status; return data.status;
  }catch(e){
    console.warn("خطای شبکه در ثبت آگهی روی سرور:",e);
    toast("⚠️ اتصال با سرور برقرار نشد؛ آگهی فقط در این دستگاه ذخیره شد. وقتی اینترنت وصل شد دوباره ذخیره کنید.");
    return null;
  }
}
const adMsg=(st,verb)=> st==="approved"?"✅ آگهی "+verb+" و منتشر شد":st==="rejected"?"❌ آگهی به‌دلیل محتوای ممنوعه رد شد":st==="pending"?"⏳ آگهی ثبت شد و پس از بررسی منتشر می‌شود":"آگهی با موفقیت "+verb+" شد";
async function remoteDelete(id,wasRemote){
  if(!sb()||!myId||!wasRemote) return true;
  if(adminFlag){ const r=await sb().rpc("admin_delete_ad",{p_id:String(id)}); if(r.error){console.warn(r.error);return false;} return true; }
  const r=await sb().from("ads").delete().eq("id",String(id)).select("id");
  if(r.error){console.warn(r.error);return false;}
  return !!(r.data&&r.data.length);
}
async function adminSetStatus(id, status){
  if(!adminFlag){ toast("فقط ادمین می‌تواند تایید/رد کند"); return; }
  if(seed.some(x=>String(x.id)===String(id))){ toast("این آگهی نمونه است و قابل تغییر نیست."); return; }
  if(sb() && myId){
    const {error} = await sb().from("ads").update({status}).eq("id", String(id));
    if(error){ console.warn(error); toast("ذخیره نشد روی سرور"); return; }
  }
  const ad = mine.find(x=>String(x.id)===String(id));
  if(ad) ad.status = status;
  put("ab_ads", mine);
  toast(status==="approved"?"✅ آگهی تایید شد":"❌ آگهی رد شد");
  draw();
}
function bumpStat(id,field){ if(sb() && !seed.some(x=>String(x.id)===String(id))) sb().rpc("bump_stat",{p_ad:String(id),p_field:field}).then(()=>{},()=>{}); }
async function remoteReview(a,rating,comment){
  if(!sb()||!myId||!a.ownerId) return;
  const {error}=await sb().from("reviews").upsert({shop_phone:a.ph,shop_owner_id:a.ownerId,buyer_id:myId,buyer_name:users[me].name,rating,comment},{onConflict:"shop_phone,buyer_id"});
  if(error){console.warn(error);toast("ثبت نظر روی سرور انجام نشد.");}
}
let currentChatChannel = null;

async function loadChat(a) {
  if(!sb() || !myId || !a.ownerId) return;
  
  const {data, error} = await sb().from("messages").select("*")
    .eq("ad_id", String(a.id))
    .or(`sender_id.eq.${myId},recipient_id.eq.${myId}`)
    .order("created_at", { ascending: false })
    .limit(50);
    
  if(!error && data) {
    const fetchedMsgs = data.map(r => ({
      sender: r.sender_id === myId ? me : r.sender_id,
      senderId: r.sender_id, recipientId: r.recipient_id, remoteId: r.id,
      name: r.sender_name, text: r.text, time: Date.parse(r.created_at),
      readAt: r.read_at || null
    }));
    if(messages[a.id]) {
       const existingTexts = new Set(fetchedMsgs.map(m => m.text + m.senderId + Math.floor(m.time / 3000)));
       messages[a.id].forEach(m => {
          if(!existingTexts.has(m.text + m.senderId + Math.floor(m.time / 3000))) fetchedMsgs.push(m);
       });
    }
    messages[a.id] = fetchedMsgs.sort((a,b) => a.time - b.time);

    const unread = data.filter(r => r.recipient_id === myId && !r.read_at).map(r => r.id);
    if (unread.length > 0 && sb()) {
      sb().from("messages").update({ read_at: new Date().toISOString() })
        .in("id", unread)
        .then(()=>{}, ()=>{});
    }
  }

  if (currentChatChannel) sb().removeChannel(currentChatChannel);
  
  currentChatChannel = sb().channel('chat_' + a.id)
    .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `ad_id=eq.${a.id}` 
      }, 
      payload => {
        const r = payload.new;
        if(r.sender_id === myId || r.recipient_id === myId) {
          if(!messages[a.id]) messages[a.id] = [];
          const isDuplicate = messages[a.id].some(m => 
            m.text === r.text && 
            m.senderId === r.sender_id && 
            Math.abs(m.time - Date.parse(r.created_at)) < 3000
          );
          if(!isDuplicate) {
             messages[a.id].push({
               sender: r.sender_id === myId ? me : r.sender_id,
               senderId: r.sender_id, recipientId: r.recipient_id, remoteId: r.id,
               name: r.sender_name, text: r.text, time: Date.parse(r.created_at),
               readAt: r.read_at || null
             });
             if(document.getElementById('chat-messages')) {
                const renderChat = () => {
                  const list = messages[a.id] || [];
                  const chatBox = document.getElementById("chat-messages");
                  const isAtBottom = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < 150;
                  chatBox.innerHTML = list.map(m=>`<div class="chat-msg ${m.sender==me?'me':'other'}"><b>${esc(m.name || 'کاربر')}:</b> ${esc(m.text)}</div>`).join("");
                  if(isAtBottom || chatBox.scrollTop === 0) {
                      chatBox.scrollTop = chatBox.scrollHeight;
                  }
                };
                renderChat();
             }
          }
        }
      })
    .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `ad_id=eq.${a.id}`
      },
      payload => {
        const r = payload.new;
        if (r.sender_id !== myId || !r.read_at) return;
        if (!messages[a.id]) return;
        const found = messages[a.id].find(m => m.remoteId === r.id);
        if (!found) return;
        found.readAt = r.read_at;
        const chatBox = document.getElementById("chat-messages");
        if (!chatBox) return;
        const list = messages[a.id];
        const isAtBottom = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < 150;
        chatBox.innerHTML = list.map(m=>{
          const mine = m.sender === me;
          const tick = mine ? (m.readAt ? ' <span title="خوانده شد" style="opacity:.8;">✔✔</span>' : ' <span title="ارسال شد" style="opacity:.6;">✔</span>') : '';
          return `<div class="chat-msg ${mine?'me':'other'}"><b>${esc(m.name || 'کاربر')}:</b> ${esc(m.text)}${tick}</div>`;
        }).join("");
        if (isAtBottom || chatBox.scrollTop === 0) chatBox.scrollTop = chatBox.scrollHeight;
      })
    .subscribe();
}
async function sendRemote(a,txt){
  if(!sb()||!myId||!a.ownerId) return;
  let rid=a.ownerId;
  if(rid===myId){
    const last = [...(messages[a.id]||[])].reverse().find(m => m.senderId && m.senderId !== myId);
    rid = last && last.senderId ? last.senderId : null;
  }
  if(!rid || rid === myId) return;
  const {data: _ins, error}=await sb().from("messages")
    .insert({ad_id:String(a.id),sender_id:myId,recipient_id:rid,sender_name:users[me].name,text:txt})
    .select("id").single();
  if(!error && _ins && messages[a.id]){
    const last = [...messages[a.id]].reverse().find(m => m.text === txt && m.senderId === myId && !m.remoteId);
    if(last) last.remoteId = _ins.id;
  }
  if(error){
    toast("پیام روی سرور ارسال نشد.");
    messages[a.id].pop();
  }
}
async function reportRemoteWithReason(id, reason, note) {
  if (!sb() || !myId) return false;
  const { error } = await sb().from("reports").upsert({
    ad_id: String(id),
    reporter_id: myId,
    reason,
    note: note || null,
    status: "open"
  }, { onConflict: "ad_id,reporter_id" });
  if (error) { console.warn("Report:", error); return false; }
  return true;
}
async function renderReports(){
  if(!adminFlag||!sb()) return;
  const box = (currentAppTab === 'wholesale') ? document.getElementById("wholesale-list") : document.getElementById("list");
  
  const {data:_rep,error}=await sb().from("reports").select("id,ad_id,created_at").eq("status","open").order("created_at",{ascending:false}).limit(50);
  const data=(_rep||[]).filter(r=>SAFE_ID.test(String(r.ad_id)));
  
  if(error||!_rep){ box.innerHTML = '<div class="empty">خطا در دریافت گزارش‌ها.</div>'; return; }
  
  if(data.length === 0) {
      box.innerHTML = '<div class="empty">هیچ گزارش تخلفی ثبت نشده است. 🎉</div>';
      return;
  }

  box.innerHTML = `<div style="grid-column: 1/-1; display:flex; flex-direction:column; gap:10px; width:100%;">
    ${data.map(r=>`
      <div style="background:var(--card); border:1px solid var(--bd); padding:12px; border-radius:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <b style="color:#d6324a; font-size:13px;">گزارش برای آگهی: ${esc(r.ad_id)}</b>
          <div class="mu" style="font-size:11px; margin-top:4px;">زمان ثبت گزارش: ${ago((Date.now()-Date.parse(r.created_at))/36e5)}</div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="admin-action-btn approve" onclick="openAd('${esc(r.ad_id)}')" style="display:flex;align-items:center;gap:4px;"><svg class="icon icon-sm"><use href="#i-eye"></use></svg> مشاهده آگهی</button> 
          <button class="admin-action-btn reject" onclick="closeReport('${r.id}')" style="display:flex;align-items:center;gap:4px;"><svg class="icon icon-sm"><use href="#i-check"></use></svg> بستن گزارش</button>
        </div>
      </div>
    `).join("")}
  </div>`;
}

window.closeReport = async (reportId) => {
    if(!sb()) return;
    await sb().from("reports").update({status:"closed"}).eq("id", reportId);
    toast("گزارش بسته شد.");
    renderReports(); 
};

const SAFE_ID=/^[A-Za-z0-9_-]{1,60}$/;
const MY_STORAGE_URL = "https://snhyzmwgazifdqyvqsnu.supabase.co/storage/v1/object/public/ad-images/";
const SAFE_IMG = new RegExp("^(" + MY_STORAGE_URL.replace(/[\x5b\x5d\x7b\x7d\x28\x29\x2a\x2b\x3f\x2e\x5e\x24\x7c\x5c]/g, '\\$&') + "[A-Za-z0-9_./-]+)$");
function cleanAd(r){
  if(!r||!SAFE_ID.test(String(r.id))) return null;
  const a={...(r.data&&typeof r.data==="object"?r.data:{}),id:String(r.id),status: r.status || "approved"};
  ["p","moq","c","ci","views","calls","ts","lat","lng","u"].forEach(k=>{ if(k in a) a[k]=Number(a[k])||0; });
  ["isWholesale","isShop","neg"].forEach(k=>{ if(k in a) a[k]=!!a[k]; });
  
  a.imgs=(Array.isArray(a.imgs)?a.imgs:[]).filter(x=>typeof x==="string"&&SAFE_IMG.test(x)).slice(0,8);
  if(a.img&&!(typeof a.img==="string"&&SAFE_IMG.test(a.img))) a.img="";
  return a;
}
async function loadRemote(){
  if(!sb()) return;
  const {data,error}=await sb().from("ads").select("id,owner_id,status,data").order("created_at",{ascending:false}).limit(500);
  if(error){ console.warn("Supabase ads:",error.message); return; }
  const remote=data.map(r=>{const a=cleanAd(r); if(a){ a.owner=(myId&&r.owner_id===myId)?me:r.owner_id; a.ownerId=r.owner_id; a.status=r.status||"approved"; } return a;}).filter(Boolean);
  const rids=new Set(remote.map(r=>r.id));
  const localOwn=myId?(Array.isArray(mine)?mine:[]).filter(a=>a.owner===me&&!rids.has(a.id)):[];
  mine=remote;
  await Promise.all(localOwn.map(async a => {
    try {
      a.imgs = await Promise.all((a.imgs || []).map(uploadImg));
      a.ownerId = myId;
      await syncAd(a);
    } catch(e) { console.warn(e); }
  }));
  localOwn.forEach(a => { if(!remote.some(x => x.id === a.id)) mine.unshift(a); });
  put("ab_ads",mine);
  const rv=await sb().from("reviews").select("shop_phone,rating,comment,buyer_name,buyer_id,created_at").limit(3000);
  if(rv.data){ const m={}; rv.data.forEach(r=>{(m[r.shop_phone]=m[r.shop_phone]||[]).push({rating:r.rating,comment:r.comment,buyer:r.buyer_name,buyerId:r.buyer_id,date:Date.parse(r.created_at)})}); shopReviews=m; }
  if(myId){
    const ad=await sb().from("admins").select("user_id").eq("user_id",myId).maybeSingle();
    adminFlag=!!(ad.data);
    const seen=get("ab_msg_seen",0);
    const mc=await sb().from("messages").select("id",{count:"exact",head:true}).eq("recipient_id",myId).gt("created_at",new Date(seen).toISOString());
    if(mc.count>0) addNotification(`${nf(mc.count)} پیام جدید در آگهی‌های شما`);
    put("ab_msg_seen",Date.now());
  }
  draw();
  if(window.__fromHash && !document.getElementById("dlg").open) window.__fromHash();
}
async function afterLogin(p){
  if(!sb() || !myId || !p) return;
  if(!users[p]) {
    const base = String(p).split("@")[0];
    users[p] = { name: base, verified: true, shopName: base + " دکان" };
    put("ab_users", users); put("ab_sess", p);
  }
  const pr=await sb().from("public_profiles").select("id, name, shop_name").eq("id",myId).maybeSingle();
  if(pr.data&&pr.data.name&&users[p]&&String(users[p].name).startsWith("کاربر ")){ users[p].name=pr.data.name; if(pr.data.shop_name) users[p].shopName=pr.data.shop_name; put("ab_users",users); }
  await sb().from("profiles").upsert({id:myId,phone:p,name:users[p]?.name||null,shop_name:users[p]?.shopName||null});
  await loadRemote();
}
async function initRemote(){
  if(!sb()) return;
  const {data}=await sb().auth.getSession();
  const ses=data&&data.session;
  if(ses){ myId=ses.user.id; const ident=ses.user.email||ses.user.phone;
    if(ident){
      if(ident !== me){ me=ident; loadFavs(); }
      if(!users[me]){ const md=ses.user.user_metadata||{}, base=String(me).split("@")[0];
        users[me]={name:md.full_name||md.name||base,verified:true,shopName:(md.full_name||base)+" دکان"};
        put("ab_users",users); put("ab_sess",me); loadFavs(); addNotification("به افغان‌بازار خوش آمدید!");
      }
    }
  }
  else if(me){ me=null; put("ab_sess",null); loadFavs(); }

  sb().auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      me = null; myId = null; adminFlag = false;
      put("ab_sess", null); loadFavs(); draw();
      toast("از حساب خارج شدید.");
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      const ident = session.user.email || session.user.phone;
      if (ident && ident !== me) { me = ident; myId = session.user.id; put("ab_sess", me); loadFavs(); draw(); }
    }
  });

  await loadRemote();
  setTimeout(checkExpiringAds, 5000);
}

(function(){
  var say=function(m){ try{ if(typeof toast==='function') toast(m); }catch(e){} };
  var reduce=function(){ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; };

  var pill=document.createElement('div'); pill.id='net-pill'; pill.setAttribute('role','status'); document.body.appendChild(pill);
  var pillTimer=null;
  function showPill(txt,ok,autoHide){
    clearTimeout(pillTimer); pill.textContent=txt; pill.classList.toggle('ok',!!ok); pill.classList.add('show');
    if(autoHide) pillTimer=setTimeout(function(){ pill.classList.remove('show'); },2500);
  }
  window.addEventListener('offline',function(){ showPill('📡 اینترنت قطع است',false,false); });
  window.addEventListener('online',function(){ showPill('✅ دوباره آنلاین شدید',true,true); });
  if(navigator.onLine===false) showPill('📡 اینترنت قطع است',false,false);

  var ub=document.createElement('div'); ub.id='sw-update-banner'; ub.setAttribute('role','alert');
  ub.innerHTML='<span style="font-size:22px">🔄</span><div class="pib-txt"><b>نسخه جدید آماده است</b><br><span class="mu">برای دیدن تغییرات بروزرسانی کنید</span></div><button id="sw-later" type="button">بعداً</button><button id="sw-reload" type="button">بروزرسانی</button>';
  document.body.appendChild(ub);
  ub.querySelector('#sw-later').onclick=function(){ ub.classList.remove('show'); };
  ub.querySelector('#sw-reload').onclick=function(){ location.reload(); };
  window.__showUpdateBanner=function(){ ub.classList.add('show'); };
  if('serviceWorker' in navigator){
    var hadController=!!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange',function(){ if(hadController) window.__showUpdateBanner(); });
  }

  var tt=document.createElement('button'); tt.id='to-top'; tt.type='button'; tt.setAttribute('aria-label','برگشت به بالا'); tt.textContent='↑'; document.body.appendChild(tt);
  var ticking=false;
  window.addEventListener('scroll',function(){
    if(ticking) return; ticking=true;
    requestAnimationFrame(function(){ tt.classList.toggle('show',(window.scrollY||document.documentElement.scrollTop||0)>700); ticking=false; });
  },{passive:true});
  tt.onclick=function(){ window.scrollTo({top:0,behavior:reduce()?'auto':'smooth'}); };

  var stack=[], skip=0;
  var origShow=HTMLDialogElement.prototype.showModal;
  HTMLDialogElement.prototype.showModal=function(){
    var was=this.open;
    origShow.apply(this,arguments);
    if(!was && this.open){
      try{ history.pushState({abDlg:1},''); }catch(e){ return; }
      stack.push(this);
      this.addEventListener('close',function(){
        var i=stack.lastIndexOf(this);
        if(i===-1) return;
        stack.splice(i,1);
        skip++; history.back();
      },{once:true});
    }
  };
  window.addEventListener('popstate',function(){
    if(skip>0){ skip--; return; }
    var d=stack.pop();
    if(d && d.open) d.close();
  });

  var lastErr=0;
  function softError(){
    var now=Date.now();
    if(now-lastErr<30000 || navigator.onLine===false) return;
    lastErr=now; say('مشکلی پیش آمد. اگر تکرار شد، صفحه را رفرش کنید.');
  }
  window.addEventListener('error',function(e){
    if(!e || !e.message || /ResizeObserver|Script error/i.test(e.message)) return;
    softError();
  });
  window.addEventListener('unhandledrejection',function(e){
    var r=e && e.reason;
    if(r && (r.name==='AbortError' || r.name==='NotAllowedError')) return;
    softError();
  });
})();

document.body.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.classList&&e.target.classList.contains("ad")){e.preventDefault();openAd(e.target.dataset.id)}});

(function(){
  const t=get("ab_theme",null); if(t) document.documentElement.dataset.theme=t;
  document.getElementById("theme-btn").onclick=()=>{const cur=document.documentElement.dataset.theme||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");const nx=cur==="dark"?"light":"dark";document.documentElement.dataset.theme=nx;put("ab_theme",nx)};
  document.getElementById("terms-link").onclick=e=>{e.preventDefault();document.getElementById("terms-dlg").showModal()};
  document.getElementById("close-terms").onclick=()=>document.getElementById("terms-dlg").close();
  document.body.addEventListener("click", (e) => {
    if (e.target.closest("#auth-terms-link")) {
      e.preventDefault();
      document.getElementById("terms-dlg").showModal();
    }
  });
  document.getElementById("close-ios-install").onclick=()=>document.getElementById("ios-install-dlg").close();
  const fromHash=()=>{if(location.hash==="#terms"){const d=document.getElementById("terms-dlg"); if(!d.open) d.showModal(); return;} const m=location.hash.match(/^#ad-(.+)$/); if(m) openAd(decodeURIComponent(m[1]));};
  window.__fromHash=fromHash; window.addEventListener("hashchange",fromHash); fromHash();
})();

document.body.addEventListener("click", e => {
  const tabBtn = e.target.closest("[data-atab]");
  if(tabBtn) {
    adminTab = tabBtn.dataset.atab;
    draw();
  }
});

async function loadInbox() {
  const box = document.getElementById("inbox-list");
  if(!sb() || !myId) return;
  box.innerHTML = '<div class="mu" style="text-align:center;padding:20px;">در حال دریافت پیام‌ها...</div>';
  
  const { data, error } = await sb().from('messages')
    .select('*')
    .or(`sender_id.eq.${myId},recipient_id.eq.${myId}`)
    .order('created_at', { ascending: false });
    
  if(error || !data) {
    box.innerHTML = '<div class="mu" style="text-align:center;padding:20px;">خطا در دریافت پیام‌ها.</div>';
    return;
  }

  const threads = {};
  data.forEach(msg => {
    if(!threads[msg.ad_id]) threads[msg.ad_id] = [];
    threads[msg.ad_id].push(msg);
  });

  const threadIds = Object.keys(threads).filter(id=>SAFE_ID.test(String(id)));
  if(threadIds.length === 0) {
    box.innerHTML = '<div class="mu" style="text-align:center;padding:20px;">هیچ پیامی ندارید.</div>';
    return;
  }

  let html = '';
  threadIds.forEach(adId => {
    const msgs = threads[adId];
    const lastMsg = msgs[0];
    const isMeSender = lastMsg.sender_id === myId;
    const otherName = isMeSender ? 'شما' : lastMsg.sender_name;
    const ad = all().find(a => String(a.id) === String(adId));
    const adTitle = ad ? ad.t : 'آگهی نامشخص';
    
    html += `
      <div onclick="openAdFromInbox('${adId}')" style="background:var(--card);padding:12px;border-radius:12px;border:1px solid var(--bd);cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <b style="font-size:13px;display:block;margin-bottom:4px;">${esc(adTitle)}</b>
          <div class="mu" style="font-size:11px;">${esc(otherName)}: ${esc(lastMsg.text).substring(0,30)}...</div>
        </div>
        <div style="font-size:10px;color:var(--mu);">${ago((Date.now() - Date.parse(lastMsg.created_at))/36e5)}</div>
      </div>
    `;
  });
  box.innerHTML = html;
}

window.openAdFromInbox = (adId) => {
  document.getElementById("inbox-dlg").close();
  openAd(adId);
  setTimeout(() => {
    const chatBox = document.getElementById("chat-messages");
    if(chatBox) chatBox.scrollIntoView({behavior:"smooth"});
  }, 500);
};

document.getElementById("close-inbox").onclick = () => document.getElementById("inbox-dlg").close();

(function(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const RIPPLE_SELECTOR = '.capsule-btn,.bnav-item,.tile,.ccity,.cat,.media-btn,.link';

  document.addEventListener('pointerdown', (e) => {
    const target = e.target.closest(RIPPLE_SELECTOR);
    if (!target || target.disabled) return;
    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const size = Math.max(rect.width, rect.height) * 2.2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top  = (e.clientY - rect.top  - size / 2) + 'px';
    const cs = getComputedStyle(target);
    if (cs.position === 'static') target.style.position = 'relative';
    if (cs.overflow !== 'hidden') target.style.overflow = 'hidden';
    target.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }, { passive: true });
})();

const __reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const skeletonHTML = () => Array.from({ length: 8 }, () => `
  <div class="skeleton-card ad" aria-hidden="true">
    <div class="sk-img skeleton"></div>
    <div class="sk-body">
      <div class="sk-line skeleton"></div>
      <div class="sk-line skeleton short"></div>
      <div class="sk-line skeleton" style="width:80%;"></div>
    </div>
  </div>
`).join('');

async function doRefresh() {
  const retail = document.getElementById('list');
  const whole  = document.getElementById('wholesale-list');
  if (retail) retail.innerHTML = skeletonHTML();
  if (whole)  whole.innerHTML  = skeletonHTML();
  try {
    if (typeof sb === 'function' && sb()) {
      await loadRemote();
      if (document.querySelector('.skeleton-card')) draw();
    } else {
      await new Promise(r => setTimeout(r, 350));
      draw();
    }
  } catch (e) {
    console.warn(e);
    draw();
  }
}

(function () {
  if (__reduceMotion()) return;
  let startY = 0, dist = 0, pulling = false;
  const THRESHOLD = 70;

  function indicator() {
    let el = document.getElementById('ptr-indicator');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ptr-indicator';
      el.innerHTML = '<div class="ptr-spinner"></div>';
      document.body.appendChild(el);
    }
    return el;
  }

  function resetIndicator(el) {
    el.classList.remove('ready', 'loading');
    el.style.opacity = '0';
    el.style.transform = 'translate(-50%, -60px)';
  }

  document.addEventListener('touchstart', (e) => {
    if (document.querySelector('dialog[open]')) return;
    if (document.scrollingElement.scrollTop > 2) return;
    const t = e.target;
    if (t.closest('.rail, .cats, dialog, #add, #dlg, #me, #auth, .chat-box, .thumbs-row, .filters')) return;
    if (e.touches.length !== 1) return;
    startY = e.touches[0].clientY;
    pulling = true;
    dist = 0;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!pulling) return;
    const dy = e.touches[0].clientY - startY;
    if (dy <= 0) { resetIndicator(indicator()); dist = 0; return; }
    dist = Math.min(dy * 0.55, THRESHOLD * 1.5);
    const el = indicator();
    const pct = Math.min(dist / THRESHOLD, 1);
    el.style.opacity = String(pct);
    el.style.transform = `translate(-50%, ${dist - 60}px) rotate(${dist * 3.5}deg)`;
    el.classList.toggle('ready', dist >= THRESHOLD);
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (!pulling) return;
    pulling = false;
    const el = indicator();
    if (dist >= THRESHOLD) {
      el.classList.add('loading');
      el.style.opacity = '1';
      el.style.transform = 'translate(-50%, 14px) rotate(0deg)';
      doRefresh().finally(() => {
        setTimeout(() => resetIndicator(el), 500);
      });
    } else {
      resetIndicator(el);
    }
    dist = 0;
  });
})();

(function () {
  if (__reduceMotion()) return;
  if (!document.startViewTransition) return;

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.ad');
    if (!card) return;
    if (e.target.closest('.fav, .compare-checkbox, [data-approve], [data-reject], .capsule-btn, .link, a')) return;

    const img = card.querySelector('.ph img');
    if (!img) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const adId = card.dataset.id;
    img.style.viewTransitionName = 'ad-hero';

    const transition = document.startViewTransition(() => {
      openAd(adId);
      const modalImg = document.getElementById('active-modal-img');
      if (modalImg) modalImg.style.viewTransitionName = 'ad-hero';
    });

    transition.finished.finally(() => {
      img.style.viewTransitionName = '';
      const mi = document.getElementById('active-modal-img');
      if (mi) mi.style.viewTransitionName = '';
    });
  }, true);

  const dlg = document.getElementById('dlg');
  if (dlg) dlg.addEventListener('close', () => {
    const mi = document.getElementById('active-modal-img');
    if (mi) mi.style.viewTransitionName = '';
  });
})();

window.Haptics = (() => {
  const supported = 'vibrate' in navigator;
  const enabled = () => { try { return get('ab_haptics', true) !== false; } catch(e){ return true; } };
  const setEnabled = (v) => put('ab_haptics', v);
  const fire = (p) => {
    if (!supported || !enabled()) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try { navigator.vibrate(p); } catch(e) {}
  };
  return {
    light: () => fire(10),
    medium: () => fire(20),
    heavy: () => fire(32),
    selection: () => fire(12),
    success: () => fire([10, 40, 10]),
    warning: () => fire([18, 70, 18]),
    error: () => fire([30, 55, 30, 55, 30]),
    isSupported: supported,
    isEnabled: enabled,
    setEnabled
  };
})();

document.addEventListener('pointerdown', (e) => {
  const t = e.target.closest(
    '.capsule-btn, .bnav-item, .cat, .tile, .ccity, .media-btn, .link, .fav, .compare-checkbox'
  );
  if (t && !t.disabled) Haptics.selection();
}, { passive: true });

(function wrapToast(){
  const orig = window.toast;
  if (typeof orig !== 'function') return;
  window.toast = function(m) {
    orig(m);
    if (!window.Haptics) return;
    if (/✅|موفق|خوش آمدید|پیروز|کپی شد|ذخیره شد|ثبت شد/.test(m)) Haptics.success();
    else if (/خطا|نشد|ناموفق|ممنوع|اشتباه|نامعتبر|نمی‌توانید/.test(m)) Haptics.error();
    else if (/⚠️|توجه|حداکثر|مجاز نیست|فقط/.test(m)) Haptics.warning();
  };
})();

async function shareAdCard(ad) {
  const text = `🛒 ${ad.t}\n💰 ${fmtAd(ad)}\n📍 ${cities[ad.ci] || ''}\n🔗 ${adUrl(ad.id)}`;

  if (navigator.canShare) {
    try {
      const file = await renderAdCardAsImage(ad);
      if (file && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: ad.t, text });
        Haptics.success();
        return;
      }
    } catch(err) {
      if (err.name === 'AbortError') return;
    }
  }

  if (navigator.share) {
    try {
      await navigator.share({ title: ad.t, text, url: adUrl(ad.id) });
      Haptics.success();
      return;
    } catch(err) { if (err.name === 'AbortError') return; }
  }

  try {
    const file = await renderAdCardAsImage(ad);
    if (file) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(file);
      a.download = `afghanbazar-${ad.id}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    }
    await navigator.clipboard.writeText(text);
    toast('تصویر دانلود و متن کپی شد ✅');
  } catch(e) {
    toast('اشتراک‌گذاری در این مرورگر پشتیبانی نمی‌شود.');
  }
}

async function renderAdCardAsImage(ad) {
  try {
    if (document.fonts?.ready) await document.fonts.ready;

    const W = 1080, H = 1080;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#08432c');
    grad.addColorStop(1, '#0e7a4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 60, 60, W - 120, H - 120, 44);
    ctx.fill();

    const imgUrl = (Array.isArray(ad.imgs) && ad.imgs[0]) || ad.img;
    const imgH = 480;
    if (imgUrl) {
      try {
        const img = await loadImage(imgUrl);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(60 + 44, 60);
        ctx.arcTo(60 + W - 120, 60, 60 + W - 120, 60 + imgH, 44);
        ctx.lineTo(60 + W - 120, 60 + imgH);
        ctx.lineTo(60, 60 + imgH);
        ctx.arcTo(60, 60, 60 + 44, 60, 44);
        ctx.closePath();
        ctx.clip();
        drawImageCover(ctx, img, 60, 60, W - 120, imgH);
        ctx.restore();
      } catch(e) {}
    } else {
      ctx.fillStyle = '#f0f6f2';
      ctx.fillRect(60, 60, W - 120, imgH);
      ctx.font = '180px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🛒', W / 2, 60 + imgH / 2);
      ctx.textBaseline = 'alphabetic';
    }

    ctx.direction = 'rtl';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#12211a';
    ctx.font = 'bold 46px Vazirmatn, Tahoma, sans-serif';
    wrapText(ctx, ad.t, W - 120, 620, W - 240, 58, 3);

    ctx.fillStyle = '#0e7a4b';
    ctx.font = 'bold 52px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText(fmtAd(ad), W - 120, 815);

    ctx.fillStyle = '#62736a';
    ctx.font = '30px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText(`📍 ${cities[ad.ci] || ''}  ·  ${ago(ad.age)}`, W - 120, 875);

    ctx.fillStyle = '#0e7a4b';
    ctx.font = 'bold 40px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText('◆ افغان‌بازار', W - 120, H - 95);
    ctx.fillStyle = '#62736a';
    ctx.font = '24px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText(location.host || 'afghanbazar', W - 120, H - 55);

    return await new Promise((res) => {
      canvas.toBlob((blob) => {
        res(blob ? new File([blob], `ad-${ad.id}.png`, { type: 'image/png' }) : null);
      }, 'image/png', 0.92);
    });
  } catch (e) {
    console.warn('Render card failed:', e);
    return null;
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function loadImage(src) {
  return new Promise((res, rej) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}
function drawImageCover(ctx, img, x, y, w, h) {
  const s = Math.max(w / img.width, h / img.height);
  const dw = img.width * s, dh = img.height * s;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}
function wrapText(ctx, text, x, y, maxW, lineH, maxLines) {
  const words = String(text).split(' ');
  let line = '', cy = y, n = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + ' ';
    if (ctx.measureText(test).width > maxW && line) {
      if (n >= maxLines - 1) {
        ctx.fillText(line.trim() + '…', x, cy);
        return;
      }
      ctx.fillText(line.trim(), x, cy);
      line = words[i] + ' ';
      cy += lineH;
      n++;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, cy);
}

(function injectHapticsToggle() {
  if (!Haptics.isSupported) return;
  const tryInject = () => {
    const menu = document.querySelector('#me .menu');
    if (!menu || document.getElementById('haptics-toggle')) return false;
    const outBtn = menu.querySelector('[data-v="out"]');
    if (!outBtn) return false;
    const btn = document.createElement('button');
    btn.id = 'haptics-toggle';
    btn.type = 'button';
    const render = () => {
      const on = Haptics.isEnabled();
      btn.innerHTML = `<svg class="icon icon-sm"><use href="#i-smartphone"></use></svg> لرزش لمسی: <b style="color:${on ? 'var(--ac)' : 'var(--mu)'};">${on ? 'فعال' : 'غیرفعال'}</b>`;
    };
    render();
    btn.onclick = () => {
      const next = !Haptics.isEnabled();
      Haptics.setEnabled(next);
      render();
      if (next) Haptics.medium();
      toast(next ? 'لرزش لمسی فعال شد' : 'لرزش لمسی غیرفعال شد');
    };
    outBtn.parentNode.insertBefore(btn, outBtn);
    return true;
  };
  if (!tryInject()) {
    const obs = new MutationObserver(() => { if (tryInject()) obs.disconnect(); });
    obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => obs.disconnect(), 5000);
  }
})();

const WakeLockManager = (() => {
  let sentinel = null;
  let wantsLock = false;

  function indicator(show) {
    let el = document.getElementById('wakelock-indicator');
    if (!el) {
      el = document.createElement('div');
      el.id = 'wakelock-indicator';
      el.innerHTML = '<span class="wl-dot"></span> صفحه روشن می‌ماند';
      document.body.appendChild(el);
    }
    el.classList.toggle('active', show);
  }

  async function acquire() {
    if (!('wakeLock' in navigator)) {
      toast('مرورگر شما از روشن ماندن صفحه پشتیبانی نمی‌کند.');
      return false;
    }
    if (sentinel) return true;
    try {
      sentinel = await navigator.wakeLock.request('screen');
      sentinel.addEventListener('release', () => {
        sentinel = null;
        if (!wantsLock) indicator(false);
      });
      return true;
    } catch (err) {
      console.warn('WakeLock rejected:', err);
      toast('اجازه روشن ماندن صفحه داده نشد.');
      return false;
    }
  }

  async function release() {
    wantsLock = false;
    indicator(false);
    if (sentinel) {
      try { await sentinel.release(); } catch(e) {}
      sentinel = null;
    }
  }

  async function toggle() {
    wantsLock = !wantsLock;
    if (wantsLock) {
      const ok = await acquire();
      if (ok) {
        indicator(true);
        Haptics?.success?.();
        toast('صفحه تا زمانی که این تب باز است روشن می‌ماند ✅');
      } else {
        wantsLock = false;
      }
    } else {
      await release();
      Haptics?.medium?.();
      toast('روشن ماندن صفحه غیرفعال شد');
    }
  }

  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && wantsLock && !sentinel) {
      const ok = await acquire();
      if (ok) indicator(true);
    }
  });

  return { toggle, isActive: () => !!sentinel, wantsLock: () => wantsLock };
})();

const VAPID_PUBLIC_KEY = '';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

const PushManagerClient = (() => {
  const supported = () =>
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  async function getRegistration() {
    if (!('serviceWorker' in navigator)) return null;
    try { return await navigator.serviceWorker.ready; }
    catch(e) { return null; }
  }

  async function subscribe() {
    if (!supported()) {
      toast('مرورگر شما از اعلان پوش پشتیبانی نمی‌کند.');
      return null;
    }
    if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY.includes('REPLACE')) {
      toast('اعلان پوش هنوز توسط مدیر تنظیم نشده است.');
      return null;
    }
    if (Notification.permission === 'denied') {
      toast('اعلان‌ها در تنظیمات مرورگر مسدود شده است.');
      return null;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      toast('اجازه اعلان داده نشد.');
      return null;
    }

    const reg = await getRegistration();
    if (!reg) return null;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }

    if (sb() && myId) {
      const json = sub.toJSON();
      await sb().from('push_subscriptions').upsert({
        user_id: myId,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      }, { onConflict: 'user_id,endpoint' });
    }

    toast('اعلان‌های پوش فعال شدند ✅');
    Haptics?.success?.();
    return sub;
  }

  async function unsubscribe() {
    const reg = await getRegistration();
    if (!reg) return;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      const __ep = sub.endpoint;
      await sub.unsubscribe();
      if (sb() && myId) {
        await sb().from('push_subscriptions').delete().eq('user_id', myId).eq('endpoint', __ep);
      }
    }
    toast('اعلان‌های پوش غیرفعال شدند');
    Haptics?.medium?.();
  }

  async function isSubscribed() {
    if (!supported()) return false;
    const reg = await getRegistration();
    if (!reg) return false;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  }

  return { subscribe, unsubscribe, isSubscribed, supported };
})();

(function injectPushToggle() {
  if (!PushManagerClient.supported()) return;
  if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY.includes('REPLACE')) return;
  const tryInject = () => {
    const menu = document.querySelector('#me .menu');
    if (!menu || document.getElementById('push-toggle')) return false;
    const outBtn = menu.querySelector('[data-v="out"]');
    if (!outBtn) return false;

    const btn = document.createElement('button');
    btn.id = 'push-toggle';
    btn.type = 'button';
    const render = async () => {
      const on = await PushManagerClient.isSubscribed();
      btn.innerHTML = `<svg class="icon icon-sm"><use href="#i-bell"></use></svg> اعلان‌های پوش: <b style="color:${on ? 'var(--ac)' : 'var(--mu)'};">${on ? 'فعال' : 'غیرفعال'}</b>`;
    };
    render();
    btn.onclick = async () => {
      const on = await PushManagerClient.isSubscribed();
      if (on) await PushManagerClient.unsubscribe();
      else await PushManagerClient.subscribe();
      render();
    };
    outBtn.parentNode.insertBefore(btn, outBtn);
    return true;
  };
  if (!tryInject()) {
    const obs = new MutationObserver(() => { if (tryInject()) obs.disconnect(); });
    obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => obs.disconnect(), 5000);
  }
})();

function renderActiveFilters(containerId, isWholesale) {
  const box = document.getElementById(containerId);
  if (!box) return;
  const chips = [];
  const q = isWholesale 
    ? document.getElementById("q-wholesale").value.trim()
    : document.getElementById("q").value.trim();
  if (q) chips.push({ label: `🔍 ${q}`, clear: () => { document.getElementById(isWholesale ? "q-wholesale" : "q").value = ""; } });
  const cityVal = +document.getElementById("header-city-select").value;
  if (cityVal >= 0) chips.push({ label: `📍 ${cities[cityVal]}`, clear: () => { document.getElementById("header-city-select").value = -1; } });
  
  if (!isWholesale) {
    if (cat > 0) chips.push({ label: `📂 ${cats[cat]?.[0]}`, clear: () => { cat = 0; } });
    const pmin = document.getElementById("pmin").value;
    const pmax = document.getElementById("pmax").value;
    if (pmin || pmax) chips.push({ 
      label: `💰 ${pmin||'۰'} - ${pmax||'∞'} افغانی`, 
      clear: () => { document.getElementById("pmin").value = ""; document.getElementById("pmax").value = ""; } 
    });
    const cond = document.getElementById("f-cond").value;
    if (cond) chips.push({ label: cond === 'new' ? '✨ نو' : '🔧 کارکرده', clear: () => { document.getElementById("f-cond").value = ""; } });
    if (document.getElementById("urg").checked) chips.push({ label: '⚡ فوری', clear: () => { document.getElementById("urg").checked = false; } });
    if (document.getElementById("f-has-photo").checked) chips.push({ label: '📷 دارای عکس', clear: () => { document.getElementById("f-has-photo").checked = false; } });
    if (document.getElementById("f-shop-only").checked) chips.push({ label: '🏪 فروشگاه رسمی', clear: () => { document.getElementById("f-shop-only").checked = false; } });
  } else {
    if (wholesaleCat > 0) chips.push({ label: `📦 ${wholesaleCats[wholesaleCat]?.[0]}`, clear: () => { wholesaleCat = 0; } });
    const wmin = document.getElementById("wmin").value;
    const wmax = document.getElementById("wmax").value;
    if (wmin || wmax) chips.push({ label: `💰 ${wmin||'۰'} - ${wmax||'∞'}`, clear: () => { document.getElementById("wmin").value = ""; document.getElementById("wmax").value = ""; } });
  }
  
  if (radiusFilterActive) chips.push({ 
    label: `🌐 شعاع ${radiusMaxKm} ک‌م`, 
    clear: () => { radiusFilterActive = false; document.getElementById("radius-status-badge").textContent = "شعاع فعال نیست"; } 
  });
  
  if (chips.length === 0) { box.innerHTML = ""; return; }
  
  box.innerHTML = 
    `<span class="mu" style="font-size:11px;">فیلترهای فعال:</span>` +
    chips.map((c, i) => `<button class="capsule-btn" data-chip-idx="${i}" style="padding:3px 10px;font-size:11px;background:var(--chip);border:1px solid var(--ac);color:var(--ac);border-radius:99px;">${esc(c.label)} ✕</button>`).join("") +
    `<button class="link" id="clear-all-chips-${isWholesale?'w':'r'}" style="font-size:11px;margin:0;">پاک‌کردن همه</button>`;
  
  box.querySelectorAll("[data-chip-idx]").forEach(btn => {
    btn.onclick = () => {
      chips[+btn.dataset.chipIdx].clear();
      if (isWholesale) wholesaleCurrentPage = 1; else currentPage = 1;
      draw();
    };
  });
  box.querySelector(`#clear-all-chips-${isWholesale?'w':'r'}`).onclick = () => resetAllFilters();
}

(function setupNonDataUI() {
  setInterval(() => {
    if (document.hidden) return;
    document.querySelectorAll(".ad .i .mu span[title]").forEach(el => {
      const ts = el.getAttribute("title");
      if (!ts) return;
      try {
        const dt = new Date(ts);
        if (isNaN(dt.getTime())) return;
        const ageH = (Date.now() - dt.getTime()) / 36e5;
        el.textContent = ago(ageH);
      } catch(e) {}
    });
  }, 5 * 60 * 1000);

  (function langToggle(){
    const getLang = () => currentLang;
    const setLang = (l) => { 
      try { localStorage.setItem("ab_lang", l); } catch(e){} 
      currentLang = l;
      cats = catsLocalized[l];
      wholesaleCats = wholesaleCatsLocalized[l];
      applyLang(l); 
    };
    
    const applyLang = (l) => {
      document.documentElement.lang = l === "ps" ? "ps" : "fa";
      const btn = document.getElementById("lang-toggle");
      if (btn) btn.textContent = l === "ps" ? "پښتو" : "دری";
      
      document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        el.innerHTML = t(key);
      });
      
      document.querySelectorAll("[data-i18n-ph]").forEach(el => {
        const key = el.getAttribute("data-i18n-ph");
        el.placeholder = t(key);
      });

      const post = document.getElementById("header-post-btn");
      if (post) {
        const isW = currentAppTab === "wholesale";
        post.textContent = isW ? t('postWholesale') : t('postRetail');
      }
      
      document.querySelectorAll(".bnav-item").forEach(b => {
        const lbl = b.querySelector("span:not(.icon)");
        if (!lbl) return;
        if (b.dataset.target === "retail") lbl.textContent = t('navRetail');
        if (b.dataset.target === "wholesale") lbl.textContent = t('navWholesale');
      });

      if (typeof draw === 'function') draw();
      if (typeof renderSearchHistory === 'function') renderSearchHistory();
    };

    window.__applyLang = () => applyLang(getLang());

    const btn = document.getElementById("lang-toggle");
    if (btn) btn.onclick = () => setLang(getLang() === "fa" ? "ps" : "fa");
    applyLang(getLang());
  })();
})();

(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window)) return;
  const obs=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in-view'); obs.unobserve(e.target); } }),{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.sec').forEach(el=>{ el.setAttribute('data-rv','1'); obs.observe(el); });
  document.documentElement.classList.add('js-reveal');
})();
(function(){
  const bar=document.getElementById('scroll-progress'); if(!bar) return; let raf=false;
  window.addEventListener('scroll',()=>{ if(raf) return; raf=true; requestAnimationFrame(()=>{ const d=document.documentElement,tot=d.scrollHeight-d.clientHeight; bar.style.width=(tot>0?(d.scrollTop/tot)*100:0)+'%'; raf=false; }); },{passive:true});
})();
(async () => {
  try { initVoiceSearch("q"); initVoiceSearch("q-wholesale"); } catch(_) {}
  const _listEl = document.getElementById('list');
  const _wholeEl = document.getElementById('wholesale-list');
  if (_listEl) _listEl.innerHTML = skeletonHTML();
  if (_wholeEl) _wholeEl.innerHTML = skeletonHTML();
  try {
    await initRemote();
  } catch(e) {
    console.error("initRemote failed:", e);
    if (_listEl) _listEl.innerHTML = `<div class="empty" style="text-align:center;">
      <div style="font-size:56px;margin-bottom:8px;">📡</div>
      <div style="font-weight:700;font-size:15px;margin-bottom:6px;">اتصال به سرور برقرار نشد</div>
      <div class="mu" style="margin-bottom:14px;">اینترنت خود را بررسی کنید و دوباره تلاش کنید.</div>
      <button class="capsule-btn primary" onclick="location.reload()" style="margin:0 auto;">تلاش مجدد</button>
    </div>`;
  } finally {
    draw();
  }
})();
