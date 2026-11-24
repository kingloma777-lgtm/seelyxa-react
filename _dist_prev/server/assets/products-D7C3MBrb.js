import { ca as require_jsx_runtime } from "./shared-home-CDptNpzP.js";
import { t as ProductListing } from "./product-listing-4cWTBHKk.js";
import { E as Route } from "./router-BsPD0JMV.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/.twilight/products.tsx?tsr-split=component
/**
* Products route configuration: `?source=` picks the list, the latest products by default.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* Products page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function ProductListingComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductListing.Component, { ...data });
}
//#endregion
export { ProductListingComponent as component };

//# sourceMappingURL=products-D7C3MBrb.js.map