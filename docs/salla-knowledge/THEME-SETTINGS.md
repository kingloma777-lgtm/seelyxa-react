# إعدادات الثيم و`twilight.json`

> المصادر: https://docs.salla.dev/twilight/react/guide/twilight-json ·
> `/guide/settings` · `/data/theme` · `/guide/icons-and-fonts` · **تاريخ القراءة: 2026-11-21**
> هذه الصفحة هي **المرجع الحاكم** لأي حقل يُضاف إلى `twilight.json` في هذا المشروع.

---

## 1. مفاتيح المستوى الأعلى

اللوحة عند النشر تقرأ **فقط**: `settings`, `components`, `features`, `support_url`, `groups`.
الباقي للـCLI ولصفحة المتجر.

| المفتاح | النوع | ملاحظة |
| --- | --- | --- |
| `type` | `"react"` | **إلزامي للـCLI**. بدونه يسلك CLI المسار الخطأ. اللوحة تتجاهله |
| `name`, `description` | `{ ar, en }` | |
| `repository`, `author_email` | string | |
| `support_url` | string | |
| `features` | string[] | `"fonts"`, `"color"`, `"mega-menu"`, `"component-<name>"`. الاسم المجهول يُسقَط بصمت |
| `settings` | array | خيارات التاجر |
| `components` | array | بلوكات الرئيسية |
| `groups` | — | **تقرأها اللوحة عند النشر، ومخططها غير موثَّق** ⇒ لا تستخدمها قبل التحقق من حساب حقيقي |

---

## 2. إعداد أم حقل؟ نفس الشكل

مدخلات `settings[]` و`fields[]` داخل بلوك الرئيسية **تتشارك شكلًا واحدًا**.
اللوحة تشترط `id` و`type`. و`type` يجب أن يكون واحدًا من **ستة** — والنشر يفشل على أي غيره.

| `type` | `format` الافتراضي | تنسيقات أخرى | القيمة التي تقرأها |
| --- | --- | --- | --- |
| `boolean` | `switch` | — | `true` / `false` |
| `items` | `dropdown` | `dropdown-list`, `variable-list` | `value` للخيار المختار، أو قائمة مع `multichoice` |
| `string` | — | `text`, `textarea`, `hidden`, `image`, `url`, `email`, `color`, `icon` | نص، أو عنوان لـ`image`/`url` |
| `number` | `integer` | `number`, `numeric` | رقم |
| `collection` | `collection` | — | قائمة عناصر، كل عنصر من `fields` المتداخلة |
| `static` | — | `title`, `line`, `description` | **لا شيء** — زخرفة في اللوحة فقط |

> `slider` **ليست** تنسيقًا رسميًا. تحويل `format:"slider"` إلى `integer` في هذا المشروع كان تصحيحًا، لا تفضيلًا.

---

## 3. المفاتيح التي يحملها أي مدخل

| المفتاح | المعنى |
| --- | --- |
| `id` | **إلزامي**، فريد داخل القائمة. المفتاح الذي تقرأه في الكود. في بلوك: حروف/أرقام/`-`/`.`/`_` فقط |
| `label`, `description`, `placeholder`, `icon` | ما تعرضه اللوحة بجوار الحقل |
| `value` | **الافتراضي**: boolean للمفتاح، نص للحقل النصي |
| `selected` | **الافتراضي للـdropdown** — كائن خيار، لا نص |
| `options` | خيارات الـdropdown، كل منها `{ label, value }` |
| `source` | يجلب الخيارات من المتجر: `products`, `brands`, `categories`. اترك `options` فارغة |
| `required`, `multichoice` | في بلوك: كل واحد `true` أو `false`. `multichoice` = اختيار متعدد |
| `multilanguage` | حقل نصي بقيمة لكل لغة |
| `conditions` | يُظهر الحقل فقط عند مطابقة حقل آخر |
| `fields`, `minLength`, `maxLength` | لـ`collection`: الحقول المتداخلة وحدود العدد. `collection` يجب أن يحمل `fields` |

يستخدم قالب سلة أيضًا `labelHTML`, `variant`, `item_label` — **اللوحة تقرأها، والمحرك لا**.

### `conditions` — الصيغة الوحيدة الموثَّقة

```json
[{ "id": "active", "operation": "=", "value": true }]
```

`id` يشير إلى الحقل الآخر. **العملية الموثَّقة هي `=` فقط** — لا تفترض `!=` أو `in` بلا اختبار في محرر مستضاف.

---

## 4. مثال إعداد (من الوثائق حرفيًا)

```json
{
  "id": "header_is_sticky",
  "label": "Keep the main menu at the top while scrolling",
  "type": "boolean",
  "format": "switch",
  "required": false,
  "value": true
}
```

```json
{
  "id": "slider_background_size",
  "type": "items",
  "format": "dropdown-list",
  "options": [{ "label": "Cover", "value": "cover" }, { "label": "Contain", "value": "contain" }],
  "selected": [{ "label": "Contain", "value": "contain" }]
}
```

