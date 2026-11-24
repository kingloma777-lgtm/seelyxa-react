import { ca as require_jsx_runtime } from "./shared-home-CDptNpzP.js";
import { n as Orders } from "./chunk-HIGI3M7E-DoseKaRF.js";
import "./orders-11s2SCFn.js";
import { _ as Route } from "./router-BsPD0JMV.js";
//#region app/routes/account.orders.tsx?tsr-split=component
/**
* Orders route configuration.
* Loads page data via loader and renders the Orders component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* Orders page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function OrdersComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Orders.Component, { ...data });
}
//#endregion
export { OrdersComponent as component };

//# sourceMappingURL=account.orders-BoRbLCjq.js.map