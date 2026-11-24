import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { ca as require_jsx_runtime, kt as useComments, la as require_react, un as LazyBreadcrumb } from "./shared-home-CDptNpzP.js";
import { t as SallaComments } from "./salla-comments-BYSbzrD4.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/PageSingle-5TPYMYII.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function PageSingle({ page }) {
	const { commentsKey } = useComments();
	const cleanContent = (0, import_react.useMemo)(() => {
		if (!page.content) return "";
		return page.content.replace(/&nbsp;/g, " ");
	}, [page.content]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyBreadcrumb, { page }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "content content--single-page w-full lg:w-10/12 bg-white rounded p-6 lg:p-8 mt-4 lg:mt-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-bold text-2xl mb-6",
						children: page.title
					}),
					cleanContent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "content-entry",
						dangerouslySetInnerHTML: { __html: cleanContent }
					}),
					page.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaComments, {
						itemId: Number(page.id),
						type: "page"
					}, commentsKey)
				]
			})
		})]
	}, page.slug);
}
//#endregion
export { PageSingle };

//# sourceMappingURL=PageSingle-5TPYMYII-CdkjOO7N.js.map