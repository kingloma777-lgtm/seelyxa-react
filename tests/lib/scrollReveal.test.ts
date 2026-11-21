import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initScrollReveal, splitHeading, SR_ARMED_CLASS, SR_VISIBLE_ATTR } from '../../app/lib/scrollReveal';

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly observed = new Set<Element>();
  private readonly cb: IntersectionObserverCallback;

  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
    FakeIntersectionObserver.instances.push(this);
  }
  observe(el: Element) {
    this.observed.add(el);
  }
  unobserve(el: Element) {
    this.observed.delete(el);
  }
  disconnect() {
    this.observed.clear();
  }
  trigger(...elements: Element[]) {
    this.cb(
      elements.map((target) => ({ isIntersecting: true, target }) as IntersectionObserverEntry),
      this as unknown as IntersectionObserver
    );
  }
}

/** Every element gets a real box with a controllable `data-top`. */
function stubBoxes() {
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value(this: HTMLElement) {
      const top = Number(this.dataset.top ?? 2000);
      return {
        x: 0, y: top, top, left: 0, right: 300, bottom: top + 120,
        width: 300, height: 120, toJSON: () => ({}),
      } as DOMRect;
    },
  });
}

function makeMain(html: string) {
  const main = document.createElement('main');
  main.innerHTML = html;
  document.body.appendChild(main);
  return main;
}

beforeEach(() => {
  document.body.innerHTML = '';
  document.documentElement.className = '';
  FakeIntersectionObserver.instances = [];
  stubBoxes();
  // jsdom's matchMedia answers `true` for everything; that would silently
  // route every test down the reduced-motion path (playbook trap).
  vi.stubGlobal('matchMedia', (media: string) => ({
    matches: false, media, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  }));
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
  document.documentElement.className = '';
});

describe('splitHeading', () => {
  it('splits Arabic by WORD, not by letter, and preserves the readable text', () => {
    const h = document.createElement('h2');
    h.textContent = 'تصنيفات مميزة لبيتك';
    expect(splitHeading(h)).toBe(true);
    const words = h.querySelectorAll('.sr-word__in');
    expect(words).toHaveLength(3);
    expect([...words].map((w) => w.textContent)).toEqual(['تصنيفات', 'مميزة', 'لبيتك']);
    expect(h.textContent).toBe('تصنيفات مميزة لبيتك');
    expect([...words].map((w) => (w as HTMLElement).style.getPropertyValue('--sr-w'))).toEqual([
      '0', '1', '2',
    ]);
  });

  it('leaves headings with markup or a single word alone', () => {
    const withSpan = document.createElement('h2');
    withSpan.innerHTML = 'مرحباً <span>بالبيت</span>';
    expect(splitHeading(withSpan)).toBe(false);
    const single = document.createElement('h3');
    single.textContent = 'الجديد';
    expect(splitHeading(single)).toBe(false);
  });
});

