import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { En as withDeferredHydration, Gn as L, dn as LazyBreadcrumb, la as require_jsx_runtime, ua as require_react, wn as HookSlot } from "./shared-home-CSJrMlCW.js";
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-loyalty-program.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var SallaLoyaltyProgramElement_runtime = typeof HTMLElement !== "undefined" ? HTMLElement : class {};
var defineSallaLoyaltyProgram_runtime = () => {};
var SallaLoyaltyProgramCore = /*@__PURE__*/ L({
	tagName: "salla-loyalty-program",
	elementClass: SallaLoyaltyProgramElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaLoyaltyProgram_runtime
});
SallaLoyaltyProgramCore.displayName = "SallaLoyaltyProgramCore";
var SallaLoyaltyProgram = withDeferredHydration(SallaLoyaltyProgramCore, "SallaLoyaltyProgram");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/LoyaltyPage-HCLFYNTM.js
var import_jsx_runtime = require_jsx_runtime();
function LoyaltyPage({ page }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "loyalty:start" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container mb-20",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyBreadcrumb, { page }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaLoyaltyProgram, {})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "loyalty:end" })
	] });
}
//#endregion
export { LoyaltyPage };

//# sourceMappingURL=LoyaltyPage-HCLFYNTM-DZaCV82f.js.map