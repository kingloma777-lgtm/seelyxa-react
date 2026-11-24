import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { Nt as useBreadcrumbs, Rr as useTwilight, ca as require_jsx_runtime, la as require_react, on as Link } from "./shared-home-CDptNpzP.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/Breadcrumb-VFMPAWSR.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var MAX_VISIBLE_ITEMS = 4;
var ChevronIcon = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	version: "1.1",
	xmlns: "http://www.w3.org/2000/svg",
	width: "32",
	height: "32",
	viewBox: "0 0 32 32",
	"aria-hidden": "true",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: "keyboard_arrow_left" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M20.563 22.104l-1.875 1.875-8-8 8-8 1.875 1.875-6.125 6.125z" })]
});
function truncateItems(items) {
	if (items.length <= MAX_VISIBLE_ITEMS) return items;
	return [
		items[0],
		{
			name: "…",
			url: ""
		},
		...items.slice(-2)
	];
}
var BreadcrumbTrail = (0, import_react.memo)(function BreadcrumbTrail2({ items, className }) {
	const [expanded, setExpanded] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setExpanded(false);
	}, [items]);
	if (items.length === 0) return null;
	const displayItems = expanded ? items : truncateItems(items);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: className ?? "breadcrumbs w-full py-5",
		"aria-label": "Breadcrumb",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "s-breadcrumb-wrapper",
			itemScope: true,
			itemType: "https://schema.org/BreadcrumbList",
			children: displayItems.map((item, index) => {
				const isLast = index === displayItems.length - 1;
				const isEllipsis = item.name === "…" && !item.url;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: ["s-breadcrumb-item", isEllipsis ? "cursor-pointer select-none" : ""].join(" "),
					"aria-current": isLast ? "page" : void 0,
					itemProp: "itemListElement",
					itemScope: true,
					itemType: "https://schema.org/ListItem",
					children: [isEllipsis ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setExpanded(true);
						},
						className: "inline-flex items-center gap-1 hover:underline",
						"aria-label": "Show all breadcrumbs",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							className: "text-xs",
							children: "•••"
						})
					}) : isLast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						itemProp: "name",
						children: item.name
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.url,
							itemProp: "item",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								itemProp: "name",
								children: item.name
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							className: "s-breadcrumb-arrow inline-flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronIcon, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
							itemProp: "position",
							content: String(index + 1)
						})
					] }), isLast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
						itemProp: "position",
						content: String(index + 1)
					})]
				}, `${item.url}-${item.name}`);
			})
		})
	});
});
function toAbsoluteUrl(origin, path) {
	if (path.startsWith("http")) return path;
	return origin + path;
}
function BreadcrumbJsonLd({ items, origin }) {
	if (items.length === 0) return null;
	const schema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => {
			const isLast = index === items.length - 1;
			const url = toAbsoluteUrl(origin, item.url);
			return {
				"@type": "ListItem",
				position: index + 1,
				name: item.name,
				...isLast ? { "@id": url } : { item: url }
			};
		})
	};
	const html = JSON.stringify(schema);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
		type: "application/ld+json",
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: html }
	});
}
function Breadcrumb({ page, className }) {
	const { theme, store } = useTwilight();
	const breadcrumbsEnabled = theme.settings.is_breadcrumbs_enabled ?? true;
	const origin = store.url;
	const items = useBreadcrumbs(page);
	if (!breadcrumbsEnabled) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreadcrumbTrail, {
		items,
		className
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreadcrumbJsonLd, {
		items,
		origin
	})] });
}
//#endregion
export { Breadcrumb };

//# sourceMappingURL=Breadcrumb-VFMPAWSR-D4BwMxyk.js.map