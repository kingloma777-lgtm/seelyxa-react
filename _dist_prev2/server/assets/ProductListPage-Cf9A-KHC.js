import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { $ as parseNextPageToken, Bt as useStore, Hn as ReviewItemSkeleton, Ir as useLocation, Ln as ProductCardSkeleton, Lr as useNavigate, a as ProductCard, at as ChevronDownIcon, dn as LazyBreadcrumb, et as product, gt as RightToLeftListBulletIcon, hn as LazyRenderWhenVisible, la as require_jsx_runtime, lt as FilterHorizontalIcon, mn as LazyNoContent, qn as useTranslation, st as DashboardSquare01Icon, ti as onSallaEvent, ua as require_react, un as Image, wn as HookSlot, zr as useTwilight } from "./shared-home-CR99BuTM.js";
import { l as sortOptions } from "./shared-product-N_AOhgpy.js";
import { a as SallaFilters, i as useAppliedFilters } from "./product-listing-U9YefjT-.js";
import { t as ItemsList } from "./ItemsList-D9uvSN8-.js";
import { l as useReorderButtons, r as LazyTestimonials } from "./chunk-L55G7FJZ-BG0uqkvV.js";
import { F as BottomSheet, I as BlockHookSlot } from "./router-3jrsUTEg.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/hooks/useStore.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
//#endregion
//#region app/components/product/ProductListPage.tsx
var import_jsx_runtime = require_jsx_runtime();
/** localStorage-backed toolbar preference, read after mount to avoid SSR mismatch. */
function usePref(key, values, initial) {
	const [value, setValue] = (0, import_react.useState)(initial);
	(0, import_react.useEffect)(() => {
		try {
			const stored = window.localStorage.getItem(key);
			if (stored && values.includes(stored)) setValue(stored);
		} catch {}
	}, [key]);
	return [value, (0, import_react.useCallback)((v) => {
		setValue(v);
		try {
			window.localStorage.setItem(key, v);
		} catch {}
	}, [key])];
}
/** `ItemsList`'s `loader` for infinite scroll - the route already loaded the
* first page, so this fetches subsequent ones from `pagination.next`, which
* `parseNextPageToken` reads as either a bare cursor token or (sources
* without true cursor pagination, e.g. `offers`) a full next-page URL. */
function useCatalogLoader(source, selectedSort, next, filters) {
	const nextCursorRef = (0, import_react.useRef)(next ?? null);
	(0, import_react.useEffect)(() => {
		nextCursorRef.current = next ?? null;
	}, [next]);
	return (0, import_react.useCallback)(async () => {
		const { cursor, page } = parseNextPageToken(nextCursorRef.current);
		const result = await product.list({
			source: source.type,
			sourceValue: source.value,
			...cursor && { cursor },
			...page !== void 0 && { page },
			sort: selectedSort,
			...filters && {
				filterable: true,
				filters
			}
		});
		nextCursorRef.current = result.next;
		return result;
	}, [
		source.type,
		source.value,
		selectedSort,
		filters
	]);
}
/** Banner + logo + description above the listing, for a `/brands/{id}` page. Renders
* nothing for any other source type. */
function BrandHeader({ source }) {
	if (source.type !== "brands") return null;
	const brand = source.entity;
	if (!brand) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
		width: 1200,
		height: 300,
		className: "w-full max-h-[300px] object-cover rounded bg-gray-100",
		src: brand.banner || void 0,
		alt: brand.name,
		priority: true
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex flex-col md:flex-row items-center md:items-start text-center rtl:md:text-right ltr:md:text-left mt-2 mb-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
			className: "rounded w-40 h-24 object-contain shadow-md p-4 bg-white shrink-0",
			src: brand.logo || void 0,
			alt: brand.name,
			aspectRatio: "5/3"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5 pt-3 rtl:text-right",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold mb-1",
				children: brand.name
			}), brand.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-base text-gray-500 font-medium",
				dangerouslySetInnerHTML: { __html: brand.description }
			})]
		})]
	})] });
}
/** Filter show/hide (desktop toggle + mobile trigger) at the start, product
* count + grid/list switch + sort select at the end. */
function CatalogToolbar({ showFilters, filtersHidden, onToggleFiltersHidden, onOpenMobileFilters, productsCount, view, onViewChange, selectedSort, sortOptionsWithTrans, currentSortLabel, onSortChange }) {
	const { t } = useTranslation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "s-catalog-toolbar",
		children: [showFilters && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "s-catalog-toolbar__group s-catalog-toolbar__filters",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "s-catalog-toolbar__filters-toggle hidden md:inline-flex",
				"aria-pressed": filtersHidden === "1",
				onClick: onToggleFiltersHidden,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterHorizontalIcon, { "aria-hidden": "true" }), filtersHidden === "1" ? t("blocks.catalog.show_filters", "Show filters") : t("blocks.catalog.hide_filters", "Hide filters")]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onOpenMobileFilters,
				className: "s-catalog-toolbar__filters-trigger md:hidden",
				"aria-label": t("pages.categories.filters", "Filters"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterHorizontalIcon, { "aria-hidden": "true" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "s-catalog-toolbar__group s-catalog-toolbar__options",
			children: [
				productsCount !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "s-catalog-toolbar__count hidden sm:inline",
					children: [
						productsCount,
						" ",
						t("blocks.catalog.products_count", "products")
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "s-catalog-toolbar__views",
					role: "group",
					"aria-label": t("blocks.catalog.view", "View"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": view === "grid",
						"aria-label": t("blocks.catalog.view_grid", "Grid view"),
						onClick: () => onViewChange("grid"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardSquare01Icon, { "aria-hidden": "true" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": view === "list",
						"aria-label": t("blocks.catalog.view_list", "List view"),
						onClick: () => onViewChange("list"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RightToLeftListBulletIcon, { "aria-hidden": "true" })
					})]
				}),
				sortOptionsWithTrans.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "s-catalog-toolbar__sort",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "s-catalog-toolbar__sort-label",
							children: [
								t("pages.categories.sorting", "Sort By"),
								": ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: currentSortLabel })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDownIcon, { "aria-hidden": "true" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: selectedSort,
							onChange: onSortChange,
							children: sortOptionsWithTrans.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: option.id,
								children: option.name
							}, option.id))
						})
					]
				})
			]
		})]
	});
}
/** The desktop filter column (when visible) + the product grid/list itself. */
function CatalogGrid({ filtersVisible, filters, listKey, selectedSort, view, products, pagination, loader, listLayoutClass, wideGridClass, filterStatus, onRetry }) {
	const { t } = useTranslation();
	const location = useLocation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: filtersVisible ? "md:grid md:grid-cols-[288px_1fr] gap-8" : "",
		children: [filtersVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaFilters, {
			id: "filters-menu",
			className: "hidden md:block lg:sticky lg:top-20",
			filters
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "product:list.items.start" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "product:index.items.start" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `flex min-h-screen${filterStatus === "loading" ? " opacity-60" : ""}`,
					"aria-busy": filterStatus === "loading",
					children: filterStatus === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 flex-1 flex-col items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyNoContent, {
							icon: "sicon-shopping-bag",
							message: t("common.errors.error_occurred", "Something went wrong")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"data-testid": "store-catalog-filters-retry",
							className: "link--primary mt-4",
							onClick: onRetry,
							children: t("common.elements.try_again", "Try again")
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemsList, {
						resetKey: `${listKey}-${selectedSort}-${view}`,
						items: products,
						loader,
						mode: pagination?.next ? "infinite" : "static",
						pageUrl: location.pathname + location.searchStr,
						className: "s-products-list flex-1 min-w-0",
						itemsClassName: `s-products-list-wrapper ${listLayoutClass}${filtersVisible ? " s-products-list-with-filters" : ""}${wideGridClass}`,
						skeleton: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCardSkeleton, {}),
						skeletonType: "item",
						skeletonCount: 12,
						empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyNoContent, {
							icon: "sicon-shopping-bag",
							message: t("pages.categories.no_products", "No products found in this category")
						}),
						t: (key, fallback) => t(key, fallback || key),
						children: (items) => items.map((prod, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
							product: prod,
							index: idx,
							layout: view === "list" ? "horizontal" : "vertical"
						}, prod.id))
					}, `${listKey}-${selectedSort}-${view}`)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "product:index.items.end" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "product:list.items.end" })
			]
		})]
	});
}
/** The store-reviews block below the listing — categories only, and only when
* the merchant has enabled it. */
function CategoryTestimonials({ enabled }) {
	if (!enabled) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyRenderWhenVisible, {
		estimatedHeight: "0px",
		placeholder: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewItemSkeleton, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyTestimonials, { data: {} })
	});
}
/**
* Theme fork of the engine `ProductListPage`, registered as `product:list-page`
* in `app/router.tsx` for every product listing.
*
* Same data flow as upstream; the toolbar is rebuilt as a pill with a product
* count, a grid / list view switch and a styled sort control, plus a desktop
* "hide filters" toggle that collapses the filter column. View + collapse state
* persist in `localStorage`. Upgrade notes: `FORKS.md`.
*/
function ProductListPage({ page, source, query, products, pagination, filters }) {
	const { t } = useTranslation();
	const store = useStore();
	const { theme } = useTwilight();
	const navigate = useNavigate();
	const location = useLocation();
	const selectedSort = query.sort;
	const [filtersOpen, setFiltersOpen] = (0, import_react.useState)(false);
	const [view, setView] = usePref("catalog-view", ["grid", "list"], "grid");
	const [filtersHidden, setFiltersHidden] = usePref("catalog-filters-hidden", ["0", "1"], "0");
	const showFilters = !!(query.filters && store?.settings?.product?.filters);
	const filtersVisible = showFilters && filtersHidden === "0";
	const { filters: appliedFilters, page: filteredPage, lastPage, status: filterStatus, retry: retryFilters } = useAppliedFilters(source, selectedSort, showFilters);
	const shownProducts = filterStatus === "error" ? [] : filterStatus === "idle" ? products : (filterStatus === "ready" ? filteredPage : lastPage)?.items ?? products;
	const shownNext = filterStatus === "idle" ? pagination?.next : filterStatus === "ready" ? filteredPage?.next : null;
	const filteredKey = filterStatus === "idle" ? "" : `${filterStatus}${filterStatus === "ready" ? JSON.stringify(appliedFilters) : ""}`;
	const isBrand = source.type === "brands";
	const isReorder = source.type === "reorder";
	useReorderButtons(isReorder);
	const sortOptionsWithTrans = (0, import_react.useMemo)(() => sortOptions(selectedSort, t), [selectedSort, t]);
	const currentSortLabel = sortOptionsWithTrans.find((o) => o.id === selectedSort)?.name ?? sortOptionsWithTrans[0]?.name;
	(0, import_react.useEffect)(() => {
		const handleFiltersChanged = () => setFiltersOpen(false);
		return onSallaEvent("salla-filters::changed", handleFiltersChanged);
	}, []);
	const handleSortChange = (0, import_react.useCallback)((event) => {
		const params = new URLSearchParams(location.searchStr);
		params.set("sort", event.target.value);
		params.delete("page");
		const search = params.toString();
		navigate(location.pathname + (search ? `?${search}` : ""));
	}, [
		navigate,
		location.pathname,
		location.searchStr
	]);
	const listKey = source.value ?? source.type;
	const blockScope = (0, import_react.useMemo)(() => source.type === "categories" && source.value ? { category_id: source.value } : void 0, [source.type, source.value]);
	const loader = useCatalogLoader(source, selectedSort, shownNext, appliedFilters);
	const listLayoutClass = view === "list" ? "s-products-list-horizontal-cards" : "s-products-list-vertical-cards";
	const wideGridClass = !query.filters && view === "grid" ? " s-products-list-cols-5" : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container px-2.5 mb-10",
		"data-source": isReorder ? "reorder" : void 0,
		children: [
			theme?.settings?.product_index_show_breadcrumbs !== false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyBreadcrumb, { page }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandHeader, { source }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "product:list.start" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockHookSlot, {
				name: "product.index.before_products_group_with_filter",
				wrapper: "s-before-products-list",
				className: "!mt-0",
				scope: blockScope
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-bold text-xl mb-4",
				id: "page-main-title",
				children: isBrand ? t("common.titles.products") : page.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatalogToolbar, {
				showFilters,
				filtersHidden,
				onToggleFiltersHidden: () => setFiltersHidden(filtersHidden === "1" ? "0" : "1"),
				onOpenMobileFilters: () => setFiltersOpen(true),
				productsCount: shownNext ? void 0 : shownProducts.length,
				view,
				onViewChange: setView,
				selectedSort,
				sortOptionsWithTrans,
				currentSortLabel,
				onSortChange: handleSortChange
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatalogGrid, {
				filtersVisible,
				filters,
				listKey: `${listKey}${filteredKey}`,
				filterStatus,
				onRetry: retryFilters,
				selectedSort,
				view,
				products: shownProducts,
				pagination: { next: shownNext ?? null },
				loader,
				listLayoutClass,
				wideGridClass
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockHookSlot, {
				name: "product.index.after_products_group_with_filter",
				wrapper: "s-after-products-list",
				scope: blockScope
			}),
			showFilters && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomSheet, {
				open: filtersOpen,
				onClose: () => setFiltersOpen(false),
				title: t("pages.categories.filters", "Filters"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaFilters, {
					id: "filters-menu-mobile",
					filters
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryTestimonials, { enabled: source.type === "categories" && !!store?.settings?.category?.testimonial_enabled }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockHookSlot, {
				name: "product.index.after_testimonials",
				wrapper: "s-after-testimonials",
				scope: blockScope
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "product:list.end" })
		]
	}, listKey);
}
//#endregion
export { ProductListPage };

//# sourceMappingURL=ProductListPage-Cf9A-KHC.js.map