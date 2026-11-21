# Salla Knowledge — المرجع الرسمي لهذا الثيم

> **الغرض:** مرجع تقني عملي مستخرج من وثائق سلة الرسمية، لا من معرفة عامة عن React.
> كل ملف هنا يجيب سؤالًا يُطرح أثناء العمل، ويحمل رابط المصدر بجوار المعلومة.
>
> **تاريخ المراجعة:** 2026-11-21 · **الإصدار المثبّت:** `@salla.sa/twilight-theme-engine@1.0.133`
> **قاعدة:** عند تعارض هذا المرجع مع وثائق أحدث، الوثائق الرسمية تفوز — وحدّث الملف.

---

## لماذا هذا المجلد

الثيم مبني على محرك Twilight (React)، والمحرك يفرض حدودًا ليست بديهية:

- بعض القيم تأتي من سلة (قراءة فقط)، وبعضها إعداد ثيم، وبعضها توكن داخلي، وبعضها حرفي في الكود. **خلطها هو مصدر معظم الأخطاء في هذا المشروع.**
- `features` في `twilight.json` **لا تُقرأ في وقت التشغيل** — ليست جزءًا من كائن الثيم.
- متغيّرات CSS يكتبها المحرك **في المتصفح فقط**، لا في SSR.
- سلة لا توفّر نظام «إعدادات عامة» — توفّر إعدادات ثيم فقط، والثيم هو من يبني طبقة التوكنات.

هذه الأربع وحدها تُبطل قرارات معمارية كثيرة لو بُنيت على الافتراض.

---

## الفهرس

| الملف | يجيب عن |
| --- | --- |
| [`TWILIGHT-ENGINE.md`](TWILIGHT-ENGINE.md) | ما هو الثيم في سلة، ما يملكه المحرك وما نملكه، البنية، CLI، الهجرة من Twig |
| [`THEME-SETTINGS.md`](THEME-SETTINGS.md) | `twilight.json` بالكامل: الأنواع الستة، التنسيقات، المفاتيح، `conditions`، بلوكات الرئيسية |
| [`STOREFRONT-DATA.md`](STOREFRONT-DATA.md) | كل حقل في `store` و`store.settings`، ومتى يكون متاحًا في SSR |
| [`STOREFRONT-SDK.md`](STOREFRONT-SDK.md) | Salla SDK في المتصفح: السلة، المفضلة، الدخول، الأحداث، `Salla.hooks` |
| [`THEME-RUNTIME.md`](THEME-RUNTIME.md) | دورة حياة الطلب: middleware → route → loader → SSR → hydration، و`getTwilightContext()` |
| [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) | ما توفره سلة فعلًا للون والخط والوضع الليلي، وما يجب أن يبنيه الثيم |
| [`SALLA-SKILLS.md`](SALLA-SKILLS.md) | المهارات الرسمية الـ29 المثبّتة، وأيها يخص الثيم |
| [`SALLA-MCP.md`](SALLA-MCP.md) | Partners MCP: العقد، OAuth 2.1 + PKCE، الأدوات، حالة الاتصال |
| [`COMPATIBILITY.md`](COMPATIBILITY.md) | جدول توافق: الوثائق ↔ الإصدار المثبّت ↔ وضع المشروع |
| [`GLOBAL-SETTINGS-REASSESSMENT.md`](GLOBAL-SETTINGS-REASSESSMENT.md) | إعادة تدقيق تقرير المرحلة صفر على ضوء الوثائق |

---

## المصادر الرسمية (تاريخ القراءة: 2026-11-21)

