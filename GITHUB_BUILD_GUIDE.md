# 📱 دليل التحميل من GitHub بالتليفون

ده شرح بالعربي لكل خطوة، مش محتاج تعرف برمجة خالص.

---

## 🔧 الخطوة 1: ربط Lovable بـ GitHub (مرة واحدة بس)

1. في Lovable، اضغط على زر **"..."** في الركن السفلي اليمين.
2. افتح **Connectors** (الموصلات) → **GitHub** → **Connect project**.
3. وافق على صلاحيات Lovable على GitHub.
4. اختار حسابك واضغط **Create Repository**.

✅ بعد كده كل تعديل في Lovable هيتحفظ في GitHub تلقائي.

---

## 🤖 الخطوة 2: GitHub هيبني اللعبة لوحده

أنا جهزت ملف `.github/workflows/build-game-portals.yml`.

ده **روبوت تلقائي** هيشتغل لما:
- أي تعديل يتعمل على المشروع، **أو**
- انت تشغّله يدوي من GitHub.

الروبوت ده هيعملك **4 ملفات ZIP جاهزة** — واحد لكل منصة.

---

## 📥 الخطوة 3: تحميل الملفات من التليفون

### الطريقة الأولى (الأسهل) — من Releases:

1. افتح متصفح التليفون وادخل على repo بتاعك على GitHub.
2. اضغط على تبويب **Releases** (على اليمين).
3. هتلاقي آخر build اسمه **"Game Hub Build #X"**.
4. تحت **Assets** اضغط على الملف اللي عاوزه:
   - `game-hub-poki.zip` لو هترفع على Poki
   - `game-hub-crazygames.zip` لو CrazyGames
   - `game-hub-gamemonetize.zip` لو GameMonetize
   - `game-hub-itch.zip` لو itch.io
5. الملف هينزل على التليفون عادي.

### الطريقة التانية — من Actions:

1. ادخل repo بتاعك → تبويب **Actions**.
2. اختار آخر workflow run (اللي عليه ✅ خضرا).
3. انزل تحت لقسم **Artifacts**.
4. اضغط على اسم الـ artifact علشان ينزل.

---

## 🎬 الخطوة 4: تشغيل البناء يدوي (لو محتاج)

1. ادخل repo → تبويب **Actions**.
2. على الشمال اختار **"Build Game Hub for Web Portals"**.
3. اضغط **Run workflow** → **Run workflow** (الزر الأخضر).
4. استنى 2-3 دقايق لحد ما تظهر علامة ✅.
5. حمّل الملفات من Releases أو Artifacts.

---

## 🖼️ الخطوة 5: الصور (انت هتعملها)

المنصات بتطلب صور دعائية. الشعار اللي رفعته جاهز في `public/logo.png` و `public/og-image.png`.

لو محتاج مقاسات إضافية:
| المنصة | المقاس المطلوب |
|--------|----------------|
| Poki | 512x512 (icon) + 1280x720 (thumbnail) |
| CrazyGames | 1280x720 + 512x512 |
| GameMonetize | 512x512 + 1280x720 |
| itch.io | 630x500 (cover) + screenshots |

استخدم أي موقع زي [photopea.com](https://www.photopea.com) من التليفون لو محتاج تعدل المقاسات.

---

## ❓ مشاكل شائعة

**الـ workflow مش بيشتغل؟**
- اتأكد إن repo فيه ملف `.github/workflows/build-game-portals.yml`.
- ادخل **Settings → Actions → General** وفعّل "Allow all actions".

**مفيش Releases؟**
- ادخل **Settings → Actions → General** → اعمل scroll لـ "Workflow permissions" → اختار **Read and write permissions** → Save.
- شغّل الـ workflow تاني.

---

🚀 خلاص! دلوقتي عندك pipeline كامل من Lovable → GitHub → ZIP جاهز للرفع.
