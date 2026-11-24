import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { On as SallaAddProductButton, Ot as useWishlist, Qn as useTranslation, Tr as useQueryClient, Vr as useLocation, Vt as useMoney, ha as require_react, hn as Image, kn as HookSlot, ma as require_jsx_runtime, oi as onSallaEvent, xn as SallaButton, yn as LazyNoContent } from "./shared-home-CcULkdy1.js";
import { h as SallaSocialShareCore } from "./shared-product-BuxTY7AC.js";
import { t as ItemsList } from "./ItemsList-MgXfLD3w.js";
import { t as wishlist } from "./chunk-QIJJTWW6-D47C-RwN.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/WishlistPage-AROQHMZ2.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function useWishlistShare() {
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const [selecting, setSelecting] = (0, import_react.useState)(false);
	const [selectedIds, setSelectedIds] = (0, import_react.useState)([]);
	const [sharing, setSharing] = (0, import_react.useState)(false);
	const [shareUrl, setShareUrl] = (0, import_react.useState)("");
	const loadedIdsRef = (0, import_react.useRef)([]);
	const socialShareRef = (0, import_react.useRef)(null);
	const share = (0, import_react.useCallback)(async (ids, selectAll) => {
		if (!window.salla?.wishlist?.share) return;
		setSharing(true);
		try {
			const response = await window.salla.wishlist.share(ids, selectAll);
			const url = response?.data?.url || response?.url || "";
			if (!url) return;
			setShareUrl(url);
			const element = socialShareRef.current;
			if (element) {
				element.url = url;
				await element.refresh?.();
				await element.open?.();
			}
		} catch {} finally {
			setSharing(false);
		}
	}, []);
	const shareAll = (0, import_react.useCallback)(() => {
		setMenuOpen(false);
		share([], true);
	}, [share]);
	const shareSelected = (0, import_react.useCallback)(() => {
		if (selectedIds.length) share(selectedIds, false);
	}, [share, selectedIds]);
	const startSelecting = (0, import_react.useCallback)(() => {
		setMenuOpen(false);
		setSelecting(true);
	}, []);
	const cancelSelecting = (0, import_react.useCallback)(() => {
		setSelecting(false);
		setSelectedIds([]);
		setShareUrl("");
		socialShareRef.current?.close?.();
	}, []);
	const toggleSelected = (0, import_react.useCallback)((id) => {
		setShareUrl("");
		setSelectedIds((current) => current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id]);
	}, []);
	const selectedIdsRef = (0, import_react.useRef)(selectedIds);
	(0, import_react.useEffect)(() => {
		selectedIdsRef.current = selectedIds;
	}, [selectedIds]);
	const deselect = (0, import_react.useCallback)((id) => {
		if (!selectedIdsRef.current.includes(id)) return;
		setShareUrl("");
		const element = socialShareRef.current;
		if (element) {
			element.url = void 0;
			element.close?.();
		}
		setSelectedIds((current) => current.filter((existing) => existing !== id));
	}, []);
	return {
		menuOpen,
		setMenuOpen,
		selecting,
		selectedIds,
		sharing,
		shareUrl,
		loadedIdsRef,
		socialShareRef,
		shareAll,
		shareSelected,
		startSelecting,
		cancelSelecting,
		toggleSelected,
		toggleAll: (0, import_react.useCallback)(() => {
			setShareUrl("");
			setSelectedIds((current) => current.length && current.length === loadedIdsRef.current.length ? [] : [...loadedIdsRef.current]);
		}, []),
		deselect
	};
}
function WishlistShareBar({ state, hasProducts }) {
	const { t } = useTranslation();
	const rootRef = (0, import_react.useRef)(null);
	const { menuOpen, setMenuOpen } = state;
	(0, import_react.useEffect)(() => {
		if (!menuOpen) return;
		const onPointerDown = (event) => {
			if (!rootRef.current?.contains(event.target)) setMenuOpen(false);
		};
		const onKeyDown = (event) => {
			if (event.key === "Escape") setMenuOpen(false);
		};
		document.addEventListener("mousedown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("mousedown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [menuOpen, setMenuOpen]);
	const selectedCount = state.selectedIds.length;
	const allSelected = selectedCount > 0 && selectedCount === state.loadedIdsRef.current.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: rootRef,
		className: "s-wishlist-actions",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "s-wishlist-actions-bar flex items-center justify-end gap-3 mb-3",
			children: state.selecting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "s-wishlist-actions-selection flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "s-wishlist-actions-select-all inline-flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: allSelected,
							ref: (input) => {
								if (input) input.indeterminate = selectedCount > 0 && !allSelected;
							},
							onChange: state.toggleAll
						}), t("pages.wishlist.select_all", "Select all")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SallaButton, {
						color: "primary",
						disabled: selectedCount === 0 || state.sharing,
						onClick: state.shareSelected,
						children: [t("pages.wishlist.share", "Share"), selectedCount > 0 ? ` (${selectedCount})` : ""]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaButton, {
						fill: "outline",
						color: "light",
						onClick: state.cancelSelecting,
						children: t("common.elements.cancel", "Cancel")
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "s-wishlist-actions-dropdown relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaButton, {
					color: "primary",
					fill: "outline",
					disabled: !hasProducts || state.sharing,
					"aria-haspopup": "true",
					"aria-expanded": menuOpen,
					onClick: () => setMenuOpen(!menuOpen),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center justify-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
								className: "sicon-share-alt",
								"aria-hidden": "true"
							}),
							t("pages.wishlist.share", "Share"),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
								className: "sicon-keyboard_arrow_down",
								"aria-hidden": "true"
							})
						]
					})
				}), menuOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					role: "menu",
					className: "s-wishlist-actions-menu absolute z-10 mt-2 min-w-48 rounded-md bg-white py-2 shadow-default rtl:right-0 ltr:left-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						role: "none",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							role: "menuitem",
							className: "s-wishlist-actions-item block w-full px-4 py-2 text-start text-sm text-gray-700 hover:bg-gray-50",
							onClick: state.shareAll,
							children: t("pages.wishlist.share_all", "Share the list")
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						role: "none",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							role: "menuitem",
							className: "s-wishlist-actions-item block w-full px-4 py-2 text-start text-sm text-gray-700 hover:bg-gray-50",
							onClick: state.startSelecting,
							children: t("pages.wishlist.share_specific", "Share specific items")
						})
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaSocialShareCore, {
			ref: state.socialShareRef,
			url: state.shareUrl || void 0,
			mode: "modal",
			modalTitle: t("pages.wishlist.share_list_title", "Share wishlist"),
			className: "s-wishlist-actions-social",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				slot: "widget",
				className: "s-wishlist-actions-social-anchor",
				"aria-hidden": "true"
			})
		})]
	});
}
var setAddButtonAttributes = (el) => {
	el?.setAttribute("loader-position", "center");
	el?.setAttribute("fill", "outline");
};
var REMOVING_MS = 300;
var REMOVING_STYLE = {
	opacity: 0,
	transform: "scale(0.95)",
	transition: `opacity ${REMOVING_MS}ms ease-in-out, transform ${REMOVING_MS}ms ease-in-out`
};
function WishlistCard({ product: prod, selection, removing, onRemoved }) {
	const { remove } = useWishlist();
	const { format } = useMoney();
	(0, import_react.useEffect)(() => {
		if (!removing) return;
		const timer = setTimeout(() => onRemoved?.(Number(prod.id)), REMOVING_MS + 50);
		return () => clearTimeout(timer);
	}, [
		removing,
		onRemoved,
		prod.id
	]);
	const handleRemove = () => {
		if (prod.id) remove(Number(prod.id));
	};
	const displayPrice = prod.sale_price ?? prod.price;
	const regularPrice = prod.regular_price;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id: `wishlist-product-${prod.id}`,
		className: `product-entry product-entry--wishlist${selection?.selected ? " is-selected" : ""}`,
		style: removing ? REMOVING_STYLE : void 0,
		onTransitionEnd: (event) => {
			if (removing && event.target === event.currentTarget && event.propertyName === "opacity") onRemoved?.(Number(prod.id));
		},
		children: [
			selection?.selecting && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "checkbox",
				className: "s-wishlist-select shrink-0 rtl:ml-4 ltr:mr-4",
				"aria-label": prod.name,
				checked: selection.selected,
				onChange: () => selection.onToggle(Number(prod.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center mb-4 sm:mb-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: prod.url,
					className: "product-entry__image",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
						className: "object-cover w-full h-full",
						src: prod.image?.url,
						alt: prod.image?.alt ?? prod.name,
						aspectRatio: "1/1"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 rtl:pr-5 ltr:pl-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm text-gray-800 leading-6 mb-1.5 rtl:pl-5 ltr:pr-5 rtl:md:pl-8 ltr:md:pr-8 line-clamp-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: prod.url,
							children: prod.name
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-full center-between",
						children: prod.is_on_sale && regularPrice ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-x-1 rtl:space-x-reverse",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "inline-block text-sm font-bold text-red-400",
								children: format(displayPrice)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm text-gray-500 line-through",
								children: format(regularPrice)
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-sm font-bold",
							children: format(displayPrice)
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center space-x-4 rtl:space-x-reverse",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaAddProductButton, {
					ref: setAddButtonAttributes,
					productStatus: prod.status,
					productId: prod.id,
					productType: prod.type,
					fill: "outline",
					className: "flex-grow w-full sm:grow-0 md:w-40"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaButton, {
					loaderPosition: "center",
					shape: "icon",
					size: "small",
					color: "danger",
					className: "btn--delete",
					onClick: handleRemove,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-cancel" })
				})]
			})
		]
	});
}
function useWishlistItems({ query, products, pagination }, onRemoved) {
	const queryClient = useQueryClient();
	const nextPageRef = (0, import_react.useRef)(query.page + 1);
	const [removedIds, setRemovedIds] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
	const [removingIds, setRemovingIds] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
	const [reloaded, setReloaded] = (0, import_react.useState)(null);
	const loadedRef = (0, import_react.useRef)({
		ids: products.map((prod) => Number(prod.id)),
		hasMore: !!pagination?.next
	});
	const [loadedProducts, setLoadedProducts] = (0, import_react.useState)(products);
	if (loadedProducts !== products) {
		setLoadedProducts(products);
		setRemovedIds(/* @__PURE__ */ new Set());
		setRemovingIds(/* @__PURE__ */ new Set());
		setReloaded(null);
	}
	(0, import_react.useEffect)(() => {
		nextPageRef.current = query.page + 1;
		loadedRef.current = {
			ids: products.map((prod) => Number(prod.id)),
			hasMore: !!pagination?.next
		};
	}, [
		products,
		query.page,
		pagination?.next
	]);
	(0, import_react.useEffect)(() => {
		const handleRemoved = (_response, id) => {
			(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? setRemovedIds : setRemovingIds)((current) => new Set(current).add(Number(id)));
			onRemoved(Number(id));
		};
		return onSallaEvent("wishlist::removed", handleRemoved);
	}, [onRemoved]);
	(0, import_react.useEffect)(() => {
		const { ids, hasMore } = loadedRef.current;
		if (!ids.length || !ids.every((id) => removedIds.has(id))) return;
		const reset = (items, next) => {
			nextPageRef.current = query.page + 1;
			loadedRef.current = {
				ids: items.map((prod) => Number(prod.id)),
				hasMore: !!next
			};
			setRemovedIds(/* @__PURE__ */ new Set());
			setRemovingIds(/* @__PURE__ */ new Set());
			setReloaded((current) => ({
				items,
				next,
				generation: (current?.generation ?? 0) + 1
			}));
		};
		if (!hasMore) {
			reset([], null);
			return;
		}
		let cancelled = false;
		queryClient.fetchQuery({
			...wishlist.queries.list({ page: query.page }),
			staleTime: 0
		}).then((result) => {
			if (!cancelled) reset(result.items, result.next);
		}).catch(() => void 0);
		return () => {
			cancelled = true;
		};
	}, [
		removedIds,
		query.page,
		products,
		queryClient
	]);
	const loader = async () => {
		const pageToLoad = nextPageRef.current;
		const result = await wishlist.list({ page: pageToLoad });
		nextPageRef.current = pageToLoad + 1;
		loadedRef.current = {
			ids: [...loadedRef.current.ids, ...result.items.map((prod) => Number(prod.id))],
			hasMore: !!result.next
		};
		return {
			items: result.items,
			next: result.next
		};
	};
	const finishRemoving = (0, import_react.useCallback)((id) => {
		setRemovedIds((current) => current.has(id) ? current : new Set(current).add(id));
	}, []);
	return {
		items: reloaded ? reloaded.items : products,
		next: reloaded ? reloaded.next : pagination?.next,
		generation: reloaded?.generation ?? 0,
		removedIds,
		removingIds,
		finishRemoving,
		loader
	};
}
function WishlistPage(props) {
	const { t } = useTranslation();
	const { pathname, searchStr } = useLocation();
	const shareState = useWishlistShare();
	const selectedIdSet = (0, import_react.useMemo)(() => new Set(shareState.selectedIds), [shareState.selectedIds]);
	const { items, next, generation, removedIds, removingIds, finishRemoving, loader } = useWishlistItems(props, shareState.deselect);
	const hasRemaining = items.some((prod) => !removedIds.has(Number(prod.id)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		id: "wishlist",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "customer:wishlist.items.start" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WishlistShareBar, {
				state: shareState,
				hasProducts: hasRemaining || !!next
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemsList, {
				items,
				loader,
				mode: next ? "infinite" : "static",
				pageUrl: pathname + searchStr,
				className: "s-products-list",
				itemsClassName: "s-products-list-wrapper s-products-list-row-cards",
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-center py-16",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyNoContent, {
						icon: "sicon-heart",
						message: t("common.errors.no_wishlist", "You don't have any wishes"),
						actionLabel: t("pages.offer.continue_shopping", "Continue shopping"),
						actionUrl: "/"
					})
				}),
				t: (key, fallback) => t(key, fallback || key),
				children: (items2) => {
					const remaining = items2.filter((item) => !removedIds.has(Number(item.id)));
					shareState.loadedIdsRef.current = remaining.map((item) => Number(item.id));
					return remaining.map((prod) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WishlistCard, {
						product: prod,
						removing: removingIds.has(Number(prod.id)),
						onRemoved: finishRemoving,
						selection: {
							selecting: shareState.selecting,
							selected: selectedIdSet.has(Number(prod.id)),
							onToggle: shareState.toggleSelected
						}
					}, prod.id));
				}
			}, generation),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "customer:wishlist.items.end" })
		]
	});
}
//#endregion
export { WishlistPage };

//# sourceMappingURL=WishlistPage-AROQHMZ2-siXG6o7U.js.map