| المصدر | الرابط | ما أُخذ منه |
| --- | --- | --- |
| وثائق محرك React/Twilight | https://docs.salla.dev/twilight/react/llms.txt | الفهرس الكامل لوثائق المحرك |
| `twilight.json` reference | https://docs.salla.dev/twilight/react/guide/twilight-json | الأنواع الستة، المفاتيح، `conditions`، المدقّق |
| Settings | https://docs.salla.dev/twilight/react/guide/settings | كيف يُعلَن الإعداد ويُقرأ |
| Theme data | https://docs.salla.dev/twilight/react/data/theme | حقول كائن الثيم + متغيّرات CSS |
| Store data | https://docs.salla.dev/twilight/react/data/store | حقول كائن المتجر + `settings.*` |
| Styling | https://docs.salla.dev/twilight/react/guide/styling | `--color-*`، `--font-main`، الوضع الليلي |
| How it works | https://docs.salla.dev/twilight/react/start/how-it-works | دورة حياة الطلب |
| Changelog | https://docs.salla.dev/twilight/react/changelog | إطلاق React (2026-10-15) والموعد النهائي للهجرة |
| Agent Kit — Overview | https://docs.salla.dev/ai-agent-kit/overview | Skills + MCP |
| Agent Kit — Skills | https://docs.salla.dev/doc-2228619 | أوامر التثبيت |
| Agent Kit — MCP | https://docs.salla.dev/ai-agent-kit/mcp | الخادم والتفويض |
| MCP Tools Reference | https://docs.salla.dev/doc-2228622 | قائمة الأدوات |
| Skills Reference | https://docs.salla.dev/doc-2228621 | أسماء المهارات |
| المستودع الرسمي | https://github.com/SallaApp/salla-partners-agent-kit | ملفات المهارات الفعلية |

> كل صفحة من وثائق المحرك متاحة كـ Markdown بإضافة `.md` إلى عنوانها — أرخص طريقة للتحقق:
> `curl -s https://docs.salla.dev/twilight/react/guide/twilight-json.md`

---

## كيف تستخدم هذا المرجع

1. **قبل كتابة أي كود يقرأ من سلة**: افتح `STOREFRONT-DATA.md` أو `THEME-SETTINGS.md` — لا تخمّن اسم حقل.
2. **قبل إضافة إعداد للتاجر**: `THEME-SETTINGS.md` (الأنواع والتنسيقات) + `GLOBAL-SETTINGS-REASSESSMENT.md` (قرار المعمارية).
3. **قبل لمس اللون أو الخط أو الوضع الليلي**: `DESIGN-SYSTEM.md`.
4. **قبل أي عمل على حساب الشركاء**: `SALLA-MCP.md` — وما لا يفعله MCP مذكور صراحة.
5. **عند الشك في إصدار**: `COMPATIBILITY.md` — وفيه أوامر التحقق.

---

## طبقات القيمة الخمس (لا تُخلط)

| الطبقة | مثال | من يغيّرها | أين تُعرَّف |
| --- | --- | --- | --- |
| قيمة يكتبها المحرك | `--color-primary`, `--font-main` | التاجر من لوحة سلة | inline على `<html>` في المتصفح |
| بيانات متجر | `store.settings.product.fit_type` | التاجر من لوحة سلة | `store/settings` API |
| إعداد ثيم | `product_card_bg` | التاجر من محرر الثيم | `twilight.json` → `theme.settings` |
| توكن داخلي | `--bg-store`, `--radius-card` | مؤلف الثيم | `01-settings/*.scss` |
| حرفي في الكود | `#004956` | مؤلف الثيم | TSX/SCSS — وهذا ما يحاربه `audit:design` |

---

## بوابة التحقق (شغّلها قبل أي ادعاء)

```bash
cd seelyxa-react
npm run check:manifest -- --strict        # عقد twilight.json كما تفرضه سلة
npx vitest run tests/styles              # سلسلة التوكنات والتباين
npm run audit:design                     # ألوان الهوية المكتوبة يدويًا
npx tsc --noEmit
```

آخر نتيجة مسجَّلة (2026-11-21): `twilight.json: 0 error(s), 0 warning(s)`.

---

## الصيانة

- عندما يتغيّر إصدار المحرك: أعد قراءة `changelog.md` وحدّث `COMPATIBILITY.md` وحده.
- عندما تُضاف مهارة رسمية: `SALLA-SKILLS.md`.
- عندما تفتح سلة أداة MCP جديدة: `SALLA-MCP.md`.
- لا تنسخ صفحات الوثائق هنا. سجّل الخلاصة العملية + الرابط.
