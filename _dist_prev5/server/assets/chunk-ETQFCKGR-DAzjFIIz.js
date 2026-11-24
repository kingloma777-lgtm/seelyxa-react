import { Wr as api } from "./shared-home-CSJrMlCW.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-ETQFCKGR.js
var wallet = { list: async (params = {}) => {
	const { page = 1, perPage = 10, signal } = params;
	const searchParams = new URLSearchParams();
	searchParams.set("page", String(page));
	searchParams.set("per_page", String(perPage));
	const options = {};
	if (signal) options.signal = signal;
	const response = await api.get(`balance/wallet?${searchParams.toString()}`, options).json();
	const transactions = response.data.transactions;
	return {
		items: transactions.data ?? [],
		next: transactions.next_page_url,
		balance: response.data.balance
	};
} };
//#endregion
export { wallet as t };

//# sourceMappingURL=chunk-ETQFCKGR-DAzjFIIz.js.map