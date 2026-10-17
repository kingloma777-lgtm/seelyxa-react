import { describe, it, expect } from 'vitest';
import {
  activeSlot,
  fallbackSlot,
  idFromUrl,
  imgSrc,
  keysFromText,
  pickerValue,
  productIdFromUrl,
  readSlots,
  rowsFrom,
  scalar,
  slotKey,
  slotKeys,
  slotRenderable,
  type CurtainSlot,
} from '../../app/lib/curtainSlots';
import type { CurtainNodeLike } from '../../app/lib/curtainSlots';

describe('slotKey', () => {
  it('strips protocol, www, query/hash and trailing slash, lowercased', () => {
    expect(slotKey('https://www.Store.sa/ar/cat-5/')).toBe('store.sa/ar/cat-5');
    expect(slotKey('store.sa/Cat?id=9#x')).toBe('store.sa/cat');
    expect(slotKey('')).toBe('');
    expect(slotKey(null)).toBe('');
  });
});

describe('idFromUrl', () => {
  it('takes the last numeric run in the path', () => {
    expect(idFromUrl('/ar/cat-5/slugs-2-3?x=1')).toBe('3');
    expect(idFromUrl('/plain-name')).toBe('');
  });
});

describe('pickerValue / scalar', () => {
  it('flattens arrays of picker objects — NOT the array itself', () => {
    const picker = [{ label: 'فئة', value: 'store.sa/cat-7', key: 'k1' }];
    // `key` is not one of the flattened picker shapes — value and label are
    expect(pickerValue(picker)).toEqual(['store.sa/cat-7', 'فئة']);
    expect(scalar(picker)).toBe('store.sa/cat-7');
  });

  it('dedupes and skips empties across nesting', () => {
    const value = [
      { value: 'a', label: 'b' },
      'a',
      ['', null],
      'b',
    ];
    expect(pickerValue(value)).toEqual(['a', 'b']);
  });
});

describe('keysFromText / slotKeys', () => {
  it('keys a picker url as url + tail + id', () => {
    expect(keysFromText('store.sa/ar/cat-5')).toEqual([
      'store.sa/ar/cat-5',
      'tail:cat-5',
      'id:5',
    ]);
  });

  it('keys a bare numeric id', () => {
    // the normalised text survives too — a bare id keyed under its own text
    expect(keysFromText('42')).toEqual(['42', 'id:42']);
  });

  it('keys a plain name as its normalised text', () => {
    expect(keysFromText('العائلة')).toEqual(['العائلة']);
  });

  it('slotKeys unions the shapes of a whole picker array', () => {
    expect(slotKeys(['store.sa/ar/cat-5', { id: 9 }])).toEqual([
      'store.sa/ar/cat-5',
      'tail:cat-5',
      'id:5',
      '9',
      'id:9',
    ]);
    expect(slotKeys('')).toEqual([]);
  });
});

describe('imgSrc', () => {
  it('reads a url, a builder object, or a picker array — all three', () => {
    expect(imgSrc('https://cdn.store/i.png')).toBe('https://cdn.store/i.png');
    expect(imgSrc({ url: 'u', small_url: 's', alt: 'a' })).toBe('u');
    expect(imgSrc({ small_url: 's' })).toBe('s');
    expect(imgSrc([{ value: null, url: 'u' }])).toBe('u');
    expect(imgSrc(undefined)).toBe('');
    expect(imgSrc({})).toBe('');
  });
});

describe('rowsFrom', () => {
  it('takes an array as-is', () => {
    const rows = [{ category: 'a' }];
    expect(rowsFrom(rows)).toEqual(rows);
  });

  it('parses a JSON string, and keeps a broken string empty (not a crash)', () => {
    expect(rowsFrom('[{"category":"a"}]')).toEqual([{ category: 'a' }]);
    expect(rowsFrom('not json')).toEqual([]);
  });

  it('unwraps a single row handed back unwrapped', () => {
    const row = { 'curtain_slots.category': { value: 'a' } };
    expect(rowsFrom(row)).toEqual([row]);
  });

  it('unwraps one wrapper key holding the real list', () => {
    const wrapped = { rows: [{ category: 'a' }] };
    expect(rowsFrom(wrapped)).toEqual([{ category: 'a' }]);
  });

  it('unwraps rows keyed by index or generated id', () => {
    const indexed = { r1: { category: 'a' }, r2: { category: 'b' } };
    expect(rowsFrom(indexed)).toEqual([{ category: 'a' }, { category: 'b' }]);
  });

  it('rejects scalars and empty shapes', () => {
    expect(rowsFrom(7)).toEqual([]);
    expect(rowsFrom({})).toEqual([]);
    expect(rowsFrom(null)).toEqual([]);
  });
});

const imageSlot = (extras: Partial<CurtainSlot> = {}): CurtainSlot => ({
  type: 'image',
  product: '',
  image: 'slot.png',
  title: 'صورة',
  ...extras,
});
const productSlot = (extras: Partial<CurtainSlot> = {}): CurtainSlot => ({
  type: 'product',
  product: '/p1234',
  image: '',
  title: '',
  ...extras,
});

