import { At as useComments, Ft as useDate, Ot as useAsset, St as useBlogLike, dn as LazyBreadcrumb, la as require_jsx_runtime, qn as useTranslation, sn as Link, un as Image, wn as HookSlot, zr as useTwilight } from "./shared-home-CSJrMlCW.js";
import { t as SallaComments } from "./salla-comments-D2ao26d_.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/BlogSinglePage-SF575W74.js
var import_jsx_runtime = require_jsx_runtime();
function BlogSinglePage({ page, article, related = [] }) {
	const { t } = useTranslation();
	const { store } = useTwilight();
	const { cdn } = useAsset();
	const { format: formatDate } = useDate();
	const { active, count, toggle, loading } = useBlogLike(Number(article.id) || 0, article.stats?.likes ?? 0);
	const { commentsKey } = useComments();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container mb-8 sm:mb-24",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyBreadcrumb, { page }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "md:flex items-start",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "main-content blog-category md:w-96 flex-1 bg-white lg:p-8 rounded-md mb-10 md:mb-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "blog:single.start" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-bold text-3xl mb-5 leading-10",
						children: article.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-10 text-gray-500 rounded-md inline-flex text-sm rtl:space-x-reverse space-x-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-calendar-date rtl:ml-1 ltr:mr-1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDate(article.created_at) })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: article.author?.url || "#",
							className: "flex items-center hover:text-dark",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-user rtl:ml-1 ltr:mr-1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: article.author?.name })]
						})]
					}),
					article.image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
						src: article.image,
						alt: article.name,
						className: "h-80 mb-10 w-full rounded-md",
						aspectRatio: "16/9",
						priority: true,
						noWrapper: true
					}),
					store.settings?.blog?.allow_likes_and_comments && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5 text-gray-500 text-base mb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							id: "blog-like",
							"data-blog-id": article.id,
							className: `flex items-center gap-1 transition-colors ${active ? "text-primary font-semibold liked" : ""}`,
							onClick: toggle,
							disabled: loading,
							children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "loader loader--small" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: `sicon-thumbs-up ${active ? "text-primary" : ""}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: count })]
						}), (article.stats?.comments ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-chat text-primary" }), article.stats?.comments]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
						className: "leading-7 text-sm mb-10",
						dangerouslySetInnerHTML: { __html: article.description?.replace(/&nbsp;/g, " ") || "" }
					}),
					article.tags && article.tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-4 flex flex-wrap items-center border-t border-gray-200",
						children: article.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: tag.url,
							className: "py-2 px-4 rounded-large inline-flex items-center text-gray-500 hover:text-dark justify-center text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "font-medium sicon-tag rtl:ml-1.5 ltr:mr-1.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "fix-align whitespace-nowrap",
								children: tag.name
							})]
						}, tag.id))
					}),
					store.settings?.blog?.allow_likes_and_comments && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaComments, {
						itemId: Number(article.id) || 0,
						type: "blog"
					}, commentsKey),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "blog:single.end" })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				"aria-label": "Sidebar",
				className: "sticky shrink-0 top-24 md:w-96 rtl:lg:mr-8 ltr:lg:ml-8 pb-11",
				children: related.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-bold mb-3",
						children: t("pages.blog_articles.related")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "blog:single.related.start" }),
					related.map((relatedArticle) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex items-center bg-white p-5 rounded-md",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: relatedArticle.url,
								className: "bg-border-color h-24 w-24 rounded-md overflow-hidden flex items-center justify-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sr-only",
									children: relatedArticle.name
								}), relatedArticle.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
									className: "h-full w-full object-cover",
									src: relatedArticle.image,
									alt: relatedArticle.name,
									aspectRatio: "1/1"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
									className: "sm:h-full w-10 object-contain opacity-60",
									src: cdn("/images/placeholder.png"),
									alt: "post image"
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rtl:mr-3 ltr:ml-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center text-sm text-gray-500 mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-calendar-date rtl:ml-1 ltr:mr-1 rtl:pl-px ltr:pr-px" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", { children: formatDate(relatedArticle.created_at) })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-bold text-gray-800 leading-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: relatedArticle.url,
									className: "hover:underline",
									children: relatedArticle.name
								})
							})]
						})]
					}, relatedArticle.id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "blog:single.related.end" })
				] })
			})]
		})]
	}, article.id);
}
//#endregion
export { BlogSinglePage };

//# sourceMappingURL=BlogSinglePage-SF575W74-Dp6zunyl.js.map