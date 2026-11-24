import { la as require_jsx_runtime } from "./shared-home-CSJrMlCW.js";
import { n as BlogAuthorRoute } from "./blog-D812Md-j.js";
import { i as Route } from "./router-Dne9SQHr.js";
//#region app/routes/blog_.author.$id.tsx?tsr-split=component
/**
* BlogAuthorRoute route configuration.
* Loads page data via loader and renders the BlogAuthorRoute component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* BlogAuthorRoute page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function BlogAuthorRouteComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlogAuthorRoute.Component, { ...data });
}
//#endregion
export { BlogAuthorRouteComponent as component };

//# sourceMappingURL=blog_.author._id-BlnYSj5g.js.map