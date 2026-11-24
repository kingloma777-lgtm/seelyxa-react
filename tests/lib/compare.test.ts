import { describe, it, expect, beforeEach } from 'vitest';
import {
  COMPARE_MAX,
  addToCompare,
  clearCompare,
  compareItemFromProduct,
  getCompareItems,
  isCompared,
  removeFromCompare,
  toggleCompare,
  type CompareItem,
} from '../../app/lib/compare';
import type { Product } from '@salla.sa/twilight-theme-engine/types';

/**
 * The comparison list is the compare button's whole function: if this file's
 * rules are wrong, the button is a decoration. Four rules matter — add once,
 * toggle off, cap at four by dropping the OLDEST, and survive a reload.
 */

const item = (id: number): CompareItem => ({
  id,
  name: `Product ${id}`,
  url: `/p/${id}`,
  image: '',
  price: 100,
  regularPrice: null,
  isOnSale: false,
  brand: '',
  stars: 0,
  reviews: 0,
  outOfStock: false,
});

beforeEach(() => {
  clearCompare();
  localStorage.clear();
});

describe('compare store', () => {
  it('adds a product once, however many times the button is pressed', () => {
    addToCompare(item(1));
    addToCompare(item(1));
    expect(getCompareItems()).toHaveLength(1);
    expect(isCompared(1)).toBe(true);
  });

  it('toggles a product out again', () => {
    addToCompare(item(1));
    expect(toggleCompare(item(1))).toBe('removed');
    expect(isCompared(1)).toBe(false);
    expect(toggleCompare(item(1))).toBe('added');
    expect(isCompared(1)).toBe(true);
  });

  it('removes by id, and ignores an id that is not there', () => {
    addToCompare(item(1));
    addToCompare(item(2));
    removeFromCompare(1);
    expect(getCompareItems().map((entry) => entry.id)).toEqual([2]);
    removeFromCompare(99);
    expect(getCompareItems()).toHaveLength(1);
  });

  it(`caps at ${COMPARE_MAX} by dropping the OLDEST, never the newest`, () => {
    [1, 2, 3, 4, 5].forEach((id) => addToCompare(item(id)));
    expect(getCompareItems().map((entry) => entry.id)).toEqual([2, 3, 4, 5]);
  });

  it('persists the selection so a reload keeps it', () => {
    addToCompare(item(7));
    const raw = localStorage.getItem('seelyxa::compare');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw as string)[0].id).toBe(7);
  });

  it('clears everything', () => {
    addToCompare(item(1));
    addToCompare(item(2));
    clearCompare();
    expect(getCompareItems()).toHaveLength(0);
  });
});

describe('compareItemFromProduct', () => {
  const base = { id: 5, name: 'Dress', url: '/p/5', image: { url: 'a.jpg' } } as unknown as Product;

  it('reads the sale price as the price, with the original beside it', () => {
    const row = compareItemFromProduct({ ...base, price: 200, sale_price: 80, is_on_sale: true } as Product);
    expect(row?.price).toBe(80);
    expect(row?.regularPrice).toBe(200);
    expect(row?.isOnSale).toBe(true);
  });

  it('refuses a sale flag with no real discount', () => {
    const row = compareItemFromProduct({ ...base, price: 200, sale_price: 200, is_on_sale: true } as Product);
    expect(row?.price).toBe(200);
    expect(row?.regularPrice).toBeNull();
    expect(row?.isOnSale).toBe(false);
  });

  it('accepts a string price from a list payload', () => {
    const row = compareItemFromProduct({ ...base, price: '149.5', sale_price: null } as unknown as Product);
    expect(row?.price).toBe(149.5);
  });

  it('carries the brand, the score and the stock state', () => {
    const row = compareItemFromProduct({
      ...base,
      brand: { name: 'دار عود' },
      rating: { stars: 4.6, count: 12 },
      is_out_of_stock: true,
    } as unknown as Product);
    expect(row?.brand).toBe('دار عود');
    expect(row?.stars).toBe(4.6);
    expect(row?.reviews).toBe(12);
    expect(row?.outOfStock).toBe(true);
  });

  it('returns nothing for a product without an id', () => {
    expect(compareItemFromProduct(undefined)).toBeNull();
    expect(compareItemFromProduct({ name: 'x' } as unknown as Product)).toBeNull();
  });
});
