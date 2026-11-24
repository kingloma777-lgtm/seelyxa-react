import { ca as require_jsx_runtime } from "./shared-home-CDptNpzP.js";
import { i as Wallet } from "./account-w4gQQWqS.js";
import { m as Route } from "./router-BsPD0JMV.js";
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

//# sourceMappingURL=account.wallet-Bj6hutbO.js.map