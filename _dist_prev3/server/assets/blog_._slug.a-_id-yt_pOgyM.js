import { la as require_jsx_runtime } from "./shared-home-CR99BuTM.js";
import { i as BlogSingle } from "./blog-BAKQOd3Q.js";
import { s as Route } from "./router-26TzvfmH.js";
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

//# sourceMappingURL=blog_._slug.a-_id-yt_pOgyM.js.map