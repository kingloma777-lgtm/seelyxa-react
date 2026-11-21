# بيانات المتجر — من أين تأتي، وما هو متاح فعلًا

> المصادر: https://docs.salla.dev/twilight/react/data/store ·
> `/hooks/use-store` · `/api/modules/store` · `/data` · **تاريخ القراءة: 2026-11-21**

---

## 1. المصدر الوحيد: `store/settings`

```ts
store.settings(storeIdentifier?)  // GET store/settings?include[]=…&scope=<id>
```

`include`: `store`, `settings`, `theme`, `theme_settings`, `external_services`,
`currencies`, `languages`, `payments`, `product_widgets`, `rating`, `ratings`, `user`.
`scope` يُضاف فقط عند وجود سوق/فرع نشط. **المهلة 5 ثوانٍ** (لا 8 كالمعتاد).

المحرك يجلبه **مرة لكل طلب** ويضعه في المزوّد على جذر التطبيق ⇒ متاح في SSR وأول رسم في المتصفح.

**الرد = `StoreContext`:**

| المفتاح | النوع | ملاحظة |
| --- | --- | --- |
| `store` | `Store` | بيانات المتجر + `settings` الخاصة به |
| `theme` | `Theme` | اللون، الخط، إعدادات الثيم |
| `languages` | `Language[]` | محوَّلة من كائن إلى مصفوفة، مع `iso_code` |
| `currencies` | `Record<string, {code,name,symbol,amount,country_code}>` | `amount` = سعر الصرف |
| `external_services` | object | |
| `login` | `{ url, turnstile_site_key }` | |
| `affiliate` | `{ utm_url, cta_enabled }` | |
| `policy_url` | string | |
| `user` | guest دائمًا | الـendpoint يتجاهل التوكن |
| `maintenance` / `maintenance_details` | boolean / object | المتجر مغلق |
| `launched` | `false` | المتجر لم يُطلق بعد |

⚠️ **`useTwilight().settings` ليس `store.settings`.**
`useTwilight().settings` = رد الإعدادات كاملًا (`store`, `theme`, `languages`, `currencies`…).
`store.settings` = مجموعة إعدادات المتجر فقط.

---

## 2. ثلاث طرق للقراءة — نفس الكائن

| تكتب | تحصل | متى |
| --- | --- | --- |
| `useStore()` | حقول `Store` + `refresh()` | تحتاج `refresh` |
| `useTwilight().store` | حقول `Store` بلا `refresh` | **الأفضل** — هوية ثابتة حتى `refresh()` |
| `useTwilight().settings` | `StoreContext` كاملًا | تحتاج اللغات/العملات/الصيانة |

`useStore()` يعيد كائنًا جديدًا كل render ⇒ لا تستخدمه كـdependency لـ`useEffect`.

---

## 3. حقول `store`

| الحقل | النوع | ملاحظة |
| --- | --- | --- |
| `id` | number | |
| `name`, `username`, `slogan?`, `about?` | string | |
| `description` | string | **HTML** — نظّفه أو اعرضه بحذر |
| `logo`, `icon` | string | |
| `url` | string | يحمل بادئة اللغة على متجر متعدد اللغات (`/ar/`) |
| `api?` | string | |
| `meta?` | `{title,description,keywords}` | افتراضيات SEO |
| `settings` | `StoreSettings` | القسم التالي |
| `contacts` | `{mobile,phone,email,whatsapp,telegram}` | |
| `social` | `{instagram,snapchat,twitter,youtube,facebook,pinterest,maroof,whatsapp,tiktok}` | |
| `country`, `store_country?` | string | ISO كبير (`SA`) |
| `features?` | string[] | أعلام المنصة (`guest-checkout` …) |
| `apps?` | `{appstore,googleplay}` | |
| `scope?` | `StoreScope \| null` | السوق/الفرع، أو null |
| `shipping?` | `{delivery_location,express_delivery_promise,support_pickup,has_bullet_delivery_tag}` | |
| `rating?`, `ratings?` | `{total,stars}` / مصفوفة توزيع | |
| `order_instruction?` | HTML strings | صفحة الشكر |
| `is_merchant?` | boolean | **مُعلَّم للإزالة** — استخدم `theme.mode` |
| `template?`, `ray?` | — | لا تعتمد عليها |

