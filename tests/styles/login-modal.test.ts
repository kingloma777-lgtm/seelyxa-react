// @vitest-environment node
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import * as sass from 'sass';
import postcss, { type Container, type Root, type Rule } from 'postcss';
import tailwindcss from 'tailwindcss';

const themeRoot = fileURLToPath(new URL('../../', import.meta.url));
const tailwindConfig = createRequire(import.meta.url)(`${themeRoot}tailwind.config.cjs`);

async function compile(): Promise<Root> {
  const { css } = sass.compile(`${themeRoot}app/styles/04-components/login-modal.scss`);
  const result = await postcss([
    tailwindcss({ ...tailwindConfig, content: [{ raw: '' }] }),
  ]).process(css, { from: undefined });
  return result.root;
}

function collect(root: Root, selector: string, media?: string): Record<string, string> {
  const decls: Record<string, string> = {};
  const readRule = (rule: Rule) => {
    if (!rule.selectors.includes(selector)) return;
    rule.walkDecls((decl) => {
      decls[decl.prop] = decl.important ? `${decl.value} !important` : decl.value;
    });
  };
  if (media) {
    root.walkAtRules('media', (at) => {
      if (at.params.includes(media)) at.walkRules(readRule);
    });
    return decls;
  }
  root.walkRules((rule) => {
    // Do not let the phone / reduced-motion overrides overwrite the base
    // declarations we are asserting on.
    let parent = rule.parent;
    while (parent && parent !== root) {
      if (parent.type === 'atrule') return;
      parent = parent.parent;
    }
    readRule(rule);
  });
  return decls;
}

const BODY = 'salla-modal.s-login-modal[visible] .s-modal-body.s-modal-xs.s-modal-align-middle';

describe('login-modal.scss — the frame is ours, the form stays Salla’s', () => {
  it('replaces the 1425px white slab with a centred 820px ink card', async () => {
    const root = await compile();
    const body = collect(root, BODY);
    expect(body['display']).toContain('grid');
    expect(body['width']).toContain('820px');
    expect(body['padding']).toContain('0');
    expect(body['border-radius']).toContain('24px');
    // the white iframe is now a small seated sheet, NOT the card background
    expect(body['background']).toContain('var(--login-rail)');
  });

  it('paints the ink rail as a full-height grid item, not a text-sized strip', async () => {
    const root = await compile();
    // `align-self:end` shrank the rail to the headline's own 60px box in the
    // browser; the background must STRETCH across the whole grid row.
    expect(collect(root, `${BODY}::before`)['align-self']).toBe('stretch');
    expect(collect(root, `${BODY}::after`)['align-self']).toBe('stretch');
    expect(collect(root, `${BODY}::before`)['content']).toContain('أهلًا بعودتك');
    expect(
      collect(root, 'html[dir=ltr] salla-modal.s-login-modal[visible] .s-modal-body.s-modal-xs::before')['content']
    ).toContain('Welcome back');
  });

  it('seats the white iframe as a small 460px sheet on the rail', async () => {
    const root = await compile();
    const iframe = collect(root, `${BODY} iframe`);
    expect(iframe['justify-self']).toBe('start');
    expect(iframe['align-self']).toBe('center');
    expect(iframe['width']).toContain('460px');
    expect(iframe['border-radius']).toContain('16px');
    // the shadow is a token now, so day/night can seat the sheet differently
    expect(iframe['box-shadow']).toContain('var(--login-sheet-shadow)');
    expect(iframe['border']).toContain('0');
  });

  it('follows the site mode: paper rail by day, ink rail at night', async () => {
    const root = await compile();
    const day = collect(root, BODY);
    expect(day['--login-rail']).toContain('#f4f6f2');
    expect(day['--login-ink']).toContain('var(--ink-1');
    // nothing on the day card may be a light-on-dark colour
    expect(day['color']).toBe('var(--login-ink) !important');

    const night = collect(root, `html.dark ${BODY}`);
    expect(night['--login-rail']).toContain('#0b0c0f');
    expect(night['--login-ink']).toContain('#f6f8f7');
  });

  it('inverts the hosted LIGHT form in night mode instead of trusting its broken dark class', async () => {
    const root = await compile();
    const darkSelector = `html.dark ${BODY}`;
    expect(collect(root, darkSelector)['--login-rail']).toContain('#0b0c0f');
    const darkFrame = collect(root, `${darkSelector} iframe`);
    expect(darkFrame['filter']).toContain('invert(1)');
    expect(darkFrame['filter']).toContain('hue-rotate(180deg)');
    // Pre-inverted border/shadow: they must land dark, not glow after the filter.
    expect(darkFrame['border']).toContain('rgba(0, 0, 0');
    expect(darkFrame['box-shadow']).toContain('rgba(255, 255, 255');
  });

  it('docks the phone sheet to the bottom and avoids a duplicate title', async () => {
    const root = await compile();
    const phone = collect(root, BODY, 'max-width: 767px');
    expect(phone['margin']).toContain('0');
    expect(phone['border-radius']).toContain('20px 20px 0 0');
    expect(collect(root, `${BODY} iframe`, 'max-width: 767px')['width']).toContain('calc(100% - 20px)');
    expect(collect(root, `${BODY}::before`, 'max-width: 767px')['content']).toBe('none');
    expect(collect(root, `${BODY} .s-modal-header::before`, 'max-width: 767px')['content']).toContain('مرحبًا');
    expect(
      collect(root, `html[dir=ltr] salla-modal.s-login-modal[visible] .s-modal-body.s-modal-xs.s-modal-align-middle .s-modal-header::before`, 'max-width: 767px')['content']
    ).toContain('Hello');
  });

  it('keeps a 44px close control and kills the entrance motion for reduced motion', async () => {
    const root = await compile();
    const close = collect(root, `${BODY} .s-modal-close`);
    expect(close['width']).toContain('44px');
    expect(close['height']).toContain('44px');
    expect(close['border-radius']).toContain('999px');
    expect(collect(root, BODY, 'prefers-reduced-motion: reduce')['animation']).toBe('none !important');
  });
});
