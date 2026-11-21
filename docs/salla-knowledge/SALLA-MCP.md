# Salla Partners MCP — العقد، الإعداد، الحالة

> المصادر: https://docs.salla.dev/ai-agent-kit/mcp · https://docs.salla.dev/doc-2228622 ·
> https://docs.salla.dev/twilight/react/start/build-with-ai ·
> مهارة `salla-theme-builder` + `references/theme-api-notes.md` ·
> **فحص مباشر للخادم: 2026-11-21**

---

## 1. ما هو

خادم **HTTP عن بُعد** يمنح الوكيل أفعالًا على Partners Portal: إنشاء التطبيقات، ضبط OAuth،
الاشتراك بالأحداث، إدارة الإعدادات، **وإدارة الثيمات**، والنشر.

```
https://partners.mcp.salla.dev
```

---

## 2. الإعداد في هذه البيئة

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "salla-partners": {
      "type": "streamable-http",
      "url": "https://partners.mcp.salla.dev"
    }
  }
}
```

الملف كان `{"mcpServers": {}}` — أُضيف المدخل ولم يُحذف شيء.

### ⚠️ فخ النقل (transport) — مُكلَّف

وثائق سلة (ووثائق Cursor) تكتب `"type": "http"`. **WorkBuddy لا يعرف هذه القيمة**:
كل موصلاته البعيدة الـ29 تُعرَّف `"type": "streamable-http"`، وواحد فقط `"stdio"`.
القيمة الخاطئة تجعل الخادم **لا يُحمَّل إطلاقًا** ⇒ لا يظهر في صفحة الموصّلات ⇒ لا يمكن تفويضه،
بلا رسالة خطأ. هذه كانت سبب «الإعداد موجود والمخدوم غير موجود».

قاعدة: **البروتوكول واحد (MCP Streamable HTTP)، والاسم يختلف بحسب المضيف.** في WorkBuddy:
`streamable-http`.

### قواعد التحقق الفعلية (مستخرجة من الحزمة، لا مُستنتجة)

دالة `parseAgentPluginMcp` في `app.asar` هي **المرشِّح الصامت**: أي مدخل يخالفها يُسقَط
بـ `Skipping MCP server <name>: <reason>` في السجل، **ولا يظهر في الواجهة إطلاقًا**.

| القاعدة | التفصيل |
| --- | --- |
| `$schema` | يجب أن يساوي **حرفيًا** `https://agent-plugins.org/schemas/1.0.0/mcp.schema.json` |
| مفاتيح الجذر | `$schema` و`mcpServers` فقط — أي مفتاح آخر ⇒ `Invalid Agent Plugins mcp.json` |
| `stdio` — الحقول المسموحة | `type, command, args, env, cwd` حصرًا |
| `stdio` — `command` | **رمز تنفيذي واحد**: لا مسافة ولا `/` ولا `\` إلا إذا بدأ بـ `./` |
| `stdio` — `env` | ممنوع `PLUGIN_ROOT` / `PLUGIN_DATA` |
| بعيد — الحقول المسموحة | `type, url, headers` حصرًا |
| بعيد — `type` | `streamable-http` أو `sse` فقط. غير ذلك ⇒ `unsupported transport` |
| بعيد — `url` | **https** إلزامي (http مسموح فقط للـloopback) |

> **درس عملي:** `stdio` مع `command: "npx"` يمرّ التحقق لكنه يفشل عند التشغيل على Windows
> (`npx` ملف `.cmd` لا يُنفَّذ بلا shell) ⇒ يظهر `failed`. المسار الصحيح هو
> `streamable-http` مباشرة: بلا عملية فرعية، وبلا `mcp-remote`، ويتيح OAuth الأصلي في WorkBuddy.

### 🔴 السبب الجذري لـ«لا يظهر في الموصّلات»: `mcp.json` يُقرأ عند الإقلاع فقط

`mcp.json` يُقرأ مرة واحدة عند بدء التطبيق. تعديله على القرص **لا يصل** إلى الواجهة،
ولا يُكتب أي سطر في السجل عن المدخل الجديد — وهذا هو الدليل القاطع (صفر ذكر لـ`salla-partners`
في `main.log` و`daemon.log` و`renderer.log` بينما عملية التطبيق تعمل منذ أيام).

مساران لإعادة القراءة:

1. **بلا إعادة تشغيل:** نافذة **MCP Server Management** ← زر **Configure MCP** ← يُقرأ الملف من
   القرص ← **Save**. النص الرسمي في الواجهة: «Saving refreshes the MCP server list automatically».
2. **إعادة تشغيل كاملة** للتطبيق (إغلاق من الـtray لا إغلاق النافذة فقط).

> **الحالة: مُعدّ بشكل صحيح ومُتحقَّق منه، غير مُفوَّض.** لا تدّعِ أنه متصل قبل تفويض المتصفح.
> بعد ظهوره: زر **Connect** ← «Authorizing…» ← نافذة المتصفح. التفويض **بوابة موافقة**
> لا يمكن للوكيل تجاوزها.

### ما يُثبت أن المدخل صالح دون فتح الواجهة

```bash
node -e 'const fs=require("fs"),p=process.env.HOME+"/.workbuddy-ai/mcp.json";
const c=JSON.parse(fs.readFileSync(p,"utf8"));
console.log(c.$schema, Object.keys(c.mcpServers));'
```

المتوقَّع: مخطَّط `agent-plugins.org` + `[ "salla-partners" ]`.

### ما يثبت أن الخادم سليم بعد الإعداد

```bash
curl -s -D - -o /dev/null -X POST https://partners.mcp.salla.dev \
  -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"probe","version":"1"}}}'
