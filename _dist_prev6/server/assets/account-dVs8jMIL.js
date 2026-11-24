import { ma as require_jsx_runtime } from "./shared-home-CcULkdy1.js";
import { _ as useMatches, v as Outlet } from "./vendor-router-DsN9e2Ev.js";
import { t as LazyCustomerLayout } from "./chunk-XQLAAPWR-DlDUbvpC.js";
import "./router-oL-b_T_3.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/.twilight/account.tsx?tsr-split=component
var import_jsx_runtime = require_jsx_runtime();
function AccountLayoutComponent() {
	const page = useMatches().reduceRight((found, m) => found ?? (m.loaderData?.page ? m.loaderData.page : null), null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyCustomerLayout, {
		page,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	});
}
//#endregion
export { AccountLayoutComponent as component };

//# sourceMappingURL=account-dVs8jMIL.js.map