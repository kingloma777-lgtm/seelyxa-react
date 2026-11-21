import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { StampStory, stampStoryRunClass } from '../../../app/components/home/StampStory';

/* The block is photos + motion only. These tests pin the two things that are
   easy to break by accident: the reference's fixed chrome never comes back,
   and the block degrades to something sensible with 0, 1 or 2 stamps. */

const stamp = (image: string, name = '', header = 'SEELYXA', symbol = 'S') => ({
  image,
  name,
  header,
  symbol,
});

describe('StampStory', () => {
  beforeEach(() => {
    /* jsdom has no matchMedia; the component treats "reduce" as the default
       path when it is missing, which is the branch these tests exercise. */
    vi.stubGlobal('matchMedia', undefined);
  });

  it('renders one card per stamp with its image', () => {
    const { container } = render(
      <StampStory
        data={{
          stamps: [
            stamp('/a.jpg', 'One'),
            stamp('/b.jpg', 'Two'),
            stamp('/c.jpg', 'Three'),
          ],
        }}
      />
    );

    const cards = container.querySelectorAll('.stamp-story__card');
    expect(cards.length).toBe(3);
    expect(container.querySelectorAll('.stamp-story__image').length).toBe(3);
    expect(container.querySelector('.stamp-story__image')?.getAttribute('src')).toBe('/a.jpg');
  });

  it('renders no fixed UI chrome — no index bar, no coordinate line', () => {
    const { container } = render(
      <StampStory data={{ stamps: [stamp('/a.jpg', 'One'), stamp('/b.jpg', 'Two')] }} />
    );

    expect(container.querySelector('.ui')).toBeNull();
    expect(container.querySelector('.ui-top')).toBeNull();
    expect(container.querySelector('.ui-bottom')).toBeNull();
    expect(container.textContent).not.toMatch(/N 45/);
  });

  it('draws the trail only when there is somewhere to travel', () => {
    const one = render(<StampStory data={{ stamps: [stamp('/a.jpg')] }} />);
    expect(one.container.querySelector('.stamp-story__trail')).toBeNull();
    one.unmount();

    const two = render(
      <StampStory data={{ stamps: [stamp('/a.jpg'), stamp('/b.jpg')] }} />
    );
    const path = two.container.querySelector('.stamp-story__trail-dots')?.getAttribute('d');
    expect(path).toMatch(/^M 500 520/);
    /* the generated path has to END on the last stamp, never past it */
    expect(path?.endsWith('1200 1040')).toBe(true);
  });

  it('meanders between the stamps instead of dropping in a straight line', () => {
    const { container } = render(
      <StampStory data={{ stamps: [stamp('/a.jpg'), stamp('/b.jpg')] }} />
    );
    const d = container.querySelector('.stamp-story__trail-dots')?.getAttribute('d') ?? '';

    /* every coordinate pair in the path, control points included */
    const numbers = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    const points: Array<[number, number]> = [];
    for (let i = 0; i + 1 < numbers.length; i += 2) {
      points.push([numbers[i], numbers[i + 1]]);
    }

    /* perpendicular distance from the straight chord between the two stamps:
       a ruled line scores 0, the meander has to score well clear of it */
    const [ax, ay] = [500, 520];
    const [bx, by] = [1200, 1040];
    const length = Math.hypot(bx - ax, by - ay);
    const bulge = Math.max(
      ...points.map(([x, y]) => Math.abs((bx - ax) * (ay - y) - (ax - x) * (by - ay)) / length)
    );

    expect(points.length).toBeGreaterThan(10);
    expect(bulge).toBeGreaterThan(80);
  });

  it('renders nothing without usable images', () => {
    const empty = render(<StampStory data={{ stamps: [] }} />);
    expect(empty.container.firstChild).toBeNull();
    empty.unmount();

    const blank = render(<StampStory data={{ stamps: [{ name: 'no image' }] }} />);
    expect(blank.container.firstChild).toBeNull();
  });

  it('writes the handwritten name only when the merchant gave one', () => {
    const { container } = render(
      <StampStory data={{ stamps: [stamp('/a.jpg', 'المحطة الأولى'), stamp('/b.jpg', '')] }} />
    );

    const names = container.querySelectorAll('.stamp-story__hw');
    expect(names.length).toBe(1);
    expect(names[0].textContent).toBe('المحطة الأولى');
  });

  it('applies the merchant colours as CSS variables', () => {
    const { container } = render(
      <StampStory
        data={{
          stamps: [stamp('/a.jpg')],
          trail_color: '#ff0000',
          paper_color: '#111111',
          bg_color: '#222222',
        }}
      />
    );

    const root = container.querySelector('.stamp-story') as HTMLElement;
    expect(root.style.getPropertyValue('--stamp-trail')).toBe('#ff0000');
    expect(root.style.getPropertyValue('--stamp-paper')).toBe('#111111');
    expect(root.style.getPropertyValue('--stamp-bg')).toBe('#222222');
  });

  it('turns the film overlays off when the switches are off', () => {
    const on = render(<StampStory data={{ stamps: [stamp('/a.jpg')] }} />);
    expect(on.container.querySelector('.stamp-story__grain')).not.toBeNull();
    expect(on.container.querySelector('.stamp-story__vignette')).not.toBeNull();
    on.unmount();

    const off = render(
      <StampStory data={{ stamps: [stamp('/a.jpg')], grain: false, vignette: false }} />
    );
    expect(off.container.querySelector('.stamp-story__grain')).toBeNull();
    expect(off.container.querySelector('.stamp-story__vignette')).toBeNull();
  });

  it('keeps the journey at zero for a single stamp so the page is not pinned', () => {
    const { container } = render(<StampStory data={{ stamps: [stamp('/a.jpg')] }} />);
    const root = container.querySelector('.stamp-story') as HTMLElement;
    expect(root.style.getPropertyValue('--stamp-journey')).toBe('0vw');
  });

  it('takes as many stamps as the merchant adds, not three', () => {
    const six = Array.from({ length: 6 }, (_, i) => stamp(`/${i}.jpg`));
    const { container } = render(<StampStory data={{ stamps: six }} />);
    expect(container.querySelectorAll('.stamp-story__card').length).toBe(6);
  });

  it('caps the run at twelve stamps', () => {
    const many = Array.from({ length: 20 }, (_, i) => stamp(`/${i}.jpg`));
    const { container } = render(<StampStory data={{ stamps: many }} />);
    expect(container.querySelectorAll('.stamp-story__card').length).toBe(12);
  });

  it('reverses the direction after every three stamps', () => {
    const six = Array.from({ length: 6 }, (_, i) => stamp(`/${i}.jpg`));
    const { container } = render(<StampStory data={{ stamps: six }} />);

    const xs = [...container.querySelectorAll('.stamp-story__card')].map((card) =>
      parseFloat((card as HTMLElement).style.getPropertyValue('--stamp-x'))
    );

    /* three legs running one way, then three running back — the fourth stamp
       sits to the LEFT of the third instead of carrying on to the right */
    expect(xs).toEqual([120, 190, 260, 190, 120, 50]);
    expect(xs[3]).toBeLessThan(xs[2]);
  });

  it('grows the journey with the stamp count', () => {
    const three = render(
      <StampStory data={{ stamps: [stamp('/a.jpg'), stamp('/b.jpg'), stamp('/c.jpg')] }} />
    );
    const threeRun = (three.container.querySelector('.stamp-story') as HTMLElement).style.getPropertyValue(
      '--stamp-journey'
    );
    three.unmount();

    const six = render(
      <StampStory data={{ stamps: Array.from({ length: 6 }, (_, i) => stamp(`/${i}.jpg`)) }} />
    );
    const sixRun = (six.container.querySelector('.stamp-story') as HTMLElement).style.getPropertyValue(
      '--stamp-journey'
    );

    expect(threeRun).toBe('400vw');
    expect(sixRun).toBe('1000vw');
  });

  it('names the reserved-height class from the placement it will render', () => {
    const six = Array.from({ length: 6 }, (_, i) => stamp(`/${i}.jpg`));
    expect(stampStoryRunClass({ stamps: six })).toBe('stamp-story-run--m5');
    expect(stampStoryRunClass({ stamps: six, travel: 'long' })).toBe('stamp-story-run--l5');
    expect(stampStoryRunClass({ stamps: [stamp('/a.jpg')] })).toBe('stamp-story-run--m0');
    /* a row with no image is not a stamp: the reservation must agree */
    expect(stampStoryRunClass({ stamps: [stamp('/a.jpg'), { name: 'no image' }] })).toBe(
      'stamp-story-run--m0'
    );
  });
});