```

المتوقَّع (بدون توكن):

```
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="salla-partners-mcp",
  resource_metadata="https://partners.mcp.salla.dev/.well-known/oauth-protected-resource",
  error="invalid_token"
```

`401` + `WWW-Authenticate` صحيح = الخادم حيّ ويعرف كيف يطلب التفويض. هذا **ليس** اتصالًا ناجحًا.


---

## 3. التفويض — OAuth 2.1 + PKCE (متحقَّق من الخادم)

بيانات الاكتشاف الحقيقية (`/.well-known/oauth-authorization-server`, 2026-11-21):

| البند | القيمة |
| --- | --- |
| `issuer` | `https://partners.mcp.salla.dev` |
| `authorization_endpoint` | `…/authorize` |
| `token_endpoint` | `…/token` |
| `registration_endpoint` | `…/register` ← **تسجيل عميل ديناميكي** |
| `revocation_endpoint` | `…/revoke` |
| `code_challenge_methods_supported` | `["S256"]` ← **PKCE إلزامي** |
| `grant_types_supported` | `authorization_code`, `refresh_token` |
| `token_endpoint_auth_methods_supported` | `["none"]` ← عميل عام، بلا سر |
| `scopes_supported` | `app-functions`, `app-reports` |
| `resource` (protected-resource) | `https://partners.mcp.salla.dev` |
| `bearer_methods_supported` | `header` |

**قراءة مهمة:** الجلسة **~14 يومًا** ثم يُجدَّد أو يُعاد التفويض.
والصلاحيات الفعلية للأدوات **لا تُحدَّد بهذه الـscopes** — بل بدور المستخدم في البورتال
(مثل `manage-themes`). لذلك قد تنجح `list` وتفشل `get` بنفس الجلسة.

فحص بلا تفويض (متوقَّع 401):

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://partners.mcp.salla.dev \
  -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"probe","version":"1"}}}'
# ⇒ 401
```

### سلسلة إعادة التوجيه — من أين تأتي رسالة «فشل التفويض»

مُتحقَّق بالقياس (`curl -i`، 2026-11-21) بتسجيل عميل ديناميكي + PKCE S256:

```
GET https://partners.mcp.salla.dev/authorize?response_type=code&client_id=…&code_challenge=…&code_challenge_method=S256
  ⇒ 302 Location: https://portal.salla.partners/oauth/authorize?state=…&code_challenge=…&redirect_uri=…
GET https://portal.salla.partners/oauth/authorize?…
  ⇒ 200 text/html  <title>Salla for Partners</title>  (SPA — «You need to enable JavaScript»)
