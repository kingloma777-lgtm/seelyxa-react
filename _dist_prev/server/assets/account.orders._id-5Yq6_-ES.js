import { ca as require_jsx_runtime } from "./shared-home-CDptNpzP.js";
import { t as OrderSingle } from "./chunk-HIGI3M7E-DoseKaRF.js";
import "./orders-11s2SCFn.js";
import { c as Route } from "./router-BsPD0JMV.js";
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

//# sourceMappingURL=account.orders._id-5Yq6_-ES.js.map