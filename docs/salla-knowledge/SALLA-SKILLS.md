# مهارات سلة الرسمية — المثبّتة والمتاحة

> المصادر: https://docs.salla.dev/ai-agent-kit/overview ·
> https://docs.salla.dev/doc-2228617 (Install via Plugin) · https://docs.salla.dev/doc-2228619 (Skills Only) ·
> https://docs.salla.dev/doc-2228621 (Skills Reference) ·
> https://github.com/SallaApp/salla-partners-agent-kit · **تاريخ القراءة: 2026-11-21**

---

## 1. ما هي

ملفات معرفة (`SKILL.md` + `references/`) تعلّم الوكيل كيف تعمل منصة سلة: دورة OAuth، عقود webhooks،
App Functions، بلوكات المتجر، الفوترة، النشر، **والثيمات**. الوكيل يقرأها بصمت قبل أن يتصرّف.

**المهارات تعلّم «كيف». MCP يمنح «الفعل».** يمكن استخدام المهارات وحدها كمرجع للقراءة فقط.

---

## 2. أوامر التثبيت الرسمية (حرفيًا)

| الأداة | الأمر |
| --- | --- |
| Claude Code | `claude plugin marketplace add SallaApp/salla-partners-agent-kit` ثم `/mcp` للتفويض |
| Cursor / Copilot / Codex | `npx plugins add SallaApp/salla-partners-agent-kit` |
| Gemini CLI | `gemini extensions install https://github.com/SallaApp/salla-partners-agent-kit` |
| **المهارات فقط (أي أداة)** | `npx skills add SallaApp/salla-partners-agent-kit` |
| مهارة واحدة | `npx skills add SallaApp/salla-partners-agent-kit --skill salla-app-builder` |

المصدر: `/doc-2228619` و`/doc-2228617` و`README` المستودع.

---

## 3. ما نُفّذ فعليًا في هذه البيئة (وما لم يُنفّذ)

| المحاولة | النتيجة |
| --- | --- |
| `npx -y skills@latest add SallaApp/salla-partners-agent-kit -g -y --json` | **علّق 11 دقيقة بلا أي مخرجات**، فأُوقف. لم يُثبَّت شيء من هذا الأمر |
| `git clone --depth 1` للمستودع الرسمي ثم نسخ `.agents/skills/*` إلى `~/.workbuddy-ai/skills/` | **نجح**: 29 مجلدًا، كل واحد يحوي `SKILL.md` |

**لماذا هذا ليس اختراعًا لطريقة تثبيت:**
- الوثائق نفسها تقول إن الاكتشاف يختلف بحسب الأداة، وأن **Copilot يكتشف `.agents/skills/` أصلًا**،
  وأن Claude/Codex يقرآن manifest — أي أن «مجلد مهارات» هو الوحدة القابلة للنقل.
- WorkBuddy يكتشف مهارات المستخدم في `~/.workbuddy-ai/skills/` (نفس عقد `SKILL.md` + frontmatter).
- المنقول هو **الملفات الرسمية بعينها**، بلا تعديل.

التحقق:

```bash
ls ~/.workbuddy-ai/skills | grep '^salla-' | wc -l     # 29
for d in ~/.workbuddy-ai/skills/salla-*; do [ -f "$d/SKILL.md" ] || echo "MISSING $d"; done
```

---

## 4. المهارات الـ29 (6 طبقات)

| الطبقة | المهارات |
| --- | --- |
| **الأساس** | `salla-app-expert` · `salla-api-core` · `salla-app-auth` · `salla-webhooks` · `salla-docs` |
| **Hookables** | `salla-app-functions` · `salla-snippets` · `salla-snippets-migration` · `salla-embedded-app` · `salla-app-settings` · `salla-app-ui-builder` |
| **أنواع التطبيقات** | `salla-app-builder` · `salla-shipping-app` · `salla-communication-app` |
| **دورة الحياة والفوترة** | `salla-app-lifecycle` · `salla-app-billing` · `salla-addon-purchase` · `salla-addon-purchase-embedded` · `salla-checkout-sdk-purchase` |
| **الثيمات** | **`salla-theme-builder`** |
| **الجودة والإطلاق** | `salla-storefront-ui` · `salla-embedded-ui` · `salla-live-testing` · `salla-publication-consistency` |

