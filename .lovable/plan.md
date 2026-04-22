

# 🌍 تعدد اللغات + تجهيز اللعبة للنشر على منصات Web Games

## 📋 ملخص الطلب
1. دعم 4 لغات: العربية، الإنجليزية، الفرنسية، الألمانية
2. دمج نظام إعلانات (Ads SDK) متوافق مع Poki / CrazyGames
3. تجهيز ملف Build جاهز للرفع (ZIP)
4. تجهيز الأصول التسويقية (Icon, Thumbnail, Cover, Screenshots)
5. تحسين شكل ومظهر الألعاب

---

## 🌐 1. نظام تعدد اللغات (i18n)

**المكتبة:** `react-i18next` + `i18next` (الأكثر استخداماً واستقراراً)

**الملفات:**
- `src/i18n/config.ts` — إعداد i18next مع كشف اللغة وحفظها في localStorage
- `src/i18n/locales/ar.json` — العربية (افتراضية)
- `src/i18n/locales/en.json` — الإنجليزية
- `src/i18n/locales/fr.json` — الفرنسية
- `src/i18n/locales/de.json` — الألمانية

**المحتوى المترجم:**
- أسماء الألعاب (XO, Chess, Ludo)
- جميع الأزرار (ابدأ، إعادة، إعدادات، عودة، رمي النرد...)
- رسائل الفوز/التعادل/الكش ملك
- إعدادات XO (حجم الشبكة، اختيار الرموز)
- إعدادات الشطرنج (الثيمات، مستوى الذكاء)
- إعدادات الصوت والموسيقى

**اتجاه النص (RTL/LTR):**
- العربية: `dir="rtl"` تلقائياً على `<html>`
- باقي اللغات: `dir="ltr"`
- ضبط Tailwind لدعم RTL في التخطيطات

**واجهة تبديل اللغة:**
- زر/Dropdown في `SettingsDialog` بـ 4 أعلام (🇸🇦 🇬🇧 🇫🇷 🇩🇪)
- حفظ الاختيار في localStorage عبر `useGameSettings`

---

## 📢 2. دمج SDK الإعلانات (Poki / CrazyGames)

> ملاحظة مهمة: **Poki و CrazyGames لا يسمحان باستخدام SDK الخاص بهما إلا بعد قبول لعبتك على منصتهما.** سنجهّز البنية بحيث يكفي وضع مفتاح/سكربت واحد عند القبول.

### البنية المقترحة:
**ملف موحد:** `src/lib/adsSDK.ts`
- واجهة موحدة (Adapter Pattern) تدعم: `poki` | `crazygames` | `none` (وضع التطوير)
- دوال:
  - `initAds(provider)` — تهيئة الـ SDK
  - `showCommercialBreak()` — إعلان فيديو بين الجولات
  - `showRewardedAd()` — إعلان مكافأة (مثلاً: لإعادة محاولة في الشطرنج)
  - `gameplayStart()` / `gameplayStop()` — تتبع جلسات اللعب (مطلوب من Poki)

### نقاط عرض الإعلانات (حسب إرشادات Poki):
- ✅ بعد انتهاء جولة (XO أو لودو)
- ✅ بعد انتهاء مباراة شطرنج (Checkmate/Stalemate)
- ❌ لا تُعرض أثناء اللعب الفعلي
- ❌ لا تُعرض في أول 60 ثانية من فتح اللعبة

### في `index.html`:
- إضافة placeholder للسكربت:
```html
<!-- Ads SDK - استبدله بسكربت Poki/CrazyGames بعد قبول اللعبة -->
<!-- <script src="https://game-cdn.poki.com/scripts/v2/poki-sdk.js"></script> -->
```

---

## 🎨 3. تحسينات الشكل والمظهر

### الشاشة الرئيسية:
- إضافة شعار/أيقونة احترافية أعلى الصفحة
- تحريك (animation) ناعم لبطاقات الألعاب عند التحميل
- إضافة معاينة مصغرة لكل لعبة في البطاقة

### الشطرنج:
- تحسين رسم القطع (استخدام Unicode أكبر وأوضح + ظلال)
- إضافة highlight للحركة الأخيرة (المربع المصدر والوجهة)
- إضافة عداد للقطع المأكولة بجانب اللوحة

### لودو:
- تحسين ألوان اللوحة لتكون أكثر حيوية
- إضافة animation للنرد (دوران 3D حقيقي)
- توضيح المسار الذي ستسلكه القطعة عند اختيارها

### XO:
- إضافة تأثير "خط النصر" متحرك يعبر الرموز الفائزة
- تحسين رسم X و O بحركة "رسم" تدريجية

### عام:
- تحسين الـ favicon ليكون شعار اللعبة
- تحديث `<title>` و meta tags في `index.html`

