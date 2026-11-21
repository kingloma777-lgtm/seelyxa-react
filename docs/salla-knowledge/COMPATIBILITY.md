# جدول التوافق — الوثائق ↔ الإصدار المثبّت ↔ المشروع

> الأساس: وثائق `docs.salla.dev/twilight/react` (قراءة 2026-11-21) ·
> الإصدار المثبّت `@salla.sa/twilight-theme-engine@1.0.133` ·
> القياس على `D:/salla theme 9/seelyxa-react`

---

## 1. الجدول

| الخاصية | ما تقوله وثائق سلة | ما يدعمه الإصدار المثبّت | وضع المشروع |
| --- | --- | --- | --- |
| **Theme Settings** | `settings[]` في `twilight.json`، 6 أنواع، تُقرأ من `theme.settings` | ✅ `useTheme()` + `useTwilight().theme.settings` | **مستخدم** — 54 إعدادًا، كلها مقيدة بمكوّن |
| **Store Data** | `store/settings` مرة لكل طلب، متاح SSR | ✅ `useStore()` + `useTwilight().store` | **مستخدم جزئيًا** — 7 مفاتيح من `store.settings` |
| **Color Picker** | `type:"string"`, `format:"color"` | ✅ (المحرر المحلي يرسمه صندوق نص — الثيم أضاف لوحة swatches) | **مستخدم** — 5 إعدادات لون |
| **Theme Context** | `useTwilight()` يعيد `{store, theme, settings, locale, dir, currency, salla…}` | ✅ مُتحقَّق في `dist/providers/twilight-context.d.ts` | **مستخدم** — 15 موضعًا |
| **Global CSS Variables** | المحرك يكتب `--color-*`/`--font-*` على `<html>` **في المتصفح** | ✅ `themeCssVars()` — `chunk-N4YBKFJM.js:33` | **مستخدم** — `--font-main` عبر `--font-body/heading` |
| **Store Settings** | `store.settings.*` (auth/cart/product/rating/…) | ✅ | **مستخدم جزئيًا** — 7 مفاتيح فقط |
| `features` (twilight.json) | تُخبر اللوحة فقط؛ **ليست في وقت التشغيل** | ✅ (لا وصول) | **مستخدم** — 16، منها `fonts`, `color` |
| `conditions` | `[{id, operation:"=", value}]` | ✅ | **مستخدم** — 16 حقلًا (مُختبر) |
| `collection` + `minLength/maxLength` | نوع سادس، للحقول المتداخلة | ✅ | **مستخدم** — 1 إعداد + 31 حقل بلوك |
| `source: products/brands/categories` | يجلب خيارات الـdropdown من المتجر | ✅ | **مستخدم** |
| `static` (title/line/description) | زخرفة اللوحة، بلا قيمة وقت التشغيل | ✅ | **مستخدم** — 10 عناوين + 118 حقلًا |
| `format: "slider"` | **غير موجود** في القائمة الرسمية | — | **مُصحَّح** — حُوّل إلى `integer` |
| `groups` (مفتاح أعلى) | تقرأه اللوحة عند النشر، **مخططه غير موثَّق** | غير معروف | **غير مستخدم** |
| Home Blocks | `title`,`key`,`path`,`fields` إلزامية | ✅ | **مستخدم** — 43 بلوكًا مسجّلًا |
| SSR | `store`/`theme` متاحان؛ متغيّرات CSS لا | ✅ | **مستخدم** — critical CSS + inline `--pc-*` |
| Dark Mode | المحرك يضيف `color-mode-*` على `<body>`؛ **لا يبني ثيمًا داكنًا** | ✅ | ⚠️ **متعارض** — الثيم يستخدم `html.dark` ويتجاهل `color-mode-*` |
| Hooks & Slots | `<HookSlot>` + `useHook` + `hookRegistry` | ✅ | **مستخدم** — كارت المنتج عبر slot |
| Salla SDK | `window.salla`, أحداث, `Salla.hooks` | ✅ (المحرك يبدأه) | **مستخدم** — دخول، سلة |
| Web Components | `salla-*` بأغلفة React | ✅ `twilight-components-react@3.0.0-beta.1` | **مستخدم** — `salla-cart-summary`, `salla-tel-input` |
| Salla CLI | `salla theme create/dev/doctor/preview/publish/list/delete` | — | **غير مستخدم** — التطوير عبر `scripts/dev-local.cjs` (قرار موثّق) |
| `twilight-check-manifest` | مدقّق `twilight.json` | ✅ في `node_modules/.bin` | **مستخدم** — 0/0 |
| `getTwilightContext()` | سياق الطلب على السيرفر | ✅ `settings: StoreContext` (يحمل `theme` و`store`) | **مستخدم** في `__root.tsx` |
| Partners MCP | `https://partners.mcp.salla.dev` | — | **مُعدّ، غير مُفوَّض** |
| Skills (29) | مستودع رسمي | — | **مثبّتة** في `~/.workbuddy-ai/skills/` |

---

## 2. فروق وثائق ↔ إصدار

| الملاحظة | التفصيل |
| --- | --- |
| لا فروق جوهرية | كل ما وصفته الوثائق موجود في `1.0.133`: `themeCssVars`, `color-mode-*`, `getTwilightContext`, `StoreContext`, `TwilightProviderProps` |
| الوثائق أحدث من الثيم في نقطة واحدة | وثائق `ThemeSettings` تُنمّط مفاتيح القالب المرجعي فقط؛ المتجر يرسل مفاتيح أكثر. **الوثيقة تقول ذلك صراحة** ⇒ اقرأ ما أعلنته فقط |
| `--color-text` | الوثيقة تحذّر أنها `#222222`؛ الكود يؤكد (`chunk-N4YBKFJM.js:45`) |
| `features` | الوثيقة تنفي وصولها وقت التشغيل؛ لا مقابل لها في `TwilightContextValue` ✔ |

---

## 3. أوامر التحقق (شغّلها قبل أي ادعاء)

```bash
cd seelyxa-react

# الإصدارات
node -e "console.log(require('./node_modules/@salla.sa/twilight-theme-engine/package.json').version)"

# عقد twilight.json
npm run check:manifest -- --strict

# ما يكتبه المحرك فعلًا
grep -n "color-mode\|--color-text\|--color-secondary" \
  node_modules/@salla.sa/twilight-theme-engine/dist/chunk-N4YBKFJM.js | head

# سياق السيرفر
grep -n "settings: StoreContext" \
  node_modules/@salla.sa/twilight-theme-engine/dist/twilight/context.d.ts

# مستهلكو إعداد متجر
grep -rn "fit_type" app --include=*.ts --include=*.tsx | wc -l

# بوابة التصميم
npx vitest run tests/styles && npm run audit:design && npx tsc --noEmit
```

---

## 4. ما يحتاج تحققًا على متجر حقيقي

| البند | لماذا لا يمكن حسمه من الوثائق |
| --- | --- |
| `store.settings.display_copyright` | غير موجود في جدول الوثائق ⇒ قد يكون حقلًا غير مُنمَّط أو قديمًا |
| `settings.rating.*` الإضافية (`allow_attach_videos`, `rating_store_points`) | الوثيقة تذكر وجودها بلا توثيق كامل |
| `groups` في `twilight.json` | مذكور كمقروء عند النشر، بلا مخطط |
| عمليات `conditions` غير `=` | موثَّقة `=` فقط |
| إمكانية **تفريغ** حقل `format:"color"` في المحرر المستضاف | يحدد مصير نمط «الفارغ = يرث» |
| `theme.settings.opening_hours` | الوثيقة تقول «Not yet sent by the API» |
