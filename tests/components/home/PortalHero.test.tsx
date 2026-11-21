import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import {
  PortalHero,
  portalHeroPace,
  portalHeroRunClass,
} from '../../../app/components/home/PortalHero';

/* The block is two acts and one number. These tests pin the parts that would
   fail silently on a merchant's page: which key an image is read from, whether
   the arc wraps in both directions, whether clearing a field takes its element
   with it, and whether the still composition survives reduced motion. */

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
    locale: 'ar',
    direction: 'rtl',
    isRTL: true,
    isLTR: false,
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const quote = (text: string, author = '') => ({
  'portal_hero_quotes.text': text,
  'portal_hero_quotes.author': author,
});

const base = {
  portal_hero_portal_image: '/portal.jpg',
  portal_hero_world_image: '/world.jpg',
  portal_hero_eyebrow: 'Discover',
  portal_hero_title: 'Living\nDigital Worlds\nVivid, Alive, Endless',
  portal_hero_body: 'Step inside.',
  portal_hero_cta_label: 'Explore',
  portal_hero_cta_link: '/collection',
  portal_hero_signature: 'A.',
  portal_hero_caption: 'A studio.',
  portal_hero_reviews_title: 'Real wonders.\nReal worlds.',
  portal_hero_reviews_body: 'What others say.',
  portal_hero_quotes: [
    quote('one', 'Mariam'),
    quote('two', 'Youssef'),
    quote('three', 'Lina'),
  ],
  portal_hero_text_color: '#ffffff',
  portal_hero_card_color: '#f7fbff',
  portal_hero_scrim: 50,
  portal_hero_pace: 'medium',
};

const matchMediaStub = (reduced: boolean) => (query: string) => ({
  matches: reduced && query.includes('prefers-reduced-motion'),
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
});

const positions = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>('.portal-hero__card')].map((card) => ({
    pos: Number(card.style.getPropertyValue('--pos')),
    abs: Number(card.style.getPropertyValue('--abs')),
    centre: card.classList.contains('is-center'),
    hidden: card.getAttribute('aria-hidden'),
  }));

