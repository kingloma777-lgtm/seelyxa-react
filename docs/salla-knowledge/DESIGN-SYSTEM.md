# نظام التصميم — ما توفره سلة، وما يجب أن يبنيه الثيم

> المصادر: https://docs.salla.dev/twilight/react/guide/styling ·
> `/data/theme` · `/guide/icons-and-fonts` · `/guide/twilight-json` · **تاريخ القراءة: 2026-11-21**

---

## 1. الحكم في سطر

**سلة توفّر لونًا أساسيًا واحدًا وعائلة خط واحدة. كل ما بعد ذلك — اللوحة، المقياس الطباعي،
المسافات، الاستدارة، الظلال، الخلفيات، الحركة، الوضع الليلي — يبنيه الثيم.**

لا يوجد في المنصة «نظام تصميم» جاهز للثيمات، ولا حقول للون الثانوي أو لون النص أو المقاييس.

---

## 2. ما توفره سلة فعلًا

### 2.1 عبر المتغيّرات (يكتبها المحرك في المتصفح)

| المتغيّر | المصدر | ملاحظة |
| --- | --- | --- |
| `--color-primary` | `theme.color.primary` | اختيار التاجر |
| `--color-primary-dark` / `-light` | مشتق ±15% | **حساب المحرك**، لا اختيار |
| `--color-primary-reverse`, `--color-text-reverse`, `--color-reverse-text` | `color.reverse_text` | نص فوق الأساسي |
| `--color-reverse-primary` | `color.reverse_primary` | |
| `--color-title`, `--color-secondary` | **= `color.primary`** | لا دور مستقل |
| `--color-text` | **`#222222` ثابتة** | `color.text` مُهمَل |
| `--font-main`, `--font-light`, `--font-regular` | `font.name` | عائلة واحدة |
| `--font-medium`, `--font-bold` | `font.name` + لاحقة | |

### 2.2 عبر أصناف على `<body>`

- `color-mode-dark` / `color-mode-light` — من `theme.color.is_dark`.
- `footer-is-dark` / `footer-is-light` — من `footer_is_dark`.
- `topnav-is-dark` — من `topnav_is_dark`.
- `is-sticky-product-bar` — من `sticky_add_to_cart`.
- `preview-mode` — عندما `theme.mode === 'preview'`.
- `salla-<theme name>` — اسم الثيم.

### 2.3 عبر `features`

`"fonts"` ⇒ التاجر يستطيع تغيير الخط. `"color"` ⇒ يستطيع تغيير اللون الأساسي.
**بدون هذين الاسمين لا يظهر الخيار للتاجر أصلًا.**

---

## 3. ما لا توفره سلة (وثائقيًا)

| ما تحتاجه | الحالة | البديل الرسمي |
| --- | --- | --- |
| لون ثانوي مستقل | ❌ | إعداد ثيم `format:"color"` |
| لون نص من لوحة سلة | ❌ (`#222222` ثابتة) | إعداد ثيم، أو قراءة `color.text` في JS |
| مقياس طباعي (أحجام/أوزان/ارتفاعات أسطر) | ❌ | توكنات الثيم |
| عرض حاوية، مسافات، استدارة، ظلال | ❌ | توكنات الثيم |
| خلفية المتجر (لون/صورة/تدرّج) | ❌ | إعداد ثيم + توكن |
| حركة وانتقالات | ❌ | توكنات الثيم |
| نقاط توقف | ❌ | SCSS داخلي |
| نِسَب أبعاد الصور | جزئي: `store.settings.product.fit_type` (`cover`/`contain`) | نسبة = إعداد ثيم |
| وضع ليلي كامل | ❌ **«The engine does not give you a dark theme by itself»** | يبنيه الثيم |

---

## 4. الوضع الليلي — النص الرسمي حرفيًا

