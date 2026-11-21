import { prefersReducedMotion } from './homeBlock';

/**
 * Scroll reveal, ported from the reference storefront's GSAP/ScrollTrigger
 * motion (themes/1014726610 1.4.0, `initRevealAnimations` / `scrollMotion`).
 *
 * The reference's numbers, kept verbatim rather than approximated:
 *
 *   start      top 90%          → rootMargin bottom -10%, threshold 0
 *   from       autoAlpha .08    → opacity .08
 *              y 58             → translate 0 58px
 *   duration   1s               → --sr-duration
 *   ease       power3.out       → cubic-bezier(.165,.84,.44,1) (easeOutQuart)
 *   stagger    .16s             → --sr-stagger, per sibling group
 *   toggle     play none none none → one-shot: unobserve after revealing
 *   split      yPercent 118, rotation 2.5, autoAlpha .12, stagger .13,
 *              power4.out, word-level in RTL (character-level would break
 *              Arabic joining — see the playbook's SplitText trap)
 *
 * We deliberately do NOT add GSAP: a single IntersectionObserver and two
 * compositor-only properties (`opacity`, `translate`) reproduce the same
 * entrance without shipping a 70 KB animation runtime. `translate` is used
 * instead of `transform` so a card's own hover transform keeps working.
 *
 * All of this is armed only after hydration. Server HTML is fully visible:
 * no JS, reduced motion or a disabled merchant switch means no hidden state
 * ever exists, so the page can never be left blank by an observer that did
 * not fire.
 */

export const SR_ARMED_CLASS = 'sr-armed';
/**
 * React owns `className` on these nodes. A block that re-renders when it
 * mounts (the catalogue, a lazy section) would wipe a `.is-visible` class and
 * leave the unit hidden forever — the exact reduced-motion trap in the
 * playbook. An attribute React never writes is stable across re-renders.
 */
export const SR_VISIBLE_ATTR = 'data-sr-visible';

/** Sections that own a scroll-scrubbed stage, canvas or their own reveal. */
const OWN_MOTION = /s-block--(?:stamp-story|second-skin|product-scrub|portal-hero|arc-coverflow|product-chapters|stats-orbit|selia-statistics|enhanced-slider|photos-slider|advanced-slider|figurines|main-links|custom-testimonials)/;

const UNIT_KEYS = [
  'card', 'item', 'tile', 'panel', 'feature', 'stat', 'step', 'slide',
  'badge', 'chip', 'box', 'entry', 'post', 'product', 'category', 'banner',
  'head', 'title', 'subtitle', 'caption', 'eyebrow', 'desc', 'description',
  'cta', 'action', 'quote', 'number', 'image', 'media', 'figure', 'list-item',
];

const UNIT_SELECTOR = [
  'h1', 'h2', 'h3', 'h4', 'p', 'figure', 'blockquote', 'ul', 'ol', 'form',
  ...UNIT_KEYS.flatMap((key) => [`[class*="__${key}"]`, `[class*="-${key}"]`]),
].join(',');

const HEADING_TAGS = new Set(['H1', 'H2', 'H3', 'H4']);
const MAX_UNITS_PER_SECTION = 24;
const MAX_STAGGER_INDEX = 10;

export interface ScrollRevealOptions {
  /** Merchant switch; `false` disables the layer entirely. */
  enabled?: boolean;
  /** Re-scan after late-mounted blocks (`renderWhenVisible`). */
  watchMutations?: boolean;
}

/** A wrapper element with no box can never intersect (display: contents). */
function eligible(el: HTMLElement, section: HTMLElement): boolean {
  if (el === section || el.hasAttribute('data-sr') || el.closest('[data-sr]')) return false;
  if (el.closest('[data-no-sr], [data-reveal], [data-nx-no-reveal]')) return false;
  if (el.querySelector('canvas, video, iframe, [data-reveal], [data-no-sr]')) return false;

  const box = el.getBoundingClientRect();
  if (box.width < 40 || box.height < 24) return false;

  const style = getComputedStyle(el);
  if (style.display === 'none' || style.display === 'contents') return false;
  if (style.visibility === 'hidden' || style.position === 'fixed' || style.position === 'sticky') {
    return false;
  }
  // Decorative half-transparent layers would be forced to opacity 1 on arrival.
  if (Number.parseFloat(style.opacity) < 0.99) return false;

  // A transformed/opacity ancestor of a sticky stage breaks stickiness; skip
  // the unit instead of taking the risk on a scrubbed block.
  let parent = el.parentElement;
  while (parent && parent !== section) {
    const position = getComputedStyle(parent).position;
    if (position === 'sticky' || position === 'fixed') return false;
    parent = parent.parentElement;
  }
  return true;
}

