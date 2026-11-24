import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { Bi as getTwilightContext, Or as notFound, Yi as RouteId, kr as orThrow, nn as buildHreflangAlternates, ua as require_react } from "./shared-home-CR99BuTM.js";
import { t as blog } from "./chunk-B3DGM7TM-CDODd5Fm.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/routes/blog.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
async function blogLoader() {
	const i18n = getTwilightContext().i18n;
	const breadcrumbs = [{
		name: i18n.t("common.titles.home"),
		url: "/"
	}, {
		name: i18n.t("blocks.footer.blog"),
		url: "/blog"
	}];
	const page = {
		slug: RouteId.BLOG_INDEX,
		title: i18n.t("blocks.footer.blog") || "Blog",
		breadcrumbs
	};
	try {
		const overview = await blog.get();
		return {
			page,
			articles: overview.articles,
			categories: overview.categories,
			slides: overview.slides,
			popular: overview.popular
		};
	} catch (_error) {
		return {
			page,
			articles: [],
			categories: [],
			slides: [],
			popular: []
		};
	}
}
async function blogSingleLoader({ params }) {
	const { id } = params;
	const i18n = getTwilightContext().i18n;
	if (!/^\d+$/.test(id)) throw notFound();
	const article = await blog.articles.findOrThrow(id);
	const breadcrumbs = [
		{
			name: i18n.t("common.titles.home"),
			url: "/"
		},
		{
			name: i18n.t("blocks.footer.blog"),
			url: "/blog"
		},
		{
			name: article.name,
			url: article.url
		}
	];
	return {
		page: {
			slug: RouteId.BLOG_SINGLE,
			id: article.id,
			title: article.name,
			breadcrumbs
		},
		article,
		related: article.related
	};
}
async function blogAuthorLoader({ params }) {
	const { id } = params;
	const i18n = getTwilightContext().i18n;
	const [response, overview] = await Promise.all([orThrow(blog.articles.list({ author: id })), blog.get()]);
	const author = response.author;
	if (!author) throw notFound();
	const breadcrumbs = [
		{
			name: i18n.t("common.titles.home"),
			url: "/"
		},
		{
			name: i18n.t("blocks.footer.blog"),
			url: "/blog"
		},
		{
			name: author.name,
			url: author.url
		}
	];
	return {
		page: {
			slug: RouteId.BLOG_INDEX_AUTHOR,
			id,
			title: author.name,
			breadcrumbs
		},
		author,
		categories: overview.categories,
		articles: response.data,
		cursor: response.cursor
	};
}
async function blogCategoryLoader({ params }) {
	const { id } = params;
	const i18n = getTwilightContext().i18n;
	const [response, overview] = await Promise.all([orThrow(blog.articles.list({ category: id })), blog.get()]);
	const category = response.category;
	if (!category) throw notFound();
	const breadcrumbs = [
		{
			name: i18n.t("common.titles.home"),
			url: "/"
		},
		{
			name: i18n.t("blocks.footer.blog"),
			url: "/blog"
		},
		{
			name: category.name,
			url: category.url
		}
	];
	return {
		page: {
			slug: RouteId.BLOG_INDEX_CATEGORY,
			id: category.id,
			title: category.name,
			breadcrumbs
		},
		blogCategory: category,
		categories: overview.categories,
		articles: response.data,
		cursor: response.cursor
	};
}
async function blogTagLoader({ params }) {
	const { id } = params;
	const i18n = getTwilightContext().i18n;
	const [response, overview] = await Promise.all([orThrow(blog.articles.list({ tag: id })), blog.get()]);
	const tag = response.tag;
	if (!tag) throw notFound();
	const breadcrumbs = [
		{
			name: i18n.t("common.titles.home"),
			url: "/"
		},
		{
			name: i18n.t("blocks.footer.blog"),
			url: "/blog"
		},
		{
			name: tag.name,
			url: tag.url
		}
	];
	return {
		page: {
			slug: RouteId.BLOG_INDEX_TAG,
			id: tag.id,
			title: tag.name,
			breadcrumbs
		},
		blogTag: tag,
		categories: overview.categories,
		articles: response.data,
		cursor: response.cursor
	};
}
var LazyBlogPage = (0, import_react.lazy)(() => import("./BlogPage-7HOCNIL5-DP-_h7Ap.js").then((m) => ({ default: m.BlogPage })));
var LazyBlogSinglePage = (0, import_react.lazy)(() => import("./BlogSinglePage-SF575W74-BQ51uurw.js").then((m) => ({ default: m.BlogSinglePage })));
var LazyBlogAuthorPage = (0, import_react.lazy)(() => import("./BlogAuthorPage-BF5XVPHV-C0YMlCxS.js").then((m) => ({ default: m.BlogAuthorPage })));
var LazyBlogCategoryPage = (0, import_react.lazy)(() => import("./BlogCategoryPage-BZTNFEM7-DDlOGoMg.js").then((m) => ({ default: m.BlogCategoryPage })));
var LazyBlogTagPage = (0, import_react.lazy)(() => import("./BlogTagPage-TALXABAF-Bizb0vcu.js").then((m) => ({ default: m.BlogTagPage })));
async function blogLoaderWithExtend(_ctx, extend) {
	const data = await blogLoader();
	if (extend) {
		const extra = await extend(data, { params: {} });
		return {
			...data,
			...extra
		};
	}
	return data;
}
function blogHead(ctx, data) {
	return {
		title: data.page.title,
		description: data.page.description,
		alternateLanguages: buildHreflangAlternates(ctx.settings, ctx.location.pathname)
	};
}
async function blogSingleLoaderWithExtend(ctx, extend) {
	const data = await blogSingleLoader({ params: ctx.params });
	if (extend) {
		const extra = await extend(data, ctx);
		return {
			...data,
			...extra
		};
	}
	return data;
}
function blogSingleHead(ctx, data) {
	return {
		title: data.article.meta?.title ?? data.article.name,
		description: data.article.meta?.description ?? data.article.description,
		canonical: data.article.meta?.canonical ?? data.article.url,
		openGraph: {
			title: data.article.meta?.title ?? data.article.name,
			images: data.article.meta?.og_image ?? data.article.image
		},
		alternateLanguages: buildHreflangAlternates(ctx.settings, ctx.location.pathname)
	};
}
async function blogAuthorLoaderWithExtend(ctx, extend) {
	const data = await blogAuthorLoader({ params: ctx.params });
	if (extend) {
		const extra = await extend(data, ctx);
		return {
			...data,
			...extra
		};
	}
	return data;
}
function blogAuthorHead(ctx, data) {
	return {
		title: data.author.name,
		description: `Articles by ${data.author.name}`,
		alternateLanguages: buildHreflangAlternates(ctx.settings, ctx.location.pathname)
	};
}
async function blogCategoryLoaderWithExtend(ctx, extend) {
	const data = await blogCategoryLoader({ params: ctx.params });
	if (extend) {
		const extra = await extend(data, ctx);
		return {
			...data,
			...extra
		};
	}
	return data;
}
function blogCategoryHead(ctx, data) {
	return {
		title: data.blogCategory.meta?.title ?? data.blogCategory.name,
		description: data.blogCategory.meta?.description ?? `Articles in ${data.blogCategory.name}`,
		canonical: data.blogCategory.meta?.canonical ?? data.blogCategory.url,
		alternateLanguages: buildHreflangAlternates(ctx.settings, ctx.location.pathname)
	};
}
async function blogTagLoaderWithExtend(ctx, extend) {
	const data = await blogTagLoader({ params: ctx.params });
	if (extend) {
		const extra = await extend(data, ctx);
		return {
			...data,
			...extra
		};
	}
	return data;
}
function blogTagHead(ctx, data) {
	return {
		title: data.blogTag.name,
		description: `Articles tagged with ${data.blogTag.name}`,
		canonical: data.blogTag.url,
		alternateLanguages: buildHreflangAlternates(ctx.settings, ctx.location.pathname)
	};
}
var Blog = {
	id: RouteId.BLOG_INDEX,
	loader: blogLoaderWithExtend,
	head: blogHead,
	Component: LazyBlogPage
};
var BlogSingle = {
	id: RouteId.BLOG_SINGLE,
	loader: blogSingleLoaderWithExtend,
	head: blogSingleHead,
	Component: LazyBlogSinglePage
};
var BlogAuthorRoute = {
	id: RouteId.BLOG_INDEX_AUTHOR,
	loader: blogAuthorLoaderWithExtend,
	head: blogAuthorHead,
	Component: LazyBlogAuthorPage
};
var BlogCategoryRoute = {
	id: RouteId.BLOG_INDEX_CATEGORY,
	loader: blogCategoryLoaderWithExtend,
	head: blogCategoryHead,
	Component: LazyBlogCategoryPage
};
var BlogTagRoute = {
	id: RouteId.BLOG_INDEX_TAG,
	loader: blogTagLoaderWithExtend,
	head: blogTagHead,
	Component: LazyBlogTagPage
};
//#endregion
export { BlogTagRoute as a, BlogSingle as i, BlogAuthorRoute as n, BlogCategoryRoute as r, Blog as t };

//# sourceMappingURL=blog-BAKQOd3Q.js.map