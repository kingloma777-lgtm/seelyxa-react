import { aa as DEV_LOOKUP_BUDGET_MS, at as product } from "./shared-home-CcULkdy1.js";
import { t as category } from "./chunk-MBSWV56J-B5-N4ih1.js";
import { t as brand } from "./chunk-G3UTLR3D-B1kG2Q4M.js";
import { t as blog } from "./chunk-B3DGM7TM-BcEVTK2j.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/store-lookup-OWYYSCDT.js
var PER_PAGE = 20;
var MAX_PAGES = 10;
async function collect(fetchPage, keep) {
	const deadline = Date.now() + DEV_LOOKUP_BUDGET_MS;
	const found = [];
	let cursor = null;
	for (let page = 1; page <= MAX_PAGES; page += 1) {
		const { items, next } = await fetchPage(page, cursor);
		found.push(...items.filter(keep));
		if (found.length >= PER_PAGE || !next || Date.now() >= deadline) break;
		cursor = next;
	}
	return found.slice(0, PER_PAGE);
}
function matches(name, query) {
	return !query || name.toLowerCase().includes(query.toLowerCase());
}
function flatten(categories2) {
	return categories2.flatMap((c) => [c, ...flatten(c.sub_categories ?? [])]);
}
async function products(query) {
	const { items } = await product.list({
		source: query ? "search" : "latest",
		...query ? { keyword: query } : {},
		perPage: PER_PAGE
	});
	return items.map((p) => ({
		id: Number(p.id),
		name: p.name,
		image: p.image?.url,
		url: p.url,
		data: {
			id: Number(p.id),
			name: p.name,
			url: p.url,
			image: p.image?.url ?? null
		}
	}));
}
async function categories(query) {
	return flatten(await category.list()).filter((c) => matches(c.name, query)).slice(0, PER_PAGE).map((c) => ({
		id: c.id,
		name: c.name,
		image: c.image ?? void 0,
		url: c.url,
		data: {
			id: c.id,
			name: c.name,
			url: c.url,
			image: c.image ?? null,
			icon: c.icon ?? null
		}
	}));
}
async function brands(query) {
	return (await collect((page) => brand.list(page), (b) => matches(b.name, query))).map((b) => ({
		id: b.id,
		name: b.name,
		image: b.logo,
		url: b.url,
		data: {
			id: b.id,
			name: b.name,
			url: b.url,
			logo: b.logo,
			banner: b.banner ?? null
		}
	}));
}
async function blogArticles(query) {
	return (await collect(async (_page, cursor) => {
		const { data, cursor: pages } = await blog.articles.list(cursor ? { cursor } : void 0);
		return {
			items: data,
			next: pages?.next ?? null
		};
	}, (a) => matches(a.name, query))).map((a) => ({
		id: a.id,
		name: a.name,
		image: a.image,
		url: a.url,
		data: {
			id: a.id,
			name: a.name,
			url: a.url
		}
	}));
}
async function blogCategories(query) {
	const { categories: list } = await blog.get();
	return list.filter((c) => matches(c.name, query)).slice(0, PER_PAGE).map((c) => ({
		id: c.id,
		name: c.name,
		url: c.url,
		data: {
			id: c.id,
			name: c.name,
			url: c.url
		}
	}));
}
var LOOKUPS = {
	products,
	categories,
	brands,
	blog_articles: blogArticles,
	blog_categories: blogCategories
};
function lookupInStore(source, query) {
	const lookup = LOOKUPS[source];
	if (!lookup) return Promise.reject(/* @__PURE__ */ new Error(`no lookup for ${source}`));
	return lookup(query.trim());
}
//#endregion
export { lookupInStore };

//# sourceMappingURL=store-lookup-OWYYSCDT-tdIuiXdR.js.map