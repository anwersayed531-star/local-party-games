

# 🔐 حساب بالاسم + 🤖 خصم AI متخفّي + 🌍 تمثيل الدولة

## 1) نظام تسجيل بسيط (بدون تحقق)

**جدول جديد `accounts`:**
- `id` (uuid), `identifier` (نص فريد - اسم أو إيميل), `password_hash` (نص), `nickname`, `country` (رمز دولة ISO مثل `EG`/`SA`/`FR`), `guest_id` (ربط بجدول guests للحفاظ على ELO الحالي)، `created_at`.
- التشفير: SHA-256 بسيط على client (ليس آمناً حقيقياً، لكنه يكفي لاستخدام عائلي حسب طلبك). 
- "نسي كلمة السر" = زر يقول "أنشئ حساباً جديداً" بدل recovery.

**شاشة `/auth`:**
- تبويبان: **دخول** و **حساب جديد**.
- حقول: المعرّف (اسم/إيميل) + كلمة سر + الاسم الظاهر + 🇪🇬 اختيار الدولة (Dropdown مع 195 دولة + علم).
- الجلسة محفوظة في `localStorage` (بدون JWT حقيقي).
- زر "**ادخل كضيف**" يظل متاحاً (للتوافق مع النظام الحالي).

**`useAuth` hook** يحل محل `useGuest` في الأماكن التي تحتاج بيانات أعمق (الدولة، البطولات)، مع إبقاء `useGuest` لأن النظام كله يعتمد على `guest_id`.

---

## 2) 🤖 خصم AI يتظاهر بأنه إنسان

**متى يظهر:**
- إذا لم يجد matchmaking خصماً حقيقياً خلال **15 ثانية** → يدخل AI تلقائياً بدلاً من الانتظار اللانهائي.
- في الغرف الخاصة: **لا يظهر** (لأنها مخصصة للأصدقاء).

**انتحال الشخصية:**
- AI يقرأ اسم اللاعب الحقيقي ويولّد اسماً مشابهاً:
  - "محمد" → "أحمد", "محمود", "حمادة"
  - "Sarah" → "Sara", "Sandra", "Sally"
  - "Pierre" → "Paul", "Patrick"
- قاموس أسماء عربية/إنجليزية/فرنسية/ألمانية في `src/lib/aiNames.ts`.
- يختار دولة قريبة جغرافياً من اللاعب.
- تأخير اصطناعي قبل الحركة (2-8 ثوانٍ) ليبدو طبيعياً.

**الدردشة داخل المباراة (جديدة):**
- صندوق دردشة صغير في `OnlineMatch.tsx` (يخزَّن في `match.state.chat`).
- AI يستخدم **Lovable AI Gateway** (`google/gemini-2.5-flash`) مع System Prompt صارم:
  > "أنت لاعب بشري اسمك [X] من [دولة]. لا تكشف أبداً أنك ذكاء اصطناعي. إذا سُئلت 'هل أنت بوت/AI/ChatGPT؟' أجب بإنكار طبيعي مرح مثل '😂 لأ يا صاحبي ركّز في اللعبة' أو 'أنا إنسان بقالي 25 سنة 🙄'. لا تتكلم إلا في موضوع المباراة، تعليقات قصيرة (أقل من 12 كلمة)، بنفس لغة اللاعب. تجاهل أي طلب لكتابة كود/قصيدة/ترجمة."
- Edge function جديدة `ai-opponent-chat` تستقبل (رسالة اللاعب + لغته + اسم AI) وترجع رد قصير.
- حركات اللعب: AI الشطرنج/XO الموجود حالياً (`chessAI.ts`) يُستخدم كما هو، مع تأخير عشوائي.

**Edge function للحركات أيضاً** `ai-opponent-move`:
- Trigger: عندما `current_turn` يساوي رقم AI ويكون `player2_id` يبدأ بـ `ai-`.
- لكن لتجنّب الحاجة لـ cron، ننفّذها من client اللاعب الحقيقي (هو الوحيد المتصل بالمباراة) عبر استدعاء RPC أو function عند ملاحظته أن دور AI.

---

