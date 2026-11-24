import { ma as require_jsx_runtime } from "./shared-home-CcULkdy1.js";
import { a as Wishlist } from "./account-BNmXfDoU.js";
import { p as Route } from "./router-oL-b_T_3.js";
//#region app/routes/account.wishlist.tsx?tsr-split=component
/**
* Wishlist route configuration.
* Loads page data via loader and renders the Wishlist component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* Wishlist page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function WishlistComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wishlist.Component, { ...data });
}
//#endregion
export { WishlistComponent as component };

//# sourceMappingURL=account.wishlist-CmqUio8I.js.map