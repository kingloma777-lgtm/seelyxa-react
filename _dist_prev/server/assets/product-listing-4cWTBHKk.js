import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { $ as product, Cn as HookSlot, Dr as notFound, Fn as PageSkeleton, Fr as useLocation, In as ProductCardSkeleton, Ir as useNavigate, J as ProductCard, Ji as RouteId, Kn as useTranslation, Nr as unauthorized, Or as orThrow, Q as parseNextPageToken, Rr as useTwilight, Tn as withDeferredHydration, Vn as ReviewItemSkeleton, Wn as L, X as COMPONENT_KEYS, Yr as getAuthToken, Z as registry, ca as require_jsx_runtime, ei as onSallaEvent, la as require_react, ln as Image, mn as LazyRenderWhenVisible, nn as storePageUrl, pn as LazyNoContent, tn as buildHreflangAlternates, un as LazyBreadcrumb, zi as getTwilightContext, zt as useStore } from "./shared-home-CDptNpzP.js";
import { c as availableSortIds, l as sortOptions, s as SORT_IDS } from "./shared-product-BT3g3Q7e.js";
import { t as ItemsList } from "./ItemsList-DU9ECcs8.js";
import { l as useReorderButtons, r as LazyTestimonials } from "./chunk-L55G7FJZ-DZwSLY6g.js";
import { t as category } from "./chunk-MBSWV56J-fxixIFLq.js";
import { t as brand } from "./chunk-G3UTLR3D-DnrFNBcI.js";
import { t as Drawer } from "./chunk-6TKIUG5C-BUTfH1FR.js";
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-filters.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var SallaFiltersElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get applyFilters() {
		return true;
	}
	get filters() {
		return true;
	}
	get getFilters() {
		return true;
	}
	get resetFilters() {
		return true;
	}
};
var defineSallaFilters_runtime = () => {};
var SallaFiltersCore = /*@__PURE__*/ L({
	tagName: "salla-filters",
	elementClass: SallaFiltersElement_runtime,
	react: import_react.default,
	events: { onChanged: "changed" },
	defineCustomElement: defineSallaFilters_runtime
});
SallaFiltersCore.displayName = "SallaFiltersCore";
var SallaFilters = withDeferredHydration(SallaFiltersCore, "SallaFilters");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/routes/product-listing.js
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_SORT = "ourSuggest";
var SOURCE_TO_API = {
	categories: "categories",
	latest: "latest",
	sales: "sales",
	offers: "offers",
	search: "search",
	tags: "tags",
	brands: "brands",
	reorder: "reorder"
};
var SOURCE_TITLE_KEY = {
	latest: "blocks.home.latest_products",
	sales: "common.titles.most_sales",
	offers: "common.titles.discounts",
	reorder: "pages.orders.repurchase"
};
var SOURCE_SLUG = {
	latest: "products?source=latest",
	sales: "products?source=sales",
	offers: "products?source=offers",
	reorder: "products?source=reorder"
};
async function productListLoader(ctx) {
	const { params, search } = ctx;
	const page = search?.page ? String(search.page) : void 0;
	const cursor = page && Number.isNaN(Number(page)) ? page : void 0;
	const sort = search?.sort && SORT_IDS.includes(search.sort) ? search.sort : DEFAULT_SORT;
	const sourceType = params.source ?? (params.id ? "categories" : void 0);
	if (!sourceType) throw new Error("ProductList loader requires source type");
	if (sourceType === "categories" && params.id) return loadCategoryProducts(params.id, cursor, sort);
	if (sourceType === "search") return loadSearchProducts((search?.q ?? params.keyword ?? "").trim(), cursor, sort);
	if (sourceType === "tags" && params.id) return loadTagProducts(params.id, cursor, sort);
	if (sourceType === "brands" && params.id) return loadBrandProducts(params.id, cursor, sort);
	if (sourceType === "reorder" && !getAuthToken()) throw unauthorized();
	if (sourceType in SOURCE_TITLE_KEY) return loadStaticProducts(sourceType, params.title ?? "", params.slug ?? "", cursor, sort);
	throw new Error(`Unknown source type: ${sourceType}`);
}
async function loadCategoryProducts(id, cursor, sort) {
	const { queryClient, i18n } = getTwilightContext();
	let categoryData, productsResult;
	try {
		[categoryData, productsResult] = await Promise.all([queryClient.fetchQuery(category.queries.detail(id)), queryClient.fetchQuery(product.queries.list({
			source: "categories",
			sourceValue: id,
			cursor,
			sort,
			filterable: true
		}))]);
	} catch {
		throw notFound();
	}
	if (!categoryData) throw notFound();
	return {
		page: {
			slug: RouteId.PRODUCT_INDEX,
			id,
			title: categoryData.name,
			breadcrumbs: [{
				name: i18n.t("common.titles.home"),
				url: "/"
			}, {
				name: categoryData.name,
				url: categoryData.url
			}]
		},
		source: {
			type: "categories",
			value: id,
			entity: categoryData
		},
		query: {
			sort,
			filters: true
		},
		products: productsResult.items,
		pagination: { next: productsResult.next },
		filters: productsResult.filters
	};
}
async function loadSearchProducts(keyword, cursor, sort) {
	if (!keyword) {
		const { i18n: i18n2 } = getTwilightContext();
		return {
			page: {
				slug: RouteId.SEARCH,
				title: i18n2.t("pages.products.search_result"),
				breadcrumbs: [{
					name: i18n2.t("common.titles.home"),
					url: "/"
				}, {
					name: i18n2.t("pages.products.search_result"),
					url: "/search"
				}]
			},
			source: {
				type: "search",
				value: ""
			},
			query: {
				sort,
				filters: true
			},
			products: [],
			pagination: { next: null }
		};
	}
	const { queryClient, i18n } = getTwilightContext();
	const productsResult = await queryClient.fetchQuery(product.queries.list({
		source: "search",
		sourceValue: keyword,
		cursor,
		sort,
		filterable: true
	}));
	return {
		page: {
			slug: RouteId.SEARCH,
			title: i18n.t("common.elements.search_about").replace(":word", keyword),
			breadcrumbs: [{
				name: i18n.t("common.titles.home"),
				url: "/"
			}, {
				name: keyword,
				url: "/search"
			}]
		},
		source: {
			type: "search",
			value: keyword
		},
		query: {
			sort,
			filters: true
		},
		products: productsResult.items,
		pagination: { next: productsResult.next },
		filters: productsResult.filters
	};
}
async function loadTagProducts(id, cursor, sort) {
	const { queryClient, i18n } = getTwilightContext();
	const [tagData, productsResult] = await Promise.all([orThrow(queryClient.fetchQuery(product.queries.tag(id))), queryClient.fetchQuery(product.queries.list({
		source: "tags",
		sourceValue: id,
		cursor,
		sort
	}))]);
	if (!tagData) throw notFound();
	const tagUrl = productsResult.items[0]?.tags?.find((t) => String(t.id) === id)?.url ?? "";
	const tag = {
		id: Number(tagData.id),
		name: tagData.name,
		url: tagUrl
	};
	return {
		page: {
			slug: RouteId.PRODUCT_INDEX_TAG,
			id,
			title: tag.name,
			breadcrumbs: [{
				name: i18n.t("common.titles.home"),
				url: "/"
			}, {
				name: tag.name,
				url: tag.url || `/tags/${id}`
			}]
		},
		source: {
			type: "tags",
			value: id,
			entity: tag
		},
		query: {
			sort,
			filters: false
		},
		products: productsResult.items,
		pagination: { next: productsResult.next }
	};
}
async function loadBrandProducts(id, cursor, sort) {
	const { queryClient, i18n } = getTwilightContext();
	let brandData, productsResult;
	try {
		[brandData, productsResult] = await Promise.all([queryClient.fetchQuery(brand.queries.detail(id)), queryClient.fetchQuery(product.queries.list({
			source: "brands",
			sourceValue: id,
			cursor,
			sort
		}))]);
	} catch {
		throw notFound();
	}
	if (!brandData) throw notFound();
	return {
		page: {
			slug: RouteId.BRANDS_INDEX,
			id,
			title: brandData.name,
			breadcrumbs: [{
				name: i18n.t("common.titles.home"),
				url: "/"
			}, {
				name: brandData.name,
				url: `/brands/${id}`
			}]
		},
		source: {
			type: "brands",
			value: id,
			entity: brandData
		},
		query: {
			sort,
			filters: false
		},
		products: productsResult.items,
		pagination: { next: productsResult.next }
	};
}
var SOURCE_ROUTE_ID = {
	latest: RouteId.PRODUCT_INDEX_LATEST,
	sales: RouteId.PRODUCT_INDEX_SALES,
	offers: RouteId.PRODUCT_INDEX_OFFERS,
	reorder: RouteId.PRODUCT_INDEX
};
async function loadStaticProducts(source, title, slug, cursor, sort) {
	const { queryClient, i18n } = getTwilightContext();
	const resolvedTitle = title || i18n.t(SOURCE_TITLE_KEY[source]);
	const resolvedSlug = slug || SOURCE_SLUG[source];
	const productsResult = await queryClient.fetchQuery({
		...product.queries.list({
			source: SOURCE_TO_API[source],
			cursor,
			sort
		}),
		...source === "reorder" && { staleTime: 0 }
	});
	return {
		page: {
			slug: SOURCE_ROUTE_ID[source],
			title: resolvedTitle,
			breadcrumbs: [{
				name: i18n.t("common.titles.home"),
				url: "/"
			}, {
				name: resolvedTitle,
				url: `/${resolvedSlug}`
			}]
		},
		source: { type: source },
		query: {
			sort,
			filters: false
		},
		products: productsResult.items,
		pagination: { next: productsResult.next }
	};
}
var UNSAFE_KEYS = /* @__PURE__ */ new Set([
	"__proto__",
	"constructor",
	"prototype"
]);
function parseFiltersFromSearch(search) {
	const out = /* @__PURE__ */ Object.create(null);
	new URLSearchParams(search).forEach((value, rawKey) => {
		if (!rawKey.startsWith("filters[")) return;
		const path = [...rawKey.matchAll(/\[([^\]]*)\]/g)].map((m) => m[1]);
		const isList = path[path.length - 1] === "";
		const keys = isList ? path.slice(0, -1) : path;
		if (!keys.length || keys.includes("") || keys.some((key) => UNSAFE_KEYS.has(key))) return;
		let node = out;
		keys.slice(0, -1).forEach((key) => {
			const existing = node[key];
			if (typeof existing !== "object" || existing === null || Array.isArray(existing)) node[key] = /* @__PURE__ */ Object.create(null);
			node = node[key];
		});
		const leaf = keys[keys.length - 1];
		if (isList) node[leaf] = [...Array.isArray(node[leaf]) ? node[leaf] : [], value];
		else node[leaf] = value;
	});
	return Object.keys(out).length ? out : null;
}
function useAppliedFilters(source, sort, enabled) {
	const [filters, setFilters] = (0, import_react.useState)(null);
	const [result, setResult] = (0, import_react.useState)(null);
	const [failedKey, setFailedKey] = (0, import_react.useState)(null);
	const [attempt, setAttempt] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!enabled) return;
		setFilters(parseFiltersFromSearch(window.location.search));
		const onChanged = (...args) => {
			const next = args[0];
			setFilters(next && Object.keys(next).length ? { ...next } : null);
		};
		return onSallaEvent("salla-filters::changed", onChanged);
	}, [
		enabled,
		source.type,
		source.value
	]);
	const key = filters ? JSON.stringify([
		source.type,
		source.value,
		sort,
		filters
	]) : "";
	(0, import_react.useEffect)(() => {
		if (!filters) return;
		const controller = new AbortController();
		setFailedKey(null);
		product.list({
			source: source.type,
			sourceValue: source.value,
			sort,
			filterable: true,
			filters,
			signal: controller.signal
		}).then((res) => setResult({
			key,
			page: {
				items: res.items,
				next: res.next
			}
		})).catch(() => {
			if (!controller.signal.aborted) setFailedKey(key);
		});
		return () => controller.abort();
	}, [key, attempt]);
	const retry = (0, import_react.useCallback)(() => setAttempt((n) => n + 1), []);
	if (!filters) return {
		filters: null,
		page: null,
		lastPage: null,
		status: "idle",
		retry
	};
	const page = result?.key === key ? result.page : null;
	const status = page ? "ready" : failedKey === key ? "error" : "loading";
	return {
		filters,
		page,
		lastPage: result?.page ?? null,
		status,
		retry
	};
}
var FILTERED_PRODUCT_IMAGE_SIZES = "(min-width: 768px) 25vw, 33vw";
function ProductListPage({ page, source, query, products, pagination, filters }) {
	const { t } = useTranslation();
	const store = useStore();
	const { theme } = useTwilight();
	const navigate = useNavigate();
	const selectedSort = query.sort;
	const [filtersOpen, setFiltersOpen] = (0, import_react.useState)(false);
	const showFilters = query.filters && store?.settings?.product?.filters;
	const isBrand = source.type === "brands";
	const brand2 = isBrand ? source.entity : null;
	const isReorder = source.type === "reorder";
	useReorderButtons(isReorder);
	const sortIds = availableSortIds(source.type, store?.settings?.product?.sort_options);
	const sortOptionsWithTrans = (0, import_react.useMemo)(() => sortOptions(selectedSort, t, sortIds), [
		selectedSort,
		t,
		sortIds
	]);
	const shownSort = sortOptionsWithTrans.some((option) => option.is_selected) ? selectedSort : "";
	const location = useLocation();
	const { filters: appliedFilters, page: filteredPage, lastPage, status: filterStatus, retry: retryFilters } = useAppliedFilters(source, selectedSort, !!showFilters);
	const shownProducts = filterStatus === "error" ? [] : filterStatus === "idle" ? products : (filterStatus === "ready" ? filteredPage : lastPage)?.items ?? products;
	const shownNext = filterStatus === "idle" ? pagination?.next : filterStatus === "ready" ? filteredPage?.next : null;
	const filteredKey = filterStatus === "idle" ? "" : `-${filterStatus}${filterStatus === "ready" ? JSON.stringify(appliedFilters) : ""}`;
	(0, import_react.useEffect)(() => {
		const handleFiltersChanged = () => setFiltersOpen(false);
		return onSallaEvent("salla-filters::changed", handleFiltersChanged);
	}, []);
	const handleSortChange = (0, import_react.useCallback)((event) => {
		const newSort = event.target.value;
		const params = new URLSearchParams(location.searchStr);
		params.set("sort", newSort);
		params.delete("page");
		navigate(`${location.pathname}?${params.toString()}`);
	}, [
		navigate,
		location.pathname,
		location.searchStr
	]);
	const listKey = source.value ?? source.type;
	const nextCursorRef = (0, import_react.useRef)(shownNext ?? null);
	(0, import_react.useEffect)(() => {
		nextCursorRef.current = shownNext ?? null;
	}, [shownNext]);
	const loader = (0, import_react.useCallback)(async () => {
		const { cursor, page: page2 } = parseNextPageToken(nextCursorRef.current);
		const result = await product.list({
			source: source.type,
			sourceValue: source.value,
			...cursor && { cursor },
			...page2 !== void 0 && { page: page2 },
			sort: selectedSort,
			...appliedFilters && {
				filterable: true,
				filters: appliedFilters
			}
		});
		nextCursorRef.current = result.next;
		return result;
	}, [
		source.type,
		source.value,
		selectedSort,
		appliedFilters
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container px-2.5 ms:px-5 mb-10",
		"data-source": isReorder ? "reorder" : void 0,
		children: [
			theme?.settings?.product_index_show_breadcrumbs !== false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyBreadcrumb, { page }),
			isBrand && brand2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
				width: 1200,
				height: 300,
				className: "w-full max-h-[300px] object-cover rounded-md bg-gray-100",
				src: brand2.banner || void 0,
				alt: brand2.name,
				priority: true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col md:flex-row items-center md:items-start text-center rtl:md:text-right ltr:md:text-left mt-2 mb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
					className: "rounded-md w-40 h-24 shadow-md p-4 bg-white shrink-0",
					objectFit: "contain",
					src: brand2.logo || void 0,
					alt: brand2.name,
					aspectRatio: "5/3"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 pt-3 rtl:text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-bold mb-1",
						children: brand2.name
					}), brand2.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base text-gray-500 font-medium",
						dangerouslySetInnerHTML: { __html: brand2.description }
					})]
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "product:list.start" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: showFilters ? "md:grid md:grid-cols-[288px_1fr] gap-8" : "",
				children: [showFilters && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaFilters, {
					id: "filters-menu",
					className: "hidden md:block lg:sticky lg:top-20",
					filters
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 sm:mb-6 flex justify-between items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-bold text-xl rtl:pl-3 ltr:pr-3",
								id: "page-main-title",
								children: isBrand ? t("common.titles.products") : page.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center space-x-2 rtl:space-x-reverse",
								children: [showFilters && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setFiltersOpen(true),
									className: "filters-trigger bg-border-color text-primary lg:hidden p-2 rounded",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-filter text-gray-text text-2xl" })
								}), sortOptionsWithTrans.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "hidden sm:block rtl:ml-3 ltr:mr-3 whitespace-nowrap",
										htmlFor: "product-sort",
										children: t("pages.categories.sorting", "Sort By")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										id: "product-sort",
										className: "form-input pt-0 pb-1 rtl:md:pl-10 ltr:md:pr-10",
										value: shownSort,
										onChange: handleSortChange,
										children: [shownSort === "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											disabled: true,
											hidden: true,
											children: t("pages.categories.sorting", "Sort By")
										}), sortOptionsWithTrans.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: option.id,
											children: option.name
										}, option.id))]
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "product:list.items.start" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `flex min-h-screen${filterStatus === "loading" ? " opacity-60" : ""}`,
							"aria-busy": filterStatus === "loading",
							children: filterStatus === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0 flex flex-col items-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyNoContent, {
									icon: "sicon-shopping-bag",
									message: t("common.errors.error_occurred", "Something went wrong")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "link--primary mt-4",
									onClick: retryFilters,
									children: t("common.elements.try_again", "Try again")
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemsList, {
								resetKey: `${listKey}-${selectedSort}${filteredKey}`,
								items: shownProducts,
								loader,
								mode: shownNext ? "infinite" : "static",
								pageUrl: location.pathname + location.searchStr,
								className: "s-products-list flex-1 min-w-0",
								itemsClassName: `s-products-list-wrapper s-products-list-vertical-cards${showFilters ? " s-products-list-with-filters" : ""}`,
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
									sizes: showFilters ? FILTERED_PRODUCT_IMAGE_SIZES : void 0
								}, prod.id))
							}, `${listKey}-${selectedSort}${filteredKey}`)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "product:list.items.end" })
					]
				})]
			}),
			showFilters && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer, {
				isOpen: filtersOpen,
				onClose: () => setFiltersOpen(false),
				size: "md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between items-center mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-bold text-lg",
							children: t("pages.categories.filters", "Filters")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setFiltersOpen(false),
							className: "btn--close-sm sicon-cancel text-gray-500"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaFilters, {
						id: "filters-menu-mobile",
						filters
					})]
				})
			}),
			source.type === "categories" && store?.settings?.category?.testimonial_enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyRenderWhenVisible, {
				placeholder: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewItemSkeleton, {}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyTestimonials, { data: {} })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "product:list.end" })
		]
	}, listKey);
}
var PRODUCTS_SOURCES = /* @__PURE__ */ new Set([
	"latest",
	"sales",
	"offers",
	"reorder"
]);
function head(ctx, data) {
	const entity = data.source.entity;
	const category2 = data.source.type === "categories" ? entity : void 0;
	const tag = data.source.type === "tags" ? entity : void 0;
	const productsPath = PRODUCTS_SOURCES.has(data.source.type) ? `/products?source=${data.source.type}` : void 0;
	const alternateLanguages = buildHreflangAlternates(ctx.settings, category2?.url ?? (tag?.url || productsPath || ctx.location.pathname));
	const canonical = category2?.url ?? (tag?.url || (productsPath ? storePageUrl(ctx.settings, `${ctx.location.pathname}?source=${data.source.type}`) : void 0));
	const title = category2?.name ?? tag?.name ?? data.page.title;
	const image = category2?.image ?? void 0;
	const storeName = ctx.settings?.store?.name;
	const pageTitle = category2 && storeName ? `${title} | ${storeName}` : title;
	return {
		title: pageTitle,
		appendStoreTitle: !category2,
		description: `Browse ${title}`,
		canonical,
		openGraph: {
			type: "website",
			title: pageTitle,
			description: `Browse ${title}`,
			images: image,
			url: canonical
		},
		twitter: {
			card: "summary_large_image",
			title: pageTitle,
			description: `Browse ${title}`,
			images: image
		},
		alternateLanguages
	};
}
function ProductListingPage(props) {
	const Page = registry.resolve(COMPONENT_KEYS.PRODUCT_LIST_PAGE) ?? ProductListPage;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Page, { ...props });
}
function ProductListingPending({ hideFilters }) {
	const Skeleton = registry.resolve(COMPONENT_KEYS.PRODUCT_LIST_SKELETON);
	return Skeleton ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { hideFilters }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, {});
}
var ProductListing = {
	id: RouteId.PRODUCT_INDEX,
	loader: productListLoader,
	head,
	Component: ProductListingPage,
	Pending: ProductListingPending
};
var listingSearch = {
	validateSearch: (search) => {
		const page = Number(search.page) || 1;
		const sort = search.sort ? String(search.sort) : void 0;
		return {
			...page > 1 ? { page } : {},
			...sort ? { sort } : {}
		};
	},
	loaderDeps: ({ search }) => ({
		page: search.page,
		sort: search.sort
	})
};
var searchListingSearch = {
	validateSearch: (search) => ({
		q: search.q == null ? "" : String(search.q),
		...listingSearch.validateSearch(search)
	}),
	loaderDeps: ({ search }) => ({
		q: search.q,
		page: search.page,
		sort: search.sort
	})
};
//#endregion
export { SallaFilters as a, useAppliedFilters as i, listingSearch as n, searchListingSearch as r, ProductListing as t };

//# sourceMappingURL=product-listing-4cWTBHKk.js.map