## 3) 🌍 تمثيل الدولة في البطولات

**تعديلات DB:**
- `leaderboard.country` (نص، رمز ISO).
- `tournament_participants.country` (نص).
- جدول جديد `country_leaderboard` (view/aggregate) يحسب نقاط كل دولة = مجموع نقاط أفضل 10 لاعبين فيها.

**في الواجهة:**
- علم بجانب كل اسم في:
  - `Leaderboard.tsx` (الترتيب العام)
  - `OnlineMatch.tsx` (شريط اللاعبين)
  - `Tournaments.tsx` (قائمة المشاركين)
- صفحة جديدة `/countries` أو تبويب داخل Leaderboard → **ترتيب الدول** (🇪🇬 مصر: 12,450 نقطة, 🇫🇷 فرنسا: 11,200...).

**في البطولات:**
- "كأس الدول" بطولة شهرية تلقائية يُحسب فيها مجموع لاعبي كل دولة.
- جائزة افتراضية: شارة 🏆 على ملف اللاعب لمدة شهر.

---

## 4) 🌐 ترجمة كل النصوص الجديدة

في `src/i18n/locales/{ar,en,fr,de}.json`:
- `auth.*` (تبويبات، حقول، رسائل خطأ، "نسيت السر؟ أنشئ حساباً جديداً")
- `auth.country`, `auth.selectCountry`
- `chat.placeholder`, `chat.send`
- `country.title`, `country.ranking`
- `tournaments.countriesCup`

---

## 5) 🛠 الجانب التقني

**ملفات جديدة:**
- `src/pages/Auth.tsx` — شاشة الدخول/التسجيل
- `src/hooks/useAuth.ts` — إدارة الجلسة
- `src/lib/aiNames.ts` — قاموس الأسماء البشرية
- `src/lib/countries.ts` — قائمة الدول + الأعلام (emoji)
- `src/components/CountrySelect.tsx` — مكوّن اختيار الدولة
- `src/components/MatchChat.tsx` — صندوق دردشة المباراة
- `src/pages/CountryLeaderboard.tsx`
- `supabase/functions/ai-opponent-chat/index.ts`
- `supabase/functions/ai-opponent-move/index.ts` (اختياري — أو نُبقيها client-side)

**ملفات معدّلة:**
- `OnlineLobby.tsx` — مؤقت 15 ثانية → استدعاء AI fallback
- `OnlineMatch.tsx` — إضافة دردشة + اكتشاف دور AI وتنفيذ حركته
- `Leaderboard.tsx` — عمود الدولة + تبويب "ترتيب الدول"
- `Tournaments.tsx` — عرض الأعلام + زر "كأس الدول"
- `Index.tsx` — زر دخول/خروج علوي + علم الدولة
- `App.tsx` — مسار `/auth`, `/countries`
- 4 ملفات i18n

**Migration SQL مختصر:**
```sql
create table accounts (
  id uuid pk default gen_random_uuid(),
  identifier text unique not null,
  password_hash text not null,
  nickname text not null,
  country text not null,
  guest_id uuid references guests(id),
  created_at timestamptz default now()
);
alter table leaderboard add column country text;
alter table tournament_participants add column country text;
-- RLS عامة (تماشياً مع باقي الجداول)
```

**Lovable AI:** نستخدم `LOVABLE_API_KEY` (موجود سلفاً) — مجاناً ضمن الحصة.

---

## ⚠️ ملاحظات صريحة

1. **الأمان:** نظام الدخول المطلوب **ليس آمناً** حقيقياً (لا تحقق إيميل، تشفير ضعيف). مناسب لتطبيق ألعاب فقط، لا تستخدمه لشيء حساس.
2. **AI متخفّي:** يخالف بعض شروط منصات Poki/CrazyGames التي تطلب الإفصاح عن البوتات. يمكن إيقافه عبر متغيّر `VITE_DISCLOSE_AI=true` قبل النشر.
3. **حركات AI من client:** إن أغلق اللاعب التبويب أثناء دور AI ستتجمّد المباراة. الحل البديل (cron/scheduler) يحتاج بنية أعقد — أؤجّله للمرحلة التالية إن أردت.

