import { la as require_jsx_runtime } from "./shared-home-CSJrMlCW.js";
import { t as Home } from "./skeleton-D2_Jz-eM.js";
import { N as Route } from "./router-DEPH1lf3.js";
//#region app/routes/index.tsx?tsr-split=component
/**
* Home (index) route configuration.
* Loads page data via loader and renders the Home component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* Home page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function HomeComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Home.Component, { ...data });
}
//#endregion
export { HomeComponent as component };

//# sourceMappingURL=routes-DrGlyOKZ.js.map