---

## 4. `store.settings` — المجموعات

### 4.1 المستوى الأعلى

`auth` · `cart` · `product` · `category` · `rating` · `blog` · `keys` · `tax` · `certificate` ·
`opening_hours` · `features` · `payments?` · `arabic_numbers_enabled` · `content_copyright?` ·
`use_sar_symbol?` · `is_multilingual` · `currencies_enabled` · `rating_enabled` · `blog?` ·
`is_loyalty_enabled?` · `is_salla_gateway?` · `upload_size?` · `made_in_ksa?` ·
`commercial_number?` · `freelance_number?` · `buy_now?` · `installments?` · `quick_order?` ·
`bullet_delivery?` · `ticketing_system_enabled?`

### 4.2 `settings.auth`

`email_allowed` · `mobile_allowed` · `is_email_required` · `countries?` · `force_login?` ·
`whatsapp_allowed?` · `whatsapp_countries?` · `whatsapp_merchant_allowed?` · `user_country?`

### 4.3 `settings.cart`

`apply_coupon_enabled` · `basket_gap?` · `multi_coupon?`

### 4.4 `settings.product`

`total_sold_enabled` (**1 أو 0، لا boolean**) · `manual_quantity?` · `fit_type?` (`contain`/`cover`/null) ·
`related_products_enabled?` · `filters?` · `product-recommendation-type?` (**شرطات ⇒ أقواس**) ·
`bought_together?` · `show_comments?` · `user_can_comment?` · `show_price_as_dash?` ·
`notify_options_availability?` · `show_special_offers?` · `show_more?` ·
`availability_notify?` `{email,sms,mobile,whatsapp}`

### 4.5 `settings.rating` · `settings.blog` · `settings.tax` · `settings.keys`

`rating`: `is_enabled`, `show_on_category`, `show_on_product`, `can_rate_store`, `can_rate_product`,
`can_rate_shipping`, `show_rating_summary`, `show_recommendation`, `allow_likes`,
`allow_attach_images`, `allow_contact_support`, `allow_update`, `update_period`,
`can_customer_hide_name`, `visitor_can_comment`, `page_feedback_enabled`

`blog`: `is_enabled`, `allow_likes_and_comments`
`tax`: `number?`, `certificate?`, `taxable_prices_enabled`
`keys`: `maps?`, `gtm?`, `sift?`

### 4.6 `settings.opening_hours`

`enabled?` · `hours?`: `Record<day, string[]>` بأسماء أيام **صغيرة**؛ يوم بلا مدخل أو قائمة فارغة = مغلق.
يُقرأ عبر `useOpeningHours()` → `isOpen`, `isEnabled`, `nextOpen`, `nextOpenFormatted`.

---

## 5. اللغات والعملات — ليست في `store`

```tsx
const { store, settings, locale } = useTwilight();
store.settings?.is_multilingual;      // boolean
settings.languages;                   // [{ name, code, is_rtl, country_code, url, iso_code }]
settings.currencies;                  // { SAR: { amount: 1, … }, USD: { amount: 0.267589, … } }
store.settings?.currencies_enabled;   // boolean
```

`language.url` = أيقونة علم، **لا صفحة**. تنسيق الأسعار عبر `useMoney`، لا حساب يدوي.

---

## 6. الصيانة والإطلاق

