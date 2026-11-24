import { t as createMiddleware } from "./createMiddleware-bHELZO7i.js";
import { i as twilightMiddleware, r as earlyHintsMiddleware } from "./tanstack-BLyg5M43.js";
//#region node_modules/.pnpm/@tanstack+start-client-core@1.170.35/node_modules/@tanstack/start-client-core/dist/esm/createStart.js
function dedupeSerializationAdapters(deduped, serializationAdapters) {
	for (let i = 0, len = serializationAdapters.length; i < len; i++) {
		const current = serializationAdapters[i];
		if (!deduped.has(current)) {
			deduped.add(current);
			if (current.extends) dedupeSerializationAdapters(deduped, current.extends);
		}
	}
}
var createStart = (getOptions) => {
	return {
		getOptions: async () => {
			const options = await getOptions();
			if (options.serializationAdapters) {
				const deduped = /* @__PURE__ */ new Set();
				dedupeSerializationAdapters(deduped, options.serializationAdapters);
				options.serializationAdapters = Array.from(deduped);
			}
			return options;
		},
		createMiddleware
	};
};
//#endregion
//#region app/start.ts
var startInstance = createStart(() => {
	return { requestMiddleware: [twilightMiddleware(), earlyHintsMiddleware()] };
});
//#endregion
export { startInstance };

//# sourceMappingURL=start-C67adrjO.js.map