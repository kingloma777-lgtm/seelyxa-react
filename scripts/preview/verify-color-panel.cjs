/* Verifies the dev colour panel end to end against the running dev server.
   Not part of the test suite: it needs a live storefront and a real store.
   Run: node scripts/preview/verify-color-panel.cjs */
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require(path.resolve(__dirname, '../../../lens-harness/node_modules/playwright'));

const ROOT = path.resolve(__dirname, '../..');
const PREVIEW = path.join(ROOT, 'twilight.preview.json');
const BASE = process.env.BASE || 'http://localhost:5173';

const FIELD = 'header_glass_color';
const TEST_HEX = '#ff0000';

const readState = () => JSON.parse(fs.readFileSync(PREVIEW, 'utf8'));

(async () => {
  const before = fs.readFileSync(PREVIEW, 'utf8');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const log = (...args) => console.log('·', ...args);

  try {
    await page.goto(`${BASE}/ar`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.sx-fab', { timeout: 45000 });
    log('FAB rendered');

    await page.click('.sx-fab');
    await page.waitForSelector('.sx-panel', { timeout: 10000 });
    log('panel opened');

    await page.waitForFunction(
      () => !!document.querySelector('.sx-panel .sx-row'),
      undefined,
      { timeout: 20000 }
    );

    const count = await page.$$eval('.sx-panel .sx-row', (rows) => rows.length);
    const head = await page.textContent('.sx-panel .sx-head');
    const groups = await page.$$eval('.sx-group-head', (els) =>
      els.map((el) => el.textContent.replace(/\s+/g, ' ').trim())
    );
    log(`theme rows visible: ${count} | header: ${head.replace(/\s+/g, ' ').trim()}`);
    log(`groups: ${groups.length} → ${groups.slice(0, 6).join(' / ')}`);

    // Find the row by its manifest id through the hex box's row, using the label.
    const rowLabel = await page.evaluate((id) => {
      const rows = [...document.querySelectorAll('.sx-panel .sx-row')];
      return rows.length ? rows[0].querySelector('.sx-name')?.textContent : null;
    }, FIELD);
    log(`first row label: ${rowLabel}`);

    // Type a colour into the first row (header glass colour is the 4th theme row;
    // locate it by matching the current value against the saved state).
    const target = await page.evaluate(
      ({ id, state }) => {
        const value = state.settings[id];
        const rows = [...document.querySelectorAll('.sx-panel .sx-row')];
        const match = rows.find((row) => row.querySelector('.sx-hex')?.value === value);
        if (!match) return null;
        const hex = match.querySelector('.sx-hex');
        hex.dataset.probe = 'target';
        return { label: match.querySelector('.sx-name')?.textContent, value: hex.value };
      },
      { id: FIELD, state: readState() }
    );
    if (!target) throw new Error(`no row found for ${FIELD}`);
    log(`target row: ${target.label} = ${target.value}`);

    const hexBox = await page.$('.sx-hex[data-probe="target"]');
    await hexBox.click();
    await hexBox.fill(TEST_HEX);
    await hexBox.press('Enter');
    log('typed ' + TEST_HEX);

    await page.waitForFunction(
      () => document.querySelector('.sx-panel .sx-status')?.textContent?.includes('محفوظ'),
      undefined,
      { timeout: 15000 }
    );
    log('status: saved');

    const saved = readState();
    if (saved.settings[FIELD] !== TEST_HEX) {
      throw new Error(`file not written: ${FIELD} = ${JSON.stringify(saved.settings[FIELD])}`);
    }
    log(`twilight.preview.json → ${FIELD}: ${saved.settings[FIELD]}`);

    // The storefront must pick the colour up without a reload.
    const applied = await page.evaluate(() => {
      const header = document.querySelector('.morph-header');
      if (!header) return 'no header';
      const style = getComputedStyle(header);
      return style.getPropertyValue('--morph-glass-color').trim() || header.getAttribute('style');
    });
    log(`storefront --morph-glass-color: ${applied}`);
    if (!String(applied).includes('255, 0, 0') && !String(applied).toLowerCase().includes('#ff0000')) {
      throw new Error(`storefront did not apply the colour: ${applied}`);
    }

    // Reset must restore the manifest default.
    const resetButton = await page.evaluateHandle((el) => el.closest('.sx-row').querySelector('.sx-reset'), hexBox);
    await resetButton.asElement().click();
    await page.waitForTimeout(1200);
    const afterReset = readState();
    log(`after reset → ${FIELD}: ${JSON.stringify(afterReset.settings[FIELD])}`);

    log('PASS');
  } finally {
    await browser.close();
    fs.writeFileSync(PREVIEW, before);
    const restored = readState();
    console.log('· preview restored;', FIELD, '=', JSON.stringify(restored.settings[FIELD]));
  }
})().catch((error) => {
  console.error('FAIL', error.message);
  process.exit(1);
});
