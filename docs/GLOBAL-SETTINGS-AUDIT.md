# نظام الإعدادات العامة للمتجر — تقرير المرحلة صفر

> مراجعة معمارية قبل أي تعديل. كل رقم في هذا التقرير مقيس على الشجرة الحالية
> (`D:/salla theme 9/seelyxa-react`)، وكل ادعاء عن مصدر قيمة مسنود إلى ملف وسطر.
> تاريخ القياس: 2026-11-21 · الحالة الابتدائية: `tests/styles` 85/85 خضراء،
> `check:manifest --strict` 0 أخطاء / 0 تحذيرات.

---

## 0. الحكم في سطر واحد

**المشكلة ليست غياب طبقة توكنات — الطبقة موجودة ومكتوبة. المشكلة أن المكونات لا
تقرأها.** لذلك أي «إعداد عام» يُضاف اليوم سيصل إلى `:root` ولا يحرّك شيئًا، وهو
بالضبط الفخ الذي يحذّر منه §13.8 («لا تعتبر إعدادًا يعمل قبل إثبات أثره»).

قياس يوضح الفكرة:

| التوكن | عدد المستهلكين في الثيم |
| --- | --- |
| `--ink-1` / `--surface-2` / `--line-1` | 77 / 44 / 42 |
| `--radius-card` | 1 (داخل `tokens.scss` نفسه) |
| `--container-max` / `--gutter` / `--section-gap` | 0 / 0 / 0 |
| `--motion-base` / `--motion-fast` / `--motion-slow` | 0 / 0 / 0 |
| `--space-1…20` / `--fs-*` / `--lh-*` | 0 |
| `--shadow-md` / `--shadow-lg` / `--shadow-card` | 0 / 0 / 0 |

الخلاصة: **اللوحة (palette) نظام حيّ، وبقية `tokens.scss` مواصفة لا ينفّذها أحد.**
المرحلة الأولى في التنفيذ يجب أن تكون «تبنّي التوكنات في المكونات»، لا «إضافة حقول
للتاجر». وإلا سنبني لوحة تحكم تتحكم في لا شيء.

---

## 1. الطبقات الأربع — من يملك كل قيمة

| الطبقة | مثال | من يغيّرها | أين تُكتب | يمكن قراءتها من الثيم؟ |
| --- | --- | --- | --- | --- |
| **قيمة من سلة (Runtime)** | `--color-primary`, `--font-main` | التاجر من لوحة سلة | inline على `<html>` بواسطة المحرك | نعم، قراءة فقط |
| **بيانات المتجر** | `store.settings.product.fit_type` | التاجر من لوحة سلة | كائن JS من الـAPI | نعم، قراءة فقط |
| **إعداد ثيم** | `product_card_radius` | التاجر من محرر الثيم | `twilight.json` → `theme.settings` | نعم |
| **توكن داخلي** | `--radius-card`, `--motion-base` | مؤلف الثيم | `01-settings/*.scss` | نعم (CSS فقط) |
| **قيمة ثابتة في الكود** | `'#004956'`, `'#f6f4f0'` | مؤلف الثيم | TSX/SCSS | — (هذه هي المشكلة) |

### 1.1 ما يكتبه محرك سلة فعليًا (مُثبت)

`node_modules/@salla.sa/twilight-theme-engine/dist/chunk-N4YBKFJM.js:33-66`
(`themeCssVars`) — يكتب inline على `document.documentElement`:

| المتغيّر | المصدر | ملاحظة |
| --- | --- | --- |
| `--font-main`, `--font-light`, `--font-regular`, `--font-medium`, `--font-bold` | `theme.font.name` | `-Medium` / `-Bold` لاحقة على اسم العائلة |
| `--color-primary` | `theme.color.primary` | اللون الأساسي للتاجر |
| `--color-primary-dark`, `--color-primary-light` | مشتقّان: `darken(0.15)` / `lighten(0.15)` | حساب المحرك لا اختيار التاجر |
| `--color-title` | = `primary` | ليس دورًا مستقلًا |
| `--color-secondary` | = `primary` | **لا يوجد لون ثانوي حقيقي** |
| `--color-primary-reverse` | `theme.color.reverse_text` | نص فوق اللون الأساسي |
| `--color-reverse-primary` | `theme.color.reverse_primary` | |
| `--color-text` | **`#222222` ثابتة في الكود** | `theme.color.text` مُهمَل |
| `--page-height` | `100%` | |

