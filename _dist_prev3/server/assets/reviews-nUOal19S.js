import { la as require_jsx_runtime } from "./shared-home-CR99BuTM.js";
import { t as Reviews } from "./testimonials-D8HJ4ZoY.js";
import { T as Route } from "./router-26TzvfmH.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/.twilight/reviews.tsx?tsr-split=component
/**
* Reviews route configuration.
* Loads page data via loader and renders the Reviews component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* Reviews page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function ReviewsComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reviews.Component, { ...data });
}
//#endregion
export { ReviewsComponent as component };

//# sourceMappingURL=reviews-nUOal19S.js.map