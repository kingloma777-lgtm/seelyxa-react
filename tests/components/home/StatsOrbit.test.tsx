import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { StatsOrbit } from '../../../app/components/home/StatsOrbit';

/* The block is a small INSTRUMENT: glass chips scattered around one moss
   sphere, a segmented ring with a travelling bead, and a lens in the sphere
   that reads one figure at a time. Nothing scrolls.
   These tests pin what is easy to break by accident:
     - the payload shape a real store sends (prefixed row keys),
     - an empty collection rendering nothing at all,
     - the badge's sign surviving an RTL page,
     - every card sitting on ITS OWN anchor (the scatter is data),
     - the lens holding every figure, and the server html carrying the real
       figure — never a counting-up zero, and never the arm that hides a card
       before JS runs. */

const row = (over: Record<string, unknown> = {}) => ({
  'stats_orbit_items.title': 'عملاء سعداء',
  'stats_orbit_items.value': '12,480',
  'stats_orbit_items.unit': 'عميل',
  'stats_orbit_items.date': 'هذا العام',
  'stats_orbit_items.delta': '+18%',
  'stats_orbit_items.color': '#c9f26c',
  ...over,
});

const block = (over: Record<string, unknown> = {}) => ({
  stats_orbit_items: [row(), row({ 'stats_orbit_items.title': 'طلبات تم توصيلها' })],
  /* the counter is the one thing that makes a DOM assertion time-dependent:
     off, the merchant's own text is what renders */
  stats_orbit_count_up: false,
  ...over,
});

