import { ma as require_jsx_runtime } from "./shared-home-CcULkdy1.js";
import { i as BlogSingle } from "./blog-DWtjKQ8M.js";
import { s as Route } from "./router-oL-b_T_3.js";
//#region app/routes/blog_.$slug.a-$id.tsx?tsr-split=component
/**
* BlogSingle route configuration.
* Loads page data via loader and renders the BlogSingle component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* BlogSingle page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function BlogSingleComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlogSingle.Component, { ...data });
}
//#endregion
export { BlogSingleComponent as component };

//# sourceMappingURL=blog_._slug.a-_id-Bcl04YtG.js.map