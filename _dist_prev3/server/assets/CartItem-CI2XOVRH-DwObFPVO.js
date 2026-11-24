import { Et as useHostAttributes, It as useMoney, gn as SallaButton, la as require_jsx_runtime, qn as useTranslation, sn as Link, un as Image } from "./shared-home-CR99BuTM.js";
import { t as SallaCartItemOffers } from "./salla-cart-item-offers-BU5T5FLW.js";
import { _ as SallaQuantityInput, y as SallaProductOptions } from "./shared-product-N_AOhgpy.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/CartItem-CI2XOVRH.js
var import_jsx_runtime = require_jsx_runtime();
function toNumber(value) {
	if (value === void 0) return void 0;
	if (typeof value === "number") return value;
	return value.amount;
}
function moneyCurrency(value) {
	if (typeof value !== "object") return void 0;
	return value.currency;
}
function CartItemPrices({ item }) {
	const { format } = useMoney();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 flex-wrap",
		children: [
			item.offer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm text-gray-500 line-through item-regular-price",
				children: format(toNumber(item.product_price), { currency: moneyCurrency(item.product_price) })
			}),
			item.is_on_sale && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "inline-flex gap-1 leading-4 text-sm text-gray-500 line-through item-original-price",
				children: format(toNumber(item.original_price), { currency: moneyCurrency(item.original_price) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `inline-flex gap-1 leading-4 item-price ${item.has_discount ? "text-red-800" : "text-sm text-gray-500"}`,
				children: format(toNumber(item.price), { currency: moneyCurrency(item.price) })
			})
		]
	});
}
function CartItemQuantity({ item }) {
	const { t } = useTranslation();
	const quantityRef = useHostAttributes({
		max: item.max_quantity,
		value: item.quantity,
		name: "quantity"
	});
	if (item.type === "donating") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {});
	if (item.is_hidden_quantity) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type: "hidden",
		value: item.quantity,
		name: "quantity",
		"aria-label": t("pages.products.quantity")
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "w-10 text-center",
		children: item.quantity
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaQuantityInput, {
		ref: quantityRef,
		cartItemId: item.id,
		max: item.max_quantity ?? void 0,
		className: "transition transition-color duration-300",
		"aria-label": t("pages.products.quantity"),
		value: item.quantity,
		name: "quantity"
	}, `${item.id}-${item.quantity}`);
}
function CartItemTotal({ item }) {
	const { t } = useTranslation();
	const { format } = useMoney();
	const total = item.detailed_offers?.length ? item.total_special_price : item.total;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-primary flex-none font-bold text-sm rtl:md:pl-12 ltr:md:pr-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [t("pages.cart.total"), ":"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "inline-block item-total",
			children: item.is_available ? format(toNumber(total), { currency: moneyCurrency(total) }) : t("pages.products.out_of_stock")
		})]
	});
}
var handleChange = (e) => {
	window.salla?.form.onChange("cart.updateItem", e);
};
function CartItem({ item, isFirst = false }) {
	const { t } = useTranslation();
	const handleDelete = async () => {
		await window.salla?.cart.deleteItem(item.id);
		document.querySelector(`#item-${item.id}`)?.remove();
	};
	const isFreeProduct = toNumber(item.price) === 0 && item.has_discount;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
		onChange: handleChange,
		id: `item-${item.id}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "cart-item bg-white p-5 xs:p-7 rounded-md mb-5 relative",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "hidden",
					name: "id",
					value: item.id
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:flex rtl:space-x-reverse md:space-x-12 items-start justify-between mb-8 last:mb-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-1 rtl:space-x-reverse space-x-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.url,
							className: "relative overflow-hidden shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
								src: item.product_image,
								alt: item.product_name,
								className: "flex-none w-24 h-20 border border-gray-200 bg-gray-100 rounded-md object-center object-cover",
								aspectRatio: "6/5",
								priority: isFirst
							}), isFreeProduct && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "free-ribbon absolute top-[11px] right-[-38px] w-32 bg-red-600 text-white text-xs font-bold text-center py-1 rotate-45 shadow-md",
								children: t("pages.loyalty_program.free_product")
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-gray-900 leading-6 text-lg font-bold",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: item.url,
										className: "text-base",
										children: item.product_name
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartItemPrices, { item }),
								item.weight_label && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-gray-500",
									children: [
										t("pages.products.weight"),
										": ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.weight_label })
									]
								}),
								item.offer && !item.detailed_offers?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "old-offers flex items-center gap-1 mx-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-discount-calculator text-gray-500 offer-icon" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm text-gray-500 offer-name",
										children: item.offer.names
									})]
								}),
								item.detailed_offers && item.detailed_offers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaCartItemOffers, {
									quantity: item.quantity,
									itemId: String(item.id),
									productPrice: toNumber(item.product_price) ?? 0,
									offers: JSON.stringify(item.detailed_offers)
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t border-b border-gray-200 py-3 md:p-0 md:border-none mt-5 md:mt-0 flex gap-8 justify-between items-center md:items-start",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartItemQuantity, { item }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartItemTotal, { item })]
					})]
				}),
				item.options && item.options.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaProductOptions, {
					options: JSON.stringify(item.options),
					productId: item.product_id
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute top-1.5 rtl:left-1.5 ltr:right-1.5 rtl:xs:left-5 ltr:xs:right-5 xs:top-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaButton, {
						type: "button",
						shape: "icon",
						size: "small",
						color: "danger",
						className: "btn--delete",
						ariaLabel: t("common.elements.remove"),
						onClick: handleDelete,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-cancel" })
					})
				})
			]
		})
	});
}
//#endregion
export { CartItem };

//# sourceMappingURL=CartItem-CI2XOVRH-DwObFPVO.js.map