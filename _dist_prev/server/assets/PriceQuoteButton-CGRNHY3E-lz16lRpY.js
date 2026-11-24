import { Kn as useTranslation, ca as require_jsx_runtime, hn as SallaButton } from "./shared-home-CDptNpzP.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/PriceQuoteButton-CGRNHY3E.js
var import_jsx_runtime = require_jsx_runtime();
var handlePriceQuote = async () => {
	await window.salla?.cart.api.priceQuote?.();
};
function PriceQuoteButton() {
	const { t } = useTranslation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaButton, {
		id: "request-price-quote-btn",
		className: "btn--oval btn--md",
		fill: "outline",
		onClick: handlePriceQuote,
		children: t("pages.cart.request_price_quote", "Request for Quotation")
	});
}
//#endregion
export { PriceQuoteButton };

//# sourceMappingURL=PriceQuoteButton-CGRNHY3E-lz16lRpY.js.map