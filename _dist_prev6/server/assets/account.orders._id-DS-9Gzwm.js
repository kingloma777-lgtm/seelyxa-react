import { ma as require_jsx_runtime } from "./shared-home-CcULkdy1.js";
import { t as OrderSingle } from "./chunk-HIGI3M7E-DznjVjua.js";
import "./orders-CLR1tuRn.js";
import { c as Route } from "./router-oL-b_T_3.js";
//#region app/routes/account.orders.$id.tsx?tsr-split=component
/**
* OrderSingle route configuration.
* Loads page data via loader and renders the OrderSingle component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* OrderSingle page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function OrderSingleComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderSingle.Component, { ...data });
}
//#endregion
export { OrderSingleComponent as component };

//# sourceMappingURL=account.orders._id-DS-9Gzwm.js.map