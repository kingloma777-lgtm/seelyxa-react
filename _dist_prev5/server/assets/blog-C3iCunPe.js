import { la as require_jsx_runtime } from "./shared-home-CSJrMlCW.js";
import { t as Blog } from "./blog-D812Md-j.js";
import { M as Route } from "./router-DEPH1lf3.js";
//#region app/routes/blog.tsx?tsr-split=component
/**
* Blog route configuration.
* Loads page data via loader and renders the Blog component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* Blog page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function BlogComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Blog.Component, { ...data });
}
//#endregion
export { BlogComponent as component };

//# sourceMappingURL=blog-C3iCunPe.js.map