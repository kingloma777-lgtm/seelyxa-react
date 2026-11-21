# Salla SDK في المتصفح

> المصادر: https://docs.salla.dev/twilight/react/sdk · `/sdk/events` ·
> `/sdk/component-hooks` · `/sdk/config` · **تاريخ القراءة: 2026-11-21**

---

## 1. ما هو، ومن يجهّزه

**Salla SDK** سكربت يحمّله المحرك في كل صفحة. في الكود هو `window.salla` (و`window.Salla`).
**لا تُثبّته ولا تنادي `Salla.init()`** — المحرك يبدأه ببيانات المتجر والثيم والعميل.

**يوجد في المتصفح فقط.** لا `window` على السيرفر ⇒ استدعِه من `useEffect` أو من معالج حدث،
**لا أثناء الرسم** (يكسر SSR).

```ts
await Salla.onReady();   // آمن في أي وقت؛ يُحلّ بعد `twilight::initiated`
```

---

## 2. SDK أم API client؟

| استخدم | متى | مثال |
| --- | --- | --- |
| API client (`.../api/...`) | **قراءة** بيانات لصفحة، سيرفر أو متصفح | `product.find(id)` في loader |
| SDK | **تغيير** شيء للعميل، في المتصفح | `Salla.cart.addItem(...)` على نقرة |

قبل الاثنين، افحص الـhooks: `useWishlist`, `useProduct`, `useCoupon` تنادي SDK نيابةً عنك وتُبقي الصفحة متزامنة.

---

## 3. عقد الاستدعاء

```ts
await window.salla?.cart.addItem({ id: productId, quantity: 1 });
```

| الحالة | الشكل |
| --- | --- |
| نجاح | `{ status: 200, success: true, data: { cart: { id, count } } }` |
| فشل من السيرفر | reject، والجسم في `error.response.data` |
| فشل قبل الإرسال (id ناقص) | reject بنص رسالة |

**الرسائل تُعرض تلقائيًا.** إن حمل الرد `message`، يعرضه SDK عبر toast المحرك.
**لا تعرض toast ثانيًا.** لإسكات رسالة واحدة:

```ts
await Salla.api.withoutNotifier(() => Salla.cart.details());
```

كل دالة تُطلق حدثًا أيضًا (`cart::item.added`, `cart::item.added.failed`).

---

## 4. الوحدات

| الوحدة | تفعل |
| --- | --- |
| `cart` | إضافة/تعديل/حذف عناصر، كوبونات، طلب سريع، checkout |
| `product` | سعر الخيارات المختارة، بحث، قوائم، عروض، إهداء، دليل مقاسات |
| `wishlist` | إضافة، حذف، تبديل، مشاركة |
| `booking` | حجز منتج خدمي |
| `auth` | دخول برمز، تسجيل، خروج |
| `profile` | تحديث بيانات العميل وجهات الاتصال |
| `order` | إلغاء، إعادة طلب، إرسال فاتورة، قوائم الطلبات |
| `rating` | تقييم المتجر والمنتجات والشحن |
| `comment` | تعليقات على منتجات وصفحات ومقالات |
| `loyalty` | برنامج الولاء واستبدال النقاط |
| `currency` | عرض وتغيير العملة |
| `component` | قوائم الهيدر/الفوتر وتقييمات بلوكات الرئيسية |
| `metadata` | قيم الحقول المخصّصة |

المشتركات: `Config` · `Storage` · `Helpers` · `Notify` · `Forms` · `Languages`.

---

## 5. الأحداث

اسم الحدث = الوحدة + `::` + الحدث: `cart::item.added`, `auth::logged.in`, `product::price.updated`.
الفشل حدث مستقل، غالبًا `.failed`.

| الطريقة | الاشتراك | الإلغاء |
| --- | --- | --- |
| بالاسم | `Salla.event.on('cart::item.added', fn)` | `Salla.event.off('cart::item.added', fn)` |
| Helper | `Salla.cart.event.onItemAdded(fn)` | `Salla.cart.event.offItemAdded(fn)` |

⚠️ **لا تخلط الطريقتين**: `onItemAdded` يسجّل غلافًا، فإلغاؤه بـ`off('cart::item.added', fn)` **لا يزيل شيئًا**.

```tsx
useEffect(() => {
  const onUpdated = (...args: unknown[]) => setCount(Number((args[0] as any)?.count) || 0);
  const sdk = window.salla;
  sdk?.event?.on?.('cart::updated', onUpdated);
  return () => sdk?.event?.off?.('cart::updated', onUpdated);
}, []);
```

- `Salla.event.once(name, fn)` — مرة واحدة.
- `Salla.event.onlyWhen(name, fn)` — الآن إن كان قد أُطلق، وإلا أول مرة. **الخيار الآمن** لـ«بعد تحميل السلة».
- `Salla.event.emit(name, ...data)` — أطلق حدثك ببادئة خاصة (`my-theme::filters.opened`).

**أحداث غير مرتبطة بدالة:** `twilight::initiated` · `languages::translations.loaded` ·
`wishlist::storage.synced` · `document::request.failed` · `login::open` (أطلقه لفتح نافذة الدخول).

---

## 6. `Salla.hooks` — تعديل مكوّنات `salla-*`

`Salla.hooks.registerHook(tag, hookName, callback, options?)` يعيد دالة إزالة.
`options`: `priority` (الأعلى أولًا)، `once`.

| Tag | Hook | ما يمكن تغييره |
| --- | --- | --- |
| `salla-add-product-button` | `componentDidLoad` | العنصر |
| `salla-add-product-button` | `validate` | `{ isValid, component }` — `false` يمنع الإضافة |
| `salla-products-list` | `beforeBuildListUrl` | `ctx.url` |
| `salla-products-list` | `beforeAppendItems` | `ctx.items` |
| `salla-products-slider` | `componentDidLoad`, `beforeAppendItems` | كما أعلاه |
| `salla-menu` | `afterFetchMenuItems` | `component.menus` |
| `salla-product-options`, `salla-hook`, `salla-scopes`, `salla-user-menu` | `componentDidLoad` | العنصر |

⚠️ `validate` **لا يعمل** عندما يكون الزر زر submit في form، ولا على صفحة منتج المحرك (تستخدم form).
أي تحقق قبل الإضافة هناك يحتاج معالج submit خاصًا بك.

**التسجيل المتأخر مسموح**: hook جديد من نوع `componentDidLoad` يعمل فورًا لكل عنصر موجود، ثم لكل ما يُحمَّل لاحقًا (مرة لكل عنصر).

---

## 7. قاعدة هذا المشروع

| الحالة | ما يفعله الثيم |
| --- | --- |
| الدخول | `LoginAuthModal` — السطح الوحيد عبر `salla.auth.api`؛ المستضاف معطّل |
| السلة | درج السلة عبر `useSyncExternalStore` + `salla-cart-summary` (capture على `document`) |
| الإشعارات | المحرك يوجّه رسائل SDK إلى toast؛ لا toast إضافي |
| التمرير | لا `position: fixed`، ولا scroll عام — rAF + CSS vars |

لا تنادِ SDK في مسار رسم. ولا تفترض وجوده: `window.salla?` دائمًا.
