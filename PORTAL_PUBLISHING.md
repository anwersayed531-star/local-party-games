# 🎮 رفع اللعبة على منصات Web Games

دليل شامل لرفع **Game Hub** على Poki / CrazyGames / GameMonetize / itch.io.

---

## 1) بناء اللعبة

```bash
bun install
bun run build
```

الناتج هيكون في مجلد `dist/`. يحتوي على:
- `index.html`
- `assets/` (JS + CSS)
- `icon.png` (512x512), `icon-192.png`, `apple-touch-icon.png`, `favicon.ico`
- `og-image.png`
- `manifest.webmanifest`
- `robots.txt`, `sitemap.xml`

> ⚙️ مهم: `vite.config.ts` فيه `base: "./"` يعني الروابط نسبية،
> وده شرط أساسي لمعظم المنصات لأنها بتستضيف اللعبة في subfolder.

---

## 2) ضغط الملفات للرفع

```bash
cd dist
zip -r ../game-hub.zip .
cd ..
```

ارفع `game-hub.zip` على المنصة.

---

## 3) إعداد الإعلانات (Ads SDK)

اللعبة فيها نظام إعلانات مدمج عبر `src/lib/adsSDK.ts` بيشتغل تلقائي حسب المنصة.

### كيف يعمل
- **بدون إعلانات (افتراضي)**: مفيش SDK محمل، اللعبة تشتغل عادي.
- **Poki**: شغّل اللعبة بـ `?sdk=poki` أو خلي المنصة تحقن السكربت تلقائي.
- **CrazyGames**: `?sdk=crazygames`
- **GameMonetize**: `?sdk=gm`

### المواضع اللي بتظهر فيها الإعلانات
| الحدث | النوع | الموضع |
|------|------|--------|
| تحميل اللعبة | Preroll | عند `initAds()` |
| بداية لعبة | gameplayStart | عند الدخول للماتش |
| نهاية لعبة | commercialBreak (interstitial) | بعد كل ماتش (بحد أدنى 60 ثانية بين الإعلانات) |
| مكافأة | rewardedBreak | متاح في `showRewardedAd()` |

### اختبار وضع Poki
أضف `?poki-test` للرابط بعد ما تحمّل SDK Poki.

---

## 4) المنصات المدعومة

### 🟣 Poki ([poki.com/developers](https://developers.poki.com))
1. اعمل حساب Developer.
2. ارفع `game-hub.zip`.
3. Poki هيحقن SDK تلقائي - مش محتاج تعدل أي حاجة.
4. ابعت اللعبة للمراجعة. 

**مدة المراجعة**: 2-4 أسابيع.  
**نسبة الإيرادات**: 50/50.

### 🟠 CrazyGames ([developer.crazygames.com](https://developer.crazygames.com))
1. اعمل حساب Developer.
2. ارفع `game-hub.zip`.
3. اختر اللغات المدعومة (ar, en, fr, de).
4. ارفع screenshots (1280x720 موصى به) - استخدم `og-image.png`.

**نسبة الإيرادات**: 50/50 أو 70/30 (Exclusive).

### 🟢 GameMonetize ([gamemonetize.com](https://gamemonetize.com))
1. سجّل حساب.
2. ارفع `game-hub.zip` كـ HTML5.
3. SDK بيتحقن تلقائي عبر `?sdk=gm`.

**نسبة الإيرادات**: تصل لـ 95%.

### 🟡 itch.io ([itch.io/game/new](https://itch.io/game/new))
1. ارفع `game-hub.zip` كـ HTML.
2. حدد "This file will be played in the browser".
3. الأبعاد المقترحة: **1280x720** أو "Use full screen mode".
4. itch.io مش بيدعم إعلانات - شغّل بدون SDK.

---

## 5) معلومات وصفية (Meta) للمنصات

```
Title: Game Hub - Chess, Ludo & Tic Tac Toe
Short description: Play 3 classic games — Chess, Ludo, XO — solo vs AI or with friends. 4 languages.
Long description: Game Hub is a multi-game platform featuring fully-realized Chess (with AI),
classic Ludo (2-4 players), and customizable Tic Tac Toe. Play offline on one device,
against a smart AI opponent, or online with friends. Supports Arabic, English, French and German.
Category: Board / Strategy / Casual
Tags: chess, ludo, tic-tac-toe, xo, board, classic, multiplayer, ai, strategy
Controls: Mouse / Touch
Orientation: Both (responsive)
Languages: Arabic, English, French, German
```

---

## 6) الأيقونات والصور

| ملف | أبعاد | استخدام |
|-----|------|---------|
| `public/logo.png` | 1024+ | المصدر الأصلي |
| `public/icon.png` | 512x512 | Poki/CrazyGames icon |
| `public/icon-192.png` | 192x192 | PWA / Android |
| `public/apple-touch-icon.png` | 180x180 | iOS |
| `public/favicon.ico` | 16/32/48/64 | المتصفح |
| `public/og-image.png` | 512x512 | Social share / thumbnail |

---

## 7) قائمة التحقق قبل الرفع ✅

- [x] `vite.config.ts` يستخدم `base: "./"`.
- [x] كل الأيقونات موجودة في `public/`.
- [x] `manifest.webmanifest` صحيح.
- [x] الأبعاد responsive (يعمل على 800x600 وأكبر).
- [x] لا يوجد `localStorage` errors في sandboxed iframes (تم اختباره).
- [x] الصوت لا يبدأ تلقائي قبل تفاعل المستخدم (Poki requirement).
- [x] `gameplayStart()` و `gameplayStop()` يتم استدعاؤهم في الأماكن الصحيحة.
- [x] Interstitial ads بحد أدنى 60 ثانية بينهم (تم).

---

## 8) Build سريع (نسخة جاهزة)

```bash
bun run build && cd dist && zip -r ../game-hub-$(date +%Y%m%d).zip . && cd ..
```

ملف الـ zip جاهز للرفع على أي منصة! 🚀
