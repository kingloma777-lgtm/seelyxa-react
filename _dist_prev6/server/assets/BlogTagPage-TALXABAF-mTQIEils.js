import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { Qn as useTranslation, Vr as useLocation, gn as LazyBreadcrumb, ha as require_react, kn as HookSlot, ma as require_jsx_runtime, yn as LazyNoContent } from "./shared-home-CcULkdy1.js";
import { t as ItemsList } from "./ItemsList-MgXfLD3w.js";
import { t as blog } from "./chunk-B3DGM7TM-BcEVTK2j.js";
import { n as BlogListLayout, t as BlogArticleCard } from "./chunk-7ED3XSYN-DBQVIUGc.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/BlogTagPage-TALXABAF.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var EMPTY_CATEGORIES = [];
var EMPTY_ARTICLES = [];
function BlogTagPage({ page, blogTag, categories = EMPTY_CATEGORIES, articles = EMPTY_ARTICLES, cursor }) {
	const { t } = useTranslation();
	const { pathname, searchStr } = useLocation();
	const nextCursorRef = (0, import_react.useRef)(cursor?.next ?? null);
	const loader = (0, import_react.useCallback)(async () => {
		const nextUrl = nextCursorRef.current;
		const cursorMatch = nextUrl?.match(/[?&]cursor=([^&]+)/);
		const cursorValue = cursorMatch ? decodeURIComponent(cursorMatch[1]) : nextUrl ?? void 0;
		const result = await blog.articles.list({
			tag: String(blogTag.id),
			cursor: cursorValue
		});
		nextCursorRef.current = result.cursor?.next ?? null;
		return {
			items: result.data,
			next: result.cursor?.next ?? null
		};
	}, [blogTag.id]);
	if (articles.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container mb-8 sm:mb-24",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyBreadcrumb, { page }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BlogListLayout, {
			categories,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "blog:tag.start" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyNoContent, {
					icon: "sicon-inbox",
					message: t("pages.blog_categories.no_articles")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "blog:tag.end" })
			]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container mb-8 sm:mb-24",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyBreadcrumb, { page }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BlogListLayout, {
			categories,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "blog:tag.start" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-bold text-xl",
						children: blogTag.name
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemsList, {
					items: articles,
					loader: cursor?.next ? loader : void 0,
					mode: cursor?.next ? "infinite" : "static",
					pageUrl: pathname + searchStr,
					className: "s-blog-list",
					itemsClassName: "grid md:grid-cols-2 gap-2.5 md:gap-8",
					empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyNoContent, {
						icon: "sicon-inbox",
						message: t("pages.blog_categories.no_articles")
					}),
					t: (key, fallback) => t(key, fallback || key),
					children: (items) => items.map((article) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlogArticleCard, {
						article,
						showAuthor: true
					}, article.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "blog:tag.end" })
			]
		})]
	});
}
//#endregion
export { BlogTagPage };

//# sourceMappingURL=BlogTagPage-TALXABAF-mTQIEils.js.map