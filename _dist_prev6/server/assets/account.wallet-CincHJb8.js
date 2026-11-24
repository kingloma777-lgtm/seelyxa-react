import { ma as require_jsx_runtime } from "./shared-home-CcULkdy1.js";
import { i as Wallet } from "./account-BNmXfDoU.js";
import { m as Route } from "./router-oL-b_T_3.js";
//#region app/routes/account.wallet.tsx?tsr-split=component
/**
* Wallet route configuration.
* Loads page data via loader and renders the Wallet component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* Wallet page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function WalletComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet.Component, { ...data });
}
//#endregion
export { WalletComponent as component };

//# sourceMappingURL=account.wallet-CincHJb8.js.map