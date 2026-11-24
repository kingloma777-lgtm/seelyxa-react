import { ma as require_jsx_runtime } from "./shared-home-CcULkdy1.js";
import { a as BlogTagRoute } from "./blog-DWtjKQ8M.js";
import { a as Route } from "./router-oL-b_T_3.js";
//#region app/routes/blog_.$slug.tag-$id.tsx?tsr-split=component
/**
* BlogTagRoute route configuration.
* Loads page data via loader and renders the BlogTagRoute component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* BlogTagRoute page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function BlogTagRouteComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlogTagRoute.Component, { ...data });
}
//#endregion
export { BlogTagRouteComponent as component };

//# sourceMappingURL=blog_._slug.tag-_id-rO46K2j_.js.map