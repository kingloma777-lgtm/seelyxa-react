import { ma as require_jsx_runtime } from "./shared-home-CcULkdy1.js";
import { t as Loyalty } from "./loyalty-BSp9KwJn.js";
import { O as Route } from "./router-oL-b_T_3.js";
//#region app/routes/loyalty.tsx?tsr-split=component
/**
* Loyalty route configuration.
* Loads page data via loader and renders the Loyalty component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* Loyalty page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function LoyaltyComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loyalty.Component, { ...data });
}
//#endregion
export { LoyaltyComponent as component };

//# sourceMappingURL=loyalty-DU769Xfe.js.map