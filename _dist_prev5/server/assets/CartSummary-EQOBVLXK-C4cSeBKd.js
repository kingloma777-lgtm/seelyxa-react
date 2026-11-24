import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { En as withDeferredHydration, Gn as L, It as useMoney, gn as SallaButton, la as require_jsx_runtime, qn as useTranslation, ua as require_react, wn as HookSlot, wt as useCoupon } from "./shared-home-CSJrMlCW.js";
import { T as SallaGifting, p as stripUnsafeHtml } from "./shared-product-BC5Y0DiL.js";
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-loyalty.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var SallaLoyaltyElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get allowEmail() {
		return true;
	}
	get allowMobile() {
		return true;
	}
	get close() {
		return true;
	}
	get customerPoints() {
		return true;
	}
	get exchangeLoyaltyPoint() {
		return true;
	}
	get guestMessage() {
		return true;
	}
	get open() {
		return true;
	}
	get prizePoints() {
		return true;
	}
	get prizeTitle() {
		return true;
	}
	get requireEmail() {
		return true;
	}
	get resetExchange() {
		return true;
	}
};
var defineSallaLoyalty_runtime = () => {};
var SallaLoyaltyCore = /*@__PURE__*/ L({
	tagName: "salla-loyalty",
	elementClass: SallaLoyaltyElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaLoyalty_runtime
});
SallaLoyaltyCore.displayName = "SallaLoyaltyCore";
var SallaLoyalty = withDeferredHydration(SallaLoyaltyCore, "SallaLoyalty");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-tiered-offer.js
var SallaTieredOfferElement_runtime = typeof HTMLElement !== "undefined" ? HTMLElement : class {};
var defineSallaTieredOffer_runtime = () => {};
var SallaTieredOfferCore = /*@__PURE__*/ L({
	tagName: "salla-tiered-offer",
	elementClass: SallaTieredOfferElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaTieredOffer_runtime
});
SallaTieredOfferCore.displayName = "SallaTieredOfferCore";
var SallaTieredOffer = withDeferredHydration(SallaTieredOfferCore, "SallaTieredOffer");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/CartSummary-EQOBVLXK.js
var import_jsx_runtime = require_jsx_runtime();
function CartSummary({ cart, applyCouponEnabled = true, taxAmount, loyalty, gift, loyaltyPoints }) {
	const { t } = useTranslation();
	const { format } = useMoney();
	const handleCartSubmit = (0, import_react.useCallback)(async () => {
		if (![...document.querySelectorAll("form[id^=\"item-\"]")].every((form) => form.reportValidity())) {
			window.salla?.notify.error(window.salla.lang.get("common.messages.required_fields"));
			return;
		}
		try {
			await window.salla?.cart.submit();
		} catch {}
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "sticky top-24 w-full lg:w-96 rtl:lg:mr-8 ltr:lg:ml-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "cart:summary.start" }),
			cart.free_shipping_bar && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreeShippingBar, { freeShippingBar: cart.free_shipping_bar }),
			loyalty && loyaltyPoints && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "shadow-default mb-5 rounded-md p-3 xs:p-7 bg-white",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaLoyalty, {
					customerPoints: loyaltyPoints,
					prizePoints: loyalty.prize.points,
					prizeTitle: loyalty.prize.title
				})
			}),
			gift?.enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				id: "cart-gifting",
				className: "shadow-default bg-white xs:p-2 rounded-md mb-5 relative",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaGifting, {
					id: "salla-gifting",
					className: "mt-5",
					widgetTitle: t("pages.cart.gift_widget_title", "Send as a gift"),
					widgetSubtitle: gift.text,
					...gift.type ? { [gift.type + "Products"]: true } : {},
					vertical: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shadow-default bg-white p-5 xs:p-7 rounded-md mb-5 relative transition-height duration-1000",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-bold text-sm mb-5",
						children: t("pages.cart.summary", "Order Summary")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-sm mb-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-gray-500",
							children: taxAmount ? t("pages.cart.items_total_without_tax", "Items total (excl. tax)") : t("pages.cart.items_total", "Items total")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
							id: "sub-total",
							children: format(cart.sub_total)
						})]
					}),
					cart.options?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-sm mb-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-gray-500",
							children: t("pages.cart.order_options_total", "Options total")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
							id: "cart-options-total",
							children: format(cart.options_total ?? void 0)
						})]
					}),
					cart.has_shipping && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						id: "shipping-cost",
						className: "flex justify-between text-sm mb-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-gray-500",
							children: t("pages.cart.shipping_cost", "Shipping cost")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: format(cart.real_shipping_cost) })]
					}),
					applyCouponEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CouponInput, { initialCoupon: cart.coupon ?? void 0 }),
					!!cart.total_discount && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						id: "total-discount",
						className: "flex justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-gray-500 block h-10",
							children: t("pages.cart.discount", "Discount")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: ["- ", format(cart.total_discount)] })]
					}),
					!!taxAmount && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-sm mb-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-gray-500",
							children: t("pages.cart.VAT_tax_amount", "VAT Tax Amount")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
							id: "tax-amount",
							children: format(taxAmount)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-lg mb-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-gray-500",
							children: t("pages.cart.final_total", "Total")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
							"data-cart-total": true,
							children: format(cart.total)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "cart-submit-wrap",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "cart:submit.start" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaButton, {
								id: "cart-submit",
								loaderPosition: "center",
								width: "wide",
								onClick: handleCartSubmit,
								children: t("pages.cart.complete_order", "Complete Order")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "cart:submit.end" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "cart:summary.end" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaTieredOffer, {})
		]
	});
}
function FreeShippingBar({ freeShippingBar }) {
	const isFree = freeShippingBar.has_free_shipping;
	const { t } = useTranslation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "shadow-default bg-white p-5 xs:p-7 rounded-md mb-5 relative",
		id: "free-shipping",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex rtl:space-x-reverse space-x-3 items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "bg-primary text-white rounded-icon sicon-shipping-fast" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "shipping-item font-bold text-sm mb-1.5",
					children: t("pages.cart.free_shipping", "Free Shipping")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "shipping-item text-sm text-gray-500",
					children: isFree ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						id: "free-shipping-msg",
						dangerouslySetInnerHTML: { __html: stripUnsafeHtml(t("pages.cart.has_free_shipping", "You have free shipping!")) }
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "emoji",
						id: "free-shipping-applied",
						children: "🎉"
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						id: "free-shipping-msg",
						dangerouslySetInnerHTML: { __html: stripUnsafeHtml(t("pages.cart.free_shipping_alert", "Get free shipping when you add :amount more").replace(":amount", String(freeShippingBar.remaining))) }
					})
				})]
			})]
		}), !isFree && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 bg-border-color rounded-full",
			id: "free-shipping-bar",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "progress-bg transition-all duration-500 h-2.5 bg-primary relative rounded-full flex justify-end",
				style: { width: `${freeShippingBar.percent}%` },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "inline-block sicon-shipping-fast absolute -top-5 rtl:left-0 ltr:right-0" })
			})
		})]
	});
}
function CouponInput({ initialCoupon }) {
	const { t } = useTranslation();
	const { value, error, apply, remove } = useCoupon();
	const appliedCoupon = value ?? initialCoupon;
	const handleApplyCoupon = (0, import_react.useCallback)(async (event) => {
		event.preventDefault();
		const code = new FormData(event.currentTarget).get("coupon");
		if (code?.trim()) await apply(code.trim());
	}, [apply]);
	const handleRemoveCoupon = (0, import_react.useCallback)(async () => {
		await remove();
	}, [remove]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "border-t border-gray-200 border-b py-5 mb-5",
		onSubmit: handleApplyCoupon,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: "coupon-input",
				className: "block text-sm",
				children: t("pages.cart.have_coupon", "Have a coupon?")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2.5 relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					placeholder: t("pages.cart.coupon_placeholder", "Enter coupon code"),
					disabled: !!appliedCoupon,
					className: "rtl:pl-24 ltr:pr-24 form-input",
					defaultValue: appliedCoupon,
					id: "coupon-input",
					name: "coupon",
					"aria-label": t("pages.cart.apply_coupon", "Apply coupon"),
					type: "text"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SallaButton, {
					type: "submit",
					className: `btn--coupon ${appliedCoupon ? "has-coupon btn--danger" : "has-not-coupon btn--default"}`,
					loaderPosition: "center",
					onClick: appliedCoupon ? handleRemoveCoupon : void 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "coupon-text",
						children: appliedCoupon ? "" : t("pages.cart.apply_coupon_btn", "Apply")
					}), appliedCoupon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-cancel icon text-xl w-8" })]
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-red-700",
				id: "coupon-error",
				children: error
			})
		]
	});
}
//#endregion
export { CartSummary };

//# sourceMappingURL=CartSummary-EQOBVLXK-C4cSeBKd.js.map