> *«The engine does not give you a dark theme by itself. What it does: it adds `color-mode-dark`
> or `color-mode-light` to `<body>` … Tailwind is configured with `darkMode: 'class'`, so `dark:`
> utilities only apply under a `.dark` class **that your theme must add**.»*
> — https://docs.salla.dev/twilight/react/guide/styling

أي أن المسار الرسمي **واحد**:

```scss
body.color-mode-dark {
  --color-text: #e5e7eb;
  background: #111;
}
```

أو تُضيف `.dark` بنفسك كي تعمل أدوات `dark:` في Tailwind.

**⚠️ تعارض قائم في هذا المشروع:** الثيم يبني ليله الخاص (`html.dark` + `localStorage['seelyxa-theme']`)
ولا يقرأ `color-mode-*` إطلاقًا (`grep color-mode` = 0 نتيجة).
النتيجة: تاجر يختار «داكن» في لوحة سلة يرى متجرًا فاتحًا.
هذا قرار مطلوب (البند 4 في `GLOBAL-SETTINGS-REASSESSMENT.md`)، لا إصلاح تلقائي.

---

## 5. الأيقونات والخطوط

- **Salla Icons** خط أيقونات: كل أيقونة صنف `sicon-*`. المحرك يحمّله في كل صفحة.
  القائمة الكاملة: `https://cdn.assets.salla.network/static/fonts/sallaicons.css`.
  الأيقونة تأخذ لون النص وحجمه من الأب ⇒ نسّقها بـ`color`/`font-size`.
- خط التاجر: `--font-main`. **لا تُثبّت خطًا لكل النص** — تسرق الخيار من التاجر.
  الخط الخاص للعناوين فقط، مع `var(--font-main)` كـfallback.
- خط أيقونات خاص: بادئة خاصة (`my-icon-`) كي لا تتصادم مع `sicon-`.

---

## 6. كيف يتحوّل هذا إلى طبقات في هذا الثيم

```
Salla runtime      theme.color / theme.font / store.settings      ← قراءة فقط
      ↓
Theme settings     twilight.json → theme.settings                 ← اختيار التاجر
      ↓
Resolver           قراءة واحدة (ThemeLayout)                      ← قرار واحد
      ↓
--pc-* / --gs-*    inline على .app-inner (SSR)                    ← CSS
      ↓
Global tokens      --bg-store / --radius-* / --shadow-* / --motion-*
      ↓
البلوك             يقرأ التوكن، أو يعيد توجيهه محليًا
```

هذا هو النموذج الذي تعتمده §13 في `AGENTS-SKILLS.md`، والوثائق تؤكّده: سلة تنتهي عند «لون + خط»،
والباقي مسؤولية الثيم.

---

## 7. قواعد ملزمة

1. **لا تُنشئ مصدرًا ثانيًا لقيمة توفّرها سلة.** `--color-primary` موجود؛ إعداد «لون أساسي» فوقه يخلق تعارضًا. الحل: وضع صريح (`accentMode: 'salla' | 'custom'`)، لا لون صامت.
2. **`--color-text` ليست لون التاجر.** لا تبنِ عليها قرارًا بصريًا؛ اقرأ `color.text` من JS إن احتجته.
3. **`--color-secondary` ليست لونًا ثانيًا.** هي الأساسي. أي «لون ثانوي» في التصميم = توكن ثيم.
4. **لا تكتب توكنًا على `:root` وقيمته على عنصر متداخل.** `--pc-bg` يُكتب على `.app-inner`؛ رفعه إلى `:root` يكسر ألوان البطاقات.
5. **`--color-primary-dark/light` مشتقّان آليًا.** لا تعاملهما كدرجات مصمّمة.
6. **الوضع الليلي قرار واحد.** لا تجمع `html.dark` و`color-mode-dark` بلا قاعدة أولوية مكتوبة.
7. **`format:"color"` هو المسار الرسمي لأي لون يختاره التاجر.** لا حقول نصية لأكواد hex.
