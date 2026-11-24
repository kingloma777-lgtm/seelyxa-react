import { la as require_jsx_runtime } from "./shared-home-CSJrMlCW.js";
import { r as BlogCategoryRoute } from "./blog-D812Md-j.js";
import { o as Route } from "./router-Dne9SQHr.js";
//#region app/routes/blog_.$slug.c-$id.tsx?tsr-split=component
/**
* BlogCategoryRoute route configuration.
* Loads page data via loader and renders the BlogCategoryRoute component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* BlogCategoryRoute page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function BlogCategoryRouteComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlogCategoryRoute.Component, { ...data });
}
//#endregion
export { BlogCategoryRouteComponent as component };

//# sourceMappingURL=blog_._slug.c-_id-BQjNSpXm.js.map