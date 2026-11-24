import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { Ft as useDate, dn as LazyBreadcrumb, la as require_jsx_runtime, mn as LazyNoContent, qn as useTranslation, sn as Link, ua as require_react, un as Image, wn as HookSlot, yn as SallaSlider } from "./shared-home-CR99BuTM.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/BlogPage-7HOCNIL5.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var BLOG_CARD_VISIBLE_TAGS = 3;
function BlogTags({ tags, visible = BLOG_CARD_VISIBLE_TAGS }) {
	const { t } = useTranslation();
	const [expanded, setExpanded] = (0, import_react.useState)(false);
	if (tags.length === 0) return null;
	const hiddenCount = Math.max(0, tags.length - visible);
	const shown = expanded ? tags : tags.slice(0, visible);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "s-blog-tags p-4 flex flex-wrap items-center gap-2 border-t border-gray-200",
		children: [shown.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: tag.url,
			className: "s-blog-tags-item py-1 px-3 rounded-full border border-gray-200 inline-flex items-center max-w-full text-gray-500 hover:text-dark hover:border-gray-300 text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "font-medium sicon-tag rtl:ml-1.5 ltr:mr-1.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "fix-align truncate",
				children: tag.name
			})]
		}, tag.id)), hiddenCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "s-blog-tags-more py-1 px-3 rounded-full text-xs font-medium text-primary hover:opacity-80",
			"aria-expanded": expanded,
			onClick: () => setExpanded((open) => !open),
			children: expanded ? t("common.elements.show_less", "Show less") : `+${hiddenCount}`
		})]
	});
}
var EMPTY_CATEGORIES = [];
var EMPTY_ARTICLES = [];
var EMPTY_SLIDES = [];
function BlogPage({ page, categories = EMPTY_CATEGORIES, articles = EMPTY_ARTICLES, slides = EMPTY_SLIDES }) {
	const { t } = useTranslation();
	const { format: formatDate } = useDate();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container mb-8 sm:mb-24",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "center-between",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyBreadcrumb, { page })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 lg:grid-cols-8 gap-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				"aria-label": "Sidebar",
				className: "hidden lg:block lg:sticky shrink-0 top-24 col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-bold mb-3",
					children: t("pages.blog_categories.categories")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: categories.map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: category.is_current ? "text-primary" : "",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						className: "py-3 block text-sm hover:text-primary",
						to: category.url,
						children: category.name
					})
				}, category.id)) })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "main-content lg:col-span-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "blog:start" }),
					slides.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaSlider, {
						id: "blog-home-slider",
						type: "blog",
						autoPlay: true,
						autoHeight: true,
						showControls: false,
						pagination: true,
						className: "blog-slider block rounded overflow-hidden mb-2.5 lg:mb-8",
						sliderConfig: { watchOverflow: true },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							slot: "items",
							children: slides.map((article, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "swiper-slide has-overlay blog-slider__slide h-[300px] md:h-[400px] relative bg-border-color flex justify-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
									className: "object-cover h-full w-full",
									src: article.image,
									alt: article.name,
									aspectRatio: "3/1",
									priority: index === 0
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute z-10 bottom-0 rtl:right-0 ltr:left-0 p-4 pb-10 rtl:lg:pr-10 ltr:lg:pl-10 lg:pb-20",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "blog-slider__content relative",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "z-20 w-full md:w-5/6 lg:w-6/12 text-white",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "block-slide-anime",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mb-2.5 rounded-md inline-flex text-sm rtl:space-x-reverse space-x-5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-calendar-date rtl:ml-1 ltr:mr-1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "whitespace-nowrap",
															children: formatDate(article.created_at)
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
														to: article.author?.url || "#",
														className: "flex items-center hover:underline",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-user rtl:ml-1 ltr:mr-1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "whitespace-nowrap",
															children: article.author?.name
														})]
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
													className: "text-sm font-bold leading-normal mb-4",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
														to: article.url,
														children: article.name
													})
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "line-clamp-2 block-slide-anime description",
												children: article.description
											})]
										})
									})
								})]
							}, article.id))
						})
					}),
					!slides.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "sr-only lg:not-sr-only",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "blog-category__title font-bold text-lg mb-8",
							children: t("blocks.footer.blog")
						})
					}),
					slides.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "sr-only",
						children: t("blocks.footer.blog")
					}),
					articles.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "blog:items.start" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid md:grid-cols-2 gap-2.5 md:gap-8",
							children: articles.map((article) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "list-block post-entry relative h-full transition-shadow duration-500 bg-white hover:shadow-default rounded-lg justify-around overflow-hidden flex flex-col",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: article.url,
										className: "post-entry__image relative overflow-hidden hover:opacity-90 w-full h-56 bg-border-color flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
											className: "h-full w-full object-cover",
											src: article.image,
											alt: article.name,
											aspectRatio: "16/9"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 px-5 pt-5 pb-7",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mb-2.5 text-gray-500 rounded-md inline-flex text-sm rtl:space-x-reverse space-x-5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-calendar-date rtl:ml-1 ltr:mr-1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDate(article.created_at) })]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
													to: article.author?.url || "#",
													className: "flex items-center hover:text-dark",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-user rtl:ml-1 ltr:mr-1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: article.author?.name })]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "post-entry__title text-sm font-bold text-gray-800 leading-6 mb-2.5",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: article.url,
													children: article.name
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-gray-500 leading-6 mb-2.5",
												children: article.description
											}),
											((article.stats?.likes ?? 0) > 0 || (article.stats?.comments ?? 0) > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "post-entry__icons flex items-center gap-2.5 text-gray-500 text-sm",
												children: [(article.stats?.likes ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-thumbs-up" }), article.stats?.likes]
												}), (article.stats?.comments ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-chat" }), article.stats?.comments]
												})]
											})
										]
									}),
									article.tags && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlogTags, { tags: article.tags })
								]
							}, article.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "blog:items.end" })
					] }) : !slides.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyNoContent, {
						icon: "sicon-inbox",
						message: t("pages.blog_categories.no_articles")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "blog:end" })
				]
			})]
		})]
	});
}
//#endregion
export { BlogPage };

//# sourceMappingURL=BlogPage-7HOCNIL5-DP-_h7Ap.js.map