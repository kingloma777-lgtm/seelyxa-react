import { ma as require_jsx_runtime } from "./shared-home-CcULkdy1.js";
import { t as Notifications } from "./account-BNmXfDoU.js";
import { v as Route } from "./router-oL-b_T_3.js";
//#region app/routes/account.notifications.tsx?tsr-split=component
/**
* Notifications route configuration.
* Loads page data via loader and renders the Notifications component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* Notifications page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function NotificationsComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notifications.Component, { ...data });
}
//#endregion
export { NotificationsComponent as component };

//# sourceMappingURL=account.notifications-B15_W4Ag.js.map