describe('PortalHero', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', matchMediaStub(false));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads both images from the field ids', () => {
    const { container } = render(<PortalHero data={base} />);
    expect(container.querySelector('.portal-hero__portal img')?.getAttribute('src')).toBe(
      '/portal.jpg'
    );
    expect(container.querySelector('.portal-hero__world img')?.getAttribute('src')).toBe(
      '/world.jpg'
    );
  });

  /* The seed shape and the editor shape differ by one key. Reading the short
     alias first makes the seed image win forever, and the report is "I changed
     the image and nothing happened" — see playbook §7a. */
  it('lets the prefixed key beat the short alias', () => {
    const { container } = render(
      <PortalHero data={{ ...base, world_image: '/seed.jpg' }} />
    );
    expect(container.querySelector('.portal-hero__world img')?.getAttribute('src')).toBe(
      '/world.jpg'
    );
  });

  it('falls back to the world image when only one image is set', () => {
    const { container } = render(
      <PortalHero data={{ ...base, portal_hero_portal_image: '' }} />
    );
    expect(container.querySelector('.portal-hero__portal img')?.getAttribute('src')).toBe(
      '/world.jpg'
    );
  });

  it('keeps the headline line breaks and hangs the eyebrow on the first line', () => {
    const { container } = render(<PortalHero data={base} />);
    const lines = [...container.querySelectorAll('.portal-hero__title .portal-hero__line')];

    expect(lines.map((line) => line.textContent?.trim())).toEqual([
      'Discover Living',
      'Digital Worlds',
      'Vivid, Alive, Endless',
    ]);
    expect(
      container.querySelectorAll('.portal-hero__eyebrow')
    ).toHaveLength(1);
  });

  it('puts one quote upright in the centre and wraps the rest around it', () => {
    const { container } = render(<PortalHero data={base} />);
    const cards = positions(container);

    expect(cards).toHaveLength(3);
    expect(cards.map((card) => card.pos)).toEqual([0, 1, -1]);
    expect(cards.filter((card) => card.centre)).toHaveLength(1);
    expect(cards[0].centre).toBe(true);
    /* the neighbours are decoration: they are not announced and not clickable */
    expect(cards[1].hidden).toBe('true');
    expect(cards[0].hidden).toBe('false');
  });

  it('steps one card per arrow and wraps at both ends', () => {
    const { container } = render(<PortalHero data={base} />);
    const root = container.querySelector('.portal-hero') as HTMLElement;
    const [prev, next] = [...container.querySelectorAll<HTMLButtonElement>('.portal-hero__arrow')];

    fireEvent.click(prev);
    expect(root.dataset.active).toBe('2');
    /* the last quote is centred and the first has wrapped round to its right —
       the row never ends, so neither side is ever empty */
    expect(positions(container).map((card) => card.pos)).toEqual([1, -1, 0]);

    fireEvent.click(next);
    fireEvent.click(next);
    expect(root.dataset.active).toBe('1');
  });

  it('keeps the arrows out of the DOM when there is nothing to step through', () => {
    const { container } = render(
      <PortalHero data={{ ...base, portal_hero_quotes: [quote('only')] }} />
    );
    expect(container.querySelector('.portal-hero__card')).not.toBeNull();
    expect(container.querySelector('.portal-hero__nav')).toBeNull();
  });

  /* `readTextOr`, not `readText`: a cleared field means "show nothing", and it
     takes only its own element with it. */
  it('hides a cleared field without dropping the block', () => {
    const { container } = render(
      <PortalHero
        data={{
          ...base,
          portal_hero_title: '',
          portal_hero_eyebrow: '',
          portal_hero_cta_label: '',
        }}
      />
    );
    expect(container.querySelector('.portal-hero__title')).toBeNull();
    expect(container.querySelector('.portal-hero__cta')).toBeNull();
    expect(container.querySelector('.portal-hero__portal img')).not.toBeNull();
    expect(container.querySelectorAll('.portal-hero__card')).toHaveLength(3);
  });

  it('renders nothing at all when there is nothing to show', () => {
    const { container } = render(<PortalHero data={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('derives the card ink from the card colour', () => {
    const light = render(<PortalHero data={{ ...base, portal_hero_card_color: '#f7fbff' }} />);
    expect(
      (light.container.querySelector('.portal-hero') as HTMLElement).style.getPropertyValue(
        '--ph-card-ink'
      )
    ).toBe('#2c2420');
    light.unmount();

    const dark = render(<PortalHero data={{ ...base, portal_hero_card_color: '#101010' }} />);
    expect(
      (dark.container.querySelector('.portal-hero') as HTMLElement).style.getPropertyValue(
        '--ph-card-ink'
      )
    ).toBe('#f7fbff');
  });

  it('settles into the still under reduced motion', () => {
    vi.stubGlobal('matchMedia', matchMediaStub(true));
    const { container } = render(<PortalHero data={base} />);
    expect(container.querySelector('.portal-hero')?.classList.contains('is-flat')).toBe(true);
  });

  it('does not freeze into the flat state when motion is allowed', () => {
    const { container } = render(<PortalHero data={base} />);
    expect(container.querySelector('.portal-hero')?.classList.contains('is-flat')).toBe(false);
  });
});

describe('portalHeroRunClass', () => {
  it('maps every pacing tier to the class the reserved height reads', () => {
    expect(portalHeroRunClass({ portal_hero_pace: 'short' })).toBe('portal-hero-run--short');
    expect(portalHeroRunClass({ portal_hero_pace: 'long' })).toBe('portal-hero-run--long');
    expect(portalHeroRunClass({})).toBe('portal-hero-run--medium');
  });

  /* a saved value from an older manifest must not leave the block without a
     height reservation, so anything unrecognised lands on the default tier */
  it('falls back to the default tier for an unknown value', () => {
    expect(portalHeroPace({ portal_hero_pace: 'huge' })).toBe('medium');
    expect(portalHeroPace(undefined)).toBe('medium');
  });
});