بالإضافة إلى خمس مهارات خطوات لـApp Functions: `-design`, `-handler`, `-validate`, `-test`, `-release`.

---

## 5. أيّها يخص هذا الثيم

| المهارة | لماذا تهمّنا | الأولوية |
| --- | --- | --- |
| **`salla-docs`** | توجيه لأي صفحة وثائق، ومعرفة أن وثائق React في `docs.salla.dev/twilight/react/` | ★★★ اقرأها أولًا دائمًا |
| **`salla-theme-builder`** | `salla_themes` MCP: قراءة `twilight.json` من البورتال، المكوّنات، الإعدادات، النشر | ★★★ |
| `salla-storefront-ui` | قواعد «واجهة أصلية» داخل المتجر: `salla-*`، توكنات Twilight، `sicon-*`، عربي أولًا | ★★ (تخص التطبيقات، لكن قواعدها مفيدة) |
| `salla-api-core` | اتفاقيات Merchant API: Bearer، ترقيم، حدود المعدل، أشكال الأخطاء | ★★ عند لمس API |
| `salla-app-auth` | دورة OAuth للمتجر | ★ عند الحاجة |
| `salla-webhooks` | تسجيل + HMAC + retry | ★ عند الحاجة |
| `salla-snippets` | JS يُحقن في متجر العميل (يخص التطبيقات لا الثيم) | ☆ سياق |
| `salla-app-expert` | راوتر للتطبيقات — **يوجّه الثيمات إلى `salla-theme-builder`** | ★ |

**غير ذات صلة بالثيم:** `salla-app-builder`, `salla-app-billing`, `salla-app-lifecycle`,
`salla-shipping-app`, `salla-communication-app`, `salla-embedded-*`, `salla-addon-*`,
`salla-checkout-sdk-purchase`, `salla-publication-consistency`, `salla-live-testing`,
`salla-app-functions*`. ثُبّتت لأنها المكتبة الرسمية كاملة ولأنها متشابكة الروابط.

---

## 6. حدود المهارات

- **لا تفعل شيئًا على البورتال** — هذا عمل MCP.
- **لا تعرف وثائق المحرك مباشرة**: `salla-theme-builder` تحيل صراحةً إلى `salla-docs` أو
  `salla_themes_docs` لمواضيع Twilight/React. أي سؤال عن hooks/slots/API client ⇒ الوثائق.
- **`salla-theme-builder` ليست لتطوير كود الثيم** — كود الثيم عبر Salla CLI، والوثائق.

---

## 7. التحديث

| طريقة التثبيت | التحديث |
| --- | --- |
| Plugin | تلقائي مع إصدارات المهارات والأدوات |
| تثبيت يدوي | **لا يتحدّث تلقائيًا** — يجب سحب التحديثات |

بما أن التثبيت هنا يدوي، فالتحديث:

```bash
cd /tmp && rm -rf salla-kit && git clone --depth 1 https://github.com/SallaApp/salla-partners-agent-kit.git salla-kit
cp -r salla-kit/.agents/skills/* ~/.workbuddy-ai/skills/
```

قبل النسخ، راجع `CHANGELOG.md` في المستودع لتعرف ما تغيّر.

---

## 8. قواعد الاستخدام في هذا المشروع

1. **قبل أي مهمة تخص تطوير ثيم سلة**: `salla-docs` إن كان السؤال «أين الوثيقة؟»، وإلا الوثيقة مباشرة.
2. **قبل أي فعل على حساب الشركاء**: `salla-theme-builder` + `SALLA-MCP.md`.
3. **لا تخترع اسم أداة أو خاصية** — المهارات والوثائق هي المرجع، لا الذاكرة.
4. **المهارات مرجع، لا مكتبة كود.** لا تنسخ أنماط React منها إلى هذا الثيم؛ أنماط الثيم في `AGENTS-SKILLS.md`.
