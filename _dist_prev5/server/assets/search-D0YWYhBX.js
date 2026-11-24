import { la as require_jsx_runtime } from "./shared-home-CSJrMlCW.js";
import { t as ProductListing } from "./product-listing-VIkBm3AJ.js";
import { w as Route } from "./router-DEPH1lf3.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/.twilight/search.tsx?tsr-split=component
/**
* Search route configuration: `searchListingSearch` keeps ?q=, ?page= and ?sort=
* and forwards them to the loader.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* Search page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function ProductListingComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductListing.Component, { ...data });
}
//#endregion
export { ProductListingComponent as component };

//# sourceMappingURL=search-D0YWYhBX.js.map