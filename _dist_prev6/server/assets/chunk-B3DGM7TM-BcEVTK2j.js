import { Pr as orThrow, Yr as api, er as queryOptions } from "./shared-home-CcULkdy1.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-B3DGM7TM.js
var blog = {
	get: async (signal) => {
		const options = {};
		if (signal) options.signal = signal;
		const response = await api.get("blog", options).json();
		return {
			categories: response.data.categories ?? [],
			slides: response.data.slides ?? [],
			articles: response.data.articles ?? [],
			popular: response.data.popular ?? []
		};
	},
	articles: {
		list: async (params) => {
			const { category, author, tag, page, cursor, signal } = params ?? {};
			const searchParams = new URLSearchParams();
			if (page !== void 0) searchParams.set("page", String(page));
			if (cursor) searchParams.set("cursor", cursor);
			if (category) searchParams.set("category", category);
			if (author) searchParams.set("author", author);
			if (tag) searchParams.set("tag", tag);
			const options = {};
			if (signal) options.signal = signal;
			const response = await api.get(`blog/articles?${searchParams.toString()}`, options).json();
			return {
				data: response.data ?? [],
				categories: response.categories ?? void 0,
				category: response.category,
				author: response.author,
				tag: response.tag,
				cursor: response.cursor
			};
		},
		find: async (id, signal) => {
			const options = {};
			if (signal) options.signal = signal;
			const response = await api.get(`blog/articles/${id}`, options).json();
			if (!response.data) throw new Error(`Article ${id} not found`);
			return response.data;
		},
		findOrThrow: (id, signal) => orThrow(blog.articles.find(id, signal))
	},
	queries: {
		overview: () => queryOptions({
			queryKey: ["blog", "overview"],
			queryFn: ({ signal }) => blog.get(signal)
		}),
		articles: (params) => queryOptions({
			queryKey: [
				"blog",
				"articles",
				params
			],
			queryFn: ({ signal }) => blog.articles.list({
				...params,
				signal
			})
		}),
		article: (id) => queryOptions({
			queryKey: [
				"blog",
				"article",
				id
			],
			queryFn: ({ signal }) => blog.articles.find(id, signal)
		})
	}
};
//#endregion
export { blog as t };

//# sourceMappingURL=chunk-B3DGM7TM-BcEVTK2j.js.map