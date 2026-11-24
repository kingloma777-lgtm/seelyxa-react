import { ca as require_jsx_runtime } from "./shared-home-CDptNpzP.js";
import { n as Profile } from "./account-w4gQQWqS.js";
import { g as Route } from "./router-BsPD0JMV.js";
//#region app/routes/account.profile.tsx?tsr-split=component
/**
* Profile route configuration.
* Loads page data via loader and renders the Profile component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* Profile page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function ProfileComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Profile.Component, { ...data });
}
//#endregion
export { ProfileComponent as component };

//# sourceMappingURL=account.profile-CLl-S4OW.js.map