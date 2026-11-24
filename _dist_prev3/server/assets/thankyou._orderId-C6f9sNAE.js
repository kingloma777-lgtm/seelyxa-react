import { la as require_jsx_runtime } from "./shared-home-CR99BuTM.js";
import { l as Route, u as ThankYou } from "./router-26TzvfmH.js";
//#region app/routes/thankyou.$orderId.tsx?tsr-split=component
/**
* ThankYou route configuration.
* Loads page data via loader and renders the ThankYou component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* ThankYou page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function ThankYouComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThankYou.Component, { ...data });
}
//#endregion
export { ThankYouComponent as component };

//# sourceMappingURL=thankyou._orderId-C6f9sNAE.js.map