import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { $t as useDevHomeBlocks, Bn as Pulse, Cn as HookSlot, Ji as RouteId, ca as require_jsx_runtime, la as require_react, nn as storePageUrl, tn as buildHreflangAlternates, zi as getTwilightContext } from "./shared-home-CDptNpzP.js";
import { n as HomeComponentRenderer, o as ReorderProducts, u as home } from "./chunk-L55G7FJZ-DZwSLY6g.js";
import { n as reorder, r as useLiveBlockMoves } from "./chunk-IXHM24Z4-BL3m6gSv.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-VSP3INDK.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
async function homeLoader(ctx) {
	const { queryClient } = getTwilightContext();
	const components = await queryClient.ensureQueryData(home.queries.components());
	return {
		locale: ctx?.locale || "ar",
		components: components.map((comp) => ({
			...comp,
			path: comp.path?.replace("home.", "") || comp.path
		})),
		page: { slug: RouteId.INDEX }
	};
}
var HomeSkeleton = (0, import_react.memo)(function HomeSkeleton2() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "s-block container skeleton-block-hero",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pulse, { className: "h-64 sm:h-80 rounded-md" })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "s-block container skeleton-block-products",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pulse, { className: "h-10 w-48 mb-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 sm:grid-cols-4 gap-4",
				children: [
					1,
					2,
					3,
					4
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pulse, { className: "h-56" }, i))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "s-block container skeleton-block-products",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pulse, { className: "h-10 w-48 mb-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 sm:grid-cols-4 gap-4",
				children: [
					1,
					2,
					3,
					4
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pulse, { className: "h-56" }, i))
			})]
		})
	] });
});
var storeOrder = (blocks) => Array.from(blocks, (_, at) => at);
var HomePage = (0, import_react.memo)(function HomePage2({ components = [] }) {
	const renderedComponents = useDevHomeBlocks(components);
	const [moved, setMoved] = (0, import_react.useState)(null);
	const order = moved?.source === renderedComponents ? moved.order : null;
	const onMove = (0, import_react.useCallback)((from, to) => setMoved((prev) => ({
		source: renderedComponents,
		order: reorder(prev?.source === renderedComponents ? prev.order : storeOrder(renderedComponents), from, to)
	})), [renderedComponents]);
	useLiveBlockMoves(onMove);
	const placed = order ?? storeOrder(renderedComponents);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "home:start" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "home:content" }),
		placed.map((at, index) => {
			const data = renderedComponents[at];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeComponentRenderer, {
				data,
				index
			}, data.__dev_id ?? at);
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "home:end" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReorderProducts, {})
	] });
});
function loader(_ctx) {
	return homeLoader({ locale: _ctx?.locale });
}
function head(ctx) {
	const store = ctx.settings?.store;
	if (!store) return {};
	const title = store.meta?.title ?? store.name;
	const description = store.meta?.description ?? store.description;
	const keywords = store.meta?.keywords;
	const url = storePageUrl(ctx.settings, ctx.location.pathname) ?? store.url;
	return {
		title,
		description,
		keywords,
		canonical: url,
		openGraph: {
			type: "website",
			title,
			description,
			images: store.logo,
			url
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: store.logo
		},
		alternateLanguages: buildHreflangAlternates(ctx.settings, ctx.location.pathname)
	};
}
var Home = {
	id: RouteId.INDEX,
	loader,
	head,
	Component: HomePage
};
//#endregion
export { HomeSkeleton as n, Home as t };

//# sourceMappingURL=skeleton-q5yJRWWp.js.map