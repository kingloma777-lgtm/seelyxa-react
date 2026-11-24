import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { Ji as RouteId, la as require_react, tn as buildHreflangAlternates, zi as getTwilightContext } from "./shared-home-CDptNpzP.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/routes/testimonials.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
async function testimonialsLoader(_ctx) {
	const i18n = getTwilightContext().i18n;
	return { page: {
		slug: RouteId.TESTIMONIALS,
		title: i18n.t("blocks.home.testimonials") || "Customer Reviews"
	} };
}
async function reviewsLoader() {
	const { i18n } = getTwilightContext();
	const title = i18n.t("common.titles.reviews");
	return { page: {
		slug: RouteId.REVIEWS,
		title,
		breadcrumbs: [{
			name: i18n.t("common.titles.home"),
			url: "/"
		}, {
			name: title,
			url: "/reviews"
		}]
	} };
}
var LazyTestimonialsPage = (0, import_react.lazy)(() => import("./TestimonialsPage-4Y55RF5P-z3YXJXhS.js").then((m) => ({ default: m.TestimonialsPage })));
var LazyReviewsPage = (0, import_react.lazy)(() => import("./ReviewsPage-PFMEZ27R-BzgiPeVH.js").then((m) => ({ default: m.ReviewsPage })));
async function loader(ctx, extend) {
	const data = await testimonialsLoader({ locale: ctx.locale ?? "ar" });
	if (extend) {
		const extra = await extend(data, { params: {} });
		return {
			...data,
			...extra
		};
	}
	return data;
}
function head(ctx, data) {
	return {
		title: data.page.title,
		description: data.page.description,
		alternateLanguages: buildHreflangAlternates(ctx.settings, ctx.location.pathname)
	};
}
var Testimonials = {
	id: RouteId.TESTIMONIALS,
	loader,
	head,
	Component: LazyTestimonialsPage
};
async function loadReviews(_ctx, extend) {
	const data = await reviewsLoader();
	if (extend) {
		const extra = await extend(data, { params: {} });
		return {
			...data,
			...extra
		};
	}
	return data;
}
var Reviews = {
	id: RouteId.REVIEWS,
	loader: loadReviews,
	head: (ctx, data) => ({
		title: data.page.title,
		alternateLanguages: buildHreflangAlternates(ctx.settings, ctx.location.pathname)
	}),
	Component: LazyReviewsPage
};
//#endregion
export { Testimonials as n, Reviews as t };

//# sourceMappingURL=testimonials-DK5acYvU.js.map