import { ca as require_jsx_runtime } from "./shared-home-CDptNpzP.js";
import { n as LoyaltyPoints } from "./loyalty-Dr3U9jRn.js";
import { D as Route } from "./router-BsPD0JMV.js";
//#region app/routes/loyalty_points.tsx?tsr-split=component
/**
* LoyaltyPoints route configuration.
* Loads page data via loader and renders the LoyaltyPoints component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* LoyaltyPoints page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function LoyaltyPointsComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoyaltyPoints.Component, { ...data });
}
//#endregion
export { LoyaltyPointsComponent as component };

//# sourceMappingURL=loyalty_points-DUdZvUro.js.map