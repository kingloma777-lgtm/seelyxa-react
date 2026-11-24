// @vitest-environment node
/**
 * The header's layer contract, as assertions.
 *
 * The mega menu is not a sibling of the page: it is a CHILD of the sticky
 * header, which is itself one stacking context (`isolation: isolate` +
 * `z-index: 40`). So the curtain's own `z-index: 5` never competes with page
 * content — the only number that matters is the header's `40`.
 *
 * That contract has two halves, and both are pinned here because either one
 * alone regresses silently:
 *
 *   1. the page content is ONE painting island (`#main-content`), so a block's
 *      internal z-index cannot escape into the root context and out-rank the
 *      header. This is what failed on 2026-11-24: `figurines` kept its grain
 *      at z-50 and its captions at z-60 with no `isolation` on the block root,
 *      so `elementFromPoint` inside the open curtain returned
 *      `.figurines__sub` — page text painted over the panel.
 *   2. every block that paints its own layers owns a stacking context — the
 *      playbook's block-root rule. `figurines` was the one block missing it.
 *
 * The fix is containment, never a bigger number: a `z-index` race here would
 * have to out-bid the cart drawer (260), the bottom bar (220) and the modals
 * (300) next, which is exactly the patch chain this test exists to prevent.
 *
 * Compiles the assembled stylesheet (`app.scss`) rather than the partials:
 * `home-blocks.scss` extends `.s-block--testimonials` from a sibling partial,
 * so it cannot be compiled alone.
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeAll } from 'vitest';
import * as sass from 'sass';
import postcss, { type Root } from 'postcss';
import tailwindcss from 'tailwindcss';

const themeRoot = fileURLToPath(new URL('../../', import.meta.url));
const tailwindConfig = createRequire(import.meta.url)(`${themeRoot}tailwind.config.cjs`);

let compiled: Promise<Root> | null = null;
const sheet = () =>
  (compiled ??= (async () => {
    const { css } = sass.compile(`${themeRoot}app/styles/app.scss`, {
      silenceDeprecations: ['import'],
    });
    const result = await postcss([
      tailwindcss({ ...tailwindConfig, content: [{ raw: '' }] }),
    ]).process(css, { from: undefined });
    return result.root;
  })());

/** Declarations from the unconditional rule for `selector` (no @media copy). */
async function base(selector: string): Promise<Record<string, string>> {
  const root = await sheet();
  const decls: Record<string, string> = {};
  root.walkRules((rule) => {
    if (rule.parent?.type === 'atrule' || !rule.selectors.includes(selector)) return;
    rule.walkDecls((decl) => {
      decls[decl.prop] = decl.value;
    });
  });
  return decls;
}

describe('header layer contract', () => {
  /* The compile is the expensive part of this file — the WHOLE assembled
     stylesheet, not a partial. It used to run inside the first test, which
     meant that test owned ~1.7s of Sass work against a 5s default budget and
     failed as a flake whenever the suite ran in parallel on a loaded machine
     (measured: 1650ms alone, over 5000ms under load). The hook gets its own
     budget instead. */
  beforeAll(async () => {
    await sheet();
  }, 60000);

  it('the header is its own stacking context at a level page content cannot reach', async () => {
    const h = await base('.morph-header');
    expect(h.position).toBe('sticky');
    expect(h['isolation']).toBe('isolate');
    // The layer the mega menu inherits. Above page content, below every
    // app-chrome overlay (bottom bar 220, drawer 260, modals 300).
    expect(Number(h['z-index'])).toBe(40);
  });

  it('the curtain is a child of the header, positioned under the bar', async () => {
    const c = await base('.morph-curtain');
    expect(c.position).toBe('absolute');
    expect(c.top).toBe('100%');
    // Internal only — ranked inside the header's context, never against the
    // page, so this number is not the fix for any page-content overlap.
    expect(Number(c['z-index'])).toBe(5);
  });

  it('page content is one painting island below the header', async () => {
    const main = await base('#main-content');
    expect(main['isolation']).toBe('isolate');
    // Containment, not a level: a z-index here would have to out-bid the
    // overlays that legitimately live above the header.
    expect(main['z-index']).toBeUndefined();
  });

  it('a block that paints its own layers owns a stacking context (figurines)', async () => {
    const fig = await base('.figurines');
    expect(fig['isolation']).toBe('isolate');
    // It must stay a local layer, not be promoted to a root-level z-index.
    expect(fig['z-index']).toBeUndefined();
    expect(fig.position).toBe('relative');
  });
});