وعلى `<body>`: `color-mode-dark` / `color-mode-light` من `theme.color.is_dark`،
و`footer-is-dark` / `footer-is-light` من `footer_is_dark`.
(مرجع رسمي: `docs.salla.dev/twilight/react/guide/styling` — «The merchant picks a
main colour and a font in the dashboard».)

### 1.2 ثغرة قائمة اليوم: وضعان ليليان لا يعرف أحدهما الآخر

- سلة تضيف `color-mode-dark` على `<body>` إذا اختار التاجر الوضع الداكن في لوحته.
- الثيم يتجاهل ذلك تمامًا (`grep color-mode` → 0 نتيجة) ويبني ليله الخاص:
  `localStorage['seelyxa-theme']` + `html.dark` (`app/routes/__root.tsx:82`،
  `MorphHeader.tsx:1049`).
- النتيجة: تاجر يختار «داكن» في سلة يرى متجرًا فاتحًا، وزر الليل في الهيدر لا
  يعكس اختياره.

هذه أول نقطة تعارض يجب حسمها قبل بناء أي «إعداد عام للوضع الداكن».

---

## 2. جرد ما توفره سلة رسميًا

### 2.1 متاح ويصلح للاستهلاك المركزي

| القيمة | الوصول | مستهلكون حاليًا في الثيم |
| --- | --- | --- |
| اللون الأساسي | `--color-primary` | 29 موضعًا في SCSS، منها **9 فقط** لها fallback |
| نص فوق الأساسي | `--color-primary-reverse` | 2 |
| الخط | `--font-main` | `--font-body` / `--font-heading` في `tokens.scss:61-62` |
| الوضع الداكن للتاجر | `body.color-mode-*` | **0 — متجاهَل** |
| نسبة صورة المنتج | `store.settings.product.fit_type` (`cover`/`contain`) | **0 — متجاهَل** |
| إخفاء الأسعار | `store.settings.product.show_price_as_dash` | 0 |
| الأرقام العربية | `store.settings.arabic_numbers_enabled` | 0 |
| رمز الريال | `store.settings.use_sar_symbol` | 0 |
| حقوق المتجر | `store.settings.display_copyright` | 0 |

المستهلك فعليًا من `store.settings` اليوم: `is_multilingual`،
`currencies_enabled`، `cart.apply_coupon_enabled`، `product.filters`،
`category.testimonial_enabled`، `rating.show_on_product`، `buy_now` — سبعة فقط،
كلها سلوكية لا بصرية.

### 2.2 غير متاح — والسبب

| ما طلبته | الحالة | السبب التقني |
| --- | --- | --- |
| لون ثانوي مستقل | **غير موجود** | المحرك يكتب `--color-secondary` = `--color-primary` (`chunk-N4YBKFJM.js:53`). سلة لا توفّر لونين. |
| لون النصوص من لوحة سلة | **مفقود** | المحرك يتجاهل `theme.color.text` ويكتب `#222222` ثابتة (`:45`). |
| أحجام/أوزان/ارتفاعات الأسطر | **غير موجودة** | سلة توفّر عائلة الخط فقط، لا مقياسًا طباعيًا. |
| عرض الحاوية، المسافات، الاستدارة، الظلال، أنماط الأزرار والبطاقات | **غير موجودة** | لا مقابل لها في `theme` ولا في `store.settings`؛ لا يمكن إلا أن تكون إعدادات ثيم. |
| خلفية المتجر (لون/صورة/تدرّج) | **غير موجودة** | لا حقل في سلة. اليوم `--bg-store` مكتوب في `global.scss` ومقلوب في `html.dark`. |
| الحركة والانتقالات | **غير موجودة** | سلة لا تعرف شيئًا عنها. |
| نقاط التوقف (breakpoints) | **غير موجودة** | `01-settings/breakpoints.scss` داخلية. |
| نِسَب أبعاد الصور | **جزئي** | `product.fit_type` فقط (`cover`/`contain`)، لا نسبة. النسبة إعداد ثيم (`product_card_img_ratio`). |

---

## 3. إعدادات الثيم الحالية

`twilight.json` → `settings[]`: **54 مدخلًا** (10 عناوين/أوصاف ثابتة + 44 فعّالة).
كلها مقيَّدة بمكوّن أو بسلوك، ولا يوجد فيها إعداد بصري عام واحد:

- هيدر: `header_layout`, `header_shape`, `header_theme_toggle`, `header_glass_color`,
  `header_glass_opacity`, `header_blur`, `header_text_color`, `header_nav_font_size`,
  `header_nav_weight`, 4 أيقونات، `curtain_slots`.