describe('readSlots', () => {
  it('files one row under EVERY candidate key, short names first', () => {
    const map = readSlots([
      { category: [{ value: 'https://store.sa/Cat-5/' }], type: [{ value: 'image' }], image: 'x.png', title: 'صورة' },
    ]);
    expect(map.get('store.sa/cat-5')).toEqual(imageSlot({ image: 'x.png' }));
    expect(map.get('tail:cat-5')).toBe(map.get('store.sa/cat-5'));
    expect(map.get('id:5')).toBe(map.get('store.sa/cat-5'));
    // the count is unique VALUES, never map.size
    expect(map.size).toBe(3);
    expect(new Set(map.values()).size).toBe(1);
  });

  it('falls back to the prefixed field ids when the row is prefixed', () => {
    const map = readSlots([
      {
        'curtain_slots.category': [{ value: '42' }],
        'curtain_slots.type': [{ value: 'product' }],
        'curtain_slots.product': [{ value: 'store.sa/p1234' }],
      },
    ]);
    expect(map.get('id:42')).toEqual(
      productSlot({ product: 'store.sa/p1234' })
    );
  });

  it('first row wins on a duplicated category — no flicker', () => {
    const map = readSlots([
      { category: '55', type: 'image', image: 'first.png' },
      { category: '55', type: 'image', image: 'second.png' },
    ]);
    expect(map.get('id:55')).toEqual({
      type: 'image',
      product: '',
      image: 'first.png',
      title: '',
    });
  });

  it('untyped rows default to product', () => {
    const map = readSlots([{ category: '55', product: 'x' }]);
    expect(map.get('id:55')?.type).toBe('product');
  });

  it('drops rows with no category key at all', () => {
    expect(readSlots([{ type: 'image', image: 'x.png' }]).size).toBe(0);
    expect(readSlots([]).size).toBe(0);
    expect(readSlots(undefined).size).toBe(0);
  });
});

describe('activeSlot', () => {
  const menu: CurtainNodeLike = {
    id: 5,
    url: 'store.sa/cat-5',
    title: 'التصنيف',
    children: [
      { id: 51, url: 'store.sa/cat-5/kids', title: 'الفروع' },
      { id: 52, url: 'store.sa/cat-5/other', title: 'آخر' },
    ],
  };
  const mapSlots = (entry: Record<string, CurtainSlot>) => {
    const map = new Map<string, CurtainSlot>();
    Object.entries(entry).forEach(([key, slot]) => map.set(key, slot));
    return map;
  };
  const focus51 = menu.children![0];

  it('resolves on the focused subcategory first', () => {
    const map = mapSlots({ 'id:51': imageSlot({ image: 'sub.png' }) });
    expect(activeSlot(map, menu, focus51)?.image).toBe('sub.png');
  });

  it('falls back to the main category, then its children', () => {
    const map = mapSlots({ 'id:5': imageSlot({ image: 'main.png' }) });
    expect(activeSlot(map, menu, focus51)?.image).toBe('main.png');
  });

  it('the main category wins over one of its children', () => {
    const map = mapSlots({
      'id:52': imageSlot({ image: 'kid2.png' }),
      'id:5': imageSlot({ image: 'main.png' }),
    });
    expect(activeSlot(map, menu, null)?.image).toBe('main.png');
  });

  it('stays null on an empty map or unmatched nodes', () => {
    expect(activeSlot(new Map(), menu, focus51)).toBeNull();
    expect(activeSlot(mapSlots({ 'id:999': imageSlot() }), menu, null)).toBeNull();
  });
});

describe('slotRenderable / fallbackSlot', () => {
  it('an image needs a source, a product needs an id', () => {
    expect(slotRenderable(imageSlot())).toBe(true);
    expect(slotRenderable(imageSlot({ image: '' }))).toBe(false);
    expect(slotRenderable(productSlot())).toBe(true);
    expect(slotRenderable(productSlot({ product: '' }))).toBe(false);
  });

  it('the fallback draws renderable rows only', () => {
    const map = readSlots([
      { category: '1', type: 'image' }, // no source — malformed, skipped
      { category: '2', type: 'image', image: 'ok.png' },
    ]);
    expect(fallbackSlot(map)).toEqual({
      type: 'image',
      product: '',
      image: 'ok.png',
      title: '',
    });
  });

  it('a map of only malformed rows falls back to NOTHING (honest empty)', () => {
    const map = readSlots([{ category: '1', type: 'image' }]);
    expect(fallbackSlot(map)).toBeNull();
  });
});

describe('productIdFromUrl', () => {
  it('reads the /p<digits> run only', () => {
    expect(productIdFromUrl('https://store.sa/p12345')).toBe('12345');
    expect(productIdFromUrl('store.sa/ar/big-product-160')).toBe('');
    expect(productIdFromUrl('')).toBe('');
  });
});
