import { describe, it, expect } from 'vitest';
import { menuProductIds } from '../../app/lib/menuProducts';

/* The regression this guards: `menus/header` answers `products: ""` for every
   node without featured picks, and `(node.products ?? []).filter` threw on it —
   the curtain's error boundary then replaced the whole storefront. */
describe('menuProductIds', () => {
  it('the empty string is no picks — never a throw', () => {
    expect(menuProductIds('')).toEqual([]);
    expect(menuProductIds('   ')).toEqual([]);
  });

  it('an array of ids passes through (numeric or numeric strings)', () => {
    expect(menuProductIds([7, 8, 9])).toEqual([7, 8, 9]);
    expect(menuProductIds(['7', '8'])).toEqual([7, 8]);
  });

  it('nested arrays are flattened', () => {
    expect(menuProductIds([[7], [8, [9]]])).toEqual([7, 8, 9]);
  });

  it('a comma / whitespace separated string is split', () => {
    expect(menuProductIds('7,8,9')).toEqual([7, 8, 9]);
    expect(menuProductIds('7 8')).toEqual([7, 8]);
  });

  it('a JSON string is parsed, and a broken one degrades to the split', () => {
    expect(menuProductIds('[7,8]')).toEqual([7, 8]);
    expect(menuProductIds('[oops')).toEqual([]);
  });

  it('a picker-shaped object reads its value/id', () => {
    expect(menuProductIds({ value: '7' })).toEqual([7]);
    expect(menuProductIds([{ value: 7 }])).toEqual([7]);
  });

  it('a bare number works', () => {
    expect(menuProductIds(7)).toEqual([7]);
  });

  it('anything unusable is no picks', () => {
    expect(menuProductIds(undefined)).toEqual([]);
    expect(menuProductIds(null)).toEqual([]);
    expect(menuProductIds('abc')).toEqual([]);
    expect(menuProductIds([null, '', 'x'])).toEqual([]);
    expect(menuProductIds(0)).toEqual([]);
    expect(menuProductIds(-3)).toEqual([]);
  });
});
