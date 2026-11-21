import React, { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { CategoryHero } from '../../../app/components/home/selia/CategoryHero';

/**
 * «تصنيفات مميزة مع خلفية» — the editorial split redesign.
 *
 * The contracts worth pinning down are the ones that made the old block look
 * cheap and the ones that are expensive to debug on a live store:
 *
 *  - type lives on a solid plane, NEVER on the merchant's photograph;
 *  - the caption is the picker's LABEL, not its url;
 *  - the prefixed field id beats the short seed alias;
 *  - a cleared copy field stays cleared instead of resurrecting the seed text;
 *  - an empty block renders nothing at all.
 */

const PICK = (label: string, value: string) => [{ label, value, key: value }];

const row = (image: string, label: string, value: string) => ({
  'hero_categories.image': image,
  'hero_categories.category': PICK(label, value),
});

const data = (overrides: Record<string, unknown> = {}) => ({
  cathero_background: '/reference/oryzo-hero.jpg',
  cathero_title: 'تسوّق حسب التصنيف',
  cathero_headline: 'كل البيت، في مكان واحد',
  cathero_subtitle: 'اختر التصنيف الذي يشبه ذوقك.',
  cathero_cta_label: 'كل التصنيفات',
  cathero_cta_link: '/categories',
  hero_categories: [
    row('/reference/categories/home-seating.jpg', 'أثاث', '/categories/1'),
    row('/reference/categories/home-art.jpg', 'ديكور', '/categories/2'),
    row('/reference/categories/home-lighting.jpg', 'إضاءة', '/categories/3'),
  ],
  ...overrides,
});

const one = (sel: string, root: ParentNode) => root.querySelector<HTMLElement>(sel);
const all = (sel: string, root: ParentNode) =>
  Array.from(root.querySelectorAll<HTMLElement>(sel));

describe('CategoryHero — editorial split', () => {
  it('puts all the type on the ink colophon and leaves the photograph clean', () => {
    const { container } = render(<CategoryHero data={data()} />);

    expect(one('.selia--cathero', container)).not.toBeNull();
    const colophon = one('.selia-cathero__colophon', container);
    const scene = one('.selia-cathero__scene', container);
    expect(colophon).not.toBeNull();
    expect(scene).not.toBeNull();

    expect(one('.selia-cathero__headline', colophon!)?.textContent).toBe(
      'كل البيت، في مكان واحد'
    );
    expect(one('.selia-cathero__lede', colophon!)?.textContent).toBe(
      'اختر التصنيف الذي يشبه ذوقك.'
    );
    // No gradient veil, no caption, no heading sitting on the picture.
    expect(scene!.textContent).toBe('');

    const bg = one('.selia-cathero__bg', scene!);
    expect(bg?.getAttribute('src')).toBe('/reference/oryzo-hero.jpg');
    expect(bg?.getAttribute('alt')).toBe('');
    expect(bg?.getAttribute('aria-hidden')).toBe('true');
  });

  it('uses defaults only for absent fields, and keeps a cleared field cleared', () => {
    const withDefaults = render(
      <CategoryHero data={{ cathero_background: '/bg.jpg' }} />
    ).container;
    expect(one('.selia-cathero__eyebrow', withDefaults)?.textContent).toBe(
      'مجموعات مختارة'
    );
    expect(one('.selia-cathero__headline', withDefaults)?.textContent).toBe(
      'كل البيت، في مكان واحد'
    );
    expect(one('.selia-cathero__lede', withDefaults)).not.toBeNull();

    const cleared = render(
      <CategoryHero
        data={{
          cathero_background: '/bg.jpg',
          cathero_eyebrow: '',
          cathero_headline: '',
          cathero_subtitle: '',
          cathero_title: '',
          cathero_cta_label: '',
        }}
      />
    ).container;
    expect(one('.selia-cathero__eyebrow', cleared)).toBeNull();
    expect(one('.selia-cathero__headline', cleared)).toBeNull();
    expect(one('.selia-cathero__lede', cleared)).toBeNull();
    expect(one('.selia-cathero__title', cleared)).toBeNull();
    expect(one('.selia-cathero__cta', cleared)).toBeNull();
    // The header still carries the ruled count even without a heading.
    expect(one('.selia-cathero__count-num', cleared)?.textContent).toBe('00');
  });

  it('lets the merchant field id win over the short seed alias', () => {
    const { container } = render(
      <CategoryHero
        data={data({
          title: 'عنوان البذرة',
          background: '/seed.jpg',
          headline: 'عنوان البذرة',
          hero_categories: undefined,
        })}
      />
    );
    expect(one('.selia-cathero__title', container)?.textContent).toBe(
      'تسوّق حسب التصنيف'
    );
    expect(one('.selia-cathero__headline', container)?.textContent).toBe(
      'كل البيت، في مكان واحد'
    );
    expect(one('.selia-cathero__bg', container)?.getAttribute('src')).toBe(
      '/reference/oryzo-hero.jpg'
    );
  });

  it('links each tile to the picked category and captions it with the picker label', () => {
    const { container } = render(<CategoryHero data={data()} />);
    const tiles = all('.selia-cathero__tile', container);
    expect(tiles.length).toBe(3);

    const links = all('a.selia-cathero__tile-link', container);
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/categories/1',
      '/categories/2',
      '/categories/3',
    ]);
    const names = all('.selia-cathero__name', container).map((n) => n.textContent);
    expect(names).toEqual(['أثاث', 'ديكور', 'إضاءة']);
    // The classic picker bug: reading value[0] as the caption prints a url.
    expect(names.join(' ')).not.toContain('/categories/');

    expect(one('.selia-cathero__tiles', container)?.getAttribute('aria-label')).toBe(
      'تسوّق حسب التصنيف'
    );
  });

  it('numbers the cards and publishes a zero-padded count for the ghost index', () => {
    const { container } = render(<CategoryHero data={data()} />);
    const block = one('.selia-cathero', container)!;
    expect(block.style.getPropertyValue('--cathero-count')).toBe('03');
    expect(one('.selia-cathero__count-num', container)?.textContent).toBe('03');
    expect(one('.selia-cathero__ghost', container)?.textContent).toBe('03');
    expect(one('.selia-cathero__ghost', container)?.getAttribute('aria-hidden')).toBe(
      'true'
    );

    const numbers = all('.selia-cathero__num', container);
    expect(numbers.map((n) => n.textContent)).toEqual(['01', '02', '03']);
    expect(numbers.every((n) => n.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('drops rows with neither an image nor a category instead of printing dead cards', () => {
    const { container } = render(
      <CategoryHero
        data={data({
          hero_categories: [
            row('/a.jpg', 'أثاث', '/categories/1'),
            { 'hero_categories.title': 'صف فارغ' },
            { 'hero_categories.image': '' },
            { 'hero_categories.category': PICK('إضاءة', '/categories/3') },
          ],
        })}
      />
    );
    expect(all('.selia-cathero__tile', container).length).toBe(2);
    // A link-only row still renders, with a neutral frame rather than a broken img.
    expect(one('.selia-cathero__fallback', container)).not.toBeNull();
    expect(all('.selia-cathero__frame img', container).length).toBe(1);
  });

  it('accepts the editor row shapes: a JSON string and a keyed object', () => {
    const rows = [row('/a.jpg', 'أثاث', '/categories/1')];
    const asString = render(
      <CategoryHero data={data({ hero_categories: JSON.stringify(rows) })} />
    ).container;
    expect(all('.selia-cathero__tile', asString).length).toBe(1);

    const asKeyed = render(
      <CategoryHero data={data({ hero_categories: { 0: rows[0] } })} />
    ).container;
    expect(all('.selia-cathero__tile', asKeyed).length).toBe(1);
  });

  it('loads the first card eagerly and defers the rest', () => {
    const { container } = render(<CategoryHero data={data()} />);
    expect(
      all('.selia-cathero__frame img', container).map((img) =>
        img.getAttribute('loading')
      )
    ).toEqual(['eager', 'lazy', 'lazy']);
  });

  it('switches the mobile snap rail with cathero_compact_mobile', () => {
    const compact = render(<CategoryHero data={data()} />).container;
    expect(one('.selia-cathero--compact', compact)).not.toBeNull();

    const stacked = render(
      <CategoryHero data={data({ cathero_compact_mobile: false })} />
    ).container;
    expect(one('.selia-cathero--compact', stacked)).toBeNull();
  });

  it('falls back to a centred no-background colophon when no photo is uploaded', () => {
    const { container } = render(
      <CategoryHero data={data({ cathero_background: '' })} />
    );
    expect(one('.selia-cathero--no-bg', container)).not.toBeNull();
    expect(one('.selia-cathero__bg', container)).toBeNull();
    expect(all('.selia-cathero__tile', container).length).toBe(3);
  });

  it('renders nothing at all when there is neither a photo nor a tile', () => {
    const { container } = render(
      <CategoryHero data={{ cathero_background: '', hero_categories: [] }} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the CTA only when labelled and marks external targets', () => {
    const internal = render(<CategoryHero data={data()} />).container;
    const cta = one('.selia-cta', internal)!;
    expect(cta.getAttribute('href')).toBe('/categories');
    expect(cta.hasAttribute('rel')).toBe(false);

    const external = render(
      <CategoryHero
        data={data({ cathero_cta_link: 'https://example.com/categories' })}
      />
    ).container;
    const out = one('.selia-cta', external)!;
    expect(out.getAttribute('target')).toBe('_blank');
    expect(out.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('gives every image-backed card a hover preview layer in the photo plate', () => {
    const { container } = render(<CategoryHero data={data()} />);
    const scene = one('.selia-cathero__scene', container)!;
    const previews = all('.selia-cathero__preview', scene);

    expect(previews.map((p) => p.getAttribute('data-index'))).toEqual([
      '1',
      '2',
      '3',
    ]);
    expect(previews.map((p) => p.getAttribute('src'))).toEqual([
      '/reference/categories/home-seating.jpg',
      '/reference/categories/home-art.jpg',
      '/reference/categories/home-lighting.jpg',
    ]);
    expect(previews.every((p) => p.getAttribute('alt') === '')).toBe(true);
    expect(previews.every((p) => p.getAttribute('aria-hidden') === 'true')).toBe(
      true
    );
    // The plate still carries no text: the whole "no type on the photo" rule.
    expect(scene.textContent).toBe('');

    const sparse = render(
      <CategoryHero
        data={data({
          hero_categories: [
            row('/a.jpg', 'أثاث', '/categories/1'),
            { 'hero_categories.category': PICK('إضاءة', '/categories/3') },
          ],
        })}
      />
    ).container;
    expect(all('.selia-cathero__preview', sparse).length).toBe(1);
  });

  it('keeps the numeric folios LTR inside an RTL page so 01 — 04 does not flip', () => {
    const { container } = render(<CategoryHero data={data()} />);
    const shelfFolio = one('.selia-cathero__shelf-folio', container)!;
    expect(shelfFolio.getAttribute('dir')).toBe('ltr');
    expect(shelfFolio.textContent).toBe('01 — 03');

    const numeric = one('.selia-cathero__folio span[dir]', container)!;
    expect(numeric.getAttribute('dir')).toBe('ltr');
    expect(numeric.textContent).toBe('01 — 03');
  });

  it('accepts the manifest ceiling of eight categories without losing a card', () => {
    const eight = Array.from({ length: 8 }, (_, i) =>
      row(`/c${i + 1}.jpg`, `تصنيف ${i + 1}`, `/categories/${i + 1}`)
    );
    const { container } = render(
      <CategoryHero data={data({ hero_categories: eight })} />
    );
    expect(all('.selia-cathero__tile', container).length).toBe(8);
    expect(all('.selia-cathero__preview', container).length).toBe(8);
    expect(one('.selia-cathero__count-num', container)?.textContent).toBe('08');
    // The :has() rules only reach 8; the stylesheet and the manifest must
    // agree or the ninth (impossible) row would have a dead hover.
    expect(all('.selia-cathero__num', container).at(-1)?.textContent).toBe('08');
  });

  it('tints only the last word of the headline without changing its text', () => {
    const { container } = render(<CategoryHero data={data()} />);
    const headline = one('.selia-cathero__headline', container)!;
    expect(headline.textContent).toBe('كل البيت، في مكان واحد');
    expect(one('.selia-cathero__accent-word', headline)?.textContent).toBe('واحد');

    const oneWord = render(
      <CategoryHero data={data({ cathero_headline: 'المجموعات' })} />
    ).container;
    expect(one('.selia-cathero__headline', oneWord)?.textContent).toBe('المجموعات');
    expect(one('.selia-cathero__accent-word', oneWord)).toBeNull();
  });

  it('hydrates its own server HTML without a mismatch warning', async () => {
    /* React logs hydration problems via console.error rather than throwing,
       and an exact HTML string comparison is wrong here: React 19 emits a
       preload <link> for the eager first photo and reorders img attributes
       between the server and client render. Hydration is the real contract. */
    const element = <CategoryHero data={data()} />;
    const html = renderToString(element);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    const messages: string[] = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      messages.push(args.map(String).join(' '));
    });
    let root!: Root;
    await act(async () => {
      root = hydrateRoot(container, element);
    });
    spy.mockRestore();

    const noise = /hydrat|did not match|server-rendered html|expected server html/i;
    expect(messages.filter((message) => noise.test(message))).toEqual([]);
    expect(container.querySelectorAll('.selia-cathero__tile')).toHaveLength(3);
    expect(container.querySelector('.selia-cathero__headline')?.textContent).toBe(
      'كل البيت، في مكان واحد'
    );

    await act(async () => root.unmount());
    container.remove();
  });
});
