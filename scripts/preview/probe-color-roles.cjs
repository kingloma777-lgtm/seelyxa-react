/* Which elements does a colour control actually paint?
 *
 * For each block: snapshot the computed style of every descendant, override one
 * derived custom property with a garish value, re-read, and report what moved.
 * This is how the colour descriptions are grounded in the DOM instead of in a
 * guess about which CSS rule "should" win.
 *
 * Run: node scripts/preview/probe-color-roles.cjs
 */
const path = require('node:path');
const { chromium } = require(path.resolve(__dirname, '../../../lens-harness/node_modules/playwright'));

const BASE = process.env.BASE || 'http://localhost:5173/dev-vgckq3fssfhjewwi';

const BLOCKS = [
  'selia-advanced-slider',
  'selia-featured-categories',
  'selia-detailed-products',
  'selia-about-store',
  'selia-image-grid',
  'selia-before-after',
  'selia-featured-animated-products',
  'selia-offers-counter',
  'selia-special-offer',
];

const PROPS = ['color', 'backgroundColor', 'borderTopColor', 'outlineColor', 'backgroundImage', 'fill'];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(`${BASE}/ar`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  /* Home blocks mount when they come into view, so walk the page first. */
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 220));
    }
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 600));
  });

  const result = await page.evaluate(
    ({ BLOCKS, PROPS }) => {
      const out = {};
      const snapshot = (root) => {
        const nodes = [root, ...root.querySelectorAll('*')];
        return nodes.map((el) => {
          const cs = getComputedStyle(el);
          return {
            el,
            name:
              el.tagName.toLowerCase() +
              (el.className && typeof el.className === 'string'
                ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
                : ''),
            values: PROPS.map((p) => cs[p]),
          };
        });
      };
      const diff = (before, after) => {
        const changes = [];
        before.forEach((item, i) => {
          const next = after[i];
          if (!next) return;
          PROPS.forEach((p, k) => {
            if (item.values[k] !== next.values[k]) {
              changes.push({ el: item.name, prop: p, from: item.values[k], to: next.values[k] });
            }
          });
        });
        return changes;
      };
      const probe = (section, prop, value) => {
        const before = snapshot(section);
        const previous = section.style.getPropertyValue(prop);
        section.style.setProperty(prop, value);
        // Transitions would report an interpolated value; ask for a reflow twice.
        void section.offsetHeight;
        const after = snapshot(section);
        if (previous) section.style.setProperty(prop, previous);
        else section.style.removeProperty(prop);
        return diff(before, after);
      };

      for (const block of BLOCKS) {
        const section = document.querySelector(`.selia--${block.replace(/^selia-/, '')}`);
        if (!section) {
          out[block] = { missing: true };
          continue;
        }
        out[block] = {
          accent: probe(section, '--selia-accent', '#ff00ff'),
          bg: probe(section, '--selia-bg', '#ff00ff'),
          ink: probe(section, '--selia-ink', '#ff00ff'),
        };
        // Row colours: only the first colour of a card reaches --card-accent.
        const card = section.querySelector('[style*="--card-accent"]');
        if (card) out[block].cardAccent = probe(card, '--card-accent', '#ff00ff');
      }
      return out;
    },
    { BLOCKS, PROPS }
  );

  for (const [block, data] of Object.entries(result)) {
    if (data.missing) {
      console.log(`\n## ${block} — NOT ON PAGE`);
      continue;
    }
    console.log(`\n## ${block}`);
    for (const role of ['bg', 'ink', 'accent', 'cardAccent']) {
      const changes = data[role];
      if (!changes) continue;
      const summary = [...new Set(changes.map((c) => `${c.el} [${c.prop}]`))];
      console.log(`   ${role.padEnd(11)} → ${summary.length ? summary.slice(0, 8).join(' | ') : '(nothing changes)'}`);
    }
  }

  await browser.close();
})();
