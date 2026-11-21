/* ==========================================================================
   Splitting a headline for a per-unit animation.

   Joined scripts — Arabic, Syriac, the Indic range — must never be cut into
   characters: each glyph in its own inline-block is shaped in isolation, and
   «مجموعة» comes out as disconnected letters. Those headlines split per WORD,
   the smallest unit that survives both scripts. Everything else splits per
   character, which is the cascade those designs are known for.

   Two blocks animate type this way, so the rule lives here once.
   ========================================================================== */

const JOINED_SCRIPT =
  /[\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u08A0-\u08FF\u0900-\u0DFF\u0F00-\u0FFF]/;

/** True when cutting this text into characters would destroy its shaping. */
export const isJoinedScript = (text: string): boolean => JOINED_SCRIPT.test(text);

export interface Unit {
  ch: string;
  /** running index across the whole headline — the stagger cursor */
  i: number;
}

/** Words → units. Words stay grouped so a line break can never land inside a
 * word, and the stagger index keeps running across the group. */
export function splitForMask(text: string): Unit[][] {
  const words = text.split(/\s+/).filter(Boolean);
  const perChar = !JOINED_SCRIPT.test(text);
  let index = 0;
  return words.map((word) => {
    if (!perChar) return [{ ch: word, i: index++ }];
    return Array.from(word).map((ch) => ({ ch, i: index++ }));
  });
}
