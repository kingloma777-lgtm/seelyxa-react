import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { Er as defaultNavigate, cn as LinkProvider, la as require_jsx_runtime, ua as require_react, xr as NavigationProvider } from "./shared-home-CSJrMlCW.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-HTGBIA7K.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var NextJsLinkAdapter = (0, import_react.forwardRef)(({ to, href, children, className, style, title, target, rel, onClick, preload: _, replace, "aria-label": ariaLabel, ...rest }, ref) => {
	const destination = to ?? href ?? "/";
	const handleClick = (e) => {
		if (replace && typeof window !== "undefined") {
			e.preventDefault();
			window.history.replaceState(null, "", destination);
			window.dispatchEvent(new PopStateEvent("popstate"));
		}
		onClick?.(e);
	};
	return (0, import_react.createElement)("a", {
		ref,
		href: destination,
		className,
		style,
		title,
		target,
		rel,
		onClick: handleClick,
		"aria-label": ariaLabel,
		...rest,
		children
	});
});
NextJsLinkAdapter.displayName = "NextJsLinkAdapter";
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/navigation-FTU3OC4V.js
var import_jsx_runtime = require_jsx_runtime();
function NavigationSetup({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationProvider, {
		navigate: defaultNavigate,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkProvider, {
			adapter: NextJsLinkAdapter,
			children
		})
	});
}
//#endregion
export { NavigationSetup };

//# sourceMappingURL=navigation-FTU3OC4V-C88oO_VF.js.map