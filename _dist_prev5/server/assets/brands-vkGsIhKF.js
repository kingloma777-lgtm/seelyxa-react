import { la as require_jsx_runtime } from "./shared-home-CSJrMlCW.js";
import { A as Route, j as Brands } from "./router-DEPH1lf3.js";
//#region app/routes/brands.tsx?tsr-split=component
/**
* Brands route configuration.
* Loads page data via loader and renders the Brands component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* Brands page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function BrandsComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brands.Component, { ...data });
}
//#endregion
export { BrandsComponent as component };

//# sourceMappingURL=brands-vkGsIhKF.js.map