| الحالة | ما تراه | ما تفعله |
| --- | --- | --- |
| `maintenance: true` | المحرك يعرض `MaintenancePage` مكان الـlayout بـ**200** (لا 503) و`Cache-Control: no-store, private` | لا شيء — إلا إن أردت صفحتك عبر `maintenancePage` |
| `launched: false` | صفحة «قريبًا» بلغة المنصة | افحص `launched` قبل عرض `maintenance_details` |
| التاجر | يرى المتجر + شريط الصيانة | يُحدَّد من `?utm_source=dashboard&identifier=<storeId>` أو كوكي `salla_view_as` أو `preview.salla.design` أو `theme.mode==='preview'` |

في التطوير: شريط «View the store as the merchant» يظهر أعلى صفحة الصيانة (يُحذف من build الإنتاج).

---

## 7. مصفوفة الإتاحة (جواب أسئلة الطلب)

| السؤال | الجواب |
| --- | --- |
| أثناء SSR؟ | **نعم** — `store`, `theme`, `languages`, `currencies` تُجلب في الطلب وتُرسل مع HTML |
| في المتصفح؟ | **نعم** — نفس الكائن، وأول رسم يطابق السيرفر |
| من React مباشرة؟ | **نعم** — `useStore` / `useTheme` / `useTwilight` |
| تحتاج API call؟ | **لا** — المحرك جلبها. `store.settings()` متاح لكنه نادرًا ما يُحتاج |
| تحتاج OAuth؟ | **لا** — الـendpoint عام، والتوكن مُتجاهَل (`user` دائمًا guest) |
| للثيم فقط أم للتطبيقات؟ | **للمتجر** (storefront). Merchant API (`api.salla.dev/admin/v2`) شيء آخر تمامًا: OAuth + scopes + 14 يومًا للتوكن |
| بيانات العميل؟ | **لا** في هذا الـendpoint. العميل من `useUser()` (توكن المتصفح) — لا يوجد في SSR |

> **الخلاصة التي تمنع الخطأ المعماري:** كل ما تحتاجه لعرض المتجر متاح بلا مصادقة وبلا طلب إضافي.
> لا تبنِ «إعدادات عامة» لتخزين ما توفره سلة أصلًا.

---

## 8. الفخاخ

- **الكثير اختياري**: `slogan`, `about`, `favicon`, `api`, `scope`, `opening_hours`, `social.*`, `contacts.*` — استخدم `?.`.
- **الأنواع أوسع من البيانات**: `filters`, `buy_now`, `installments` اتحاد (boolean/string/object/null) — ضيّقها قبل الاستخدام.
- **`installments: []` صحيحة لكن truthy**.
- **مفاتيح غير صالحة كمعرّفات**: `settings.product['product-recommendation-type']`, `settings.features['pre-order-campaigns']`.
- **`store.id` رقم**، لكن `certificate.id` نص.
- **`store` قد يكون `{}`** قبل وصول الإعدادات ⇒ `store.settings?.…`.
- **`settings` يتبع لغة الصفحة** في `url`، بينما `name`/`description` كما كتبهما التاجر.

---

## 9. واقع هذا المشروع

المستهلك فعليًا من `store.settings` (مقاس 2026-11-21):

| المفتاح | عدد المواضع |
| --- | --- |
| `is_multilingual` | 2 |
| `currencies_enabled` | 2 |
| `cart.apply_coupon_enabled` | 1 |
| `product.filters` | مستخدم |
| `category.testimonial_enabled` | مستخدم |
| `rating.show_on_product` | مستخدم |
| `buy_now` | مستخدم |

**غير مستخدم وموجود رسميًا:** `product.fit_type` · `product.show_price_as_dash` ·
`arabic_numbers_enabled` · `use_sar_symbol` · `settings.opening_hours` · `settings.tax.*` ·
`settings.blog.*` · `settings.rating.*` (معظمها).

⚠️ `display_copyright` — ذكره تقرير المرحلة صفر كمتاح. **ليس في جدول الوثائق الرسمي** ⇒
غير مؤكَّد؛ تحقّق من رد `store/settings` لمتجر حقيقي قبل بناء أي شيء عليه.
