import { la as require_jsx_runtime, sn as Link } from "./shared-home-CR99BuTM.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/NoContent-63TMCPGY.js
var import_jsx_runtime = require_jsx_runtime();
function NoContent({ icon = "sicon-shopping-bag", message, actionLabel, actionUrl = "/" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "no-content-placeholder",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: `${icon} icon` }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: message }),
			actionLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: actionUrl,
				className: "btn btn--outline-primary btn--rounded-full",
				children: actionLabel
			})
		]
	});
}
//#endregion
export { NoContent };

//# sourceMappingURL=NoContent-63TMCPGY-1Na4w1JA.js.map