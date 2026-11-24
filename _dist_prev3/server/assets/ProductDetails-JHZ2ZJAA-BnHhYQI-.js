import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { Ct as useWishlist, Jr as getActiveCurrency, fn as LazyCurrencySymbol, gn as SallaButton, la as require_jsx_runtime, qn as useTranslation, sn as Link, ua as require_react, un as Image, wn as HookSlot } from "./shared-home-CR99BuTM.js";
import { C as SallaMetadata, f as formatSallaPlural, g as SallaRatingStars, m as SallaSocialShare, w as SallaInstallment } from "./shared-product-N_AOhgpy.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/ProductDetails-JHZ2ZJAA.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function ProductDetails({ product, showTags = true }) {
	const { t } = useTranslation();
	const wishlist = useWishlist();
	const productHookContext = { product };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, {
			name: "product:single.description.start",
			context: productHookContext
		}),
		product.brand?.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "product-brand mb-5 w-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				className: "brand-logo",
				to: product.brand.url || "#",
				title: product.brand.name,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
					className: "max-h-full object-contain",
					src: product.brand.logo,
					title: product.brand.name,
					alt: product.brand.name,
					aspectRatio: "1/1"
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-xl md:text-2xl leading-10 font-bold mb-6 text-gray-800",
			children: product.name
		}),
		product.subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "product-entry__sub-title text-sm text-gray-500 leading-6 mb-2.5",
			children: product.subtitle
		}),
		product.rating && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaRatingStars, {
			value: product.rating.stars,
			reviews: product.rating.count
		}),
		product.is_taxable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
			className: "color-grey",
			children: t("pages.products.tax_included", "VAT Inclusive")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductPrice, { product }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductDescription, { product }),
		!!product.tags?.length && showTags && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-3",
			children: product.tags.map((tag, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: tag.url,
				className: "rtl:ml-2 ltr:mr-2 inline-flex text-gray-500 hover:text-primary underline text-sm mb-1",
				children: tag.name
			}), index < product.tags.length - 1 && ","] }, tag.name))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex rtl:space-x-reverse space-x-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaSocialShare, {
				className: "inline-flex mb-5",
				"aria-label": "social share"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaButton, {
				className: `btn--wishlist animated hidden sm:inline-flex ${wishlist.has(Number(product.id)) ? "is-added" : "not-added"}`,
				"data-id": product.id,
				onClick: () => window.salla?.wishlist.toggle(product.id),
				shape: "icon",
				fill: "outline",
				color: "light",
				ariaLabel: "add to wishlist",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-heart" })
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductQuantityInfo, { product }),
		product.sku && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex justify-between sm:grid sm:grid-cols-3 bg-white rounded-md px-4 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-barcode mx-1" }), t("pages.products.sku", "SKU")]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-unicode",
				children: product.sku
			})]
		}),
		product.barcode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex justify-between sm:grid sm:grid-cols-3 bg-white rounded-md px-4 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-barcode mx-1" }), t("pages.products.barcode")]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-unicode",
				children: product.barcode
			})]
		}),
		product.show_availability && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "bg-white p-5 rounded-md mb-5 last:mb-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "center-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center text-base",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sicon-location rtl:ml-1 ltr:mr-1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-block",
						children: t("pages.products.availability", "Availability")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 sm:mt-0 sm:col-span-2 text-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex rtl:space-x-reverse space-x-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "#!",
							onClick: () => window.salla?.event?.dispatch("scopes::open", {
								mode: "availability",
								product_id: String(product.id)
							}),
							className: "group text-primary flex items-center justify-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("pages.products.select_branch", "Select Branch") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sicon-keyboard_arrow_left mr-2 transition-all group-hover:-translate-x-1" })]
						})
					})
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, {
			name: "product:single.description",
			context: productHookContext
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaInstallment, { price: String(typeof product.base_currency_price === "object" ? product.base_currency_price.amount : product.base_currency_price) }),
		product.has_metadata && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaMetadata, {})
	] });
}
function ProductPrice({ product }) {
	const { t } = useTranslation();
	const priceCurrency = getActiveCurrency(product.currency);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex whitespace-nowrap gap-4 items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `${product.is_on_sale ? "" : "hidden"} space-x-2 rtl:space-x-reverse whitespace-nowrap`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-red-800 font-bold text-xl inline-block",
				children: [
					product.sale_price,
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyCurrencySymbol, { currency: priceCurrency })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-gray-500 line-through",
				children: [
					product.regular_price,
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyCurrencySymbol, { currency: priceCurrency })
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `gap-4 ${product.is_on_sale ? "hidden" : "flex"}`,
			children: [product.starting_price && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("pages.products.starting_price", "Starting from") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-bold text-xl inline-block",
				children: [
					product.starting_price ?? product.price,
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyCurrencySymbol, { currency: priceCurrency })
				]
			})]
		})]
	});
}
var IFRAME_TAG = /<iframe\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
function lazyIframes(html) {
	return html.replace(IFRAME_TAG, (tag) => /\sloading\s*=/i.test(tag.replace(/"[^"]*"|'[^']*'/g, "\"\"")) ? tag : tag.replace(/^<iframe/i, "<iframe loading=\"lazy\""));
}
function ProductDescription({ product }) {
	const { t } = useTranslation();
	const [isExpanded, setIsExpanded] = (0, import_react.useState)(false);
	if (!product.description) return null;
	const description = lazyIframes(product.description.replace(/&nbsp;/g, "\n"));
	if (product.has_read_more) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "product__description p-2 px-5 sm:p-1 leading-7 mb-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
			className: "article article--main relative leading-8 overflow-hidden transition-all duration-300 py-4",
			id: "more-content",
			style: { maxHeight: isExpanded ? "none" : "5.25rem" },
			dangerouslySetInnerHTML: { __html: description }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			id: "btn-show-more",
			className: `link--primary inline-block mt-2 cursor-pointer bg-transparent border-0 p-0 ${isExpanded ? "is-expanded" : ""}`,
			onClick: () => setIsExpanded(true),
			children: t("pages.products.read_more", "Read more")
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "product__description p-2 px-5 sm:p-1 leading-7 mb-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
			className: "article--main pb-1",
			dangerouslySetInnerHTML: { __html: description }
		})
	});
}
function ProductQuantityInfo({ product }) {
	const { t } = useTranslation();
	if (product.sold_quantity == null && !product.can_show_remained_quantity) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-white py-2.5 mb-5 rounded-md inline-flex text-sm",
		children: [(product.sold_quantity ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4 !text-red-800",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-fire rtl:ml-1.5 ltr:mr-1.5" }),
				" ",
				t("pages.products.sold", "Sold"),
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatSallaPlural(t("pages.products.sold_times"), product.sold_quantity) })
			]
		}), product.can_show_remained_quantity && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4 rtl:even:border-r ltr:even:border-l even:border-gray-200",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "!text-red-800 sicon-box-bankers rtl:ml-1.5 ltr:mr-1.5" }),
				t("pages.products.remained", "Remained"),
				": ",
				product.quantity
			]
		})]
	});
}
//#endregion
export { ProductDetails };

//# sourceMappingURL=ProductDetails-JHZ2ZJAA-BnHhYQI-.js.map