- كارت المنتج: 15 حقلًا (`product_card_*` + `notify_when_available_in_card`).
- صفحة المنتج/السلة/الرئيسية/الفوتر: 13.
- الحركة: `global_enable_scroll_reveal`.

**سابقة مفيدة:** البادئة `global_` مستخدمة بالفعل وتعمل في لوحة التاجر. أي إعداد
عام جديد يمكن أن يتبعها بلا اختراع اصطلاح جديد.

### 3.1 ما يعمل فعليًا منها

`product_card_*` هي النموذج الصحيح الوحيد في الثيم: تُقرأ مرة في `ThemeLayout`
(`productCardSettings.ts:88-110`)، تُكتب `--pc-*` inline على `.app-inner`،
وتُقرأ في `product-card.scss:29-58`. أي إعداد عام جديد يجب أن ينسخ هذا النمط حرفيًا.

---

## 4. القيم الثابتة — القياس

| النوع | العدد | أين |
| --- | --- | --- |
| ألوان hex في TSX | **126** | `app/components/**/*.tsx` (17× `#ffffff`, 7× `#ef4444`, 5× `#004956`…) |
| حقول لون في البلوكات | **44** | `twilight.json` → `components[].fields` |
| قيم hex محايدة في SCSS | 298 | تقرير `npm run audit:design` |
| ألوان هوية مكتوبة يدويًا | 8 | `common.scss×3`, `morph-header.scss×3`, `selia-generated.scss×2` |
| عائلات خطوط مكتوبة يدويًا | 9 | `login-auth`, `login-modal`, `portal-hero×2`, `product`, `second-skin×2`, `stamp-story`, `app.scss` |

### 4.1 الحالة الأخطر: fallback ثابت يقتل الوضع الليلي

`app/components/home/selia/SeliaAuto.tsx:466`

```ts
if (background) vars['--selia-bg'] = asText(v[background.key]) || '#f6f4f0';
```

- 15 حقل «لون خلفية» في 10 بلوكات تمرّ من هنا.
- عندما يترك التاجر الحقل فارغًا، يُكتب `--selia-bg: #f6f4f0` (كريمي) بدلًا من
  `transparent` — وهو الافتراضي الصحيح في `selia-generated.scss:20`.
- النتيجة: **باند كريمي في منتصف صفحة ليلية**، بلا أن يلمس التاجر شيئًا.

نفس النمط في `:471`: `--selia-accent` يسقط إلى `var(--color-primary, #004956)`
— fallback صحيح، لكنه يعني أن البلوك يخترع لونًا إذا لم يكن للمتجر لون أساسي.

### 4.2 التكرار الدلالي بين البلوكات

| الحقل دلاليًا | عدد الحقول | عدد البلوكات |
| --- | --- | --- |
| عنوان القسم | 30 | 28 |
| عنوان فرعي | 22 | 21 |
| `display` (ظهور حسب المتصفح) | 26 | 26 |
| `custom_css` | 26 | 26 |
| لون خلفية | 15 | 10 |
| `full_width` | 11 | 11 |
| استدارة | 1 | 1 |

الاستدارة شبه غائبة عن البلوكات ⇒ **الاستدارة مؤهَّل لأن يكون إعدادًا عامًا حقيقيًا**،
بخلاف ما قد يُتوقع. وبالمقابل `title/subtitle/display/custom_css` مكرّرة 26-30 مرة،
لكنها محتوى لا هوية بصرية — لا تُمركز.

---

## 5. ما يمكن مركزته، وما يجب أن يبقى محليًا