describe('StatsOrbit', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', undefined);
  });

  it('renders one disc per claim, from the prefixed row keys a store sends', () => {
    const { container } = render(<StatsOrbit data={block()} />);

    const discs = container.querySelectorAll('.stats-orbit__card');
    expect(discs.length).toBe(2);
    expect(discs[0].querySelector('.stats-orbit__card-title')?.textContent).toBe('عملاء سعداء');
    expect(discs[0].querySelector('.stats-orbit__card-number')?.textContent).toBe('12,480');
    expect(discs[0].querySelector('.stats-orbit__card-unit')?.textContent).toBe('عميل');
    expect(discs[0].querySelector('.stats-orbit__card-date')?.textContent).toBe('هذا العام');
  });

  it('renders nothing at all when the merchant has not added a figure yet', () => {
    const { container } = render(<StatsOrbit data={block({ stats_orbit_items: [] })} />);
    expect(container.querySelector('.stats-orbit')).toBeNull();
  });

  it('balances the scatter across BOTH sides for any figure count', () => {
    /* four figures on the old hand-picked list landed three cards on one
       side and one on the other — the scatter is computed now, so the count
       decides: sides alternate, the spare card hosts on the left like the
       reference's own five (3+2), and nothing parks over the sphere. */
    const counts: Array<[number, number, number]> = [
      // [figures, cards on the left, on the right]
      [2, 1, 1],
      [3, 2, 1],
      [4, 2, 2],
      [5, 3, 2],
      [7, 4, 3],
      [8, 4, 4],
    ];

    for (const [count, left, right] of counts) {
      const { container, unmount } = render(
        <StatsOrbit
          data={block({ stats_orbit_items: Array.from({ length: count }, () => row()) })}
        />
      );
      const slots = [...container.querySelectorAll<HTMLElement>('.stats-orbit__slot')];
      const onLeft = slots.filter((s) => parseFloat(s.style.getPropertyValue('--ax')) < 50);
      expect(onLeft.length, `${count} figures`).toBe(left);
      expect(slots.length - onLeft.length, `${count} figures`).toBe(right);
      unmount();
    }
  });

  it('spreads the cards sharing a side down its band, and none covers the sphere', () => {
    const { container } = render(
      <StatsOrbit data={block({ stats_orbit_items: [row(), row(), row(), row()] })} />
    );

    const slots = [...container.querySelectorAll<HTMLElement>('.stats-orbit__slot')];
    const ys = slots.map((slot) => parseFloat(slot.style.getPropertyValue('--ay')));
    /* two rows, one per side-pair — no two cards on one side share a height */
    expect(ys).toEqual([16, 16, 84, 84]);
    /* a card level with the sphere's middle must sit on the OUTER x; here
       both rows sit beside the poles, so both keep the inner values and the
       whole pass still proves the percentages are real coordinates */
    expect(slots.map((slot) => slot.style.getPropertyValue('--ax'))).toEqual([
      '26%',
      '74%',
      '26%',
      '74%',
    ]);
  });

  it('steps a middle-band card outward, clear of the sphere', () => {
    /* three figures: the lone right card lands at the band's centre (50%),
       where the orb is widest — it must take the outer x */
    const { container } = render(
      <StatsOrbit data={block({ stats_orbit_items: [row(), row(), row()] })} />
    );

    const slots = [...container.querySelectorAll<HTMLElement>('.stats-orbit__slot')];
    expect(slots[1].style.getPropertyValue('--ax')).toBe('79.5%');
    expect(slots[1].style.getPropertyValue('--ay')).toBe('50%');
  });

  it('keeps the badge exactly as typed, LTR, with the tone read from its sign', () => {
    const { container } = render(
      <StatsOrbit
        data={block({
          stats_orbit_items: [
            row({ 'stats_orbit_items.delta': '+18%' }),
            row({ 'stats_orbit_items.delta': '-4%' }),
            row({ 'stats_orbit_items.delta': '0%' }),
            row({ 'stats_orbit_items.delta': '' }),
          ],
        })}
      />
    );

    const badges = container.querySelectorAll('.stats-orbit__delta');
    /* the empty one is not rendered at all — no empty pill */
    expect(badges.length).toBe(3);
    expect(badges[0].getAttribute('dir')).toBe('ltr');
    const tone = (label: string) =>
      [...badges].find((b) => b.textContent === label)?.getAttribute('data-tone');
    expect(tone('+18%')).toBe('up');
    expect(tone('-4%')).toBe('down');
    expect(tone('0%')).toBe('flat');
  });

  it('draws one arc per claim, and none when the ring is switched off', () => {
    const on = render(<StatsOrbit data={block({ stats_orbit_items: [row(), row(), row()] })} />);
    expect(on.container.querySelectorAll('.stats-orbit__arc').length).toBe(3);
    /* the instrument's other two parts: the dotted halo and the travelling
       bead. Both are decoration, so both are inside the aria-hidden svg. */
    expect(on.container.querySelector('.stats-orbit__ticks')).not.toBeNull();
    expect(on.container.querySelector('.stats-orbit__comet')).not.toBeNull();
    on.unmount();

    const off = render(<StatsOrbit data={block({ stats_orbit_show_ring: false })} />);
    expect(off.container.querySelector('.stats-orbit__ring')).toBeNull();
  });

  it('marks a dense column so eight chips shrink instead of colliding', () => {
    const few = render(<StatsOrbit data={block({ stats_orbit_items: [row(), row(), row(), row()] })} />);
    expect(few.container.querySelector('.stats-orbit')?.getAttribute('data-dense')).toBeNull();
    few.unmount();

    /* four on ONE side needs the shorter chip: without it the rows overlap */
    const many = render(
      <StatsOrbit
        data={block({ stats_orbit_items: Array.from({ length: 8 }, () => row()) })}
      />
    );
    expect(many.container.querySelector('.stats-orbit')?.getAttribute('data-dense')).toBe('true');
    /* and the band widens, so four rows still fit inside the stage */
    const ys = [...many.container.querySelectorAll<HTMLElement>('.stats-orbit__slot')].map((s) =>
      parseFloat(s.style.getPropertyValue('--ay'))
    );
    expect(Math.min(...ys)).toBe(12);
    expect(Math.max(...ys)).toBe(88);
  });

  it('tells each chip which side of the sphere it hangs from', () => {
    /* the stylesheet puts the lit seam on the edge FACING the sphere, and it
       can only know which edge that is from this attribute */
    const { container } = render(
      <StatsOrbit data={block({ stats_orbit_items: [row(), row(), row(), row()] })} />
    );

    expect(
      [...container.querySelectorAll('.stats-orbit__slot')].map((s) => s.getAttribute('data-side'))
    ).toEqual(['l', 'r', 'l', 'r']);
  });

  it('gives a claim with no colour one from the ramp, so the arc still exists', () => {
    const { container } = render(
      <StatsOrbit data={block({ stats_orbit_items: [row({ 'stats_orbit_items.color': '' })] })} />
    );

    const arc = container.querySelector('.stats-orbit__arc');
    expect(arc?.getAttribute('stroke')).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('paints the sphere from a gradient, or from the merchant photo when given one', () => {
    const plain = render(<StatsOrbit data={block()} />);
    const orb = plain.container.querySelector('.stats-orbit__orb');
    expect(orb?.getAttribute('data-image')).toBeNull();
    expect(orb?.querySelector('img')).toBeNull();
    plain.unmount();

    const withPhoto = render(
      <StatsOrbit
        data={block({ stats_orbit_center_image: { url: 'https://cdn.example/moss.jpg' } })}
      />
    );
    const photoOrb = withPhoto.container.querySelector('.stats-orbit__orb');
    expect(photoOrb?.getAttribute('data-image')).toBe('true');
    expect(photoOrb?.querySelector('img')?.getAttribute('src')).toBe('https://cdn.example/moss.jpg');
  });

  it('holds every figure in the lens, one face each', () => {
    const { container } = render(
      <StatsOrbit data={block({ stats_orbit_items: [row(), row(), row(), row()] })} />
    );

    const faces = container.querySelectorAll('.stats-orbit__face');
    expect(faces.length).toBe(4);
    expect(faces[0].querySelector('.stats-orbit__face-value')?.textContent).toBe('12,480');
    expect(faces[0].querySelector('.stats-orbit__face-unit')?.textContent).toBe('عميل');
    /* the resting face is the first figure, so a page with no pointer still
       shows a real number in the sphere */
    expect(faces[0].getAttribute('data-i')).toBe('0');
  });

  it('keeps the lens out of the accessibility tree — the chips carry the data', () => {
    /* every figure is already on a chip in full; announcing the lens too would
       read each number twice */
    const { container } = render(<StatsOrbit data={block()} />);
    expect(container.querySelector('.stats-orbit__lens')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps the full claim on the card — the still shows everything at once', () => {
    /* The old walk gave a disc two faces (figure off-centre, name on the
       ring). The still has no off-centre moment: name, badge, figure and
       period all live on the one card, permanently. */
    const { container } = render(<StatsOrbit data={block()} />);

    const card = container.querySelector('.stats-orbit__card')!;
    expect(card.querySelector('.stats-orbit__card-title')?.textContent).toBe('عملاء سعداء');
    expect(card.querySelector('.stats-orbit__card-number')?.textContent).toBe('12,480');
    expect(card.querySelector('.stats-orbit__delta')?.textContent).toBe('+18%');
    expect(card.querySelector('.stats-orbit__card-figure')).toBeNull();
    expect(card.querySelector('.stats-orbit__card-label')).toBeNull();
  });

  it('mirrors every chip figure into the lens, in the same order', () => {
    /* the lens is a second reader of the same figures, not a separate
       dataset: if the order ever diverges, hovering chip 2 would show
       someone else's number. Pin the correspondence. */
    const { container } = render(
      <StatsOrbit data={block({ stats_orbit_items: [row(), row(), row()] })} />
    );

    const figures = [...container.querySelectorAll('.stats-orbit__card-number')];
    const faces = [...container.querySelectorAll('.stats-orbit__face-value')];
    expect(faces.map((face) => face.textContent)).toEqual(
      figures.map((figure) => figure.textContent)
    );
  });

  it('hides the small lines instead of printing empty nodes', () => {
    const { container } = render(
      <StatsOrbit
        data={block({
          stats_orbit_eyebrow: '',
          stats_orbit_items: [
            row({
              'stats_orbit_items.unit': '',
              'stats_orbit_items.date': '',
              'stats_orbit_items.delta': '',
            }),
          ],
        })}
      />
    );

    expect(container.querySelector('.stats-orbit__eyebrow')).toBeNull();
    expect(container.querySelector('.stats-orbit__card-unit')).toBeNull();
    expect(container.querySelector('.stats-orbit__card-date')).toBeNull();
    expect(container.querySelector('.stats-orbit__delta')).toBeNull();
  });

  it('renders nothing for the retired caption key', () => {
    /* The field was removed from the manifest; a stored payload that still
       carries the key must not resurrect a caption line. */
    const { container } = render(
      <StatsOrbit data={block({ stats_orbit_items: [row({ 'stats_orbit_items.caption': 'قديم' })] })} />
    );

    expect(container.textContent).not.toContain('قديم');
    expect(container.querySelector('.stats-orbit__card-caption')).toBeNull();
  });

  it('ships the real figure in the server html — never a zero a crawler would read', () => {
    const html = renderToString(<StatsOrbit data={block({ stats_orbit_count_up: true })} />);

    expect(html).toContain('12,480');
    expect(html).toContain('عملاء سعداء');
    expect(html).toContain('stats-orbit');
    /* no `data-ready` (the old pinned stage), no `data-armed` (the reveal
       arm) and no `data-focus` (the spotlight) in the server html: without
       JS every card must already be there, resting, unspotlit */
    expect(html).not.toContain('data-ready');
    expect(html).not.toContain('data-armed');
    expect(html).not.toContain('data-focus');
  });

  it('spotlights the visited figure — its arc, its lens face — and clears on leave', () => {
    const { container } = render(
      <StatsOrbit data={block({ stats_orbit_items: [row(), row(), row()] })} />
    );

    const section = container.querySelector('.stats-orbit')!;
    const slots = container.querySelectorAll('.stats-orbit__slot');
    fireEvent.mouseEnter(slots[1]);
    expect(section.getAttribute('data-focus')).toBe('1');
    fireEvent.mouseLeave(slots[1]);
    expect(section.getAttribute('data-focus')).toBeNull();

    /* the lens exposes its own order so the stylesheet can match card → arc →
       face by ONE number (the arcs carry data-index, the slots nth-child) */
    expect(
      [...container.querySelectorAll('.stats-orbit__face')].map((c) => c.getAttribute('data-i'))
    ).toEqual(['0', '1', '2']);
  });

  it('decorates quietly: the motes are decorative, hidden from the a11y tree', () => {
    const { container } = render(<StatsOrbit data={block()} />);

    const spores = container.querySelector('.stats-orbit__spores');
    expect(spores?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelectorAll('.stats-orbit__spores i').length).toBe(7);
  });
});