---

## 📦 4. تجهيز ملف الـ Build

### خطوات الإنتاج:
1. **تعديل `vite.config.ts`:**
   - ضبط `base: './'` (مهم جداً لمنصات Poki/CrazyGames لأنها ترفع اللعبة في مسار فرعي)
   - ضبط `build.outDir: 'dist'`
   - تعطيل source maps في الإنتاج لتقليل الحجم
   - تفعيل minification

2. **تشغيل البناء:**
```bash
npm run build
```
ينتج فولدر `dist/` يحتوي على `index.html` + ملفات الأصول.

3. **اختبار الـ Build محلياً:**
```bash
npm run preview
```

4. **ضغط الملف:**
- ضغط **محتويات** فولدر `dist` (ليس الفولدر نفسه) في `game-build.zip`
- سيتم إنتاجه وحفظه في `/mnt/documents/game-build.zip` لتنزيله

### متطلبات Poki/CrazyGames التي سنطبّقها:
- ✅ كل المسارات نسبية (relative paths)
- ✅ يعمل بدون إنترنت بعد التحميل (offline-ready)
- ✅ `index.html` في الـ root مباشرة
- ✅ حجم إجمالي مضغوط (سنفحصه)
- ✅ لا توجد طلبات لخدمات خارجية مباشرة (سننقل خط Google Fonts ليكون مدمجاً)

---

## 🖼️ 5. الأصول التسويقية (Marketing Assets)

سيتم إنشاؤها برمجياً وحفظها في `/mnt/documents/marketing/`:

| الملف | المقاس | الوصف |
|------|--------|------|
| `icon.png` | 512×512 | أيقونة اللعبة (شعار Game Hub بخلفية خشبية ذهبية) |
| `thumbnail.png` | 800×600 | صورة مصغرة بـ 3 ألعاب |
| `cover.png` | 1280×720 | غلاف رئيسي مع اسم اللعبة بـ 4 لغات |
| `screenshot-1.png` | 1280×720 | لقطة من الشاشة الرئيسية |
| `screenshot-2.png` | 1280×720 | لقطة من الشطرنج |
| `screenshot-3.png` | 1280×720 | لقطة من اللودو |
| `screenshot-4.png` | 1280×720 | لقطة من XO |

**طريقة الإنتاج:** استخدام Python + Pillow لرسم الأيقونات والأغلفة، و `browser--screenshot` للقطات الفعلية من اللعبة بعد البناء.

---

## 🔧 الجانب التقني (للمطور)

**الحزم الجديدة:**
- `i18next`, `react-i18next`, `i18next-browser-languagedetector`

**ملفات جديدة:**
- `src/i18n/config.ts`
- `src/i18n/locales/{ar,en,fr,de}.json`
- `src/lib/adsSDK.ts`
- `src/components/LanguageSwitcher.tsx`

**ملفات معدّلة:**
- `src/main.tsx` — استدعاء i18n config
- `src/App.tsx` — ضبط اتجاه HTML حسب اللغة
- `src/pages/Index.tsx` — استخدام الترجمة + تحسينات الشكل
- `src/pages/{XOGame,ChessGame,LudoGame}.tsx` — ترجمة + إعلانات بعد كل جولة
- `src/components/SettingsDialog.tsx` — إضافة LanguageSwitcher
- `src/hooks/useGameSettings.ts` — إضافة `language` و `adProvider`
- `index.html` — meta tags + placeholder لـ Ads SDK + favicon
- `vite.config.ts` — `base: './'` للنشر على Poki

**سكربت Build & Package:** سيتم تنفيذه في نهاية الخطوات لإنتاج `game-build.zip` + الأصول التسويقية.

---

## 📌 ملاحظات مهمة (يجب أن تعرفها)

1. **WiFi Direct / Online Multiplayer:** لم يُنفّذ بعد (مؤجّل من الخطة السابقة) — هل تريد إضافته الآن أم لاحقاً؟ يحتاج خادم Signaling.

2. **سكربتات Poki/CrazyGames:** لن أستطيع وضع السكربت الحقيقي لأنه يُعطى لك فقط بعد قبول اللعبة. سأضع تعليقاً واضحاً في `index.html` يخبرك أين تضعه.

3. **لتجربة اللعبة على Poki محلياً:** Poki يوفّر "Test SDK" بدون مفتاح يمكن تفعيله بإضافة `?poki-test` في الرابط — سندعم هذا تلقائياً.

4. **الأمان للأطفال (COPPA):** Poki و CrazyGames يطلبان عدم جمع بيانات شخصية — لعبتنا حالياً لا تجمع أي بيانات (كل شيء في localStorage)، فهي متوافقة ✅