| القيمة | الحكم | لماذا |
| --- | --- | --- |
| اللون الأساسي | **مركزي، لكن مصدره سلة** | إضافة `global_accent_color` فوق `--color-primary` تخلق مصدرين لنفس القيمة — وهو ما تمنعه §6 في طلبك. الحل: وضع صريح (يتبع سلة / مخصص) لا لون صامت. |
| استدارة الزوايا | **مركزي** | 1 حقل فقط في البلوكات، و`--selia-radius` يخدم 21 موضعًا. |
| عرض الحاوية | **مركزي بعد تبنّي** | 0 مستهلك اليوم + ثلاث قيم متعارضة: `--container-max: 1440`، `--selia-max: 1320`، `max-width: 1440px` في `selia-generated.scss:1237`. |
| إيقاع المسافات بين الأقسام | **مركزي بعد تبنّي** | `--section-gap` معرّف وغير مقروء. |
| الظلال | **مؤجَّل** | `--shadow-card` صفر مستهلك؛ لا معنى لتحكم تاجر في قيمة لا تُرسم. |
| الخط | **يبقى في سلة** | `--font-main` يعمل. إضافة خط عناوين = إعداد خط ثانٍ ينافس إعداد سلة. |
| الوضع الداكن | **قرار، لا إعداد** | تعارض `color-mode-*` مع `html.dark` يجب حلّه أولًا. |
| الحركة | **مؤجَّل** | 0 مستهلك للتوكنات، و`global_enable_scroll_reveal` يغطي الحالة الواقعية. |
| خلفية المتجر | **مؤجَّل** | `--bg-store` تُرسم على `body` خارج `.app-inner`؛ تمريرها عبر `.app-inner` مستحيل، و`__root.tsx` لا يملك `theme` في سياق SSR (`getTwilightContext` لا يعرض `theme`). |
| نسبة صورة المنتج | **موجود كإعداد ثيم** | `product_card_img_ratio` + `store.settings.product.fit_type` غير المستهلك. |

---

## 6. المعمارية المقترحة

### 6.1 السلسلة

```
Salla runtime (theme.color / theme.font / store.settings)   ← قراءة فقط
        ↓
Global theme settings (global_* في twilight.json)           ← اختيار التاجر
        ↓
Resolver (app/lib/storeSettings.ts)                          ← قرار واحد، مرة واحدة
        ↓
--gs-* على .app-inner (SSR، inline، مثل --pc-*)              ← CSS
+ GlobalSettingsContext                                       ← JS
        ↓
توكنات موجودة: --radius-card / --selia-radius / --container-max …
        ↓
البلوك: يقرأ التوكن، أو يعيد توجيهه محليًا إن تجاوز
```

### 6.2 الأولوية (كما طلبتها، بترتيب صريح)

1. تجاوز المكوّن (قيمة غير فارغة في حقل البلوك).
2. إعداد الثيم العام (`global_*`).
3. قيمة سلة الرسمية (`--color-primary`, `--font-main`, `store.settings.*`).
4. الافتراضي الآمن في `tokens.scss`.

### 6.3 قاعدة التنفيذ التي تمنع نسخ القيم

> **الفارغ = لا يُكتب.** إذا لم يختر التاجر شيئًا، لا يُصدر الـresolver أي متغيّر،
> فتسقط السلسلة طبيعيًا إلى سلة ثم إلى التوكن. لا نكتب قيمة عامة داخل حقل مكوّن
> أبدًا.

هذا يحقق حرفيًا شرطك «لا تنسخ القيم العامة إلى إعدادات المكونات»، ويجعل «إلغاء
التخصيص = عودة تلقائية» سلوكًا بنيويًا لا منطقًا يُنسى.

### 6.4 آلية التجاوز — لماذا «الحضور» لا «مفتاح»

الخياران المطروحان:

| | مفتاح `*_inherit` صريح | **الحضور (فارغ = يرث)** |
| --- | --- | --- |
| توافق المتاجر الحالية | ❌ قيمة محفوظة + مفتاح افتراضي «يرث» = تجاهل تخصيص قائم | ✅ القيمة المحفوظة تبقى تجاوزًا |
| حقول جديدة | +1 لكل إعداد لكل بلوك | 0 |
| ازدحام المحرر | يزداد | لا يتغيّر |
| خطر | افتراضي خاطئ يُسكِت متجرًا | يعتمد على إمكانية تفريغ حقل اللون في المحرر |

**التوصية: الحضور.** وهو متسق مع `readTextOr` الموجود أصلًا في `homeBlock.ts`
(«غائب = الافتراضي، وفارغ = فارغ») ومع حقلَي اللون الفارغين الموجودين فعلًا في
المخطوطة. النقطة الوحيدة التي تحتاج تحققًا في المحرر المستضاف: هل يمكن تفريغ
`format: "color"`؟ إن لم يكن، نضيف المفتاح لتلك الحقول فقط لا للجميع.

### 6.5 الواجهة المقترحة (مختصرة)

