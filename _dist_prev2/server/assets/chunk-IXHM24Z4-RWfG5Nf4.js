import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { ua as require_react } from "./shared-home-CR99BuTM.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-IXHM24Z4.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var mover = null;
function useLiveBlockMoves(onMove) {
	(0, import_react.useEffect)(() => {
		mover = onMove;
		return () => {
			if (mover === onMove) mover = null;
		};
	}, [onMove]);
}
function moveLiveBlock(from, to) {
	if (!mover) return false;
	mover(from, to);
	return true;
}
function reorder(order, from, to) {
	const next = [...order];
	if (from === to || from < 0 || to < 0 || from >= next.length || to >= next.length) return next;
	const [moved] = next.splice(from, 1);
	next.splice(to, 0, moved);
	return next;
}
//#endregion
export { reorder as n, useLiveBlockMoves as r, moveLiveBlock as t };

//# sourceMappingURL=chunk-IXHM24Z4-RWfG5Nf4.js.map