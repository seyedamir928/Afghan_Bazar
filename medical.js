/* افغان‌بازار — بخش «طبابت و صحت» (دسته‌های طبی پرچون و عمده + فیلدهای تخصصی ثبت آگهی + پروفایل صحی ثبت‌نام)
   - قبل از app.js بارگذاری می‌شود و فقط شیء سراسری window.AB_MED را می‌سازد.
   - اندیس دسته‌ها = مقدار فیلد c (پرچون) و wholesaleCat (عمده) آگهی؛ ترتیب این فهرست‌ها را هرگز عوض نکنید، فقط به آخرشان اضافه کنید.
   - پرچون: اندیس ۱۶ = «همه طبابت» (فقط فیلتر)، ۱۷ به بعد زیردسته‌ها
   - عمده:  اندیس ۹  = «همه طبابت عمده» (فقط فیلتر)، ۱۰ به بعد زیردسته‌ها
   - مقادیر select به‌صورت کلید زبان‌مستقل (optMed…) ذخیره و هنگام نمایش ترجمه می‌شوند. */
(function () {
  'use strict';
  var I = { fa: {}, ps: {} };
  // ثبت یک گزینه: [کلید، دری، پشتو]
  function O(list) { return list.map(function (o) { I.fa[o[0]] = o[1]; I.ps[o[0]] = o[2]; return o[0]; }); }
  // ثبت یک فیلد: کلید، برچسب دری، برچسب پشتو، نوع، راهنما، گزینه‌ها، اجباری
  function F(k, fa, ps, ty, ph, oKeys, req) {
    var lKey = 'fldMed_' + k, n = 1;
    while (I.fa[lKey] && I.fa[lKey] !== fa) lKey = 'fldMed_' + k + '_' + (++n); // برچسب متفاوت ⇒ کلید جدا
    I.fa[lKey] = fa; I.ps[lKey] = ps;
    var f = { k: k, lKey: lKey, ty: ty || 'text', ph: ph || '' };
    if (oKeys) { f.ty = 'select'; f.oKeys = oKeys; }
    if (req) f.req = true;
    return f;
  }
  function T(fa, ps) { return { fa: fa, ps: ps }; }

  /* ---------- گزینه‌های مشترک ---------- */
  var YES_NO = ['optHas', 'optNotHas'];
  var ORIGIN = O([
    ['optMedOrgAf', 'افغانستان (تولید داخل)', 'افغانستان (کورنی تولید)'], ['optMedOrgPk', 'پاکستان', 'پاکستان'],
    ['optMedOrgIn', 'هند', 'هند'], ['optMedOrgIr', 'ایران', 'ایران'], ['optMedOrgTr', 'ترکیه', 'ترکیه'],
    ['optMedOrgCn', 'چین', 'چین'], ['optMedOrgEu', 'اروپا (آلمان، فرانسه، سویس…)', 'اروپا (آلمان، فرانسه، سویس…)'],
    ['optMedOrgUs', 'امریکا', 'امریکا'], ['optMedOrgKr', 'کوریا / جاپان', 'کوریا / جاپان'], ['optMedOrgAe', 'امارات / عربستان', 'امارات / عربستان'],
    ['optMedOrgOther', 'سایر کشورها', 'نور هېوادونه']
  ]);
  var DOSAGE = O([
    ['optMedTablet', 'تابلیت (قرص)', 'ټابلېټ (ګولۍ)'], ['optMedCapsule', 'کپسول', 'کپسول'], ['optMedSyrup', 'شربت', 'شربت'],
    ['optMedSusp', 'سوسپانسیون (پودر شربت)', 'سوسپانسیون'], ['optMedInjection', 'امپول / پیچکاری', 'امپول / پیچکاري'],
    ['optMedInfusion', 'سیروم (انفیوژن)', 'سیروم (انفیوژن)'], ['optMedOintment', 'پماد / کریم', 'مرهم / کریم'],
    ['optMedDrops', 'قطره (چشم، گوش، بینی)', 'څاڅکي (سترګې، غوږ، پوزه)'], ['optMedSpray', 'اسپری / انهیلر', 'سپرې / انهیلر'],
    ['optMedSuppository', 'شیاف', 'شیاف'], ['optMedSachet', 'ساشه / پودر', 'ساشه / پوډر'], ['optMedGel', 'ژل / محلول', 'جیل / محلول']
  ]);
  var RX = O([
    ['optMedRxYes', 'نسخه‌ای (فقط با نسخهٔ داکتر)', 'نسخه‌يي (یوازې د ډاکټر په نسخه)'],
    ['optMedRxNo', 'بدون نسخه (OTC)', 'بې نسخې (OTC)']
  ]);
  var STORAGE = O([
    ['optMedStoreRoom', 'دمای اتاق (زیر ۲۵ درجه)', 'د کوټې تودوخه (له ۲۵ درجو کم)'],
    ['optMedStoreCold', 'یخچال (۲ تا ۸ درجه)', 'یخچال (۲ تر ۸ درجې)'],
    ['optMedStoreFrozen', 'منجمد (زیر صفر)', 'کنګل (له صفر لاندې)']
  ]);
  var CERT = O([
    ['optMedCertCE', 'CE (اروپا)', 'CE (اروپا)'], ['optMedCertFDA', 'FDA (امریکا)', 'FDA (امریکا)'],
    ['optMedCertISO', 'ISO 13485', 'ISO 13485'], ['optMedCertGMP', 'GMP', 'GMP'], ['optMedCertWHO', 'WHO-PQ (سازمان جهانی صحت)', 'WHO-PQ (د روغتیا نړیوال سازمان)'],
    ['optMedCertNone', 'بدون گواهی', 'بې سند']
  ]);
  var POWER = O([
    ['optMedPowerAC', 'برق شهری (۲۲۰ ولت)', 'ښاري برېښنا (۲۲۰ ولټ)'], ['optMedPowerBatt', 'باتری / شارژی', 'بیټرۍ / چارجي'],
    ['optMedPowerBoth', 'برق و باتری', 'برېښنا او بیټرۍ'], ['optMedPowerManual', 'دستی (بدون برق)', 'لاسي (بې برېښنا)']
  ]);
  var STERILE = O([['optMedSterile', 'استریل', 'سټرایل'], ['optMedNonSterile', 'غیراستریل', 'غیر سټرایل']]);
  var DEAL = ['optSell', 'optRent'];
  var GENDER = ['optAny', 'optMale', 'optFemale'];

  /* ---------- انواع کالا/خدمت هر دسته ---------- */
  var HOME_DEV = O([
    ['optMedDevBP', 'فشارسنج', 'د فشار اله'], ['optMedDevGluco', 'قندسنج (گلوکومتر)', 'د شکرې اله (ګلوکومېټر)'],
    ['optMedDevThermo', 'ترمامتر', 'ترمامېټر'], ['optMedDevOxi', 'پالس‌اکسیمتر', 'پالس اکسیمېټر'],
    ['optMedDevNeb', 'نبولایزر', 'نبولایزر'], ['optMedDevScale', 'ترازوی طبی', 'طبي تله'],
    ['optMedDevSteth', 'گوشی طبی (استتوسکوپ)', 'سټېتوسکوپ'], ['optMedDevTens', 'دستگاه ماساژ / TENS', 'د مساج اله / TENS'],
    ['optMedDevHear', 'سمعک', 'د اورېدو اله'], ['optMedDevOther', 'سایر وسایل', 'نور وسایل']
  ]);
  var HOSP_EQ = O([
    ['optMedEqECG', 'دستگاه ECG (نوار قلب)', 'د ECG ماشین'], ['optMedEqUS', 'التراسوند (سونوگرافی)', 'الټراساونډ'],
    ['optMedEqXray', 'ایکسری / رادیولوژی', 'اکسرې / راډیولوژي'], ['optMedEqMonitor', 'مانیتور علایم حیاتی', 'د ژوند نښو مانیټر'],
    ['optMedEqDefib', 'دیفیبریلاتور (شوک)', 'ډیفیبرېلاټر'], ['optMedEqVent', 'ونتیلاتور', 'وینټیلېټر'],
    ['optMedEqAuto', 'اتوکلاو / ستریلایزر', 'اتوکلاو / سټرلایزر'], ['optMedEqOR', 'تجهیزات اتاق عمل', 'د عملیاتو خونې تجهیزات'],
    ['optMedEqBed', 'تخت بیمارستانی / برانکارد', 'د روغتون کټ / سټرېچر'], ['optMedEqInstr', 'وسایل جراحی', 'جراحي اوزار'],
    ['optMedEqSuction', 'ساکشن', 'ساکشن'], ['optMedEqInfPump', 'پمپ انفیوژن / سرنگ پمپ', 'د انفیوژن پمپ'],
    ['optMedEqOther', 'سایر تجهیزات', 'نور تجهیزات']
  ]);
  var CONSUM = O([
    ['optMedConSyringe', 'سرنگ', 'سرنج'], ['optMedConGlove', 'دستکش طبی', 'طبي دستکشې'], ['optMedConMask', 'ماسک طبی / N95', 'طبي ماسک / N95'],
    ['optMedConGauze', 'گاز و بانداژ', 'ګاز او بنداژ'], ['optMedConCannula', 'کانولا (آنژیوکت)', 'کانولا'], ['optMedConIV', 'ست سیروم', 'د سیروم سیټ'],
    ['optMedConCath', 'کتتر / سوند', 'کتېټر'], ['optMedConUrine', 'کیسهٔ ادرار', 'د تشو متیازو کڅوړه'], ['optMedConCotton', 'پنبه و الکل طبی', 'مالوچ او طبي الکول'],
    ['optMedConSuture', 'نخ جراحی', 'جراحي تار'], ['optMedConGown', 'گان و لباس یک‌بارمصرف', 'یو ځل مصرفي جامې'], ['optMedConOther', 'سایر', 'نور']
  ]);
  var MATERIAL = O([
    ['optMedMatLatex', 'لاتکس', 'لاټکس'], ['optMedMatNitrile', 'نایتریل', 'نایټرایل'], ['optMedMatVinyl', 'وینایل', 'وینایل'],
    ['optMedMatCotton', 'نخی / پنبه', 'پنبه'], ['optMedMatPlastic', 'پلاستیک طبی', 'طبي پلاستیک'], ['optMedMatSteel', 'استیل ضدزنگ', 'سټیل'],
    ['optMedMatAlu', 'المونیم', 'المونیم'], ['optMedMatSilicone', 'سیلیکون', 'سیلیکون']
  ]);
  var LAB = O([
    ['optMedLabRapid', 'تست سریع (Rapid Test)', 'چټک ټیسټ'], ['optMedLabElisa', 'کیت الایزا (ELISA)', 'د ELISA کیټ'],
    ['optMedLabChem', 'معرف بیوشیمی', 'بیوشیمي معرف'], ['optMedLabHema', 'هماتولوژی (CBC)', 'هیماتولوژي (CBC)'],
    ['optMedLabPCR', 'کیت PCR', 'د PCR کیټ'], ['optMedLabStrip', 'نوار ادرار / نوار قند', 'د تشو متیازو / شکرې پټۍ'],
    ['optMedLabPreg', 'تست حاملگی', 'د امیندوارۍ ټیسټ'], ['optMedLabEquip', 'دستگاه لابراتوار (سانتریفیوژ، آنالایزر، میکروسکوپ)', 'د لابراتوار ماشین'],
    ['optMedLabGlass', 'لوله و ظروف لابراتوار', 'د لابراتوار لوښي']
  ]);
  var DENTAL = O([
    ['optMedDenUnit', 'یونت و چوکی دندان', 'د غاښونو یونټ او څوکۍ'], ['optMedDenHand', 'هندپیس و توربین', 'هینډپیس'],
    ['optMedDenMat', 'مواد پرکردن (کامپوزیت، آمالگام)', 'د ډکولو مواد'], ['optMedDenImplant', 'ایمپلنت', 'امپلانټ'],
    ['optMedDenOrtho', 'ارتودنسی (براکت، سیم)', 'ارتوډونټکس'], ['optMedDenXray', 'رادیوگرافی دندان', 'د غاښونو اکسرې'],
    ['optMedDenInstr', 'وسایل دستی دندان‌پزشکی', 'د غاښونو لاسي اوزار'], ['optMedDenCons', 'مصرفی دندان‌پزشکی', 'مصرفي توکي']
  ]);
  var OPTIC = O([
    ['optMedOptGlasses', 'عینک طبی', 'طبي عینکې'], ['optMedOptSun', 'عینک آفتابی', 'د لمر عینکې'], ['optMedOptContact', 'لنز تماسی', 'تماسي لېنز'],
    ['optMedOptLens', 'شیشهٔ عینک', 'د عینکو ښیښه'], ['optMedOptFrame', 'فریم عینک', 'د عینکو چوکاټ'], ['optMedOptEquip', 'دستگاه بینایی‌سنجی / چشم‌پزشکی', 'د سترګو ماشینونه']
  ]);
  var FRAME = O([
    ['optMedFrMetal', 'فلزی', 'فلزي'], ['optMedFrPlastic', 'پلاستیکی / استات', 'پلاستیکي'], ['optMedFrTitan', 'تیتانیوم', 'ټیټانیوم'], ['optMedFrRimless', 'بدون فریم', 'بې چوکاټه']
  ]);
  var RESP = O([
    ['optMedResConc', 'دستگاه اکسیژن‌ساز (کنسانتریتور)', 'د اکسیجن جوړولو ماشین'], ['optMedResCyl', 'کپسول (سلندر) اکسیژن', 'د اکسیجن سلنډر'],
    ['optMedResRefill', 'پرکردن اکسیژن', 'د اکسیجن ډکول'], ['optMedResCpap', 'CPAP / BiPAP', 'CPAP / BiPAP'],
    ['optMedResVent', 'ونتیلاتور', 'وینټیلېټر'], ['optMedResNeb', 'نبولایزر', 'نبولایزر'],
    ['optMedResMask', 'ماسک و کانولای اکسیژن', 'د اکسیجن ماسک'], ['optMedResReg', 'مانومتر و رگلاتور', 'مانومېټر او ریګولېټر'],
    ['optMedResLiquid', 'اکسیژن مایع', 'مایع اکسیجن'], ['optMedResN2O', 'گازهای طبی دیگر (N2O، CO2)', 'نور طبي ګازونه']
  ]);
  var REHAB = O([
    ['optMedRehWheel', 'ویلچر', 'ویلچېر'], ['optMedRehWalker', 'واکر', 'واکر'], ['optMedRehCrutch', 'عصا و چوب زیر بغل', 'امسا او بیساکۍ'],
    ['optMedRehBrace', 'کمربند و زانوبند طبی', 'طبي کمربند او د ګونډو بند'], ['optMedRehSplint', 'آتل و گچ', 'اټل او ګچ'],
    ['optMedRehBed', 'تخت طبی خانگی', 'کورنی طبي کټ'], ['optMedRehPhysio', 'دستگاه فیزیوتراپی', 'د فزیوتراپۍ ماشین'],
    ['optMedRehProst', 'پروتز (اندام مصنوعی)', 'مصنوعي غړی'], ['optMedRehMattress', 'تشک مواج ضد زخم بستر', 'د زخم ضد تشک']
  ]);
  var BABY = O([
    ['optMedBabyFormula', 'شیر خشک', 'وچې شیدې'], ['optMedBabyDiaper', 'پوشک (پمپرز)', 'پمپرز'], ['optMedBabyBottle', 'شیشهٔ شیر و پستانک', 'د شیدو بوتل او چوشک'],
    ['optMedBabyPump', 'شیردوش', 'د شیدو پمپ'], ['optMedBabyCare', 'مراقبت و بهداشت کودک', 'د ماشوم پاملرنه'],
    ['optMedBabyMother', 'محصولات دوران بارداری و زایمان', 'د امیندوارۍ توکي'], ['optMedBabyFood', 'غذای کودک (سرلاک)', 'د ماشوم خواړه (سرلاک)']
  ]);
  var SUPP = O([
    ['optMedSupMulti', 'مولتی‌ویتامین', 'ملټي ویټامین'], ['optMedSupD', 'ویتامین D', 'ویټامین D'], ['optMedSupIron', 'آهن و فولیک‌اسید', 'اوسپنه او فولیک اسید'],
    ['optMedSupCa', 'کلسیم و منیزیم', 'کلسیم او مګنیزیم'], ['optMedSupOmega', 'امگا-۳', 'اومېګا-۳'], ['optMedSupZinc', 'زینک و ویتامین C', 'زینک او ویټامین C'],
    ['optMedSupProtein', 'پروتئین و مکمل ورزشی', 'پروټین او ورزشي مکمل'], ['optMedSupHerbal', 'مکمل گیاهی', 'بوټيز مکمل']
  ]);
  var HERB_PART = O([
    ['optMedHerbRoot', 'ریشه', 'ریښه'], ['optMedHerbLeaf', 'برگ', 'پاڼه'], ['optMedHerbFlower', 'گل', 'ګل'],
    ['optMedHerbSeed', 'تخم / دانه', 'تخم'], ['optMedHerbBark', 'پوست / ساقه', 'پوستکی / ډنډ'], ['optMedHerbWhole', 'کل گیاه', 'ټول بوټی'], ['optMedHerbResin', 'صمغ / شیره', 'ژاوله']
  ]);
  var HERB_FORM = O([
    ['optMedHerbDry', 'خشک', 'وچ'], ['optMedHerbPowder', 'پودر', 'پوډر'], ['optMedHerbOil', 'روغن', 'غوړي'],
    ['optMedHerbExtract', 'عصاره / قطره', 'عصاره'], ['optMedHerbDistil', 'عرق گیاهی', 'بوټيز عرق'], ['optMedHerbTea', 'دمنوش', 'دمنوش']
  ]);
  var VET_ANIMAL = O([
    ['optMedVetCattle', 'گاو و گوساله', 'غوا او خوسکی'], ['optMedVetSheep', 'گوسفند و بز', 'پسه او وزه'], ['optMedVetPoultry', 'مرغ و طیور', 'چرګان'],
    ['optMedVetHorse', 'اسپ و خر', 'اس او خر'], ['optMedVetCamel', 'شتر', 'اوښ'], ['optMedVetPet', 'سگ و پشک', 'سپی او پیشو'], ['optMedVetAll', 'همه حیوانات', 'ټول څاروي']
  ]);
  var VET_TYPE = O([
    ['optMedVetDrug', 'دوای حیوانی', 'د څارویو درمل'], ['optMedVetVaccine', 'واکسین', 'واکسین'], ['optMedVetDeworm', 'ضدانگل', 'د چینجو ضد'],
    ['optMedVetSupp', 'مکمل و ویتامین دامی', 'د څارویو ویټامین'], ['optMedVetEquip', 'وسایل دامپزشکی', 'د وترنرۍ وسایل']
  ]);
  var SPECIALTY = O([
    ['optMedSpGeneral', 'داکتر عمومی', 'عمومي ډاکټر'], ['optMedSpInternal', 'داخله', 'داخله'], ['optMedSpPeds', 'اطفال', 'ماشومان'],
    ['optMedSpGyn', 'نسایی و ولادی', 'نسایي او ولادي'], ['optMedSpSurg', 'جراحی عمومی', 'عمومي جراحي'], ['optMedSpOrtho', 'ارتوپیدی (استخوان)', 'ارتوپيډي (هډوکي)'],
    ['optMedSpCardio', 'قلب', 'زړه'], ['optMedSpNeuro', 'عصبی (نیورولوژی)', 'عصبي (نیورولوژي)'], ['optMedSpDerm', 'جلدی', 'جلدي'],
    ['optMedSpENT', 'گوش، گلو و بینی', 'غوږ، ستونی او پوزه'], ['optMedSpEye', 'چشم', 'سترګې'], ['optMedSpDental', 'دندان', 'غاښونه'],
    ['optMedSpPsych', 'روانی', 'رواني'], ['optMedSpUro', 'یورولوژی', 'یورولوژي'], ['optMedSpGI', 'گوارش', 'هاضمه'],
    ['optMedSpOnco', 'سرطان (انکولوژی)', 'سرطان (انکولوژي)'], ['optMedSpPhysio', 'فیزیوتراپی', 'فزیوتراپي'], ['optMedSpNurse', 'نرسنگ / پرستاری', 'نرسنګ'],
    ['optMedSpMidwife', 'قابلگی', 'قابله ګي'], ['optMedSpLab', 'لابراتوار', 'لابراتوار'], ['optMedSpRadio', 'رادیولوژی', 'راډیولوژي'],
    ['optMedSpNutri', 'تغذیه', 'تغذیه'], ['optMedSpPharm', 'فارمسی', 'فارمسي'], ['optMedSpVet', 'دامپزشکی', 'وترنري']
  ]);
  var PROVIDER = O([
    ['optMedProvDoctor', 'داکتر / مطب', 'ډاکټر / کلینیک'], ['optMedProvClinic', 'کلینیک', 'کلینیک'], ['optMedProvHospital', 'شفاخانه', 'روغتون'],
    ['optMedProvLab', 'لابراتوار', 'لابراتوار'], ['optMedProvImaging', 'مرکز رادیولوژی و سونوگرافی', 'د راډیولوژۍ مرکز'],
    ['optMedProvPharmacy', 'دواخانه', 'درملتون'], ['optMedProvNurse', 'نرس و مراقبت در خانه', 'په کور کې نرس'],
    ['optMedProvAmbulance', 'امبولانس', 'امبولانس'], ['optMedProvPhysio', 'مرکز فیزیوتراپی', 'د فزیوتراپۍ مرکز']
  ]);
  var JOB_POS = O([
    ['optMedJobSpecialist', 'داکتر متخصص', 'متخصص ډاکټر'], ['optMedJobGP', 'داکتر عمومی', 'عمومي ډاکټر'], ['optMedJobNurse', 'نرس', 'نرس'],
    ['optMedJobMidwife', 'قابله', 'قابله'], ['optMedJobPharm', 'فارمسست', 'فارمسسټ'], ['optMedJobLab', 'تکنیشن لابراتوار', 'د لابراتوار تخنیکر'],
    ['optMedJobRadio', 'تکنیشن رادیولوژی', 'د راډیولوژۍ تخنیکر'], ['optMedJobDentist', 'داکتر دندان', 'د غاښونو ډاکټر'],
    ['optMedJobPhysio', 'فیزیوتراپیست', 'فزیوتراپسټ'], ['optMedJobRep', 'نمایندهٔ دوا (ویزیتور)', 'د درملو استازی'],
    ['optMedJobAdmin', 'اداری و پذیرش شفاخانه', 'اداري او پذیرش']
  ]);
  var DEGREE = O([
    ['optMedDegSpec', 'تخصص', 'تخصص'], ['optMedDegMD', 'دیپلوم طب (MD)', 'د طب ډیپلوم (MD)'], ['optMedDegBach', 'لیسانس', 'لیسانس'],
    ['optMedDegInst', 'انستیتوت صحی (فوق بکلوریا)', 'روغتیايي انسټیټیوټ'], ['optMedDegCert', 'سرتفیکت / کورس', 'سند / کورس']
  ]);
  var SHIFT = O([['optMedShiftDay', 'روزانه', 'د ورځې'], ['optMedShiftNight', 'شبانه', 'د شپې'], ['optMedShiftRot', 'نوبتی (چرخشی)', 'نوبتي']]);

  /* ---------- فیلدهای پرتکرار ---------- */
  var f_brand = function () { return F('brand', 'برند / شرکت سازنده', 'برانډ / جوړونکی شرکت', 'text', 'مثلاً Omron، Getz، Sami'); };
  var f_origin = function () { return F('origin', 'کشور سازنده', 'جوړونکی هېواد', 0, 0, ORIGIN); };
  var f_expiry = function (req) { return F('expiry', 'تاریخ انقضا', 'د پای نېټه', 'month', '', null, req); };
  var f_storage = function () { return F('storage', 'شرایط نگهداری', 'د ساتنې شرایط', 0, 0, STORAGE); };
  var f_cert = function () { return F('cert', 'گواهی کیفیت', 'د کیفیت سند', 0, 0, CERT); };
  var f_warranty = function () { return F('warranty', 'گارانتی', 'ګرنټي', 0, 0, YES_NO); };
  var f_power = function () { return F('power', 'منبع برق', 'د برېښنا سرچینه', 0, 0, POWER); };
  var f_carton = function () { return F('cartonQty', 'تعداد در هر کارتن', 'په هر کارتن کې شمېر', 'number', 'مثلاً ۱۰۰'); };
  var f_license = function (fa, ps) { return F('license', fa || 'شمارهٔ جواز وزارت صحت عامه', ps || 'د عامې روغتیا وزارت د جواز شمېره', 'text', 'مثلاً MoPH-12345'); };

  /* ---------- دسته‌های پرچون ---------- */
  var R0 = 16;
  var retail = [
    { fa: 'همه طبابت و صحت', ps: 'ټول طبابت او روغتیا', e: '⚕️', all: true },
    { fa: 'دوا و دواخانه', ps: 'درمل او درملتون', e: '💊', slug: 'medicine-pharmacy', condition: false, notice: 'rx',
      fields: [F('generic', 'نام ژنریک / مادهٔ مؤثره', 'جنریک نوم / اغېزناک توکی', 'text', 'مثلاً Amoxicillin', null, true),
        F('dosage', 'شکل دوا', 'د درملو بڼه', 0, 0, DOSAGE, true), F('strength', 'دوز / قدرت', 'دوز / قوت', 'text', 'مثلاً ۵۰۰ mg'),
        F('pack', 'بسته‌بندی', 'بسته بندي', 'text', 'مثلاً ۲۰ تابلیت، ۱۲۰ ml'), f_brand(), f_origin(), f_expiry(true),
        F('rx', 'نوع فروش', 'د پلور ډول', 0, 0, RX, true), f_storage(), f_license('شمارهٔ جواز دواخانه', 'د درملتون د جواز شمېره')] },
    { fa: 'وسایل طبی خانگی (فشارسنج، قندسنج)', ps: 'کورني طبي وسایل (د فشار او شکرې اله)', e: '🩺', slug: 'home-medical-devices', condition: true,
      fields: [F('devType', 'نوع وسیله', 'د وسیلې ډول', 0, 0, HOME_DEV, true), f_brand(), F('model', 'مدل', 'ماډل', 'text', 'مثلاً M3 Comfort'),
        f_origin(), f_power(), f_warranty(), f_cert()] },
    { fa: 'تجهیزات کلینیک و شفاخانه', ps: 'د کلینیک او روغتون تجهیزات', e: '🛏️', slug: 'hospital-equipment', condition: true,
      fields: [F('equipType', 'نوع تجهیزات', 'د تجهیزاتو ډول', 0, 0, HOSP_EQ, true), f_brand(), F('model', 'مدل', 'ماډل', 'text', 'مثلاً Mindray DC-30'),
        F('year', 'سال ساخت', 'د جوړېدو کال', 'number', 'مثلاً ۲۰۲۲'), f_origin(), f_cert(), f_power(),
        F('install', 'نصب و آموزش', 'نصب او روزنه', 0, 0, YES_NO), F('warrantyMonths', 'گارانتی (ماه)', 'ګرنټي (میاشت)', 'number', 'مثلاً ۱۲')] },
    { fa: 'لوازم مصرفی طبی (سرنگ، دستکش، ماسک)', ps: 'طبي مصرفي توکي (سرنج، دستکشې، ماسک)', e: '🧤', slug: 'medical-consumables', condition: false,
      fields: [F('itemType', 'نوع کالا', 'د توکي ډول', 0, 0, CONSUM, true), F('size', 'سایز / اندازه', 'سایز / اندازه', 'text', 'مثلاً 5ml، سایز M، 22G'),
        F('material', 'جنس', 'جنس', 0, 0, MATERIAL), F('sterile', 'استریل بودن', 'سټرایل', 0, 0, STERILE),
        F('packQty', 'تعداد در بسته', 'په بسته کې شمېر', 'number', 'مثلاً ۱۰۰'), f_expiry(), f_origin(), f_brand()] },
    { fa: 'لابراتوار و کیت تشخیصی', ps: 'لابراتوار او تشخیصي کیټونه', e: '🔬', slug: 'lab-diagnostics', condition: true, notice: 'cold',
      fields: [F('kitType', 'نوع کیت / دستگاه', 'د کیټ / ماشین ډول', 0, 0, LAB, true), F('tests', 'تعداد تست در بسته', 'په بسته کې د ټیسټونو شمېر', 'number', 'مثلاً ۲۵'),
        F('sensitivity', 'حساسیت / دقت', 'حساسیت / دقت', 'text', 'مثلاً ۹۹٪'), f_brand(), f_expiry(), f_storage(), f_origin(), f_cert()] },
    { fa: 'دندان‌پزشکی', ps: 'د غاښونو طبابت', e: '🦷', slug: 'dental', condition: true,
      fields: [F('itemType', 'نوع کالا', 'د توکي ډول', 0, 0, DENTAL, true), f_brand(), f_origin(), f_cert(), f_warranty(), f_expiry()] },
    { fa: 'عینک و چشم‌پزشکی', ps: 'عینکې او د سترګو طبابت', e: '👓', slug: 'optical', condition: true,
      fields: [F('opType', 'نوع کالا', 'د توکي ډول', 0, 0, OPTIC, true), F('power', 'نمره (دیوپتر)', 'نمره (ډیوپټر)', 'text', 'مثلاً ‎-2.25'),
        F('frame', 'جنس فریم', 'د چوکاټ جنس', 0, 0, FRAME), F('gender', 'مناسب برای', 'د چا لپاره', 0, 0, GENDER),
        F('uv', 'محافظ UV / بلولایت', 'د UV ساتنه', 0, 0, YES_NO), f_brand()] },
    { fa: 'اکسیژن و تجهیزات تنفسی', ps: 'اکسیجن او تنفسي تجهیزات', e: '🫁', slug: 'oxygen-respiratory', condition: true,
      fields: [F('resType', 'نوع کالا / خدمت', 'د توکي / خدمت ډول', 0, 0, RESP, true), F('capacity', 'ظرفیت', 'ظرفیت', 'text', 'مثلاً ۵ لیتر در دقیقه، ۴۰ لیتری'),
        F('purity', 'خلوص اکسیژن', 'د اکسیجن خالصوالی', 'text', 'مثلاً ۹۳٪'), F('deal', 'نوع معامله', 'د معاملې ډول', 0, 0, DEAL),
        f_brand(), f_power(), f_warranty(), F('delivery', 'تحویل در خانه', 'کور ته رسول', 0, 0, YES_NO)] },
    { fa: 'ارتوپدی و توانبخشی (ویلچر، واکر)', ps: 'ارتوپيډي او بیارغونه (ویلچېر، واکر)', e: '♿', slug: 'rehab-orthopedic', condition: true,
      fields: [F('rehType', 'نوع کالا', 'د توکي ډول', 0, 0, REHAB, true), F('size', 'سایز', 'سایز', 'text', 'مثلاً L، ۴۶ سانتی'),
        F('maxWeight', 'حداکثر وزن قابل تحمل (کیلو)', 'اعظمي وزن (کیلو)', 'number', 'مثلاً ۱۲۰'), F('foldable', 'تاشو', 'قاتېدونکی', 0, 0, YES_NO),
        F('material', 'جنس', 'جنس', 0, 0, MATERIAL), F('deal', 'نوع معامله', 'د معاملې ډول', 0, 0, DEAL), f_brand()] },
    { fa: 'مادر و کودک (شیر خشک، پوشک)', ps: 'مور او ماشوم (وچې شیدې، پمپرز)', e: '🍼', slug: 'mother-baby', condition: false,
      fields: [F('babyType', 'نوع کالا', 'د توکي ډول', 0, 0, BABY, true), F('age', 'رده سنی', 'د عمر ډله', 'text', 'مثلاً ۰ تا ۶ ماه'),
        F('size', 'سایز / وزن', 'سایز / وزن', 'text', 'مثلاً سایز ۳، ۴۰۰ گرم'), f_brand(), f_expiry(true), f_origin()] },
    { fa: 'مکمل و ویتامین', ps: 'مکمل او ویټامینونه', e: '💪', slug: 'supplements', condition: false,
      fields: [F('supType', 'نوع مکمل', 'د مکمل ډول', 0, 0, SUPP, true), F('dosage', 'شکل', 'بڼه', 0, 0, DOSAGE),
        F('count', 'تعداد در قوطی', 'په قطۍ کې شمېر', 'number', 'مثلاً ۶۰'), F('strength', 'دوز', 'دوز', 'text', 'مثلاً 1000 IU'),
        f_brand(), f_expiry(true), f_origin(), F('halal', 'گواهی حلال', 'د حلال سند', 0, 0, YES_NO)] },
    { fa: 'طب سنتی و گیاهان دارویی', ps: 'دودیز طب او درملي بوټي', e: '🌿', slug: 'herbal-traditional', condition: false,
      fields: [F('plant', 'نام گیاه / محصول', 'د بوټي / محصول نوم', 'text', 'مثلاً زعفران، شیرین‌بویه، زیره', null, true),
        F('part', 'بخش مصرفی', 'کارېدونکې برخه', 0, 0, HERB_PART), F('herbForm', 'شکل محصول', 'د محصول بڼه', 0, 0, HERB_FORM),
        F('weight', 'وزن / حجم', 'وزن / حجم', 'text', 'مثلاً ۲۵۰ گرم'), F('originProv', 'ولایت / منطقهٔ تولید', 'د تولید ولایت', 'text', 'مثلاً هرات، بدخشان'),
        F('organic', 'ارگانیک (بدون کود کیمیایی)', 'ارګانیک', 0, 0, YES_NO), f_expiry()] },
    { fa: 'دامپزشکی (دوا و وسایل)', ps: 'وترنري (درمل او وسایل)', e: '🐄', slug: 'veterinary', condition: false, notice: 'rx',
      fields: [F('animal', 'نوع حیوان', 'د څاروي ډول', 0, 0, VET_ANIMAL, true), F('vetType', 'نوع محصول', 'د محصول ډول', 0, 0, VET_TYPE, true),
        F('dosage', 'شکل دوا', 'د درملو بڼه', 0, 0, DOSAGE), F('pack', 'بسته‌بندی', 'بسته بندي', 'text', 'مثلاً ۱۰۰ ml، ۵۰ دوز'),
        f_brand(), f_expiry(true), f_storage(), f_origin()] },
    { fa: 'خدمات صحی، داکتران و کلینیک‌ها', ps: 'روغتیايي خدمات، ډاکټران او کلینیکونه', e: '🏥', slug: 'health-services', condition: false, specRow: false,
      fields: [F('provider', 'نوع مرکز / ارائه‌دهنده', 'د مرکز ډول', 0, 0, PROVIDER, true), F('specialty', 'رشتهٔ تخصصی', 'تخصصي څانګه', 0, 0, SPECIALTY, true),
        F('doctor', 'نام داکتر / مسئول فنی', 'د ډاکټر نوم', 'text', 'مثلاً داکتر احمد کریمی'), F('fee', 'فیس معاینه (افغانی)', 'د معاینې فیس (افغانۍ)', 'number', 'مثلاً ۳۰۰'),
        F('hours', 'ساعات کاری', 'کاري ساعتونه', 'text', 'مثلاً شنبه تا پنجشنبه ۸ تا ۴'), F('homeVisit', 'معاینه در خانه', 'په کور کې معاینه', 0, 0, YES_NO),
        F('doctorGender', 'جنسیت داکتر', 'د ډاکټر جنسیت', 0, 0, GENDER), F('experience', 'سابقهٔ کار', 'کاري تجربه', 'text', 'مثلاً ۱۰ سال'),
        f_license('شمارهٔ جواز فعالیت (وزارت صحت)', 'د فعالیت جواز شمېره')] },
    { fa: 'استخدام صحی (داکتر، نرس، فارمسست)', ps: 'روغتیايي دندې (ډاکټر، نرس، فارمسسټ)', e: '🥼', slug: 'health-jobs', condition: false, specRow: false,
      fields: [F('position', 'عنوان وظیفه', 'د دندې عنوان', 0, 0, JOB_POS, true), F('specialty', 'رشتهٔ مورد نیاز', 'اړینه څانګه', 0, 0, SPECIALTY),
        F('jobType', 'نوع قرارداد', 'د قرارداد ډول', 0, 0, ['optFullTime', 'optPartTime', 'optContract']), F('shift', 'نوبت کاری', 'کاري نوبت', 0, 0, SHIFT),
        F('degree', 'حداقل تحصیلات', 'لږ تر لږه زده کړې', 0, 0, DEGREE), F('experience', 'سابقهٔ لازم', 'اړینه تجربه', 'text', 'مثلاً ۲ سال'),
        F('salary', 'معاش ماهانه (افغانی)', 'میاشتنی معاش (افغانۍ)', 'number', 'مثلاً ۳۵۰۰۰'), F('gender', 'جنسیت', 'جنسیت', 0, 0, GENDER),
        F('licenseReq', 'جواز شورای طبی لازم است', 'د طبي شورا جواز اړین', 0, 0, YES_NO)] }
  ];

  /* ---------- دسته‌های عمده ---------- */
  var W0 = 9;
  var wholesale = [
    { fa: 'همه طبابت عمده', ps: 'ټول طبي عمده', e: '⚕️', all: true },
    { fa: 'دوا عمده (شرکت‌های وارداتی و تولیدی)', ps: 'عمده درمل (وارداتي او تولیدي شرکتونه)', e: '💊', notice: 'rx',
      fields: [F('generic', 'نام ژنریک / مادهٔ مؤثره', 'جنریک نوم', 'text', 'مثلاً Paracetamol', null, true), F('dosage', 'شکل دوا', 'د درملو بڼه', 0, 0, DOSAGE, true),
        F('strength', 'دوز / قدرت', 'دوز / قوت', 'text', 'مثلاً ۵۰۰ mg'), F('packing', 'بسته‌بندی کارتن', 'د کارتن بسته بندي', 'text', 'مثلاً کارتن ۱۰۰ بسته ۱۰ تایی'),
        f_brand(), f_origin(), f_expiry(true), F('batch', 'شمارهٔ بچ (Batch)', 'د بیچ شمېره', 'text', 'مثلاً B2311'), f_storage(),
        F('gmp', 'گواهی GMP کارخانه', 'د GMP سند', 0, 0, YES_NO), f_license('جواز وارداتی / ادارهٔ ملی غذا و دوا', 'د وارداتو جواز / د خوړو او درملو ملي اداره')] },
    { fa: 'تجهیزات طبی و شفاخانه‌ای (عمده)', ps: 'طبي او روغتون تجهیزات (عمده)', e: '🛏️',
      fields: [F('equipType', 'نوع تجهیزات', 'د تجهیزاتو ډول', 0, 0, HOSP_EQ.concat(HOME_DEV), true), f_brand(), f_origin(), f_cert(),
        F('warrantyMonths', 'گارانتی (ماه)', 'ګرنټي (میاشت)', 'number', 'مثلاً ۱۲'), F('install', 'نصب و آموزش', 'نصب او روزنه', 0, 0, YES_NO),
        F('afterSales', 'خدمات پس از فروش و قطعات', 'له پلور وروسته خدمات', 0, 0, YES_NO), F('leadTime', 'زمان تحویل', 'د سپارلو وخت', 'text', 'مثلاً ۲ هفته')] },
    { fa: 'لوازم مصرفی طبی (کارتن و عمده)', ps: 'طبي مصرفي توکي (کارتن)', e: '🧤',
      fields: [F('itemType', 'نوع کالا', 'د توکي ډول', 0, 0, CONSUM, true), F('material', 'جنس', 'جنس', 0, 0, MATERIAL), F('sterile', 'استریل بودن', 'سټرایل', 0, 0, STERILE),
        F('size', 'سایز / اندازه', 'سایز', 'text', 'مثلاً 3ml، سایز L'), f_carton(), f_expiry(), f_origin(), f_cert()] },
    { fa: 'کیت و مواد لابراتوار (عمده)', ps: 'د لابراتوار کیټونه او مواد (عمده)', e: '🔬', notice: 'cold',
      fields: [F('kitType', 'نوع کیت / دستگاه', 'د کیټ ډول', 0, 0, LAB, true), F('tests', 'تعداد تست در هر بسته', 'په بسته کې ټیسټونه', 'number', 'مثلاً ۱۰۰'),
        f_carton(), f_brand(), f_expiry(true), f_storage(), f_origin(), f_cert()] },
    { fa: 'مواد و تجهیزات دندان‌پزشکی (عمده)', ps: 'د غاښونو مواد او تجهیزات (عمده)', e: '🦷',
      fields: [F('itemType', 'نوع کالا', 'د توکي ډول', 0, 0, DENTAL, true), f_brand(), f_origin(), f_cert(), f_carton(), f_expiry()] },
    { fa: 'عینک، لنز و تجهیزات اپتیک (عمده)', ps: 'عینکې، لېنز او اپټیک (عمده)', e: '👓',
      fields: [F('opType', 'نوع کالا', 'د توکي ډول', 0, 0, OPTIC, true), F('frame', 'جنس فریم', 'د چوکاټ جنس', 0, 0, FRAME), f_carton(), f_brand(), f_origin()] },
    { fa: 'اکسیژن و گازهای طبی (عمده)', ps: 'اکسیجن او طبي ګازونه (عمده)', e: '🫁',
      fields: [F('resType', 'نوع کالا / خدمت', 'د توکي ډول', 0, 0, RESP, true), F('capacity', 'ظرفیت / حجم', 'ظرفیت', 'text', 'مثلاً سلندر ۴۰ لیتری، ۱۰۰۰ مترمکعب'),
        F('purity', 'خلوص', 'خالصوالی', 'text', 'مثلاً ۹۹.۵٪'), F('delivery', 'انتقال تا شفاخانه', 'روغتون ته لېږد', 0, 0, YES_NO), f_origin(), f_cert()] },
    { fa: 'شیر خشک و محصولات کودک (عمده)', ps: 'وچې شیدې او د ماشوم توکي (عمده)', e: '🍼',
      fields: [F('babyType', 'نوع کالا', 'د توکي ډول', 0, 0, BABY, true), f_brand(), F('age', 'رده سنی', 'د عمر ډله', 'text', 'مثلاً ۶ تا ۱۲ ماه'), f_carton(), f_expiry(true), f_origin()] },
    { fa: 'مکمل، ویتامین و گیاهان دارویی (عمده)', ps: 'مکمل، ویټامین او درملي بوټي (عمده)', e: '🌿',
      fields: [F('supType', 'نوع محصول', 'د محصول ډول', 0, 0, SUPP, true), F('dosage', 'شکل', 'بڼه', 0, 0, DOSAGE.concat(HERB_FORM)),
        f_carton(), f_brand(), f_expiry(true), f_origin(), F('halal', 'گواهی حلال', 'د حلال سند', 0, 0, YES_NO)] },
    { fa: 'دوا و وسایل دامپزشکی (عمده)', ps: 'د وترنرۍ درمل او وسایل (عمده)', e: '🐄', notice: 'rx',
      fields: [F('animal', 'نوع حیوان', 'د څاروي ډول', 0, 0, VET_ANIMAL, true), F('vetType', 'نوع محصول', 'د محصول ډول', 0, 0, VET_TYPE, true),
        F('dosage', 'شکل دوا', 'د درملو بڼه', 0, 0, DOSAGE), f_carton(), f_brand(), f_expiry(true), f_storage(), f_origin()] },
    { fa: 'تجهیزات توانبخشی و ارتوپدی (عمده)', ps: 'د بیارغونې او ارتوپيډۍ تجهیزات (عمده)', e: '♿',
      fields: [F('rehType', 'نوع کالا', 'د توکي ډول', 0, 0, REHAB, true), F('material', 'جنس', 'جنس', 0, 0, MATERIAL), f_carton(), f_brand(), f_origin(), f_cert()] }
  ];

  /* ---------- پروفایل صحی در ثبت‌نام ---------- */
  var ROLE = O([
    ['optMedRoleDoctor', 'داکتر', 'ډاکټر'], ['optMedRoleDentist', 'داکتر دندان', 'د غاښونو ډاکټر'], ['optMedRolePharmacist', 'فارمسست', 'فارمسسټ'],
    ['optMedRolePharmacy', 'دواخانه', 'درملتون'], ['optMedRoleNurse', 'نرس / قابله', 'نرس / قابله'], ['optMedRoleClinic', 'کلینیک / شفاخانه', 'کلینیک / روغتون'],
    ['optMedRoleLab', 'لابراتوار / رادیولوژی', 'لابراتوار / راډیولوژي'], ['optMedRoleImporter', 'شرکت وارد کنندهٔ دوا', 'د درملو واردوونکی شرکت'],
    ['optMedRoleManufacturer', 'کارخانهٔ تولید دوا', 'د درملو فابریکه'], ['optMedRoleEquip', 'فروشندهٔ تجهیزات طبی', 'د طبي تجهیزاتو پلورونکی'],
    ['optMedRoleOptic', 'عینک‌سازی / اپتیک', 'عینک جوړونه'], ['optMedRoleHerbal', 'عطاری / طب سنتی', 'عطاري / دودیز طب'], ['optMedRoleVet', 'دامپزشک', 'وترنر']
  ]);
  var profileFields = [
    F('role', 'نوع فعالیت صحی', 'د روغتیايي فعالیت ډول', 0, 0, ROLE, true),
    F('specialty', 'رشتهٔ تخصصی', 'تخصصي څانګه', 0, 0, SPECIALTY),
    F('org', 'نام مرکز / شرکت / دواخانه', 'د مرکز / شرکت نوم', 'text', 'مثلاً دواخانهٔ شفا'),
    f_license('شمارهٔ جواز (وزارت صحت / شورای طبی)', 'د جواز شمېره (روغتیا وزارت / طبي شورا)'),
    F('experience', 'سابقهٔ کار', 'کاري تجربه', 'text', 'مثلاً ۸ سال'),
    F('phoneWork', 'شمارهٔ تماس مرکز', 'د مرکز د اړیکې شمېره', 'tel', '07…')
  ];

  Object.assign(I.fa, {
    medGroup: 'طبابت و صحت', medGroupSub: 'دوا، تجهیزات طبی، داکتران و خدمات صحی', medWholesaleGroup: 'طبابت و صحت (عمده)',
    medGroupBadge: 'طبابت', medGeneral: 'دسته‌های عمومی', medSpecSection: '⚕️ مشخصات تخصصی طبی', medReqMark: '(الزامی)',
    medNoticeGeneral: 'آگهی‌های طبی باید مطابق مقررات وزارت صحت عامه و ادارهٔ ملی غذا و دوا باشد. اطلاعات تخصصی را دقیق و کامل وارد کنید.',
    medNoticeRx: 'فروش دواهای نسخه‌ای فقط توسط دواخانه یا شرکت دارای جواز مجاز است. دواهای مخدر، روان‌گردان، تاریخ‌گذشته یا بدون نشان رسمی ممنوع است و آگهی رد می‌شود.',
    medNoticeCold: 'کیت‌ها و معرف‌های یخچالی باید با زنجیرهٔ سرد (۲ تا ۸ درجه) نگهداری و انتقال شوند.',
    medErrRequired: 'لطفاً فیلد «{f}» را پر کنید.', medErrExpired: 'تاریخ انقضا گذشته است؛ فروش کالای تاریخ‌گذشته ممنوع است.',
    medSignupToggle: '⚕️ حساب صحی / طبی (داکتر، دواخانه، شرکت دوا، کلینیک…)', medSignupHint: 'با تکمیل این بخش، نشان «فعال صحی» روی پروفایل و آگهی‌های طبی شما نمایش داده می‌شود.',
    medSignupTitle: 'مشخصات تخصصی صحی', medProfileBadge: 'فعال صحی', medExpiryLabel: 'انقضا'
  });
  Object.assign(I.ps, {
    medGroup: 'طبابت او روغتیا', medGroupSub: 'درمل، طبي تجهیزات، ډاکټران او روغتیايي خدمات', medWholesaleGroup: 'طبابت او روغتیا (عمده)',
    medGroupBadge: 'طبابت', medGeneral: 'عمومي کټګورۍ', medSpecSection: '⚕️ تخصصي طبي ځانګړتیاوې', medReqMark: '(اړین)',
    medNoticeGeneral: 'طبي اعلانونه باید د عامې روغتیا وزارت او د خوړو او درملو ملي ادارې له مقرراتو سره سم وي. تخصصي معلومات دقیق ولیکئ.',
    medNoticeRx: 'نسخه‌يي درمل یوازې جوازلرونکي درملتونونه یا شرکتونه پلورلی شي. مخدره، رواني، تېرې نېټې یا بې رسمي نښې درمل منع دي او اعلان ردېږي.',
    medNoticeCold: 'یخچالي کیټونه او معرفونه باید په سړه زنځیر (۲ تر ۸ درجې) کې وساتل او ولېږدول شي.',
    medErrRequired: 'مهرباني وکړئ «{f}» ډک کړئ.', medErrExpired: 'د پای نېټه تېره شوې؛ د تېرې نېټې توکي پلورل منع دي.',
    medSignupToggle: '⚕️ روغتیايي / طبي حساب (ډاکټر، درملتون، د درملو شرکت، کلینیک…)', medSignupHint: 'د دې برخې په ډکولو سره ستاسو په پروفایل او طبي اعلانونو د «روغتیايي فعال» نښه ښکاري.',
    medSignupTitle: 'تخصصي روغتیايي معلومات', medProfileBadge: 'روغتیايي فعال', medExpiryLabel: 'پای نېټه'
  });

  function meta(list, base) {
    var out = {};
    list.forEach(function (c, i) { if (!c.all) out[String(base + i)] = { condition: !!c.condition, specRow: c.specRow !== false, fields: c.fields, notice: c.notice, medical: true }; });
    return out;
  }

  window.AB_MED = {
    R0: R0, W0: W0,
    retail: { fa: retail.map(function (c) { return [c.fa, c.e]; }), ps: retail.map(function (c) { return [c.ps, c.e]; }) },
    wholesale: { fa: wholesale.map(function (c) { return [c.fa, c.e]; }), ps: wholesale.map(function (c) { return [c.ps, c.e]; }) },
    retailSlugs: retail.map(function (c) { return c.slug || 'medical'; }),
    retailMeta: meta(retail, R0),
    wholesaleMeta: meta(wholesale, W0),
    profileFields: profileFields,
    i18n: I,
    isRetail: function (c) { return +c >= R0; },
    isWholesale: function (c) { return +c >= W0; },
    isAd: function (a) { return !!a && (a.isWholesale ? +a.wholesaleCat >= W0 : +a.c >= R0); }
  };
})();
