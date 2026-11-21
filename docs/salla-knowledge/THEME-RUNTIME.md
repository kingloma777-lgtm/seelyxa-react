# وقت التشغيل — من الطلب إلى الصفحة

> المصادر: https://docs.salla.dev/twilight/react/start/how-it-works ·
> `/start/project-structure` · `/data/theme` (Gotchas) · أنواع المحرك المثبّت:
> `dist/twilight/context.d.ts` · **تاريخ القراءة: 2026-11-21**

---

## 1. المسار الكامل

```
الطلب (مثال /en/cart)
  ↓  app/start.ts — twilightMiddleware + earlyHintsMiddleware
     يقرأ الكوكيز والـhost ⇒ «أي متجر؟» و«هل العميل داخل؟»
  ↓  الراوتر يطابق مسارًا (لغة = أول مقطع في URL)
     ملف في app/routes.ts بنفس المسار ⇒ صفحتك تفوز على صفحة المحرك
  ↓  loader — يجلب ما تحتاجه الصفحة (سلة، منتج، بلوكات) على السيرفر
     ⇒ HTML الأول مكتمل
  ↓  التجاوزات: layout، بلوكات الرئيسية، مكوّنات في slots
     ما لم تستبدله يستخدم نسخة المحرك
  ↓  HTML + __root.tsx
  ↓  المتصفح: hydration (app/client.tsx → bootClient → app/hydrate.tsx)
     ثم تنقّل داخلي بلا إعادة تحميل، مع loader الصفحة التالية
```

**النتائج العملية (من الوثائق حرفيًا):**
- ضع البيانات في loaders، لا داخل المكوّنات.
- السيرفر والمتصفح يشغّلان نفس المكوّنات ⇒ **لا تقرأ `window` أثناء الرسم**.
- ما لا تستبدله يبقى يعمل ويتحسّن مع المحرك.

---

## 2. سياق الطلب على السيرفر — `getTwilightContext()`

```tsx
import { getTwilightContext } from '@salla.sa/twilight-theme-engine/tanstack';

function RootComponent() {
  const ctx = getTwilightContext();
  return <html lang={ctx.locale} dir={ctx.dir} suppressHydrationWarning>…</html>;
}
```

الحقول الفعلية في الإصدار المثبّت (`TwilightContext`):

| الحقل | النوع | ملاحظة |
| --- | --- | --- |
| `settings` | **`StoreContext`** | **يحمل `store` و`theme`** — انظر التحذير أدناه |
| `queryClient` | `QueryClient` | |
| `locale`, `dir` | string / `'ltr'\|'rtl'` | يُكتبان على `<html>` |
| `routeId`, `location` | | |
| `authToken` | `string \| null` | غالبًا null للمسجّلين — استخدم عميل API بدلًا منه |
| `scope`, `scopeId` | `ActiveScope \| null` | السوق/الفرع |
| `storeId`, `storeBase`, `storeBaseFollowsLocale` | | أي متجر عنونَه الطلب |
| `versionId` | `string \| null` | نسخة إعدادات الثيم المطلوبة (معاينة المحرر) |
| `requestHost`, `nativeAppHeaders` | | |
| `i18n`, `page`, `appsSnippets`, `appsSettings` | | |
| `maintenance`, `storeNotFound` | boolean | يُحسمان في `rootBeforeLoad` |
| `extras` | | |

### ⚠️ تصحيح مهم

`getTwilightContext()` **لا يعرض `theme` كمفتاح مباشر**، لكن `ctx.settings` هو `StoreContext`
وفيه `theme?: Theme` و`store?: Store`. أي:

```ts
const theme = getTwilightContext().settings.theme;   // متاح على السيرفر ✔
```

هذا يعني أن **كائن الثيم متاح في SSR** — بما فيه `theme.color`, `theme.font`, `theme.settings`,
`theme.mode`, `theme.customization`. المتغيّرات **ليست** متاحة (البند التالي).

`ctx.settings` يرمي `SettingsError` إذا كان المتجر فارغًا. للفحص بلا استثناء: `hasTwilightSettings()`.

---

## 3. متغيّرات CSS — تُكتب في المتصفح فقط

عند تركيب الصفحة ينسخ المحرك الثيم إلى `<html>` كمتغيّرات CSS:

