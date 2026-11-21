// @vitest-environment node
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, it, expect } from 'vitest';
import * as sass from 'sass';
import postcss, { type Root } from 'postcss';
import tailwindcss from 'tailwindcss';

const themeRoot = fileURLToPath(new URL('../../', import.meta.url));
const tailwindConfig = createRequire(import.meta.url)(`${themeRoot}tailwind.config.cjs`);

async function compile(file: string): Promise<Root> {
  const { css } = sass.compile(`${themeRoot}app/styles/04-components/${file}`);
  const result = await postcss([
    tailwindcss({ ...tailwindConfig, content: [{ raw: '' }] }),
  ]).process(css, { from: undefined });
  return result.root;
}

/* One compile for the whole file. Sass + Tailwind is ~1s here and each `it`
   below used to pay it again, so whichever assertion ran first absorbed the
   bill — on a loaded machine that was a 5s timeout, i.e. a false red. The AST
   is read-only, so a shared one is safe. */
let compiled: Promise<Root> | null = null;
const css = () => (compiled ??= compile('cart-drawer.scss'));

function declarations(root: Root, selector: string): Record<string, string> {
  const decls: Record<string, string> = {};
  root.walkRules((rule) => {
    if (rule.selectors.includes(selector)) {
      rule.walkDecls((decl) => {
        decls[decl.prop] = decl.value;
      });
    }
  });
  return decls;
}

/**
 * Every rule that matches `selector`, one map each — `declarations` merges them
 * and the last one wins, which is wrong once a `prefers-reduced-motion` block
 * later resets the same property to `none`.
 */
function declarationList(root: Root, selector: string): Array<Record<string, string>> {
  const list: Array<Record<string, string>> = [];
  root.walkRules((rule) => {
    if (!rule.selectors.includes(selector)) return;
    const decls: Record<string, string> = {};
    rule.walkDecls((decl) => {
      decls[decl.prop] = decl.value;
    });
    list.push(decls);
  });
  return list;
}

describe('cart-drawer.scss — the panel is anchored, hidden and theme-owned', () => {
  /* Paying the compile off the clock keeps the first assertion from timing out
     while the rest of the suite runs in parallel. */
  beforeAll(async () => {
    await css();
  }, 30000);

  it('sits above the header and the mobile bar, and is click-through while closed', async () => {
    const root = await css();
    const shell = declarations(root, '.cart-drawer-root');

    expect(shell.position).toBe('fixed');
    expect(shell['z-index']).toBe('260');
    expect(shell['pointer-events']).toBe('none');

    const open = declarations(root, '.cart-drawer-root.is-open');
    expect(open['pointer-events']).toBe('auto');
  });

  it('anchors to the END edge — the side the cart chip itself sits on', async () => {
    const root = await css();
    const panel = declarations(root, '.cart-drawer');

    expect(panel['inset-inline-end']).toBe('0');
    expect(panel['inset-block']).toBe('0');
    // `left` / `right` would pin it to one physical edge and open from the
    // wrong side in the other writing direction
    expect(panel.left).toBeUndefined();
    expect(panel.right).toBeUndefined();
  });

  it('slides out toward its own edge, and mirrors the closed offset in RTL', async () => {
    const root = await css();

    expect(declarations(root, '.cart-drawer').transform).toBe('translateX(100%)');
    // sass normalises the attribute selector: html[dir='rtl'] → html[dir=rtl]
    expect(declarations(root, 'html[dir=rtl] .cart-drawer').transform).toBe('translateX(-100%)');
    expect(declarations(root, '.cart-drawer-root.is-open .cart-drawer').transform).toBe(
      'translateX(0)'
    );
  });

  it('paints on the shared tokens, so html.dark flips it in one place', async () => {
    const root = await css();
    const panel = declarations(root, '.cart-drawer');

    expect(panel.background).toBe('var(--surface-1)');
    expect(panel.color).toBe('var(--ink-1)');
  });

  it('flashes the line that was just added, once', async () => {
    const root = await css();
    const animations = declarationList(root, '.cart-drawer__row.is-new').map(
      (decls) => decls.animation ?? ''
    );

    expect(animations.some((value) => value.includes('cart-drawer-flash'))).toBe(true);

    let keyframes = 0;
    root.walkAtRules('keyframes', (rule) => {
      if (rule.params === 'cart-drawer-flash') keyframes += 1;
    });
    expect(keyframes).toBe(1);
  });

  it('honours prefers-reduced-motion for the slide and the flash', async () => {
    const root = await css();

    let reduced = '';
    root.walkAtRules('media', (rule) => {
      if (!rule.params.includes('prefers-reduced-motion')) return;
      rule.walkRules((inner) => {
        reduced += `${inner.selectors.join(',')}|`;
      });
    });

    expect(reduced).toContain('.cart-drawer');
    expect(reduced).toContain('.cart-drawer__row.is-new');
  });
});