---

## 5. بلوك الرئيسية — الحد الأدنى

اللوحة تشترط `title`, `key`, `path`, `fields`؛ النشر يفشل إن غاب أحدها.
اللوحة تضيف `key` و`path` المخفيين بنفسها إلى الحقول.

```json
{
  "key": "uuid",
  "title": { "ar": "…", "en": "…" },
  "path": "home.hero",
  "icon": "sicon-image",
  "fields": [ … ]
}
```

`path` = `home.` + الاسم المسجّل في `router.tsx`. بلا تسجيل، البلوك لا يفعل شيئًا.

---

## 6. قراءة الإعداد في وقت التشغيل

```tsx
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
const { settings } = useTheme();          // مفاتيح = ids من twilight.json
```

أو عبر المزوّد (وهو ما يفعله هذا الثيم):

```tsx
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
const { theme } = useTwilight();
theme?.settings?.header_is_sticky;
```

`useTheme()` يعيد `{ color, font, settings, isRTL }` فقط. ما ليس فيه (`name`, `mode`, `profile`, `assets`, `customization`, `twilight`) يُقرأ من `useTwilight().theme`.

---

## 7. الفخاخ الخمسة (كلها مؤكَّدة رسميًا)

1. **`!== false` لا `=== true`.** المتجر الذي لم يحفظ الإعداد لا يملك القيمة، و`undefined` يجب أن يعني «مفعّل».
2. **شكل قيمة الـdropdown يختلف.** قد تصل نصًا (`"cover"`) أو `[{ value: "cover" }]`.
   في هذا المشروع `scalar()`/`pickerValue()` يتعامل مع الشكلين (`PICKER_KEYS` تبدأ بـ`value`) ✔
3. **`settings` قد تكون `undefined`** قبل أول حفظ.
4. **`static` بلا قيمة وقت تشغيل.** لا تقرأ `theme.settings.static_label2`.
5. **`--color-text` دائمًا `#222222`**، وليس `color.text` — انظر `DESIGN-SYSTEM.md`.

### إعدادات يقرأها المحرك نفسه

هذه تعمل حتى لو لم يقرأها ثيمك:

`footer_is_dark` (→ `footer-is-dark`/`footer-is-light` على `<body>`) ·
`footer_layout` · `topnav_is_dark` (→ `topnav-is-dark`) ·
`sticky_add_to_cart` (→ `is-sticky-product-bar`) ·
`slider_background_size` · `header_is_sticky`

⚠️ في **معاينة محرر الثيم** يُقرأ `header_is_sticky` كـ`false` مهما اختار التاجر
(هيدر مثبّت يغطي شريط أدوات البلوكات). ثيم يثبّت هيدره من هذا الإعداد لا يحتاج تغييرًا.

---

## 8. واقع هذا المشروع (مقاس 2026-11-21)

| البند | القيمة |
| --- | --- |
| `type` | `react` ✔ |
| `settings` | 54 مدخلًا |
| توزيع الأنواع | `boolean` 20 · `items` 13 · `static` 10 · `string` 5 · `number` 5 · `collection` 1 |
| التنسيقات | `switch` 20 · `dropdown-list` 13 · `title` 8 · `color` 5 · `integer` 5 · `description` 2 · `collection` 1 |
| `components` | 43 بلوكًا |
| حقول البلوكات | `string` 184 · `boolean` 130 · `static` 118 · `items` 72 · `collection` 31 · `number` 20 |
| `features` | 16 (منها `fonts`, `color`, `mega-menu`, `filters`, و`component-*`) |
| المدقّق | `0 error(s), 0 warning(s)` |

**ملاحظتان:**
- `is_default: true` موجود على بلوكات البداية. الوثائق تقول إن استيراد إعدادات اللوحة **لا يقرأه للبلوكات** — وجوده غير ضار لكنه غير فعّال.
- `variant: "h6"` على `static` — اللوحة تقرأه، المحرك لا. متوافق مع الوثائق.

---

## 9. قواعد هذا المشروع فوق قواعد سلة

- **كل إعداد بصري جديد يتبع نمط `product_card_*`**: يُقرأ مرة في `ThemeLayout`، يُكتب `--pc-*`/`--gs-*` **inline على `.app-inner`**، لا `:root`.
- **لا إعداد عام جديد بلا قرار صريح** (الملزم رقم 1 في §13.12 من `AGENTS-SKILLS.md`).
- **`twilight.preview.json` يجب أن يحمل نفس الحقول** — dev يقرأه هو، لا `twilight.json`.
- **لا تكتب إعدادات الثيم عبر MCP**: `salla_themes action=settings_update` يستبدل **المصفوفة كاملة**؛ حقل واحد يمحو الباقي. عدّل من البورتال.
