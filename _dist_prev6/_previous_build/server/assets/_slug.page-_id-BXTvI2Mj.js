import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { At as useComments, dn as LazyBreadcrumb, la as require_jsx_runtime, ua as require_react } from "./shared-home-CSJrMlCW.js";
import { t as SallaComments } from "./salla-comments-D2ao26d_.js";
import { I as BlockHookSlot, x as Route } from "./router-qkGTy9IO.js";
//#region app/components/page/PageSingle.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
/**
* Theme fork of the engine `PageSingle` (rendered by `app/routes/$slug.page-$id.tsx`).
*
* Adds the classic-storefront `information_page.information_page` app hook: on a
* `customised` page the whole body IS the app-injected block, so we render only
* the hook — exactly like `page-single.twig`. Every other page type keeps the
* engine's breadcrumb + article + comments layout.
*
* Upgrade notes: `FORKS.md`.
*/
function PageSingle({ page }) {
	const { commentsKey } = useComments();
	const cleanContent = (0, import_react.useMemo)(() => page.content ? page.content.replace(/&nbsp;/g, " ") : "", [page.content]);
	if (page.type === "customised") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockHookSlot, {
		name: "information_page.information_page",
		wrapper: "s-information-page",
		className: "!mt-0",
		scope: page.id != null ? { page_id: page.id } : void 0
	});
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
					page.id != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaComments, {
						itemId: Number(page.id),
						type: "page"
					}, commentsKey)
				]
			})
		})]
	}, page.slug);
}
//#endregion
//#region app/routes/$slug.page-$id.tsx?tsr-split=component
function PageSingleComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSingle, { ...data });
}
//#endregion
export { PageSingleComponent as component };

//# sourceMappingURL=_slug.page-_id-BXTvI2Mj.js.map