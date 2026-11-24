import { la as require_jsx_runtime } from "./shared-home-CR99BuTM.js";
import { r as Settings } from "./account-DIIj3NFN.js";
import { h as Route } from "./router-3jrsUTEg.js";
//#region app/routes/account.settings.tsx?tsr-split=component
/**
* Settings route configuration.
* Loads page data via loader and renders the Settings component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* Settings page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function SettingsComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings.Component, { ...data });
}
//#endregion
export { SettingsComponent as component };

//# sourceMappingURL=account.settings-DWUruWxY.js.map