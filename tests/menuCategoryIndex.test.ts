import { describe, expect, it } from 'vitest';
import type { Category } from '@salla.sa/twilight-theme-engine/types';
import {
  buildCategoryIndex,
  enrichMenuNode,
  matchMenuNode,
  normalizeTitle,
} from '../app/lib/menuCategoryIndex';
import type { CurtainMenu } from '../app/components/layout/MorphCurtain';

/* Fixtures measured against the live store (1510890315): the categories carry
   flat image urls and a raw numeric `id_`; exact values are immaterial, the
   shapes and the matching are what the curtain depends on. */
const tree: Category[] = [
  {
    id: 'VPnDXm',
    id_: 600759148,
    name: 'المنزل',
    url: 'https://x/المنزل/c600759148',
    icon: null,
    image: 'https://cdn.salla.sa/home.jpg',
    sub_categories: [
      {
        id: 'evbVAK',
        id_: 1683407280,
        name: 'غرفة الجلوس',
        url: 'https://x/غرفة-الجلوس/c1683407280',
        icon: null,
        image: 'https://cdn.salla.sa/seating.jpg',
        sub_categories: [],
        items: null,
      },
    ],
    items: null,
  },
  {
    id: 'QlayPG',
    id_: 1309167683,
    name: 'اكسسورات',
    url: 'https://x/اكسسورات/c1309167683',
    icon: 'sicon-store',
    image: 'https://cdn.salla.sa/accessories.jpg',
    sub_categories: [],
    /* the API doubles a parent's children under `items` as well */
    items: [
      {
        id: 'evbOyd',
        id_: 466976588,
        name: 'هداياهدايا',
        url: 'https://x/هدايا/c466976588',
        image: 'https://cdn.salla.sa/gifts.jpg',
      },
    ],
  },
];

const index = buildCategoryIndex(tree);

const node = (over: Partial<CurtainMenu>): CurtainMenu => ({
  id: 2118102026,
  title: '',
  url: 'https://x/',
  ...over,
});

describe('normalizeTitle', () => {
  it('unifies alef variants, teh marbuta, diacritics and whitespace', () => {
    expect(normalizeTitle('الأَزْيَاء')).toBe('الازياء');
    expect(normalizeTitle('الأزياء')).toBe(normalizeTitle('الازياء'));
    expect(normalizeTitle('طعّام ة')).toBe('طعام ه');
    expect(normalizeTitle('  تجربة   عنصر ')).toBe('تجربه عنصر');
    expect(normalizeTitle(null)).toBe('');
  });
});

describe('buildCategoryIndex', () => {
  it('indexes mains and subs from both child arrays', () => {
    expect(matchMenuNode(index, { title: 'المنزل' }, 1)?.image).toBe('https://cdn.salla.sa/home.jpg');
    expect(matchMenuNode(index, { title: 'غرفة الجلوس' }, 2)?.image).toBe('https://cdn.salla.sa/seating.jpg');
    expect(matchMenuNode(index, { title: 'هداياهدايا' }, 2)?.id).toBe(466976588);
  });

  it('matches glyph-blind', () => {
    expect(matchMenuNode(index, { title: 'اكسسورات' }, 1)).toBeTruthy();
    expect(matchMenuNode(index, { title: 'gdah' }, 1)).toBeNull();
  });
});

describe('matchMenuNode', () => {
  it('wrong on level, right on the fallback map (a sub named at the root)', () => {
    const hint = matchMenuNode(index, { title: 'غرفة الجلوس' }, 1);
    expect(hint?.id).toBe(1683407280);
    expect(matchMenuNode(index, { title: '' })).toBeNull();
  });
});

describe('enrichMenuNode', () => {
  it('fills image and categoryId from the matched category', () => {
    const out = enrichMenuNode(
      node({ title: 'غرفة الجلوس', image: '', children: [] }),
      index
    );
    expect(out.image).toBe('https://cdn.salla.sa/seating.jpg');
    expect(out.categoryId).toBe(1683407280);
  });

  it('the merchant\'s own image wins and a no-match row stays honest', () => {
    const mine = node({
      title: 'غرفة الجلوس',
      image: 'https://cdn.salla.sa/mine.jpg',
      children: [],
    });
    const withMine = enrichMenuNode(mine, index);
    expect(withMine.image).toBe('https://cdn.salla.sa/mine.jpg');
    /* categoryId still arrives — the featured rectangle uses it by itself */
    expect(withMine.categoryId).toBe(1683407280);

    const stray = node({ title: 'تجربة عناصر ٤', image: '', children: [] });
    const unmatched = enrichMenuNode(stray, index);
    expect(unmatched.image).toBeNull();
    expect(unmatched.categoryId).toBeNull();
  });

  it('an id of a hashed string (id_ missing) becomes null, never the hash', () => {
    const hashed = buildCategoryIndex([
      {
        id: 'QlayPG',
        name: 'اكسسورات',
        url: 'https://x/c1',
        image: 'https://cdn.salla.sa/accessories.jpg',
      },
    ]);
    const out = enrichMenuNode(
      node({ title: 'اكسسورات', image: null, children: [] }),
      hashed
    );
    expect(out.image).toBe('https://cdn.salla.sa/accessories.jpg');
    expect(out.categoryId).toBeNull();
  });

  it('does not mutate the source node', () => {
    const src = node({ title: 'غرفة الجلوس', image: '', children: [] });
    enrichMenuNode(src, index);
    expect(src.image).toBe('');
    expect((src as { categoryId?: unknown }).categoryId).toBeUndefined();
  });
});