```ts
// app/lib/storeSettings.ts
export type RadiusChoice = 'theme' | 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface GlobalSettings {
  radius: RadiusChoice;      // 'theme' = اتبع التوكن
  container: 'theme' | '1280' | '1320' | '1440' | '1600' | 'full';
  rhythm: 'theme' | 'compact' | 'normal' | 'airy';
  accentMode: 'salla' | 'custom';
  accent: string;            // '' = لا شيء
}

/** يقرأ مرة واحدة. لا يقرأ أي مكوّن `useTwilight` بنفسه. */
export function readGlobalSettings(settings: BlockData | undefined): GlobalSettings;

/** يكتب فقط ما اختاره التاجر — لا شيء غير ذلك. */
export function globalVars(g: GlobalSettings): Record<string, string>;

/** الحل النهائي لأي إعداد: محلي → عام → سلة → افتراضي. */
export function resolveSetting<T>(
  local: T | '' | null | undefined,
  global: T | '' | null | undefined,
  official: T | undefined,
  fallback: T
): T;

export const GlobalSettingsContext = createContext<GlobalSettings>(GLOBAL_DEFAULTS);
export function useGlobalSettings(): GlobalSettings;
```

استخدام داخل بلوك:

```tsx
// قبل
const accent = readText(data, 'accent_color', PREFIX, '#004956');
// بعد — الفارغ يعني «ارث»
const accent = readText(data, 'accent_color', PREFIX, '');
style={{ ...(accent ? { '--selia-accent': accent } : null) }}
```

و`SeliaAuto.styleFromControls` تصبح نقطة التبنّي الكبرى: **27 بلوكًا** تمرّ منها،
فإصلاحها مرة واحدة يُصحّح 27 بلوكًا بلا لمس أي منها.

### 6.6 لماذا `--gs-*` على `.app-inner` وليس `:root`

- `:root` لا يستطيع قراءة متغيّر مكتوب على عنصر متداخل — نفس الفخ الموثّق في
  §13.12 وفي `tokens.scss:37-42`.
- `.app-inner` هو العنصر الذي يحمل `--pc-*` بالفعل، وهو مُصيَّر على السيرفر ⇒ لا
  وميض إطار أول.
- كل ما يجب أن يتأثر (هيدر، بلوكات، فوتر، منتج، سلة، درج) داخل `.app-inner`.
- الاستثناء الوحيد: `--bg-store` (تُرسم على `body`) ⇒ خارج النطاق، ولذلك أُجّل.

### 6.7 التوكنات تُقرأ من الإعداد، لا تُستبدل

```scss
/* 01-settings/global-settings.scss — طبقة الإعدادات، لا طبقة المكوّن */
.app-inner {
  --radius-card: var(--gs-radius, var(--radius-xl));
  --selia-radius: var(--gs-radius, 20px);
  --container-max: var(--gs-container, 1440px);
  --section-gap: var(--gs-rhythm, clamp(40px, 6vw, 88px));
}
```

هذه إعادة توجيه (`var(...)`)، وهي المسموحة في عقد التوكنات؛ الحرفي ممنوع.

---

## 7. الملفات المتأثرة

| الملف | التغيير | المرحلة |
| --- | --- | --- |
| `app/lib/storeSettings.ts` | **جديد** — الأنواع، القارئات، `resolveSetting`, `globalVars`, السياق | 1 |
| `app/components/layout/ThemeLayout.tsx` | قراءة واحدة + كتابة `--gs-*` + `Provider` | 1 |
| `app/styles/01-settings/global-settings.scss` | **جديد** — إعادة توجيه التوكنات إلى `--gs-*` + `@import` في `app.scss` | 1 |
| `twilight.json` | مجموعة «إعدادات المتجر العامة» (static title + 3-5 حقول) | 1 |
| `twilight.preview.json` | بذور نفس الحقول (dev يقرأه) | 1 |
| `app/components/home/selia/SeliaAuto.tsx` | `styleFromControls` ← الـresolver؛ حذف `#f6f4f0` | 2 |
| `app/styles/04-components/selia-base.scss` | `--selia-radius` و`--selia-max` يقرآن `--gs-*` | 2 |
| ~10 ملفات TSX في `selia/` | حذف fallback اللون الحرفي من `readText(...,'#...')` | 2 |
| `app/components/home/PortalHero.tsx` | `accent` يصبح `''` = يرث | 2 |
| `tests/lib/storeSettings.test.ts` | **جديد** — 8 سيناريوهات §7 من طلبك | 1 |
| `tests/styles/token-contract.test.ts` | تأكيد أن `--gs-*` لا يُستبدل بحرفي | 1 |
| `scripts/audit-design-system.cjs` | قاعدة: لا حرفي للون حيث يوجد `--gs-*` | 3 |
| `docs/GLOBAL-SETTINGS.md` | **جديد** — مرجع المطور: كيف يستهلك بلوك جديد النظام | 3 |