| المتغيّر | القيمة |
| --- | --- |
| `--color-primary` | `color.primary` |
| `--color-primary-dark` / `-light` | الأساسي ±15% |
| `--color-title`, `--color-secondary` | **= `color.primary`** |
| `--color-primary-reverse`, `--color-text-reverse`, `--color-reverse-text` | `color.reverse_text` |
| `--color-reverse-primary` | `color.reverse_primary` |
| `--color-text` | **`#222222` ثابتة** (ليست `color.text`) |
| `--font-main`, `--font-light`, `--font-regular` | `font.name` |
| `--font-medium`, `--font-bold` | `font.name` + `-Medium` / `-Bold` |
| `--page-height` | `100%` |

وعلى `<body>`: `color-mode-dark` / `color-mode-light` من `color.is_dark`،
و`footer-is-dark` / `footer-is-light` من `footer_is_dark`.

**العاقبة:** في HTML السيرفر لا توجد هذه المتغيّرات. لذلك:
- أي تنسيق يعتمد عليها يحتاج **fallback** في CSS (وهو ما يفعله الثيم).
- **لا** تُصدر قيمة CSS من JS أثناء الرسم بناءً على `getComputedStyle` — ستكون فارغة على السيرفر.

مُتحقَّق في `dist/chunk-N4YBKFJM.js:33-67` (دالة `themeCssVars`) و`:94` (أصناف الجسم).

---

## 4. الصيانة والمعاينة (قرار لكل طلب)

| المُشاهد | كيف يُحدَّد |
| --- | --- |
| التاجر | `?utm_source=dashboard&identifier=<storeId>` (أو `portal`) + كوكي `salla_view_as`، أو `theme.mode==='preview'`، أو host `preview.salla.design` |
| الزائر عند إغلاق المتجر | صفحة الصيانة، بحالة **200** و`Cache-Control: no-store, private` |
| متجر لم يُطلق | `settings.launched === false` ⇒ صفحة «قريبًا» بلغة المنصة |

استبدال صفحة الصيانة: `<TwilightProvider maintenancePage={ClosedPage}>` — بلا props، بلا layout، بلا SDK.

---

## 5. الترجمة والاتجاه

- اللغة من أول مقطع في URL (`/en/...`)، والاتجاه: `ar`, `fa`, `he`, `ur` = RTL.
- `<html lang dir>` يُكتبان من `ctx.locale` / `ctx.dir` ⇒ **أول رسم سيرفري بالاتجاه الصحيح**.
- نصوص الثيم في `locales/ar.json`, `en.json` بمفاتيح **مسطّحة بنقاط** (`pages.cart.total`).
- **ترجمات سلة تُبحَث أولًا، وملفات الثيم fallback** — مفتاح يبدو مُهمَلًا غالبًا موجود عند سلة.
- الجمع بأسلوب Laravel (`{1} once|[3,10] :count times`) يحتاج `formatSallaPlural()`.

---

## 6. ما يجب أن يعرفه أي مكوّن جديد

| السؤال | الجواب |
| --- | --- |
| هل `store`/`theme` متاحان في SSR؟ | **نعم** |
| هل متغيّرات CSS متاحة في SSR؟ | **لا** |
| هل `window.salla` متاح في SSR؟ | **لا** |
| هل `useUser()` متاح في SSR؟ | **لا** — عميل المتصفح فقط؛ ارسم حالة زائر أولًا |
| هل `useStore()` آمن كـdependency؟ | **لا** — كائن جديد كل render |
| أين أضع جلب البيانات؟ | في loader المسار |
| هل أستطيع استبدال layout؟ | نعم، `layout` prop على المزوّد |

---

## 7. في هذا المشروع

- `app/routes/__root.tsx` يستخدم `createTwilightRootRoute()` و`getTwilightContext()` فعلًا.
- يبني CSS حرجًا (critical) لكل من الرئيسية وصفحة المنتج + subset للهيدر، ويؤجّل `app.css` بعد أول رسم.
- `ThemeLayout` يقرأ `theme.settings` مرة واحدة ويكتب `--pc-*` inline على `.app-inner` (SSR ⇒ بلا وميض إطار أول).
- **لا تفترض** أن `__root.tsx` يستطيع استدعاء `useTwilight()` — هو فوق المزوّد. استخدم `getTwilightContext()`.
