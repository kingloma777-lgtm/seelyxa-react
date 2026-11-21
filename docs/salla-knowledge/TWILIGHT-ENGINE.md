# محرك Twilight — ما هو الثيم، ومن يملك ماذا

> المصادر: https://docs.salla.dev/twilight/react/start/what-is-a-theme ·
> `/start/project-structure` · `/changelog` · `/local-development/cli-commands` ·
> مهارة `salla-theme-builder` الرسمية · **تاريخ القراءة: 2026-11-21**

---

## 1. تعريف لا يُتجاوز

**الثيم ليس تطبيقًا.**

| | الثيم | التطبيق |
| --- | --- | --- |
| ما هو | مستودع GitHub ينشئه البورتال نيابة عن الشريك، + `twilight.json` يعلن مكوّناته وإعداداته | تطبيق له OAuth وتركيب (install) وأحداث دورة حياة |
| المصادقة | لا OAuth، لا webhooks تركيب، لا App Settings | OAuth 2.0 + scopes + webhooks |
| النشر | من Partners Portal (مراجعة فريق سلة) | App Store listing |
| الأدوات | `salla theme *` (CLI) + `salla_themes` (MCP) | `salla_apps`, `salla_events`, … (MCP) |

> المصدر: مهارة `salla-theme-builder`، جدول *Red Flags*: «A theme is not an app, so the app flow applies» = خطأ.
> لا تخلط بين **Twilight** (وقت تشغيل المتجر) و**Merchant API** (`api.salla.dev/admin/v2`، يحتاج OAuth)
> و**Partners MCP** (أفعال على حساب الشريك).

---

## 2. الإصدارات المثبّتة في هذا المشروع

| الحزمة | الإصدار | الدور |
| --- | --- | --- |
| `@salla.sa/twilight-theme-engine` | `1.0.133` | المحرك: hooks، مكوّنات، API client، layouts، slots، Vite plugin |
| `@salla.sa/twilight-components-react` | `3.0.0-beta.1` | أغلفة React لمكوّنات `salla-*` |
| `@salla.sa/twilight-tailwind-theme` | `3.0.0-beta.1` | إضافة Tailwind الرسمية |
| `@tanstack/react-start` | `~1.168.57` | إطار التشغيل (TanStack Start هو المدعوم رسميًا) |

التحقق:

```bash
node -e "console.log(require('./node_modules/@salla.sa/twilight-theme-engine/package.json').version)"
```

---

## 3. الهجرة من Twig — السياق الزمني

أُطلق محرك React في **2026-10-15**، والوثائق الحالية تحلّ محل وثائق Twig.
**كل ثيم يجب أن ينتقل إلى React قبل نهاية نوفمبر 2026** (المصدر: `/changelog`).

| في Twig | في React |
| --- | --- |
| `.twig` في `src/views` | مكوّنات وملفات مسارات في `app/` |
| متغيّرات الصفحة (`product`, `cart`) | Route loaders + API client مُنمَّط |
| `money`, `trans`, `link` | `useMoney`, `useTranslation`, `Link` |
| `{% hook 'cart:items.start' %}` | `<HookSlot>` + `hookRegistry` |
| بلوكات في `views/components/home` | مكوّنات React مسجّلة لكل `path` |
| ملفات لغة متداخلة | مفاتيح مسطّحة في `locales/ar.json`, `en.json` |
| webpack | Vite + `twilightReact()` |
| `salla theme serve` / `sync` | **متوقفة** — React يخدم نفسه؛ استخدم `salla theme dev` |

**ما لم يتغيّر:** `twilight.json` (نفس المخطط)، Salla CLI، Partners Portal، قواعد المراجعة، ومحرر الثيم عند التاجر.

---

## 4. من يملك ماذا

| المسؤولية | المحرك | الثيم |
| --- | --- | --- |
| المسارات (كل صفحات المتجر) | ✅ | يستبدل ما يريد ملفًا بملف |
| جلب البيانات (loaders) | ✅ لكل مسار مدمج | يكتب loader لمساره |
| Layouts (`MasterLayout`, `CustomerLayout`) | ✅ | يستبدل عبر `layout` prop |
| Slots | ✅ يعلنها | يملؤها عبر `useHook` |
| مكوّنات `salla-*` | ✅ (React wrappers) | يعيد تنسيقها |
| متغيّرات CSS للون والخط | ✅ يكتبها | يقرأها |
| صفحة الصيانة | ✅ | يستبدل `maintenancePage` |
| مكوّنات الرئيسية | — | ✅ يسجّلها + `twilight.json` |
| إعدادات التاجر | يقرأها | ✅ يعلنها ويستهلكها |
| تصميم الثيم بالكامل | — | ✅ |

**قاعدة عملية:** «ما لم تستبدله يبقى يعمل ويتحسّن مع المحرك». لا تنسخ مكوّنًا محركيًا لتعديل لون — استبدله أو استخدم slot.

---

## 5. بنية المشروع (الملفات التي تُحرَّر)

