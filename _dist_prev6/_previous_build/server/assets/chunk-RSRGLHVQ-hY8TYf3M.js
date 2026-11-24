import { Ar as orUnauthorized, Wr as api, Yn as queryOptions, kr as orThrow } from "./shared-home-CSJrMlCW.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-RSRGLHVQ.js
var order = {
	list: async (params) => {
		const { page, cursor, status, feedback_status: feedbackStatus, with_items: withItems, signal } = params ?? {};
		const searchParams = new URLSearchParams();
		if (page !== void 0) searchParams.set("page", String(page));
		if (cursor) searchParams.set("cursor", cursor);
		if (status) searchParams.set("status", status);
		if (feedbackStatus) searchParams.set("feedback_status", feedbackStatus);
		if (withItems) searchParams.set("with_items", "1");
		const options = {};
		if (signal) options.signal = signal;
		const response = await api.get(`orders?${searchParams.toString()}`, options).json();
		return {
			data: response.data ?? [],
			cursor: response.cursor
		};
	},
	find: async (id) => {
		return { order: (await api.get(`orders/${id}`).json()).data };
	},
	findForComponents: async (id) => {
		return (await api.get(`orders/${id}`, { hooks: { beforeRequest: [({ request }) => request.headers.delete("s-theme-type")] } }).json()).data;
	},
	shipments: async (orderId) => {
		return (await api.get(`orders/${orderId}/shipments`).json()).data ?? [];
	},
	ratings: async (orderId) => {
		return (await api.get(`orders/${orderId}/ratings`).json()).data ?? [];
	},
	findOrThrow: (id) => orThrow(orUnauthorized(order.find(id))),
	thankYou: async (orderId) => {
		const { data } = await api.get(`checkout/thank-you/${orderId}`).json();
		return data;
	},
	thankYouOrThrow: (orderId) => orThrow(order.thankYou(orderId)),
	queries: {
		list: (params) => queryOptions({
			queryKey: [
				"orders",
				"list",
				params
			],
			queryFn: ({ signal }) => order.list({
				...params,
				signal
			})
		}),
		find: (id) => queryOptions({
			queryKey: [
				"orders",
				"detail",
				id
			],
			queryFn: () => order.find(id)
		}),
		shipments: (orderId) => queryOptions({
			queryKey: [
				"orders",
				"shipments",
				orderId
			],
			queryFn: () => order.shipments(orderId)
		}),
		ratings: (orderId) => queryOptions({
			queryKey: [
				"orders",
				"ratings",
				orderId
			],
			queryFn: () => order.ratings(orderId)
		}),
		thankYou: (orderId) => queryOptions({
			queryKey: [
				"orders",
				"thankYou",
				orderId
			],
			queryFn: () => order.thankYou(orderId)
		})
	}
};
//#endregion
export { order as t };

//# sourceMappingURL=chunk-RSRGLHVQ-hY8TYf3M.js.map