describe('initScrollReveal', () => {
  it('arms only units below the fold; above-the-fold content keeps its own motion', () => {
    const main = makeMain(`
      <div class="s-block s-block--selia-blog">
        <div class="selia__inner">
          <header class="selia__head" data-top="200"><h2 class="selia__title">الأخبار</h2></header>
          <div class="selia-blog__item" data-top="2400">خبر أول</div>
        </div>
      </div>`);
    const cleanup = initScrollReveal(main, { watchMutations: false });
    expect(document.documentElement.classList.contains(SR_ARMED_CLASS)).toBe(true);
    const head = main.querySelector('.selia__head')!;
    const card = main.querySelector('.selia-blog__item')!;
    expect(head.hasAttribute('data-sr')).toBe(false); // settled, never hidden
    expect(card.getAttribute('data-sr')).toBe('rise');
    expect(card.hasAttribute(SR_VISIBLE_ATTR)).toBe(false);
    cleanup();
  });

  it('plays once and stays visible — no scrubbing back out on the way up', () => {
    const main = makeMain(`
      <div class="s-block s-block--selia-blog">
        <div class="selia-blog__item" data-top="2400">واحد</div>
      </div>`);
    const cleanup = initScrollReveal(main, { watchMutations: false });
    const card = main.querySelector('.selia-blog__item')!;
    const io = FakeIntersectionObserver.instances[0];
    expect(io.observed.has(card)).toBe(true);
    io.trigger(card);
    expect(card.hasAttribute(SR_VISIBLE_ATTR)).toBe(true);
    expect(io.observed.has(card)).toBe(false);
    // a second "scrolled past" callback cannot remove the visible state
    io.trigger(card);
    expect(card.hasAttribute(SR_VISIBLE_ATTR)).toBe(true);
    cleanup();
  });

  it('staggers a sibling group but never delays a lone element', () => {
    const main = makeMain(`
      <div class="s-block s-block--selia-blog">
        <div class="selia-blog__head" data-top="2200"><h2>عن المدونة</h2></div>
        <div class="selia-blog__grid">
          <div class="selia-blog__item" data-top="2600">١</div>
          <div class="selia-blog__item" data-top="2600">٢</div>
          <div class="selia-blog__item" data-top="2600">٣</div>
        </div>
      </div>`);
    const cleanup = initScrollReveal(main, { watchMutations: false });
    const cards = [...main.querySelectorAll('.selia-blog__item')] as HTMLElement[];
    expect(cards.map((c) => c.style.getPropertyValue('--sr-i'))).toEqual(['0', '1', '2']);
    expect((main.querySelector('.selia-blog__head') as HTMLElement).style.getPropertyValue('--sr-i')).toBe('0');
    cleanup();
  });

  it('does not arm under reduced motion, when disabled, or without the observer', () => {
    const html = `<div class="s-block s-block--selia-blog"><div class="selia-blog__item" data-top="2400">١</div></div>`;
    const first = makeMain(html);
    initScrollReveal(first, { enabled: false, watchMutations: false })();
    expect(document.documentElement.classList.contains(SR_ARMED_CLASS)).toBe(false);
    expect(first.querySelector('[data-sr]')).toBeNull();

    vi.stubGlobal('matchMedia', (media: string) => ({ matches: true, media }));
    const second = makeMain(html);
    initScrollReveal(second, { watchMutations: false })();
    expect(second.querySelector('[data-sr]')).toBeNull();
    expect(document.documentElement.classList.contains(SR_ARMED_CLASS)).toBe(false);
  });

  it('skips blocks that own a scroll-scrubbed stage or a canvas', () => {
    const main = makeMain(`
      <div class="s-block s-block--stamp-story"><h2 data-top="2400">الرحلة</h2></div>
      <div class="s-block s-block--second-skin"><canvas></canvas><h2 data-top="2400">المجسم</h2></div>
      <div class="s-block s-block--selia-blog"><h2 data-top="2400">الأخبار</h2></div>`);
    const cleanup = initScrollReveal(main, { watchMutations: false });
    expect(main.querySelector('.s-block--stamp-story [data-sr]')).toBeNull();
    expect(main.querySelector('.s-block--second-skin [data-sr]')).toBeNull();
    expect(main.querySelector('.s-block--selia-blog [data-sr]')).not.toBeNull();
    cleanup();
  });

  it('plays units that mount later immediately, while the first-paint hero stays still', async () => {
    const main = makeMain(`
      <div class="s-block s-block--selia-blog"><h2 data-top="200">هيرو المتجر</h2></div>`);
    const cleanup = initScrollReveal(main); // mutation watching on, as in production
    const hero = main.querySelector('h2')!;
    expect(hero.hasAttribute('data-sr')).toBe(false);

    const late = document.createElement('div');
    late.className = 's-block s-block--selia-featured-categories';
    late.innerHTML = `
      <h2 data-top="400">تصنيفات مميزة لبيتك</h2>
      <div class="selia-featured-categories__item" data-top="520">كرسي</div>`;
    main.appendChild(late);
    await new Promise((resolve) => setTimeout(resolve, 350));

    const heading = late.querySelector('h2')!;
    expect(heading.getAttribute('data-sr')).toBe('rise');
    // A lazily mounted block is already on screen: play now, don't wait for
    // an intersection that will never come.
    expect(heading.hasAttribute('data-sr-visible')).toBe(true);
    expect(heading.querySelectorAll('.sr-word')).toHaveLength(3);
    expect(hero.hasAttribute('data-sr')).toBe(false);
    cleanup();
  });

  it('sweeps units that can never cross the top-90% line at the page end', async () => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 100,
    });
    const main = makeMain(`
      <div class="s-block s-block--selia-blog">
        <div class="selia-blog__item" data-top="2400">خبر</div>
      </div>`);
    const cleanup = initScrollReveal(main, { watchMutations: false });
    const card = main.querySelector('.selia-blog__item')! as HTMLElement;
    expect(card.hasAttribute('data-sr-visible')).toBe(false);
    // The page has ended and the unit is now on screen, but it never crossed
    // the observer's 90% line: this is the case the sweep exists for.
    card.dataset.top = '500';
    window.dispatchEvent(new Event('scroll'));
    expect(card.hasAttribute('data-sr-visible')).toBe(true);
    cleanup();
  });

  it('cleanup restores a fully visible page and unwraps split headings', () => {
    const main = makeMain(`
      <div class="s-block s-block--selia-blog">
        <h2 data-top="2400">تصنيفات مميزة لبيتك</h2>
        <div class="selia-blog__item" data-top="2600">خبر</div>
      </div>`);
    const cleanup = initScrollReveal(main, { watchMutations: false });
    const heading = main.querySelector('h2')!;
    expect(heading.querySelectorAll('.sr-word')).toHaveLength(3);
    cleanup();
    expect(document.documentElement.classList.contains(SR_ARMED_CLASS)).toBe(false);
    expect(main.querySelector('[data-sr]')).toBeNull();
    expect(main.querySelector('.sr-word')).toBeNull();
    expect(heading.textContent).toBe('تصنيفات مميزة لبيتك');
  });
});
