import { la as require_jsx_runtime } from "./shared-home-CSJrMlCW.js";
import { t as OrderSingle } from "./chunk-HIGI3M7E-T9hMxwiP.js";
import "./orders-K32X_CJa.js";
import { c as Route } from "./router-DEPH1lf3.js";
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

//# sourceMappingURL=account.orders._id-CyiAV17K.js.map