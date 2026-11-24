import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { Kn as useTranslation, ca as require_jsx_runtime, kt as useComments, la as require_react, un as LazyBreadcrumb } from "./shared-home-CDptNpzP.js";
import { t as SallaComments } from "./salla-comments-BYSbzrD4.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/TestimonialsPage-4Y55RF5P.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var buildSortOptions = (t) => [
	{
		id: "latest",
		label: t("pages.testimonials.sort_by_date_desc", "Latest")
	},
	{
		id: "oldest",
		label: t("pages.testimonials.sort_by_date_asc", "Oldest")
	},
	{
		id: "top_rating",
		label: t("pages.testimonials.sort_by_rating_desc", "Top rated")
	},
	{
		id: "bottom_rating",
		label: t("pages.testimonials.sort_by_rating_asc", "Low rated")
	}
];
function TestimonialsPage({ page }) {
	const { t } = useTranslation();
	const { commentsKey } = useComments();
	const [selectedSort, setSelectedSort] = (0, import_react.useState)(() => {
		return new URLSearchParams(window.location.search).get("sort") || "latest";
	});
	(0, import_react.useEffect)(() => {
		const url = new URL(window.location.href);
		url.searchParams.set("sort", selectedSort);
		window.history.replaceState(null, "", url.toString());
	}, [selectedSort]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyBreadcrumb, { page }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full lg:w-10/12 bg-white rounded p-6 lg:p-8 mt-4 lg:mt-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 sm:mb-6 flex justify-between items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-bold text-2xl",
						children: page.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "hidden sm:block rtl:ml-3 ltr:mr-3 whitespace-nowrap",
							htmlFor: "testimonials-filter",
							children: t("pages.categories.sorting", "Sort by")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							id: "testimonials-filter",
							className: "form-input pt-0 pb-1 rtl:pl-10 ltr:pr-10 bg-white text-gray-900",
							value: selectedSort,
							onChange: (e) => setSelectedSort(e.target.value),
							children: buildSortOptions(t).map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: opt.id,
								children: opt.label
							}, opt.id))
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaComments, {
					testimonials: true,
					itemId: void 0,
					sort: selectedSort
				}, `${selectedSort}-${commentsKey}`)]
			})
		})]
	});
}
//#endregion
export { TestimonialsPage };

//# sourceMappingURL=TestimonialsPage-4Y55RF5P-z3YXJXhS.js.map