/**
 * Wrap a heading's words in masking spans. Word-level for both scripts: the
 * reference splits Latin into characters, but an Arabic letter in its own
 * inline-block loses its joining form. Only plain-text headings are touched —
 * React owns no child nodes there, so a later re-render cannot fight us.
 */
export function splitHeading(el: HTMLElement): boolean {
  if (el.dataset.srSplit === '1') return true;
  if (el.children.length > 0) return false;
  const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  if (!text || text.length > 90) return false;
  const words = text.split(' ');
  if (words.length < 2 || words.length > 14) return false;

  const fragment = document.createDocumentFragment();
  words.forEach((word, index) => {
    if (index) fragment.appendChild(document.createTextNode(' '));
    const outer = document.createElement('span');
    outer.className = 'sr-word';
    const inner = document.createElement('span');
    inner.className = 'sr-word__in';
    inner.style.setProperty('--sr-w', String(index));
    inner.textContent = word;
    outer.appendChild(inner);
    fragment.appendChild(outer);
  });

  el.dataset.srText = text;
  el.textContent = '';
  el.appendChild(fragment);
  el.dataset.srSplit = '1';
  return true;
}

function restoreHeading(el: HTMLElement) {
  if (el.dataset.srText !== undefined) el.textContent = el.dataset.srText;
  delete el.dataset.srText;
  delete el.dataset.srSplit;
}

/** Find the outermost content units of one section. */
function unitsOf(section: HTMLElement): HTMLElement[] {
  if (OWN_MOTION.test(section.className) || section.hasAttribute('data-no-sr')) return [];
  if (section.querySelector('canvas, video, iframe')) return [];

  const candidates = Array.from(section.querySelectorAll<HTMLElement>(UNIT_SELECTOR)).filter((el) =>
    eligible(el, section)
  );
  // Keep the outermost candidate only: revealing a card AND its own caption
  // would double the motion and make the caption arrive twice as late.
  const set = new Set(candidates);
  const outermost = candidates.filter((el) => {
    let parent = el.parentElement;
    while (parent && parent !== section) {
      if (set.has(parent)) return false;
      parent = parent.parentElement;
    }
    return true;
  });
  return outermost.slice(0, MAX_UNITS_PER_SECTION);
}

/**
 * Tag + observe one `main` subtree. Returns a cleanup function; safe to call
 * again on route changes. The returned function always restores a fully
 * visible page, even if the caller forgets to remove the section markup.
 */
