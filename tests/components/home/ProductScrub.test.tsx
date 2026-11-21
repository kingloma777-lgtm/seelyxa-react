import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { ProductScrub, productScrubRunClass, spinFraction } from '../../../app/components/home/ProductScrub';

/* The block is a scroll-scrubbed stage wrapped around plain content. These
   tests pin the parts that must survive a device without WebGL: the copy is
   all there, the timeline lives in variables rather than tweens, the opening
   line is split per CHARACTER in Latin (the reference's SplitText cascade)
   but per WORD in Arabic (splitting the joins apart destroys the script), and
   the reserved-height class agrees with the pacing the merchant chose. */

const base = {
  title_a: 'Every Rep Starts With',
  title_b: 'GRND Shaker',
  travel: 'medium',
};

describe('ProductScrub', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders both headlines', () => {
    const { container } = render(<ProductScrub data={base} />);
    expect(container.querySelector('.product-scrub__headline--out')?.textContent).toBe(
      'Every Rep Starts With'
    );
    expect(container.querySelector('.product-scrub__headline--sweep')?.textContent).toBe(
      'GRND Shaker'
    );
  });

  /* The reference split `.header-1 h1` with `SplitText type:"chars"` and
     staggered the rise 0.025s. That cascade is the component's signature, so
     the Latin path must be per character — and the index has to keep running
     across word boundaries, otherwise the stagger restarts at every word and
     the line reveals in four lumps. */
  it('splits a Latin headline into characters with one running stagger', () => {
    const { container } = render(<ProductScrub data={base} />);
    const units = [
      ...container.querySelectorAll<HTMLElement>(
        '.product-scrub__headline--out .product-scrub__unit'
      ),
    ];
    expect(units.map((unit) => unit.textContent).join('')).toBe('EveryRepStartsWith');
    expect(units).toHaveLength(18);
    expect(units.map((unit) => unit.style.getPropertyValue('--i'))).toEqual(
      units.map((_, index) => String(index))
    );
    /* words stay grouped so a line break cannot land inside one */
    expect(
      container.querySelectorAll('.product-scrub__headline--out .product-scrub__wordgroup')
    ).toHaveLength(4);
  });

  /* Arabic words are one unit: splitting into characters would leave every
     letter in its isolated form. The word mask is the smallest safe unit. */
  it('keeps an Arabic headline as whole words', () => {
    const { container } = render(
      <ProductScrub data={{ ...base, title_a: 'كل تكرار يبدأ بـ' }} />
    );
    const words = [
      ...container.querySelectorAll<HTMLElement>(
        '.product-scrub__headline--out .product-scrub__unit'
      ),
    ];
    expect(words.map((word) => word.textContent)).toEqual(['كل', 'تكرار', 'يبدأ', 'بـ']);
    expect(words.map((word) => word.style.getPropertyValue('--i'))).toEqual([
      '0',
      '1',
      '2',
      '3',
    ]);
  });

  /* The line's own reading direction decides which edge it hangs off and which
     way it slides. `:dir()` cannot be used for this: the production CSS
     minifier rewrites it into `:lang(ar), :lang(he)…`, which answers "what
     language is the page", not "which way does this line read". */
  it("writes the line's own reading direction back as data-flow", () => {
    const { container } = render(<ProductScrub data={base} />);
    expect(
      container.querySelector('.product-scrub__headline--out')?.getAttribute('data-flow')
    ).toBe('ltr');
  });

  it('marks a right-to-left line so it hangs off the other edge', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      direction: 'rtl',
    } as unknown as CSSStyleDeclaration);
    const { container } = render(
      <ProductScrub data={{ ...base, title_a: 'كل تكرار يبدأ بـ' }} />
    );
    expect(
      container.querySelector('.product-scrub__headline--out')?.getAttribute('data-flow')
    ).toBe('rtl');
    expect(
      container.querySelector('.product-scrub__headline--sweep')?.getAttribute('data-flow')
    ).toBe('rtl');
    vi.restoreAllMocks();
  });

  it('renders the two cards from the collection rows', () => {
    const { container } = render(
      <ProductScrub
        data={{
          ...base,
          product_scrub_cards: [
            {
              'product_scrub_cards.icon': 'battery',
              'product_scrub_cards.title': 'All week',
              'product_scrub_cards.body': 'One charge.',
            },
            {
              'product_scrub_cards.icon': 'drop',
              'product_scrub_cards.title': 'No leaks',
              'product_scrub_cards.body': 'Sealed cap.',
            },
          ],
        }}
      />
    );
    const cards = [...container.querySelectorAll('.product-scrub__card')];
    expect(cards).toHaveLength(2);
    expect(cards[0].querySelector('.product-scrub__card-title')?.textContent).toBe('All week');
    expect(cards[1].querySelector('.product-scrub__card-body')?.textContent).toBe('Sealed cap.');
    /* the second card is the later beat of the scrub */
    expect(cards[1].querySelectorAll('.product-scrub__mask').length).toBeGreaterThan(0);
  });

  /* A fresh placement can arrive with no rows at all; an empty stage would
     read as a broken block, so the reference copy stands in. */
  it('falls back to the reference copy when no cards arrive', () => {
    const { container } = render(<ProductScrub data={base} />);
    expect(container.querySelectorAll('.product-scrub__card')).toHaveLength(2);
    expect(container.querySelector('.product-scrub__card-title')?.textContent).toBe(
      'Built to last'
    );
  });

  /* The reported class of bug: the seeded short key shadowing the merchant's
     field id, so an edit is silently ignored. */
  it('lets the field id beat the short alias', () => {
    const { container } = render(
      <ProductScrub
        data={{ ...base, title_a: 'Seed headline', product_scrub_title_a: 'Edited headline' }}
      />
    );
    expect(container.querySelector('.product-scrub__headline--out')?.textContent).toBe(
      'Edited headline'
    );
  });

  it('carries the merchant colours onto the root', () => {
    const { container } = render(
      <ProductScrub
        data={{ ...base, product_scrub_light: '#f5f5f5', product_scrub_dark: '#101010' }}
      />
    );
    const root = container.querySelector('.product-scrub') as HTMLElement;
    expect(root.style.getPropertyValue('--ps-light')).toBe('#f5f5f5');
    expect(root.style.getPropertyValue('--ps-dark')).toBe('#101010');
  });

  /* The model field is a hand-typed URL today, but the same key will carry an
     upload object the moment the editor offers one — and `readTextOr` would
     turn that object into "[object Object]" and point the loader at nothing. */
  it('accepts an upload object in the model field', () => {
    const { container } = render(
      <ProductScrub data={{ ...base, product_scrub_model: { url: '/files/other.glb' } }} />
    );
    expect(
      container.querySelector('.product-scrub__canvas')?.getAttribute('data-model')
    ).toBe('/files/other.glb');
  });

  /* The sticker is drawn in WebGL, so the only thing a test can hold on to is
     that the artwork reached the scene at all — the canvas carries it. */
  it('carries the sticker url onto the canvas', () => {
    const { container } = render(
      <ProductScrub data={{ ...base, product_scrub_label: '/files/logo.png' }} />
    );
    expect(container.querySelector('.product-scrub__canvas')?.getAttribute('data-label')).toBe(
      '/files/logo.png'
    );
  });

  it('has no sticker until the merchant adds one', () => {
    const { container } = render(<ProductScrub data={base} />);
    expect(
      container.querySelector('.product-scrub__canvas')?.hasAttribute('data-label')
    ).toBe(false);
  });

  /* ── the built-in product ────────────────────────────────────────────────
     The default product is a neutral shape, not a file: a ready-made GLB is
     branded by definition, so a merchant could never use one for their own
     bottle. These pin the controls that make the shape theirs. */

  it('draws the neutral bottle when the merchant has not chosen anything', () => {
    const { container } = render(<ProductScrub data={base} />);
    const canvas = container.querySelector('.product-scrub__canvas');
    expect(canvas?.getAttribute('data-shape')).toBe('bottle');
    expect(canvas?.hasAttribute('data-model')).toBe(false);
    expect(canvas?.getAttribute('data-body-color')).toBe('#cfccc6');
    expect(canvas?.getAttribute('data-body-finish')).toBe('satin');
    expect(canvas?.getAttribute('data-body-width')).toBe('100');
  });

  it('takes the shape, colour and finish the merchant picked', () => {
    const { container } = render(
      <ProductScrub
        data={{
          ...base,
          product_scrub_shape: 'jar',
          product_scrub_body_color: '#1f6f5c',
          product_scrub_body_finish: 'metal',
        }}
      />
    );
    const canvas = container.querySelector('.product-scrub__canvas');
    expect(canvas?.getAttribute('data-shape')).toBe('jar');
    expect(canvas?.getAttribute('data-body-color')).toBe('#1f6f5c');
    expect(canvas?.getAttribute('data-body-finish')).toBe('metal');
  });

  /* Width is a percentage of the body's own radius; a value outside the
     slider's range is clamped rather than accepted, because a 0-wide product
     is an invisible one and a 3× one fills the frame. */
  it('clamps the body width to the slider range', () => {
    const wide = render(
      <ProductScrub data={{ ...base, product_scrub_body_width: 400 }} />
    );
    expect(
      wide.container.querySelector('.product-scrub__canvas')?.getAttribute('data-body-width')
    ).toBe('140');
    wide.unmount();
    const thin = render(<ProductScrub data={{ ...base, product_scrub_body_width: 5 }} />);
    expect(
      thin.container.querySelector('.product-scrub__canvas')?.getAttribute('data-body-width')
    ).toBe('60');
  });

  /* "none" is the only value that removes the product — a missing shape field
     must still draw one, or a merchant who never opened the panel gets a
     stage with no hero in it. */
  it('drops the canvas only when the shape is set to none', () => {
    const { container } = render(
      <ProductScrub data={{ ...base, product_scrub_shape: 'none' }} />
    );
    expect(container.querySelector('.product-scrub__canvas')).toBeNull();
    /* the stage still has its type and its cards */
    expect(container.querySelector('.product-scrub__cards')).not.toBeNull();
  });

  /* A merchant's own file carries its own materials and branding, so the
     shape controls step aside entirely rather than repainting it. */
  it('lets a linked GLB win over the shape controls', () => {
    const { container } = render(
      <ProductScrub
        data={{
          ...base,
          product_scrub_shape: 'can',
          product_scrub_model: 'https://cdn.example.com/jar.glb',
        }}
      />
    );
    const canvas = container.querySelector('.product-scrub__canvas');
    expect(canvas?.getAttribute('data-model')).toBe('https://cdn.example.com/jar.glb');
    expect(canvas?.hasAttribute('data-shape')).toBe(false);
    expect(canvas?.hasAttribute('data-body-color')).toBe(false);
  });

  /* An empty link is no longer "no product": it is the neutral shape, which
     is where a merchant who has not modelled their product yet should land. */
  it('falls back to the built-in shape when the link is empty', () => {
    const { container } = render(
      <ProductScrub data={{ ...base, product_scrub_model: '' }} />
    );
    const canvas = container.querySelector('.product-scrub__canvas');
    expect(canvas).not.toBeNull();
    expect(canvas?.getAttribute('data-shape')).toBe('bottle');
  });

  /* ── the motion window ───────────────────────────────────────────────────
     The merchant decides where the product starts turning, so the window has
     to reach the DOM even on a device with no WebGL — the harness reads it to
     tell "the setting arrived" from "the setting was ignored". */
  it('publishes the motion window the merchant chose', () => {
    const { container } = render(
      <ProductScrub
        data={{ ...base, product_scrub_spin_start: 40, product_scrub_spin_end: 70 }}
      />
    );
    expect(
      container.querySelector('.product-scrub__canvas')?.getAttribute('data-spin')
    ).toBe('40-70');
  });

  /* Dragging the end below the start would divide by a negative window, and a
     window that closes to nothing leaves the product frozen for the whole
     block — which is read as "the animation is broken", not as "I set it to
     the end". The window is kept at least a fifth of the scene wide. */
  it('keeps the window at least a fifth of the scene wide', () => {
    const { container } = render(
      <ProductScrub
        data={{ ...base, product_scrub_spin_start: 90, product_scrub_spin_end: 20 }}
      />
    );
    expect(
      container.querySelector('.product-scrub__canvas')?.getAttribute('data-spin')
    ).toBe('80-100');
  });

  /* A start near the end is the exact state that made a merchant report "the
     cone does not animate": the product turned only in the last 5% of the
     scene, so it looked like a still image. */
  it('never lets the start push the whole spin into the last sliver', () => {
    const { container } = render(
      <ProductScrub
        data={{ ...base, product_scrub_spin_start: 95, product_scrub_spin_end: 100 }}
      />
    );
    expect(
      container.querySelector('.product-scrub__canvas')?.getAttribute('data-spin')
    ).toBe('80-100');
  });

  /* ── where the product sits ──────────────────────────────────────────────
     The reference framing is a starting point, not a law: a cone is heavy at
     the bottom and reads higher than a bottle at the same numbers, so the
     merchant needs to be able to move it over the copy themselves. */
  it('publishes the framing the merchant chose', () => {
    const { container } = render(
      <ProductScrub
        data={{ ...base, product_scrub_model_x: 25, product_scrub_model_y: -15 }}
      />
    );
    expect(
      container.querySelector('.product-scrub__canvas')?.getAttribute('data-frame')
    ).toBe('25,-15');
  });

  it('clamps the framing to half the product in either direction', () => {
    const { container } = render(
      <ProductScrub
        data={{ ...base, product_scrub_model_x: 400, product_scrub_model_y: -400 }}
      />
    );
    expect(
      container.querySelector('.product-scrub__canvas')?.getAttribute('data-frame')
    ).toBe('50,-50');
  });

  /* ── the pasted model ────────────────────────────────────────────────────
     A `.gltf` is JSON, so a merchant who owns a model but has nowhere to host
     it can supply the whole thing as text. It wins over the link: it is the
     field they just filled, and the only one with no external dependency to
     break later. */
  it('prefers a pasted model over a linked one', () => {
    const { container } = render(
      <ProductScrub
        data={{
          ...base,
          product_scrub_model: 'https://cdn.example.com/jar.glb',
          product_scrub_model_code: JSON.stringify({ asset: { version: '2.0' } }),
        }}
      />
    );
    const canvas = container.querySelector('.product-scrub__canvas');
    expect(canvas?.getAttribute('data-source')).toBe('code');
    expect(canvas?.hasAttribute('data-model')).toBe(false);
  });

  /* A pasted *silhouette* is still our solid, not the merchant's mesh, so the
     colour and finish controls keep working on it. */
  it('keeps the colour controls when the paste is a silhouette', () => {
    const { container } = render(
      <ProductScrub
        data={{
          ...base,
          product_scrub_model_code:
            '[[0,0],[0.22,0],[0.22,0.62],[0.1,0.8],[0.1,1],[0,1]]',
          product_scrub_body_color: '#1f6f5c',
        }}
      />
    );
    const canvas = container.querySelector('.product-scrub__canvas');
    expect(canvas?.getAttribute('data-source')).toBe('profile');
    expect(canvas?.getAttribute('data-body-color')).toBe('#1f6f5c');
  });

  /* A paste that is not a model must leave the stage exactly as it was: no
     canvas teardown, no blank frame, no error the merchant cannot see. */
  /* A paste over the ceiling must be refused, not attempted. The merchant who
     pasted an 8.67 MB car export got a frozen editor and a 11 MB page; the
     block cannot fix the paste, but it can refuse to make it worse — the stage
     falls back to the neutral shape and the reason is published, so "too big"
     is never mistaken for "broken". */
  it('refuses an oversized paste and keeps the neutral product', () => {
    const { container } = render(
      <ProductScrub
        data={{
          ...base,
          product_scrub_model_code: `{"asset":{"version":"2.0"},"pad":"${'x'.repeat(
            400_001
          )}"}`,
        }}
      />
    );
    const canvas = container.querySelector('.product-scrub__canvas');
    expect(canvas?.getAttribute('data-code')).toBe('oversize');
    expect(canvas?.getAttribute('data-source')).toBe('shape');
    expect(canvas?.getAttribute('data-shape')).toBe('bottle');
  });

  /* With a link present the link still renders — an oversized paste does not
     take the product down with it — and the reason stays visible so the
     merchant knows why their paste is being ignored. */
  it('still uses the link when the paste is oversized', () => {
    const { container } = render(
      <ProductScrub
        data={{
          ...base,
          product_scrub_model: 'https://cdn.example.com/jar.glb',
          product_scrub_model_code: 'x'.repeat(400_001),
        }}
      />
    );
    const canvas = container.querySelector('.product-scrub__canvas');
    expect(canvas?.getAttribute('data-source')).toBe('url');
    expect(canvas?.getAttribute('data-code')).toBe('oversize');
  });

  it('names an unreadable paste as unreadable, not as empty', () => {
    const { container } = render(
      <ProductScrub data={{ ...base, product_scrub_model_code: 'hello world' }} />
    );
    expect(
      container.querySelector('.product-scrub__canvas')?.getAttribute('data-code')
    ).toBe('unreadable');
  });

  it('falls back to the neutral shape when the paste is not a model', () => {
    const { container } = render(
      <ProductScrub data={{ ...base, product_scrub_model_code: 'not a model' }} />
    );
    const canvas = container.querySelector('.product-scrub__canvas');
    expect(canvas?.getAttribute('data-source')).toBe('shape');
    expect(canvas?.getAttribute('data-shape')).toBe('bottle');
  });

  it('renders nothing without either headline', () => {
    const { container } = render(
      <ProductScrub data={{ ...base, title_a: '', title_b: '' }} />
    );
    expect(container.querySelector('.product-scrub')).toBeNull();
  });

  it('settles the whole timeline and collapses the run under reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
    const { container } = render(<ProductScrub data={base} />);
    expect(container.querySelector('.product-scrub')?.classList.contains('is-flat')).toBe(true);
  });
});

