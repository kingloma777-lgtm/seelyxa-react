import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { Qn as QueryObserver, Zn as useBaseQuery, dn as LazyBreadcrumb, er as hasNextPage, la as require_jsx_runtime, mn as LazyNoContent, qn as useTranslation, sn as Link, tr as hasPreviousPage, ua as require_react, un as Image, wn as HookSlot } from "./shared-home-G5JNrgQH.js";
import { t as brand } from "./chunk-G3UTLR3D-BsMP91Yc.js";
import { n as useWindowScroll } from "./vendor-hooks-V4gqPzid.js";
//#region node_modules/.pnpm/@tanstack+query-core@5.102.8/node_modules/@tanstack/query-core/build/modern/infiniteQueryObserver.js
var InfiniteQueryObserver = class extends QueryObserver {
	constructor(client, options) {
		super(client, options);
	}
	bindMethods() {
		super.bindMethods();
		this.fetchNextPage = this.fetchNextPage.bind(this);
		this.fetchPreviousPage = this.fetchPreviousPage.bind(this);
	}
	setOptions(options) {
		options._type = "infinite";
		super.setOptions(options);
	}
	getOptimisticResult(options) {
		options._type = "infinite";
		return super.getOptimisticResult(options);
	}
	fetchNextPage(options) {
		return this.fetch({
			...options,
			meta: { fetchMore: { direction: "forward" } }
		});
	}
	fetchPreviousPage(options) {
		return this.fetch({
			...options,
			meta: { fetchMore: { direction: "backward" } }
		});
	}
	createResult(query, options) {
		const { state } = query;
		const parentResult = super.createResult(query, options);
		const { isFetching, isRefetching, isError, isRefetchError } = parentResult;
		const fetchDirection = state.fetchMeta?.fetchMore?.direction;
		const isFetchNextPageError = isError && fetchDirection === "forward";
		const isFetchingNextPage = isFetching && fetchDirection === "forward";
		const isFetchPreviousPageError = isError && fetchDirection === "backward";
		const isFetchingPreviousPage = isFetching && fetchDirection === "backward";
		return {
			...parentResult,
			fetchNextPage: this.fetchNextPage,
			fetchPreviousPage: this.fetchPreviousPage,
			hasNextPage: hasNextPage(options, state.data),
			hasPreviousPage: hasPreviousPage(options, state.data),
			isFetchNextPageError,
			isFetchingNextPage,
			isFetchPreviousPageError,
			isFetchingPreviousPage,
			isRefetchError: isRefetchError && !isFetchNextPageError && !isFetchPreviousPageError,
			isRefetching: isRefetching && !isFetchingNextPage && !isFetchingPreviousPage
		};
	}
};
//#endregion
//#region node_modules/.pnpm/@tanstack+react-query@5.102.8_react@19.2.8/node_modules/@tanstack/react-query/build/modern/useInfiniteQuery.js
function useInfiniteQuery(options, queryClient) {
	return useBaseQuery(options, InfiniteQueryObserver, queryClient);
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/BrandsPage-UNHLTVUG.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function byLetter(brands, locale) {
	const groups = {};
	for (const item of brands) (groups[(locale === "ar" ? item.ar_char : item.en_char) || "#"] ??= []).push(item);
	return Object.entries(groups).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
}
function BrandSection({ char, brands, sectionRef }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: `brand-section-${char}`,
		ref: sectionRef,
		className: "pt-24 first:pt-16 md:first:pt-24",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center mb-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"data-id": char,
				className: "brand-char",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "fix-align",
					children: char
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bg-border-color h-px flex-1" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 grid-flow-row gap-4 md:gap-8",
			children: brands.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: `/brands/${item.id}`,
				className: "brand-item",
				preload: false,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
					className: "max-h-full",
					objectFit: "contain",
					width: 400,
					height: 300,
					src: item.logo,
					alt: item.name
				})
			}, item.id))
		})]
	});
}
var PAGES_PER_WAVE = 6;
var fetchPage = (page) => brand.list(page).catch(() => brand.list(page));
async function fetchWave(from) {
	const pages = (await Promise.allSettled(Array.from({ length: PAGES_PER_WAVE }, (_, i) => fetchPage(from + i)))).flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
	return {
		items: pages.flatMap((result) => result.items),
		done: pages.length === 0 || pages.some((result) => !result.next)
	};
}
function useAllBrands(first, next, locale) {
	const startPage = Number(next?.match(/[?&]page=(\d+)/)?.[1]) || 0;
	const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
		queryKey: [
			"brands",
			"after-first-page",
			locale,
			startPage
		],
		queryFn: ({ pageParam }) => fetchWave(pageParam),
		initialPageParam: startPage,
		getNextPageParam: (wave, _waves, from) => wave.done ? void 0 : from + PAGES_PER_WAVE,
		enabled: startPage > 0,
		gcTime: 0
	});
	(0, import_react.useEffect)(() => {
		if (hasNextPage && !isFetchingNextPage) fetchNextPage();
	}, [
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage
	]);
	return (0, import_react.useMemo)(() => {
		const extra = data?.pages.flatMap((wave) => wave.items) ?? [];
		return extra.length ? [...first, ...extra] : first;
	}, [first, data]);
}
function BrandsPageComponent({ page, brands, pagination }) {
	const { t, locale } = useTranslation();
	const allBrands = useAllBrands(brands, pagination?.next, locale);
	const brandEntries = (0, import_react.useMemo)(() => byLetter(allBrands, locale), [allBrands, locale]);
	const [selectedChar, setSelectedChar] = (0, import_react.useState)(null);
	const sectionRefs = (0, import_react.useRef)({});
	const [{ y }] = useWindowScroll();
	const isSticky = (y ?? 0) > 200;
	const handleBrandClick = (0, import_react.useCallback)((e) => {
		e.preventDefault();
		const char = e.currentTarget.dataset.id;
		if (char) {
			setSelectedChar(char);
			sectionRefs.current[char]?.scrollIntoView({ behavior: "smooth" });
		}
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container mb-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyBreadcrumb, { page }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-between pt-2 pb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-bold mb-6 md:mb-0",
					children: page.title
				})
			}),
			brandEntries.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "brands-nav-wrap",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					id: "brands-nav",
					className: `brands-nav ${isSticky ? "is-sticky" : "is-not-sticky"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {}), brandEntries.map(([char]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: `brands-nav__item ${selectedChar === char ? "is-selected" : "unselected"}`,
						href: `#brand-section-${char}`,
						onClick: handleBrandClick,
						"data-id": char,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "fix-align",
							children: char
						})
					}) }, char))]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-8 xl:px-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "brands:index.items.start" }),
					brandEntries.map(([char, brandGroup]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandSection, {
						char,
						brands: brandGroup,
						sectionRef: (el) => {
							sectionRefs.current[char] = el;
						}
					}, char)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "brands:index.items.end" })
				]
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyNoContent, {
				icon: "sicon-award-ribbon",
				message: t("pages.brands.non_brands"),
				actionLabel: t("common.elements.back_home")
			})
		]
	});
}
var BrandsPage = (0, import_react.memo)(BrandsPageComponent);
//#endregion
export { BrandsPage };

//# sourceMappingURL=BrandsPage-UNHLTVUG-BkH95Itz.js.map