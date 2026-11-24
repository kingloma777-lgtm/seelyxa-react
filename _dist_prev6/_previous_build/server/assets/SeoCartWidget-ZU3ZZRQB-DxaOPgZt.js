import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { qn as useTranslation, ti as onSallaEvent, ua as require_react, zr as useTwilight } from "./shared-home-CSJrMlCW.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/SeoCartWidget-ZU3ZZRQB.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function getPriceAmount(value) {
	if (typeof value === "number") return value;
	return value.amount;
}
function getTotalAmount(value) {
	if (typeof value === "number") return value;
	return parseFloat(value) || 0;
}
function mapCartItemsToProducts(items) {
	return items.filter((item) => item.is_available).map((item) => ({
		id: item.product_id,
		name: item.product_name,
		price: getPriceAmount(item.price),
		quantity: item.quantity
	}));
}
function pushCheckoutEvent(step, cart, currencyCode) {
	if (typeof window === "undefined") return;
	window.dataLayer = window.dataLayer ?? [];
	const payload = {
		event: "checkout",
		ecommerce: { checkout: {
			actionField: { step },
			products: mapCartItemsToProducts(cart.items),
			cart_total: getTotalAmount(cart.total),
			currency: currencyCode
		} }
	};
	window.dataLayer.push(payload);
}
var PAGE_TITLE_KEYS = {
	1: "common.titles.cart",
	2: "common.titles.shipping",
	3: "common.titles.checkout"
};
function SeoCartWidget({ cart, step = 1 }) {
	const { store, currency } = useTwilight();
	const { t } = useTranslation();
	const currencyCode = currency?.code ?? "SAR";
	(0, import_react.useEffect)(() => {
		pushCheckoutEvent(step, cart, currencyCode);
	}, [
		step,
		cart,
		currencyCode
	]);
	(0, import_react.useEffect)(() => {
		const onShipping = () => pushCheckoutEvent(2, cart, currencyCode);
		const onPayment = () => pushCheckoutEvent(3, cart, currencyCode);
		const offShipping = onSallaEvent("checkout::step.shipping", onShipping);
		const offPayment = onSallaEvent("checkout::step.payment", onPayment);
		return () => {
			offShipping();
			offPayment();
		};
	}, [cart, currencyCode]);
	(0, import_react.useEffect)(() => {
		const storeTitle = store.meta?.title || store.name;
		const stepTitle = t(PAGE_TITLE_KEYS[step], PAGE_TITLE_KEYS[step]);
		document.title = storeTitle ? `${stepTitle} - ${storeTitle}` : stepTitle;
	}, [
		step,
		store.meta?.title,
		store.name,
		t
	]);
	return null;
}
//#endregion
export { SeoCartWidget };

//# sourceMappingURL=SeoCartWidget-ZU3ZZRQB-DxaOPgZt.js.map