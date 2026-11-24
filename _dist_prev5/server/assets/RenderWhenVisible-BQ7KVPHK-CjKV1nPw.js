import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { la as require_jsx_runtime, ua as require_react } from "./shared-home-CSJrMlCW.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/RenderWhenVisible-BQ7KVPHK.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function DefaultSkeleton({ height }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: { minHeight: height },
		className: "animate-pulse rounded bg-gray-100"
	});
}
function MarkMounted({ onMount }) {
	(0, import_react.useEffect)(() => onMount(true), [onMount]);
	return null;
}
var RenderWhenVisible = (0, import_react.memo)(function RenderWhenVisible2({ children, rootMargin = "50px", placeholder, className, id, estimatedHeight = "400px", renderOnMount = false, blockIndex, liveBlockId }) {
	const ref = (0, import_react.useRef)(null);
	const [visible, setVisible] = (0, import_react.useState)(renderOnMount);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	if (renderOnMount && !visible) setVisible(true);
	(0, import_react.useEffect)(() => {
		if (visible) return;
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver((entries) => {
			if (entries.some((entry) => entry.isIntersecting)) {
				setVisible(true);
				observer.disconnect();
			}
		}, { rootMargin });
		observer.observe(el);
		return () => observer.disconnect();
	}, [visible, rootMargin]);
	const fallback = placeholder ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DefaultSkeleton, { height: estimatedHeight });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		ref: !visible ? ref : void 0,
		className,
		id,
		"data-home-block": blockIndex,
		"data-live-block": liveBlockId,
		style: { minHeight: mounted ? void 0 : estimatedHeight },
		children: visible ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Suspense, {
			fallback,
			children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkMounted, { onMount: setMounted })]
		}) : fallback
	});
});
//#endregion
export { RenderWhenVisible };

//# sourceMappingURL=RenderWhenVisible-BQ7KVPHK-CjKV1nPw.js.map