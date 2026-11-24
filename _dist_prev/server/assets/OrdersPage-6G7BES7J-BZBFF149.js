import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { Cn as HookSlot, Kn as useTranslation, Tn as withDeferredHydration, Wn as L, ca as require_jsx_runtime, la as require_react } from "./shared-home-CDptNpzP.js";
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-orders.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var SallaOrdersElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get loadMoreText() {
		return true;
	}
	get params() {
		return true;
	}
};
var defineSallaOrders_runtime = () => {};
var SallaOrdersCore = /*@__PURE__*/ L({
	tagName: "salla-orders",
	elementClass: SallaOrdersElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaOrders_runtime
});
SallaOrdersCore.displayName = "SallaOrdersCore";
var SallaOrders = withDeferredHydration(SallaOrdersCore, "SallaOrders");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/OrdersPage-6G7BES7J.js
var import_jsx_runtime = require_jsx_runtime();
function OrdersPage({ orders, query }) {
	const { t } = useTranslation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "customer:orders.index.items.start" }),
		orders.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaOrders, {
			"data-testid": "store-orders-list",
			params: query?.status ? { status: query.status } : void 0
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-testid": "store-orders-empty",
			className: "no-content-placeholder",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-packed-box icon" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("pages.orders.non_orders") })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "customer:orders.index.items.end" })
	] });
}
//#endregion
export { OrdersPage };

//# sourceMappingURL=OrdersPage-6G7BES7J-BZBFF149.js.map