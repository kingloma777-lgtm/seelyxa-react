import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { Cn as SallaAddProductButton, Et as useHostAttributes, Jr as getActiveCurrency, fn as LazyCurrencySymbol, gn as SallaButton, la as require_jsx_runtime, qn as useTranslation, ua as require_react } from "./shared-home-CR99BuTM.js";
import { D as SallaCountDown, E as SallaFileUpload, S as SallaMultipleBundleProduct, T as SallaGifting, _ as SallaQuantityInput, b as SallaProductOptionsCore, v as SallaProductSizeGuide } from "./shared-product-N_AOhgpy.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/AddToCartForm-2BD3R4BH.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var handleSubmit = (e) => {
	e.preventDefault();
	window.salla?.form.onSubmit("cart.addItem", e.nativeEvent);
};
var handleChange = (e) => {
	const form = e.currentTarget;
	if (Array.from(form.elements).every((el) => !el.willValidate || el.validity.valid)) window.salla?.product?.getPrice(new FormData(form));
};
function AddToCartForm({ product, stickyAddToCart, giftingIntro, formStartSlot, formEndSlot }) {
	const { t } = useTranslation();
	const priceCurrency = getActiveCurrency(product.currency);
	const [activeCollapse, setActiveCollapse] = (0, import_react.useState)(null);
	const optionsRef = (0, import_react.useCallback)((el) => void el?.setOptionsData?.(product.options), [product.options]);
	const [optionsReady, setOptionsReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const salla = window.salla;
		if (!salla) return;
		let alive = true;
		salla.config?.set?.("page.id", product.id);
		Promise.resolve(salla.onReady?.()).finally(() => {
			if (alive) setOptionsReady(true);
		});
		return () => {
			alive = false;
		};
	}, [product.id]);
	const handleCollapseToggle = (0, import_react.useCallback)((id) => {
		setActiveCollapse((current) => current === id ? null : id);
	}, []);
	const hasPreorder = product.has_preorder_campaign && product.preorder;
	const hasWeightOrSizeGuide = product.weight || product.has_size_guide;
	const hasAttachments = product.can_add_note || product.can_upload_file;
	const amount = typeof product.base_currency_price === "object" ? product.base_currency_price.amount : product.base_currency_price;
	const quantityRef = useHostAttributes({
		max: product.max_quantity,
		value: 1,
		name: "quantity"
	});
	const addButtonRef = useHostAttributes({
		amount,
		"loader-position": "end",
		type: "submit",
		width: "wide",
		"required-shipping": product.is_require_shipping,
		"is-subscribed": product.notify_availability?.subscribed
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "form product-form",
		encType: "multipart/form-data",
		method: "post",
		onSubmit: handleSubmit,
		onChange: handleChange,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "hidden",
				name: "id",
				value: product.id
			}),
			formStartSlot,
			optionsReady && product.options && product.options.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaProductOptionsCore, {
				ref: optionsRef,
				options: JSON.stringify(product.options),
				productId: product.id
			}, product.id),
			product.has_bundle_products && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaMultipleBundleProduct, { bundleSections: JSON.stringify(product) }),
			hasWeightOrSizeGuide && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "bg-white p-5 rounded-md mb-5",
				children: [product.weight && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `center-between ${product.has_size_guide ? "pb-5 mb-5 border-b-[1px]" : ""}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", {
						className: "form-label rtl:space-x-reverse space-x-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-luggage-cart" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("pages.products.weight", "Weight") })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "product-weight text-sm",
						children: product.weight
					})]
				}), product.has_size_guide && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "center-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", {
						className: "form-label rtl:space-x-reverse space-x-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-pencil-ruler" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("pages.products.size_guides", "Size Guides") })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SallaButton, {
						shape: "link",
						color: "primary",
						className: "!p-0 text-sm with-arrow",
						onClick: () => window.salla?.event?.dispatch("size-guide::open", String(product.id)),
						children: [t("pages.products.show_size_guides", "Show Size Guides"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-keyboard_arrow_left" })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaProductSizeGuide, {})] })]
			}),
			hasAttachments && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "bg-white p-5 rounded-md mb-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "form-label",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
							className: "block",
							children: t("pages.products.attachments", "Attachments")
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 sm:mt-0 sm:col-span-2 text-end",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex rtl:space-x-reverse space-x-3",
								children: [product.can_add_note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => handleCollapseToggle(`note_${product.id}`),
									className: `btn-tab btn--collapse ${activeCollapse === `note_${product.id}` ? "is-opened" : "is-closed"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "font-medium sicon-chat-conversation-alt rtl:ml-1.5 ltr:mr-1.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "fix-align",
										children: t("pages.products.add_note", "Add Note")
									})]
								}), product.can_upload_file && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => handleCollapseToggle(`file_${product.id}`),
									className: `btn-tab btn--collapse ${activeCollapse === `file_${product.id}` ? "is-opened" : "is-closed"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "font-medium sicon-paperclip rtl:ml-1.5 ltr:mr-1.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "fix-align",
										children: t("pages.products.add_file", "Add File")
									})]
								})]
							}),
							product.can_add_note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `collapse-content ${activeCollapse === `note_${product.id}` ? "is-opened" : "is-closed"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "pt-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										className: "animated animatedfadeInDown fadeInDown form-input h-16 bg-gray-50 block",
										placeholder: t("pages.products.notes_placeholder", "Add your notes here..."),
										name: "notes",
										cols: 30,
										rows: 10,
										defaultValue: product.notes
									})
								})
							}),
							product.can_upload_file && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `collapse-content ${activeCollapse === `file_${product.id}` ? "is-opened" : "is-closed"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "pt-4 px-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaFileUpload, {
										accept: "image/png, image/jpeg, image/jpg, image/gif, video/*, application/pdf",
										className: "product-option-uploader",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "product-option-uploader-placholder",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "product-option-uploader-placholder-icon",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-camera" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "profile-filepond-placholder-text",
													children: t("common.uploader.drag_and_drop", "Drag and drop files here")
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "filepond--label-action",
													children: t("common.uploader.browse", "Browse")
												})
											]
										})
									})
								})
							})
						]
					})]
				})
			}),
			formEndSlot,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "flex bg-white p-5 sm:pb-0 rounded-md rounded-b-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "center-between w-full",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "form-label",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
								className: "block",
								children: t("pages.products.price", "Price")
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `flex whitespace-nowrap price-wrapper gap-4 items-center ${product.is_out_of_stock ? "hidden" : ""}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `price_is_on_sale space-x-2 rtl:space-x-reverse whitespace-nowrap ${product.is_on_sale ? "" : "hidden"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "total-price text-red-800 font-bold text-xl inline-block",
									children: [
										product.sale_price,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyCurrencySymbol, { currency: priceCurrency })
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "before-price text-gray-500 line-through",
									children: [
										product.regular_price,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyCurrencySymbol, { currency: priceCurrency })
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `starting-or-normal-price gap-4 ${product.is_on_sale ? "hidden" : "flex"}`,
								children: [product.starting_price && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "starting-price-title",
									children: t("pages.products.starting_price", "Starting from")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "total-price font-bold text-xl inline-block",
									children: [
										String(product.starting_price ?? product.price),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyCurrencySymbol, { currency: priceCurrency })
									]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `out-of-stock min-h-7 leading-7 text-base text-red-600 !opacity-50 font-bold ${product.is_out_of_stock ? "scale-pulse" : "hidden"}`,
							children: t("pages.products.out_of_stock", "Out of Stock")
						})
					]
				})
			}),
			hasPreorder ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mt-5 p-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaCountDown, {
					preOrder: JSON.stringify(product.preorder),
					boxed: true,
					labeled: true
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "sticky-product-bar bg-white p-5 rounded-md rounded-b-none",
				children: [product.is_hidden_quantity || product.type === "booking" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "hidden",
					value: "1",
					name: "quantity",
					"aria-label": t("pages.products.quantity", "Quantity")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sticky-product-bar__quantity center-between mb-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "form-label font-bold",
						children: t("pages.products.quantity", "Quantity")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaQuantityInput, {
						ref: quantityRef,
						max: product.max_quantity ?? void 0,
						value: 1,
						name: "quantity",
						"aria-label": t("pages.products.quantity", "Quantity"),
						className: "border-gray-200 flex justify-end"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaAddProductButton, {
					ref: addButtonRef,
					...product.can_quick_buy ? { quickBuy: true } : {},
					...stickyAddToCart ? { supportStickyBar: true } : {},
					...product.is_require_shipping ? { requiredShipping: true } : {},
					...hasPreorder ? { hasPreOrder: true } : {},
					amount,
					className: "mt-5 w-full sticky-product-bar__btn",
					productStatus: product.status,
					productType: product.type,
					productId: product.id,
					type: "submit",
					width: "wide",
					...product.notify_availability ? {
						...product.notify_availability.subscribed ? { isSubscribed: true } : {},
						channels: product.notify_availability.channels.join(","),
						...product.notify_availability.subscribed_options ? { subscribedOptions: JSON.stringify(product.notify_availability.subscribed_options) } : {},
						...product.notify_availability.options ? { notifyOptionsAvailability: true } : {}
					} : {},
					children: product.add_to_cart_label
				})]
			}),
			product.giftable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaGifting, {
				className: "mt-5",
				widgetSubtitle: giftingIntro,
				productId: Number(product.id),
				...product.is_require_shipping ? { physicalProducts: true } : {}
			})
		]
	});
}
//#endregion
export { AddToCartForm };

//# sourceMappingURL=AddToCartForm-2BD3R4BH-BdHk-UaF.js.map