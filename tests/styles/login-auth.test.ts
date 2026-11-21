// @vitest-environment node
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import * as sass from 'sass';
import postcss, { type Root, type Rule } from 'postcss';
import tailwindcss from 'tailwindcss';

const themeRoot = fileURLToPath(new URL('../../', import.meta.url));
const tailwindConfig = createRequire(import.meta.url)(`${themeRoot}tailwind.config.cjs`);

async function compile(): Promise<Root> {
  const { css } = sass.compile(`${themeRoot}app/styles/04-components/login-auth.scss`);
  const result = await postcss([
    tailwindcss({ ...tailwindConfig, content: [{ raw: '' }] }),
  ]).process(css, { from: undefined });
  return result.root;
}

function collect(root: Root, selector: string): Record<string, string> {
  const decls: Record<string, string> = {};
  const readRule = (rule: Rule) => {
    if (!rule.selectors.includes(selector)) return;
    rule.walkDecls((decl) => {
      decls[decl.prop] = decl.important ? `${decl.value} !important` : decl.value;
    });
  };
  root.walkRules((rule) => {
    let parent = rule.parent;
    while (parent && parent !== root) {
      if (parent.type === 'atrule') return;
      parent = parent.parent;
    }
    readRule(rule);
  });
  return decls;
}

describe('login-auth.scss — the popup follows the site mode', () => {
  it('paints a paper card in day mode, not the night ink one', async () => {
    const root = await compile();
    const day = collect(root, '.login-auth');
    expect(day['--la-card']).toContain('#ffffff');
    expect(day['--la-ink']).toContain('var(--ink-1');
    expect(day['--la-scheme']).toBe('light');
    // accent as TEXT needs its own darker value on paper — lemon on white is
    // unreadable, and that is why the token exists
    expect(day['--la-accent-text']).not.toBe(day['--la-accent']);
  });

  it('re-points every token under html.dark instead of forking the rules', async () => {
    const root = await compile();
    const night = collect(root, 'html.dark .login-auth');
    expect(night['--la-card']).toContain('#15171c');
    expect(night['--la-ink']).toContain('#f6f8f7');
    expect(night['--la-scheme']).toBe('dark');
    expect(night['--la-accent-text']).toContain('var(--la-accent)');
  });

  it('lets the card read its surface and shadow from the tokens', async () => {
    const root = await compile();
    const card = collect(root, '.login-auth__card');
    expect(card['color-scheme']).toBe('var(--la-scheme)');
    expect(card['box-shadow']).toBe('var(--la-shadow)');
    expect(card['color']).toBe('var(--la-ink)');
    expect(card['background']).toContain('var(--la-card)');
  });
});

/* `salla-tel-input` runs intl-tel-input in container mode and then stacks its
   own legacy skin on top. These rules are the ones that stop the country panel
   from splitting into a search strip at the top of the card and a single row at
   the bottom, and the ones that make an invalid number say so at all. */
describe('login-auth.scss — the phone field owns the country panel', () => {
  it('re-anchors the library container under the field instead of trusting its fixed coordinates', async () => {
    const root = await compile();
    const box = collect(root, '.login-auth .s-tel-input .iti--container');
    expect(box['position']).toBe('absolute !important');
    expect(box['top']).toBe('calc(100% + 8px) !important');
    expect(box['left']).toBe('0 !important');
    expect(box['right']).toBe('0 !important');
    expect(box['height']).toBe('auto !important');
  });

  it('drops the stale inline height and width the library writes on the panel', async () => {
    const root = await compile();
    const content = collect(root, '.login-auth .s-tel-input .iti__dropdown-content');
    expect(content['height']).toBe('auto !important');
    expect(content['width']).toBe('auto !important');
  });

  it('puts the country list back in flow — the legacy skin pins it absolute', async () => {
    const root = await compile();
    const list = collect(root, '.login-auth .s-tel-input .iti__country-list');
    expect(list['position']).toBe('static !important');
    expect(list['inset']).toBe('auto !important');
    expect(list['background']).toBe('transparent !important');
    expect(list['box-shadow']).toBe('none !important');
    // bounded, and never taller than the card on a short screen
    expect(list['max-height']).toContain('min(252px, 32vh)');
  });

  it('lines the dial code up on the far edge even though it is forced LTR', async () => {
    const root = await compile();
    const rtl = collect(root, '.login-auth .s-tel-input .iti__dial-code');
    expect(rtl['left']).toBe('0');
    expect(rtl['direction']).toBe('ltr');
    const ltr = collect(root, 'html[dir=ltr] .login-auth .s-tel-input .iti__dial-code');
    expect(ltr['right']).toBe('0');
  });

  it('aligns the search box with the icon on both directions', async () => {
    const root = await compile();
    const rtl = collect(root, 'html[dir=rtl] .login-auth .s-tel-input .iti__search-input');
    expect(rtl['direction']).toBe('rtl !important');
    expect(rtl['padding-right']).toBe('34px !important');
    const ltr = collect(root, 'html[dir=ltr] .login-auth .s-tel-input .iti__search-input');
    expect(ltr['direction']).toBe('ltr !important');
    expect(ltr['padding-left']).toBe('34px !important');
  });

  it('marks an invalid number on the field, because isValid() paints nothing', async () => {
    const root = await compile();
    const invalid = collect(root, '.login-auth .login-auth__field--invalid .s-tel-input');
    expect(invalid['border-color']).toContain('--la-danger-line');
    const message = collect(root, '.login-auth__field-error');
    expect(message['color']).toBe('var(--la-danger)');
  });
});
