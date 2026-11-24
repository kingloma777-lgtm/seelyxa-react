import { la as require_jsx_runtime } from "./shared-home-CR99BuTM.js";
import { n as Testimonials } from "./testimonials-D8HJ4ZoY.js";
import { C as Route } from "./router-3jrsUTEg.js";
//#region app/routes/testimonials.tsx?tsr-split=component
/**
* Testimonials route configuration.
* Loads page data via loader and renders the Testimonials component.
*/
var import_jsx_runtime = require_jsx_runtime();
/**
* Testimonials page component.
* Uses Route.useLoaderData() to access the data loaded by the route loader,
* following React best practices for data fetching in route components.
*/
function TestimonialsComponent() {
	const data = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Testimonials.Component, { ...data });
}
//#endregion
export { TestimonialsComponent as component };

//# sourceMappingURL=testimonials-DCBNdCSU.js.map