```

**الاستنتاج الحاسم:** خادم MCP **لا يرفض** — يمرّر التفويض إلى **بوابة الشركاء**.
صفحة «فشل التفويض / تم رفض طلب التفويض أو تعذر إكماله» تُنتجها **`portal.salla.partners`**
من جهة العميل (SPA)، وسببها أحد أمرين لا ثالث لهما:

1. **لا جلسة دخول فعّالة** للبورتال في ذلك المتصفح ⇒ البوابة لا تجد مَن تُفوّض.
2. **رابط مُستهلَك أو قديم** (`state` أُحرِق مرة) أو حساب بلا صلاحية `manage-themes`.

لذلك: **افتح التفويض من داخل WorkBuddy** (زر `Connect`) لا من رابط محفوظ أو مُعاد استخدامه —
التطبيق يولّد `state` و`code_verifier` جديدين في كل محاولة، ويربطهما بنافذته.

---

## 4. الأدوات — التطبيقات

| الأداة | الأفعال | تفعل |
| --- | --- | --- |
| `salla_apps` | `list` `get` `create` `update` `connect` `set_status` `publish` | إنشاء/ضبط/نشر التطبيقات |
| `salla_events` | `list` `subscribe` | اشتراك بأحداث المتجر ودورة الحياة |
| `salla_snippets` | `list` `parameters` `create` `update` `delete` | بلوكات HTML/JS في المتجر |
| `salla_embedded_pages` | `list` `create` `update` `delete` | صفحات iframe في لوحة التاجر |
| `salla_onboarding_steps` | `list` `create` `update` `delete` `sort` | خطوات ما بعد التركيب |
| `salla_settings` | `define_form` `set_validation_url` `list_features` `set_features` | نموذج إعدادات التاجر |
| `salla_shipping` | `get_zones` `set_zones` `set_settings` | مناطق الشحن |
| `salla_scopes` | `get` `set` | قراءة/تعديل scopes |
| `salla_upload` | — | رفع صور/ملفات، يعيد `file id` |
| `salla_reference` | `categories` `countries` `cities` | بيانات مرجعية للقراءة |

بعض الأدوات **مبوَّبة من السيرفر**: `salla_functions` تحتاج تفعيل خدمة App Builder على الحساب.
إن لم تظهر أداة أو أعادت خطأً مجهولًا: `t.me/salladev`.

---

## 5. الأدوات — الثيمات والوثائق

| الأداة | الأفعال | تفعل |
| --- | --- | --- |
| `salla_themes` | `list` `get` `github_config` `categories` `components` `component_get` `settings` `screenshots` `publishing` · `create` `update_details` `screenshot_*` `component_*` `settings_update` `publish` `publish_withdraw` `set_status` `sample_store_*` `preview_store_set` | إدارة ثيمات الشريك |
| `salla_themes_docs` | `search` `read` `list` | **وثائق محرك React/Twilight نفسها** — نفس الخادم ونفس الدخول |

`github_config` هو **الطريقة الوحيدة** لقراءة `components` و`settings` من ثيم:
البورتال يفلتر `twilight.json` إلى `features`, `settings`, `components`, `tags`, `templates`,
زائد `all_features` و`branches`. لا يوجد GET للمكوّنات أو الإعدادات.

`create` **ليس idempotent**: ينشئ ثيمًا **ومستودع GitHub خاصًا**. بعد timeout: `list q="<name>"` قبل الإعادة.
كل ثيم جديد يأتي بـ`price = 250` مفروضًا من السيرفر (عام 250–50000، خاص 1000–50000).

---

## 6. ما لا يفعله MCP

1. التحقق من webhooks وإعادة المحاولة.
2. تخزين توكن OAuth وتجديده.
3. كود App Functions.
4. نداءات Embedded SDK.
5. **تشغيل الثيم محليًا** — هذا `salla theme dev` (CLI).
6. **لا تُكتب إعدادات الثيم عبره بأمان**: `settings_update` يستبدل **المصفوفة كاملة**؛
   الأداة تدمج وتحرس الحذف، لكن الوثائق تنصح صراحةً بإجراء التعديلات في البورتال.

---

## 7. جدول الأخطاء (من مهارة الثيم الرسمية)

| ما تراه | المعنى | ماذا تفعل |
| --- | --- | --- |
| `403` «lacks `manage-themes`» | دور المستخدم بلا صلاحية الثيمات | مالك الشركة يمنحها في البورتال. إعادة الاتصال لا تنفع |
| `401` على `get`/`create` بينما `list` يعمل | الشركة ليست في `theme_allowed_users` | اطلب من سلة تفعيل الثيمات. إعادة الاتصال لا تنفع |
| `401` على كل شيء | الجلسة منتهية | أعد التفويض |
| «no GitHub App installation» | لا حساب يستطيع تملّك المستودع | ثبّت GitHub App من الرابط، ثم أعد `create`. **لم يُنشأ شيء** |
| «N GitHub App installations …» | المالك غير محسوم | اسأل الشريك أي حساب |
| خطأ حقل (422) | قاعدة تحقق في البورتال | أصلح الحقل المذكور |
| `5xx` | خلل في البورتال | لـ`create`: `list q` قبل الإعادة |

---

## 8. قواعد إلزامية (من طلب صاحب المشروع)

- **لا إجراء على حساب الشركاء بلا موافقة صريحة**: لا إنشاء تطبيق، لا تعديل إعدادات، لا نشر.
- `publish` = **طلب مراجعة**، لا نشر مباشر: يجمّد النسخة من التعديل.
- `component_update` و`preview_store_set` **بلا فحص إصدار**: تعديل من اللوحة بين القراءة والكتابة يُدهس.
- أي `confirm: true` قرار الشريك، لا قرار الوكيل.
