import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { An as useIsClient, At as useAsyncFn, Bt as useDate, Hr as useNavigate, Ht as useNumber, Qn as useTranslation, Vr as useLocation, Vt as useMoney, Wr as useTwilight, Wt as usePageConfig, Xn as L, Yt as useUser, ha as require_react, jn as withDeferredHydration, kn as HookSlot, ma as require_jsx_runtime, tr as useQuery, xn as SallaButton } from "./shared-home-CcULkdy1.js";
import { g as SallaRatingStars } from "./shared-product-BuxTY7AC.js";
import { t as SallaOrderBranch } from "./salla-order-branch-CPXloZRj.js";
import { t as order } from "./chunk-RSRGLHVQ-DNWfFhkM.js";
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-edit-order-button.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var SallaEditOrderButtonElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get orderId() {
		return true;
	}
};
var defineSallaEditOrderButton_runtime = () => {};
var SallaEditOrderButton = /*@__PURE__*/ L({
	tagName: "salla-edit-order-button",
	elementClass: SallaEditOrderButtonElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaEditOrderButton_runtime
});
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-modal.js
var import_jsx_runtime = require_jsx_runtime();
var SallaModalElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get centered() {
		return true;
	}
	get close() {
		return true;
	}
	get hasSkeleton() {
		return true;
	}
	get iconStyle() {
		return true;
	}
	get isClosable() {
		return true;
	}
	get isLoading() {
		return true;
	}
	get loading() {
		return true;
	}
	get noPadding() {
		return true;
	}
	get open() {
		return true;
	}
	get position() {
		return true;
	}
	get setTitle() {
		return true;
	}
	get stopLoading() {
		return true;
	}
	get subTitle() {
		return true;
	}
	get subTitleFirst() {
		return true;
	}
	get visible() {
		return true;
	}
	get width() {
		return true;
	}
};
var defineSallaModal_runtime = () => {};
var SallaModal = /*@__PURE__*/ L({
	tagName: "salla-modal",
	elementClass: SallaModalElement_runtime,
	react: import_react.default,
	events: { onModalVisibilityChanged: "modalVisibilityChanged" },
	defineCustomElement: defineSallaModal_runtime
});
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-order-details.js
var SallaOrderDetailsElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get orderDetails() {
		return true;
	}
};
var defineSallaOrderDetails_runtime = () => {};
var SallaOrderDetailsCore = /*@__PURE__*/ L({
	tagName: "salla-order-details",
	elementClass: SallaOrderDetailsElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaOrderDetails_runtime
});
SallaOrderDetailsCore.displayName = "SallaOrderDetailsCore";
var SallaOrderDetails = withDeferredHydration(SallaOrderDetailsCore, "SallaOrderDetails");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-order-totals-card.js
var SallaOrderTotalsCardElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get amounts() {
		return true;
	}
	get order() {
		return true;
	}
};
var defineSallaOrderTotalsCard_runtime = () => {};
var SallaOrderTotalsCardCore = /*@__PURE__*/ L({
	tagName: "salla-order-totals-card",
	elementClass: SallaOrderTotalsCardElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaOrderTotalsCard_runtime
});
SallaOrderTotalsCardCore.displayName = "SallaOrderTotalsCardCore";
var SallaOrderTotalsCard = withDeferredHydration(SallaOrderTotalsCardCore, "SallaOrderTotalsCard");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-rating-modal.js
var SallaRatingModalElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get close() {
		return true;
	}
	get open() {
		return true;
	}
	get orderId() {
		return true;
	}
};
var defineSallaRatingModal_runtime = () => {};
var SallaRatingModalCore = /*@__PURE__*/ L({
	tagName: "salla-rating-modal",
	elementClass: SallaRatingModalElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaRatingModal_runtime
});
SallaRatingModalCore.displayName = "SallaRatingModalCore";
var SallaRatingModal = withDeferredHydration(SallaRatingModalCore, "SallaRatingModal");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/OrderSinglePage-LMWLOLW2.js
var PRINT_WINDOW = "noopener, toolbar=yes, scrollbars=yes, resizable=yes, width=900, height=700";
function OrderStatus({ order: order2, paymentExpired }) {
	const { t } = useTranslation();
	if (paymentExpired) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-red-500",
		children: t("pages.orders.pending_payment_expired")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "text-primary inline-flex items-center rtl:space-x-reverse space-x-1",
		style: { color: order2.status.color },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: `mt-1 ${order2.status.icon}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [" ", order2.status.name] })]
	});
}
function PrintAction({ order: order2 }) {
	const { t } = useTranslation();
	const { store } = useTwilight();
	const [printNoticeOpen, setPrintNoticeOpen] = (0, import_react.useState)(false);
	const print = () => window.open(order2.urls.print ?? `${(store?.url ?? "").replace(/\/$/, "")}/account/orders/${order2.id}/print`, "_blank", PRINT_WINDOW);
	return order2.actions.invoice_printable === false ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `tooltip-toggle tooltip-toggle--clickable inline-block${printNoticeOpen ? " visible" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "text-primary border border-primary rounded text-center px-4 py-2 cursor-pointer",
			onClick: () => setPrintNoticeOpen(true),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-printer2 v-align" }),
				" ",
				t("pages.orders.print")
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "tooltip-content shadow-md rounded text-gray-500",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
				" ",
				t("pages.orders.to_order_invoice_contact_vendor"),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
				t("pages.orders.print_order_details"),
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-primary underline cursor-pointer",
					onClick: print,
					children: t("pages.orders.click_here")
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaButton, {
				shape: "link",
				color: "danger",
				size: "small",
				className: "close-tooltip",
				onClick: () => setPrintNoticeOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-cancel" })
			})]
		})]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SallaButton, {
		fill: "outline",
		size: "small",
		onClick: print,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-printer2 v-align" }),
			" ",
			t("pages.orders.print")
		]
	});
}
function OrderHeader({ order: order2, links, paymentExpired }) {
	const { t, direction } = useTranslation();
	const { format: formatDate } = useDate();
	const { format: formatNumber } = useNumber();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
		className: "min-w-full rounded-md overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
			className: "bg-white overflow-hidden flex md:table-row flex-row md:flex-row flex-wrap md:flex-no-wrap py-1.5 md:py-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
				"data-testid": "store-order-status",
				className: "single-order-header-item w-full md:w-auto  px-3 md:px-6 py-2 md:py-4 md:h-20 whitespace-nowrap text-sm ",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rtl:ml-2 ltr:mr-2 font-normal text-gray-400",
					children: t("pages.orders.date")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: formatNumber(formatDate(order2.created_at.date)) })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
				className: "single-order-header-item flex justify-between items-center w-full md:w-auto px-3 md:px-6 py-2 md:py-4 md:h-20 whitespace-nowrap text-sm ",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderStatus, {
					order: order2,
					paymentExpired
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [
						order2.type === "quote" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-red-500 ml-4",
							children: t("pages.orders.your_order_is_under_review")
						}),
						!!links?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex space-x-2 rtl:space-x-reverse text-start flex-none px-2",
							children: links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: link.url,
								className: "text-primary-reverse bg-primary px-4 py-2 rounded",
								target: "_blank",
								rel: "noreferrer",
								children: [
									link.label,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: direction === "rtl" ? "sicon-arrow-up-left" : "sicon-arrow-up-right" })
								]
							}, link.url))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrintAction, { order: order2 })
					]
				})]
			})]
		}) })
	});
}
function ItemAttachments({ item }) {
	const { t } = useTranslation();
	if (!item.attachments?.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flow-root rounded-md px-4 border border-gray-200",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
			className: "text-sm text-dark divide-y divide-border-color",
			children: item.attachments.map((attachment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "py-3.5 md:flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "mb-2 md:mb-0",
					children: t("pages.products.attachments")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: `font-medium ${attachment.type === "image" ? "text-gray-900" : "text-xs"}`,
					children: attachment.type === "image" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex rtl:space-x-reverse space-x-2.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: attachment.url,
							target: "_blank",
							rel: "noreferrer",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								className: "h-7 w-7 object-cover rounded-md",
								src: attachment.url,
								alt: item.name
							})
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: attachment.url,
						children: t("pages.orders.file_url")
					})
				})]
			}, `${attachment.type}:${attachment.url}`))
		})
	});
}
function calendarDay(day) {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(day));
	return match ? new Date(+match[1], +match[2] - 1, +match[3]) : String(day);
}
function ItemReservations({ item, productType }) {
	const { t } = useTranslation();
	const { format: formatDate } = useDate();
	const { format: formatNumber, useArabicNumerals } = useNumber();
	const reservations = item.product_reservations ?? [];
	if (productType !== "booking" || !reservations.length) return null;
	const time = (value) => useArabicNumerals ? formatNumber(String(value)).replace(/PM/g, "م").replace(/AM/g, "ص") : String(value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		item.booking_location && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "font-medium text-xs text-gray-600",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "py-1 flex justify-between items-baseline",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-5 mb-3.5 text-sm font-bold",
					children: t("common.elements.location")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-unicode",
					children: item.booking_location
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-5 mb-3.5 text-sm font-bold",
			children: reservations.length > 1 ? t("pages.cart.reservations") : t("pages.cart.item_options")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-md p-4 border border-gray-200 mb-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "font-medium text-xs text-gray-600",
				children: reservations.map((reservation) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "py-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-unicode",
						children: [formatNumber(formatDate(calendarDay(reservation.day))), reservation.from_timestamp ? ` (${time(reservation.from)} - ${time(reservation.to)})` : ""]
					})
				}, `${reservation.day}:${reservation.from}`))
			})
		})
	] });
}
function ItemSummary({ item, twigItem, money, currency }) {
	const { t } = useTranslation();
	const product = twigItem?.product;
	const image = product?.image?.url || item.image || item.thumbnail;
	const price = item.amounts.amount ?? {
		amount: 0,
		currency
	};
	const priceText = money(price.amount, price.currency);
	const total = item.amounts.total ?? {
		amount: 0,
		currency
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-5 last:mb-0",
		children: [
			product ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex rtl:space-x-reverse space-x-5 mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: product.url,
					className: "shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: image || "/images/placeholder.png",
						alt: item.name,
						className: `w-18 h-14 object-${image ? "cover" : "contain"} rounded-md`
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: product.url,
					className: "block leading-5 mb-1.5 md:text-base font-semibold transition-colors text-gray-500 hover:text-primary",
					children: item.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: priceText })] })]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full  flex  justify-between text-sm py-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "w-40 inline-block font-normal",
					children: item.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: priceText })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full flex justify-between text-sm py-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "w-40 inline-block font-normal",
					children: t("pages.products.quantity")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item.quantity })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between text-sm py-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: " w-40 inline-block font-normal",
					children: t("pages.products.price")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: priceText })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between  text-sm py-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "w-40 inline-block font-normal",
					children: t("pages.orders.total")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: money(total.amount, total.currency) })]
			})
		]
	});
}
function OrderItemRow({ item, twigItem, money, currency }) {
	const { t } = useTranslation();
	const productId = twigItem?.product?.id;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": `store-order-item-${item.id}`,
		"data-order-item-id": item.id,
		"data-order-item-product-id": productId,
		className: "order-item bg-white p-5 border-b border-gray-100 first:rounded-t-md last:rounded-b-md last:border-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemSummary, {
				item,
				twigItem,
				money,
				currency
			}),
			item.availability_date && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 text-sm py-2.5 text-blue-500",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-info" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					t("pages.products.expected_to_be"),
					":",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: String(item.availability_date).slice(0, 10) })
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemReservations, {
				item,
				productType: twigItem?.product?.type ?? item.product?.type
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaOrderDetails, { orderDetails: JSON.stringify(twigItem ?? item) }),
			item.note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-sm text-gray-500",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [t("common.elements.note"), " : "] }), item.note]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemAttachments, { item }),
			productId && (0, import_react.createElement)("salla-review-order-item", {
				"product-id": productId,
				suppressHydrationWarning: true
			})
		]
	});
}
function ConfirmModal({ visible, onVisibleChange, title, subTitle, iconStyle, confirmColor, onConfirm, busy }) {
	const { t } = useTranslation();
	if (!useIsClient()) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaModal, {
		width: "sm",
		visible,
		onModalVisibilityChanged: (e) => onVisibleChange(Boolean(e.detail)),
		"modal-title": title,
		subTitle,
		iconStyle,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			slot: "footer",
			className: "grid grid-cols-2 gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaButton, {
				width: "wide",
				color: confirmColor,
				className: "w-full cursor-pointer",
				onClick: onConfirm,
				disabled: busy,
				children: t("common.elements.ok")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaButton, {
				className: "w-full",
				fill: "outline",
				color: "light",
				onClick: () => onVisibleChange(false),
				disabled: busy,
				children: t("common.elements.cancel")
			})]
		})
	});
}
function PaymentOrReorder({ order: order2, paymentExpired, canReorder, onReorder, busy }) {
	const { t } = useTranslation();
	if (order2.actions.payable) return paymentExpired || !order2.urls.checkout ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-red-500",
		children: t("pages.orders.pending_payment_expired")
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SallaButton, {
		width: "wide",
		href: order2.urls.checkout,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon sicon-wallet rtl:ml-2 ltr:mr-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("pages.orders.finish_payment") })]
	});
	if (!canReorder) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-bold text-lg leading-none mb-1",
			children: t("pages.orders.reorder")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-gray-500",
			children: t("pages.orders.reorder_description")
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SallaButton, {
		"data-testid": "store-order-reorder-btn",
		shape: "link",
		onClick: onReorder,
		disabled: busy,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon sicon-rotate rtl:ml-2 ltr:mr-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("pages.orders.reorder") })]
	})] });
}
function OrderActions({ order: order2, paymentExpired }) {
	const { t } = useTranslation();
	const { isLoggedIn } = useUser();
	const navigate = useNavigate();
	const location = useLocation();
	const [showReorder, setShowReorder] = (0, import_react.useState)(false);
	const [showCancel, setShowCancel] = (0, import_react.useState)(false);
	const { reorderable, cancellable, payable } = order2.actions;
	const canReorder = isLoggedIn && reorderable;
	const [reorderState, handleReorder] = useAsyncFn(async () => {
		await window.salla?.order.createCartFromOrder(Number(order2.id));
		setShowReorder(false);
		navigate("/cart");
	}, [navigate, order2.id]);
	const [cancelState, handleCancel] = useAsyncFn(async () => {
		await window.salla?.order.cancel(Number(order2.id));
		setShowCancel(false);
		navigate(location.pathname, { replace: true });
	}, [
		navigate,
		order2.id,
		location.pathname
	]);
	if (!reorderable && !cancellable && !payable) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white rounded-md p-5 divide-y divide-border-color space-y-4",
			children: [(reorderable || payable) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: payable ? "flex-center" : "center-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentOrReorder, {
					order: order2,
					paymentExpired,
					canReorder: !!canReorder,
					onReorder: () => setShowReorder(true),
					busy: reorderState.loading
				})
			}), cancellable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "center-between pt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-bold text-lg leading-none mb-1",
						children: t("pages.orders.cancel")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-gray-500",
						children: t("pages.order.order_cancelation_desc")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SallaButton, {
					"data-testid": "store-order-cancel-btn",
					shape: "link",
					color: "danger",
					onClick: () => setShowCancel(true),
					disabled: cancelState.loading,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon sicon-cancel-circle rtl:ml-2 ltr:mr-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("pages.orders.cancel") })]
				})]
			})]
		}),
		canReorder && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmModal, {
			visible: showReorder,
			onVisibleChange: setShowReorder,
			title: t("pages.orders.reorder"),
			subTitle: t("pages.orders.reorder_confirmation"),
			iconStyle: "success",
			onConfirm: handleReorder,
			busy: reorderState.loading
		}),
		cancellable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmModal, {
			visible: showCancel,
			onVisibleChange: setShowCancel,
			title: t("common.elements.warning"),
			subTitle: t("pages.orders.cancel_confirmation"),
			iconStyle: "error",
			confirmColor: "danger",
			onConfirm: handleCancel,
			busy: cancelState.loading
		})
	] });
}
function RatingAction({ disabled, endedKey, color, fill, icon, onClick }) {
	const { t } = useTranslation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "tooltip-toggle tooltip-toggle--hover icon-trigger mobile-shifted",
		children: [disabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "tooltip-content shadow-md rounded",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
				" ",
				t(endedKey),
				"."
			] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaButton, {
			loaderPosition: "center",
			disabled,
			shape: "icon",
			fill,
			color,
			size: "medium",
			onClick: disabled ? void 0 : onClick,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: `${icon} text-xl` })
		})]
	});
}
function RatingSection({ title, rating, type, allowUpdate }) {
	const dispatch = (event, payload) => window.salla?.event?.dispatch(event, payload);
	const locked = !rating.can_update;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex justify-between items-start bg-white p-5 rounded-md",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-bold mb-5",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2",
				children: rating.content
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaRatingStars, {
				withLabel: true,
				value: rating.stars
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rating-actions",
			children: allowUpdate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RatingAction, {
				disabled: locked,
				endedKey: "pages.order.edit_period_ended",
				color: "dark",
				fill: "outline",
				icon: "sicon-format-border-color",
				onClick: () => dispatch("rating::edit", {
					type,
					feedback_id: String(rating.id)
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RatingAction, {
				disabled: locked,
				endedKey: "pages.order.delete_period_ended",
				color: "danger",
				fill: "outline",
				icon: "sicon-trash-2",
				onClick: () => dispatch("rating::delete", { feedback_id: String(rating.id) })
			})] })
		})]
	});
}
function ShippingRow({ shipment }) {
	const { t } = useTranslation();
	const hasNumber = !!shipment.number && shipment.number !== "0";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col md:flex-row justify-between md:items-center bg-white px-5 py-3 border-b border-gray-100 rounded-t-md text-sm space-y-4 md:space-y-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center space-x-2 rtl:space-x-reverse",
			children: [shipment.logo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: shipment.logo,
				className: "max-w-16 max-h-8",
				alt: shipment.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: shipment.name })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex space-x-5 rtl:space-x-reverse",
			children: [hasNumber && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				t("pages.orders.shipment_no"),
				": ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-bold",
					children: shipment.number
				})
			] }), shipment.tracking && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				className: "font-bold text-primary hover:opacity-80 flex items-center",
				href: shipment.tracking,
				target: "_blank",
				rel: "noreferrer",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sicon-shipping rtl:ml-1 ltr:mr-1" }), t("pages.orders.tracking_url")]
			})]
		})]
	});
}
function ShippingHeader({ twig, order: order2 }) {
	const { data } = useQuery({
		...order.queries.shipments(String(order2.id)),
		enabled: order2.features.shippable && !twig.is_pickable
	});
	if (twig.is_pickable) return null;
	const shipments = data?.length ? data.map((shipment) => ({
		...shipment,
		tracking: shipment.tracking_url
	})) : twig.shipping ? [{
		...twig.shipping,
		tracking: twig.shipping.tracing_link
	}] : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: shipments.map((shipment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShippingRow, { shipment }, shipment.id ?? shipment.name)) });
}
var optionPrice = (price) => typeof price === "number" ? price : price?.amount ?? 0;
function OrderOptionsTable({ options, money, currency }) {
	const { t } = useTranslation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-white p-5 rounded-md",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-3.5 text-sm font-bold",
			children: t("pages.checkout.cart_options_title")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "table-fixed w-full border border-gray-200",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-gray-200",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						scope: "col",
						className: "p-3 text-start text-sm",
						children: t("pages.order.option_name")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						scope: "col",
						className: "p-3 text-sm",
						children: t("pages.order.option_content")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						scope: "col",
						className: "p-3 rtl:text-left ltr:text-right text-sm",
						children: t("pages.products.price")
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: options.flatMap((option) => (option.options ?? []).map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b last:border-b-0 border-gray-200",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "text-sm p-3",
						children: [value.name, " :"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "text-center p-3 font-medium text-xs",
						children: value.value
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "rtl:text-start ltr:text-end p-3 font-medium text-xs",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: money(optionPrice(value.price), currency) })
					})
				]
			}, `${value.name}:${value.value}`))) })]
		})]
	});
}
function TitleRow({ order: order2 }) {
	const { t } = useTranslation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between items-center",
		children: [order2.type === "buy_as_gift" || order2.source?.type === "buy_as_gift" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "inline-block text-primary",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-gift-sharing" }),
				"\xA0",
				t("pages.orders.gift_tag")
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-3 flex-wrap",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaEditOrderButton, {
				"data-testid": "store-order-edit-btn",
				orderId: String(order2.id)
			})
		})]
	});
}
function RefundMessage({ message }) {
	if (!message) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-w-full rounded-md overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white flex items-center gap-1 rounded-md px-3 py-5 md:px-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-refund h-6 w-6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium text-base",
				dangerouslySetInnerHTML: { __html: message }
			})]
		})
	});
}
function RatingNotices({ twig }) {
	const { t } = useTranslation();
	const { store } = useTwilight();
	const settings = store?.settings?.rating;
	const rated = !!twig.rating && !Array.isArray(twig.rating);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [settings?.allow_update && rated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-500 px-2 py-3 rounded-md text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-info" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
			t("pages.order.can_edit_or_delete_your_review_within"),
			" ",
			settings.update_period,
			" ",
			t("pages.order.days_since_added"),
			"."
		] })]
	}), twig.can_rate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rating-header gradient-bg center-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-bold mb-1",
			children: t("pages.order.order_rating_title")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm",
			children: t("pages.order.order_rating_message")
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaButton, {
			"data-testid": "store-order-rate-btn",
			color: "light",
			className: "btn--rounded-full !text-primary",
			onClick: () => window.salla?.event?.dispatch("rating::open"),
			children: t("pages.rating.rate")
		})]
	})] });
}
function OrderRatings({ twig }) {
	const { t } = useTranslation();
	const { store } = useTwilight();
	const allowUpdate = !!store?.settings?.rating?.allow_update;
	const rating = Array.isArray(twig.rating) ? void 0 : twig.rating;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [rating?.store?.stars ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RatingSection, {
		title: t("pages.rating.rate_the_store"),
		rating: rating.store,
		type: "store",
		allowUpdate
	}) : null, rating?.shipping?.stars ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RatingSection, {
		title: t("pages.rating.rate_shipping"),
		rating: rating.shipping,
		type: "shipping",
		allowUpdate
	}) : null] });
}
function OrderSinglePage({ order: order2, page, componentsOrder }) {
	usePageConfig(page);
	const { store } = useTwilight();
	const { format } = useMoney();
	const twig = componentsOrder ?? { items: [] };
	const paymentExpired = order2.actions.payable && (order2.payment?.pending_payment_ends_at ?? 0) === 0;
	const money = (amount, currency) => format(amount, { currency });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRow, { order: order2 }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "customer:orders.single.details.start" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderHeader, {
				order: order2,
				links: twig.links,
				paymentExpired
			}),
			twig.is_pickable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaOrderBranch, {
				"data-testid": "store-order-branch",
				stackCards: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefundMessage, { message: order2.refund_message }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RatingNotices, { twig }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "overflow-hidden space-y-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "shipping-orders",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShippingHeader, {
						twig,
						order: order2
					}), order2.items.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderItemRow, {
						item,
						twigItem: twig.items[index],
						money,
						currency: order2.currency
					}, item.id))]
				}), !!twig.options?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderOptionsTable, {
					options: twig.options,
					money,
					currency: order2.currency
				})]
			}),
			componentsOrder && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaOrderTotalsCard, {
				"data-testid": "store-order-totals",
				order: JSON.stringify(componentsOrder)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderActions, {
				order: order2,
				paymentExpired
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderRatings, { twig }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "customer:orders.single.details.end" }),
			(twig.can_rate || store?.settings?.rating?.allow_update) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaRatingModal, { "data-testid": "store-order-rating-modal" })
		]
	});
}
//#endregion
export { OrderSinglePage };

//# sourceMappingURL=OrderSinglePage-LMWLOLW2-B2BPH6mX.js.map