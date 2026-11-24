import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { Jt as useDocumentClass, Qn as useTranslation, Sn as SallaUserMenu, Vr as useLocation, Yt as useUser, ea as RouteId, gn as LazyBreadcrumb, ha as require_react, ma as require_jsx_runtime } from "./shared-home-CcULkdy1.js";
import { E as SallaFileUpload } from "./shared-product-BuxTY7AC.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/CustomerLayout-V5T4OPRY.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function CustomerLayout({ children, page }) {
	const { data: user } = useUser();
	const { t } = useTranslation();
	const { pathname } = useLocation();
	const crumbPage = (0, import_react.useMemo)(() => {
		if (!page || page.breadcrumbs?.length || [RouteId.CUSTOMER_PROFILE, RouteId.CUSTOMER_WISHLIST].includes(page.slug)) return page;
		return {
			...page,
			breadcrumbs: [
				{
					name: t("common.titles.home"),
					url: "/"
				},
				{
					name: t("common.titles.profile"),
					url: "/account/profile"
				},
				{
					name: page.title,
					url: pathname
				}
			]
		};
	}, [
		page,
		pathname,
		t
	]);
	useDocumentClass({ body: { class: "customer" } });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "profile-header gradient-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "container relative flex justify-between h-full items-center",
			children: crumbPage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyBreadcrumb, {
				page: crumbPage,
				className: "breadcrumbs w-full py-5 self-start"
			})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container lg:mb-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start flex-col lg:flex-row justify-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				"aria-label": "Sidebar",
				className: "shrink-0 lg:sticky top-24 lg:-mt-28 lg:shadow-default rounded-md lg:bg-white w-full lg:w-72 rtl:lg:ml-8 ltr:lg:mr-8 lg:pt-8 lg:pb-11 sidebar space-y-px",
				children: [page?.slug === RouteId.CUSTOMER_PROFILE && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-center md:mb-9",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-20 w-20 m-auto avatar-wrap bg-gray-100 rounded-full overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaFileUpload, {
							profileImage: true,
							value: user?.avatar,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "avatar-placeholder flex justify-center items-center flex-col w-full h-full",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sicon-user text-2xl text-gray-400" })
							})
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden lg:block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaUserMenu, { inline: true })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "main-content w-full flex-1 lg:pt-10 max-w-3xl",
				children: [page?.title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-bold text-lg text-center sm:rtl:text-right sm:ltr:text-left mb-2",
					children: page.title
				}), children]
			})]
		})
	})] });
}
//#endregion
export { CustomerLayout };

//# sourceMappingURL=CustomerLayout-V5T4OPRY-D5mQ9FKP.js.map