describe('productScrubRunClass', () => {
  it('maps each pacing tier to the class that reserves its height', () => {
    expect(productScrubRunClass({ travel: 'short' })).toBe('product-scrub-run--short');
    expect(productScrubRunClass({ product_scrub_travel: 'long' })).toBe(
      'product-scrub-run--long'
    );
  });

  it('falls back to the medium pacing for anything unrecognised', () => {
    expect(productScrubRunClass({})).toBe('product-scrub-run--medium');
    expect(productScrubRunClass({ travel: 'gigantic' })).toBe('product-scrub-run--medium');
    expect(productScrubRunClass(null)).toBe('product-scrub-run--medium');
  });

  it('lets the field id beat the short alias', () => {
    expect(productScrubRunClass({ travel: 'short', product_scrub_travel: 'long' })).toBe(
      'product-scrub-run--long'
    );
  });
});

describe('spinFraction', () => {
  /* The default window starts at 5%, exactly where the reference's tween did:
     the product holds its angle through the opening beat and only then begins
     to turn. */
  it('holds still until the start and stops turning at the end', () => {
    expect(spinFraction(0, 5, 100)).toBe(0);
    expect(spinFraction(0.049, 5, 100)).toBe(0);
    expect(spinFraction(0.05, 5, 100)).toBe(0);
    expect(spinFraction(0.525, 5, 100)).toBeCloseTo(0.5, 6);
    expect(spinFraction(1, 5, 100)).toBe(1);
    expect(spinFraction(1.4, 5, 100)).toBe(1);
  });

  /* The same six turns squeezed into a fifth of the scene: the setting is a
     window, not an offset, so the middle of the window is always half a spin. */
  it('spreads the same turns over whatever window the merchant sets', () => {
    expect(spinFraction(0.4, 40, 60)).toBe(0);
    expect(spinFraction(0.5, 40, 60)).toBeCloseTo(0.5, 6);
    expect(spinFraction(0.6, 40, 60)).toBe(1);
  });

  it('treats an empty window as a step instead of dividing by zero', () => {
    const atEdge = spinFraction(0.5, 50, 50);
    expect(Number.isFinite(atEdge)).toBe(true);
    expect(atEdge).toBe(0);
    expect(spinFraction(0.61, 60, 60)).toBe(1);
  });
});
