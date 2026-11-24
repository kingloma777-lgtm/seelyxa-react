import { la as require_jsx_runtime } from "./shared-home-CSJrMlCW.js";
import { t as ProductListing } from "./product-listing-VIkBm3AJ.js";
import { S as Route } from "./router-DEPH1lf3.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/.twilight/$slug.c$id.tsx?tsr-split=component
/**
* ProductListing route configuration.
* Loads page data via loader and renders the ProductListing component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* ProductListing page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function ProductListingComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductListing.Component, { ...data });
}
//#endregion
export { ProductListingComponent as component };

//# sourceMappingURL=_slug.c_id-SJcFpT7s.js.map