export function initScrollReveal(
  root: HTMLElement,
  { enabled = true, watchMutations = true }: ScrollRevealOptions = {}
): () => void {
  if (!enabled || typeof window === 'undefined') return () => {};
  if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return () => {};

  const tagged: HTMLElement[] = [];
  const split: HTMLElement[] = [];
  // Every unit we have ever judged, tagged or deliberately left alone. Home
  // blocks mount lazily (`renderWhenVisible`), so a later scan must be able to
  // tell "a new block just arrived" from "the same hero, re-measured".
  const judged = new WeakSet<Element>();
  let firstPass = true;
  const sections = () => Array.from(root.children).filter((n): n is HTMLElement => n instanceof HTMLElement);

  const pending = new Set<HTMLElement>();
  const reveal = (unit: HTMLElement) => {
    unit.setAttribute(SR_VISIBLE_ATTR, '1');
    pending.delete(unit);
    observer.unobserve(unit);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal(entry.target as HTMLElement);
      }
    },
    // `top 90%` in the reference: the bottom edge of the root is pulled up
    // 10% of the viewport, so a unit starts as its top crosses that line.
    { rootMargin: '0px 0px -10% 0px', threshold: 0 }
  );

  const collect = () => {
    const fresh: { unit: HTMLElement; inView: boolean }[] = [];
    for (const section of sections()) {
      const units = unitsOf(section);
      // Stagger belongs to a sibling group (four cards in one grid), not to
      // DOM order across the page. A lone heading never waits for the cards.
      const sizes = new Map<Element, number>();
      const seen = new Map<Element, number>();
      units.forEach((unit) => {
        const key = unit.parentElement ?? section;
        sizes.set(key, (sizes.get(key) ?? 0) + 1);
      });

      // On the very first pass, anything already on screen (the hero) is left
      // completely untouched: no hidden frame, no entrance, no blink. Blocks
      // mounted LATER already sit inside the viewport when they appear, so
      // they are tagged and played immediately — that IS their scroll reveal.
      const incoming = units.filter((unit) => {
        if (judged.has(unit)) return false;
        judged.add(unit);
        return !(firstPass && unit.getBoundingClientRect().top < window.innerHeight * 0.9);
      });

      incoming.forEach((unit) => {
        const key = unit.parentElement ?? section;
        const size = sizes.get(key) ?? 1;
        const index = seen.get(key) ?? 0;
        seen.set(key, index + 1);
        unit.dataset.sr = 'rise';
        unit.style.setProperty('--sr-i', String(size > 1 ? Math.min(index, MAX_STAGGER_INDEX) : 0));
        fresh.push({ unit, inView: unit.getBoundingClientRect().top < window.innerHeight * 0.9 });
        tagged.push(unit);
      });

      // One heading per section gets the word-mask entrance (the reference's
      // `data-nx="split"`). The outermost unit is usually a `.selia__head`
      // wrapper, so look INSIDE it: the container keeps its own rise and the
      // words travel inside their masks at the same time.
      const heading = incoming
        .map((unit) =>
          HEADING_TAGS.has(unit.tagName)
            ? unit
            : unit.querySelector<HTMLElement>('h1, h2, h3, h4')
        )
        .find((candidate) => candidate && (candidate.textContent ?? '').trim().length > 1);
      if (heading && splitHeading(heading)) {
        const host = incoming.find((unit) => unit === heading || unit.contains(heading));
        if (host) host.dataset.srWords = '1';
        split.push(heading);
      }
    }
    firstPass = false;
    if (!fresh.length) return;
    document.documentElement.classList.add(SR_ARMED_CLASS);
    for (const { unit, inView } of fresh) {
      if (inView) unit.setAttribute(SR_VISIBLE_ATTR, '1');
      else {
        pending.add(unit);
        observer.observe(unit);
      }
    }
  };

  /* The reference wraps its start in `clamp(...)` for exactly this case: a
     unit sitting in the last 10% of the document can never cross a `top 90%`
     line, so a -10% rootMargin would leave it invisible forever. Sweep the
     remaining on-screen units once the page reaches its end. */
  let frame = 0;
  const sweep = () => {
    frame = 0;
    if (!pending.size) return;
    const doc = document.documentElement;
    if (window.scrollY + window.innerHeight < doc.scrollHeight - 160) return;
    for (const unit of [...pending]) {
      if (unit.getBoundingClientRect().top < window.innerHeight) reveal(unit);
    }
  };
  const onScroll = () => {
    if (!frame) frame = window.requestAnimationFrame(sweep);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  let timer: ReturnType<typeof setTimeout> | undefined;
  let mutationObserver: MutationObserver | undefined;
  let busy = false;

  collect();

  if (watchMutations && typeof MutationObserver !== 'undefined') {
    mutationObserver = new MutationObserver(() => {
      if (busy) return;
      // childList only — our own class/attribute writes must not re-trigger us.
      clearTimeout(timer);
      timer = setTimeout(() => {
        busy = true;
        try {
          collect();
        } finally {
          busy = false;
        }
      }, 180);
    });
    mutationObserver.observe(root, { childList: true, subtree: true });
  }

  return () => {
    clearTimeout(timer);
    if (frame) window.cancelAnimationFrame(frame);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    mutationObserver?.disconnect();
    observer.disconnect();
    pending.clear();
    // Remove the arming class FIRST: the hidden rules stop applying before
    // any per-element state is cleaned up, so nothing can stay invisible.
    document.documentElement.classList.remove(SR_ARMED_CLASS);
    for (const unit of tagged) {
      unit.removeAttribute(SR_VISIBLE_ATTR);
      delete unit.dataset.sr;
      delete unit.dataset.srWords;
      unit.style.removeProperty('--sr-i');
    }
    for (const heading of split) restoreHeading(heading);
  };
}