لا تغيير في: `productCardSettings.ts` (يبقى النموذج المرجعي)، `homeBlock.ts`
(القارئات كافية)، أي مفتاح إعداد قائم (لا إعادة تسمية).

---

## 8. الاختبارات — مقابل السيناريوهات الثمانية

| # | السيناريو | الاختبار |
| --- | --- | --- |
| 1 | تغيير اللون العام يحدّث كل من يرث | بلوكان بحقل فارغ + `--gs-accent` ⇒ كلاهما يحمل نفس القيمة المحسوبة |
| 2 | تخصيص بلوك لا يؤثر على غيره | بلوك بقيمة + بلوك فارغ ⇒ الأول محلي، الثاني عام |
| 3 | تغيير العام بعد وجود تجاوز | التجاوز ثابت والعام يتغيّر ⇒ البلوك المخصص لا يتحرك |
| 4 | إلغاء التجاوز يعود للعام | `''` ⇒ يعود للقيمة العامة الجديدة لا القديمة |
| 5 | بلوك جديد يستهلك تلقائيًا | مكوّن اختباري يقرأ `useGlobalSettings` فقط |
| 6 | الافتراضيات عند غياب كل شيء | لا يُصدر `globalVars` أي مفتاح؛ التوكن يبقى مصدره |
| 7 | لا تعارض مع سلة | `accentMode='salla'` + `theme.color.primary` ⇒ `--gs-accent` غير مُصدر |
| 8 | حفظ إعدادات المتاجر القديمة | كائن إعدادات كامل بالحقول القديمة ⇒ خرج الـresolver مطابق لليوم |

بوابة إضافية: `npx vitest run tests/styles` + `npm run check:manifest -- --strict`
+ `npm run audit:design` (بلا زيادة في `hardcoded HUE`).

---

## 9. المخاطر

1. **إعداد يبدو عاملًا ولا يفعل شيئًا.** أخطر من عدم وجوده. العلاج: لا حقل بلا
   مستهلك مقيس، والاختبار يفشل إذا لم يُقرأ المتغيّر.
2. **تعارض اللون مع سلة.** حلّه `accentMode` الصريح، لا لون صامت فوق لون.
3. **تفريغ حقل اللون في المحرر المستضاف غير مؤكد.** خطة بديلة: مفتاح `*_inherit`
   لتلك الحقول فقط.
4. **ازدحام المحرر.** 43 بلوكًا × حقول جديدة = محرر لا يُستخدم. لذلك: 0 حقل جديد
   في المرحلة الأولى، وتجاوزات البلوكات تعيد استخدام حقولها القائمة.
5. **تغيير توكن = تغيير متعدد المكونات** (§13.12 قاعدة 3). `--selia-radius` له 21
   مستهلكًا ⇒ لقطة شاشة لكل بلوك متأثر، فاتح وداكن، `ar` و`en`.
6. **الوضع الليلي المزدوج.** أي إعداد «داكن» قبل حل `color-mode-*` × `html.dark`
   سيزيد الالتباس.

---

## 10. قرارات مطلوبة قبل التنفيذ

| # | القرار | التوصية |
| --- | --- | --- |
| 1 | هل نضيف `global_accent_color` أم نكتفي بلون سلة؟ | **`accentMode` + لون**، الافتراضي «يتبع سلة». يعطي التاجر تحكمًا كاملًا بلا مصدرين متعارضين في الحالة الافتراضية. |
| 2 | هل نعتمد «الفارغ = يرث» بدل مفتاح Inherit؟ | **نعم** — التوافق مع المتاجر القائمة لا يُشترى بأي ثمن آخر. |
| 3 | هل نبدأ بتبنّي التوكنات (استدارة/حاوية/إيقاع) أم بإضافة الحقول أولًا؟ | **التبنّي أولًا.** الحقول قبل التبنّي = لوحة تحكم بلا أثر. |

بعد الموافقة على هذه الثلاثة، التنفيذ على ثلاث مراحل، كل مرحلة تُختبر وتُعرض قبل
الانتقال: (1) الـresolver + مجموعة الإعدادات + الاختبارات، (2) تبنّي `SeliaAuto`
والبلوكات، (3) الحركة والظلال وخلفية المتجر — أو تأجيلها بقرار.
