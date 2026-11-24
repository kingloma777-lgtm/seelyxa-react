import { Ft as useDate, la as require_jsx_runtime, qn as useTranslation, sn as Link, un as Image } from "./shared-home-CSJrMlCW.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-7ED3XSYN.js
var import_jsx_runtime = require_jsx_runtime();
function BlogCategoriesSidebar({ categories }) {
	const { t } = useTranslation();
	if (!categories.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		"aria-label": "Sidebar",
		className: "hidden lg:block lg:sticky shrink-0 top-24 col-span-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-bold mb-3",
			children: t("pages.blog_categories.categories")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: categories.map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			className: category.is_current ? "text-primary" : "",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				className: "py-3 block text-sm hover:text-primary",
				to: category.url,
				children: category.name
			})
		}, category.id)) })]
	});
}
function BlogArticleCard({ article, showAuthor = false }) {
	const { format: formatDate } = useDate();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "list-block post-entry relative h-full transition-shadow duration-500 bg-white hover:shadow-default rounded-lg justify-around overflow-hidden flex flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: article.url,
			className: "post-entry__image relative overflow-hidden hover:opacity-90 w-full h-56 bg-border-color flex items-center justify-center",
			children: article.image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
				className: "h-full w-full object-cover",
				src: article.image,
				alt: article.name,
				aspectRatio: "16/9"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 px-5 pt-5 pb-7",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2.5 text-gray-500 rounded-md inline-flex text-sm rtl:space-x-reverse space-x-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-calendar-date rtl:ml-1 ltr:mr-1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDate(article.created_at) })]
					}), showAuthor && article.author && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: article.author.url,
						className: "flex items-center hover:text-dark",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-user rtl:ml-1 ltr:mr-1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: article.author.name })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "post-entry__title text-sm font-bold text-gray-800 leading-6 mb-2.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: article.url,
						children: article.name
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-gray-500 leading-6 mb-2.5",
					children: article.description
				})
			]
		})]
	});
}
function BlogListLayout({ categories, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-1 lg:grid-cols-8 gap-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlogCategoriesSidebar, { categories }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "main-content lg:col-span-6",
			children
		})]
	});
}
//#endregion
export { BlogListLayout as n, BlogArticleCard as t };

//# sourceMappingURL=chunk-7ED3XSYN-BqxlKauE.js.map