| الملف | الدور |
| --- | --- |
| `vite.config.ts` | `twilightReact()` من `.../vite` — يضبط rendering/routes/translations |
| `app/start.ts` | يسجّل `twilightMiddleware` و`earlyHintsMiddleware` |
| `app/client.tsx` | `bootClient` — أول سكربت في المتصفح |
| `app/hydrate.tsx` | `hydrateRoot` (React 19) |
| `app/router.tsx` | ينشئ الراوتر ويسجّل بلوكات الرئيسية والـhooks |
| `app/routes/__root.tsx` | الهيكل: `<html>`, `<body>`, المزوّد، الـlayout |
| `app/routes.ts` | المسارات المخصّصة / استبدال مسار محركي |
| `app/styles/` | Tailwind + SCSS (ITCSS: `01-settings` … `05-utilities`) |
| `locales/*.json` | تجاوزات الترجمة (مفاتيح مسطّحة بنقاط) |
| `twilight.json` | الاسم، `features`، `settings`، `components` |
| `public/` | ملفات ثابتة بلا hash |

**لا تُحرَّر:** `app/routeTree.gen.ts`، وأي ملف مسار يبدأ بـ `// @auto-generated` (يُعاد توليده).
ملفات القوائم (`/products`, `/search`, category, tag, brand, `/reviews`) يخدمها المحرك من نسخته؛ ملف بنفس الاسم بدون سطر `@auto-generated` يستبدلها.

---

## 6. `features` — ما تفعله وما لا تفعله

`features` في `twilight.json` تُخبر **لوحة التاجر** أي أدوات تُظهر:

- `"fonts"` → التاجر يستطيع تغيير الخط.
- `"color"` → التاجر يستطيع تغيير اللون الأساسي.
- `"mega-menu"` → خيار الميجا منيو.
- `"component-<name>"` → بلوك توفّره المنصة.
- أي اسم لا تعرفه اللوحة **يُسقط بصمت** بلا خطأ.

⚠️ **`features` ليست في كائن الثيم في وقت التشغيل** — لا يمكن قراءتها من `useTheme()` ولا `useTwilight()`.
(المصدر: `/data/theme` → «Features and home blocks».)

---

## 7. بلوكات الرئيسية

كل مدخل في `components[]` = بلوك. اللوحة تشترط `title`, `key`, `path`, `fields` — ونشر الثيم يفشل إن غاب أحدها.

| المفتاح | المعنى |
| --- | --- |
| `key` | معرّف فريد (UUID عادة) |
| `title` | `{ ar, en }` — الاسم في اللوحة |
| `path` | `home.` + الاسم المسجّل. حروف/أرقام/`-`/`.`/`_` فقط |
| `fields` | حقول البلوك؛ كل `id` يصبح مفتاحًا على `data` |
| `icon` | افتراضيًا `sicon-wrench-pencil` |
| `image` | صورة معاينة |
| `is_default` | تستخدمه بلوكات البداية؛ **استيراد إعدادات اللوحة لا يقرأه للبلوكات** |

البلوك لا يفعل شيئًا حتى يُسجَّل مكوّن لمساره (في هذا الثيم: `router.tsx`).

---

## 8. Salla CLI

| الأمر | يحتاج دخولًا | الغرض |
| --- | --- | --- |
| `salla theme create` (`c`, `import`) | للمتجر الخاص أو خطوة GitHub | إنشاء ثيم وتشغيله |
| `salla theme dev` | للمتجر الخاص و`--editor` | تشغيل محلي |
| `salla theme doctor` | لا | فحص Node/pnpm/git |
| `salla theme preview` (`p`, `watch`) | نعم | تشغيل + فتح محرر الثيم |
| `salla theme publish` (`pub`) | نعم | دفع وطلب مراجعة |
| `salla theme list` / `delete` | نعم | إدارة الثيمات |

`dev`: `-p <port>` (5173 افتراضيًا، يجرب التالي)، `-s [store]`، `--no-open`، `-e` = `preview`.
الملفات التي يكتبها: `.env` (`VITE_STORE_DOMAIN`)، `package.json`, `twilight.json`، `.git/`.

> **مهم:** هذا المشروع **لا** يستخدم CLI للتطوير — يستخدم `scripts/dev-local.cjs` (workerd على Windows).
> لا تستبدل مسار التطوير الحالي بأمر CLI دون قرار.

---

## 9. المدقّق

```bash
npm run check:manifest            # أخطاء تُفشل، تحذيرات تُعرض
npm run check:manifest -- --strict # التحذيرات تُفشل أيضًا
```

**أخطاء:** `type` غائب/خاطئ، `type` خارج الستة، `id` مكرّر، dropdown بلا `options` ولا `source`،
switch بـ`value` غير منطقي، `collection` بلا `fields`، بلوك ناقص `title`/`key`/`path`/`fields`.

برمجيًا: `validateTwilightManifest()` من `@salla.sa/twilight-theme-engine/vite`.
`vite dev` يطبع الأخطاء (لا التحذيرات) عند البدء وعند كل حفظ.

> المدقّق يتبع قواعد اللوحة عند النشر، **لكن ليس كلها**. نتيجة نظيفة مؤشر جيد، لا ضمان.

---

## 10. ما يتعلّق بهذا المشروع مباشرة

- `type: "react"` ✔ · 43 بلوكًا · 54 إعدادًا · `check:manifest --strict` = 0/0.
- مسار التطوير المحلي مختلف عن CLI الرسمي (مقصود، موثّق في `AGENTS.md`).
- المحرك يملك `MasterLayout` وslots؛ الثيم يستبدل الـlayout عبر `ThemeLayout`.
