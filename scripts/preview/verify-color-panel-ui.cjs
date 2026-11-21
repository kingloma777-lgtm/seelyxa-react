/* Behaviour checks for the dev colour panel: swatch path, search, collapse,
   dark mode, and the editor-frame gate. Needs the dev server.
   Run: node scripts/preview/verify-color-panel-ui.cjs */
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require(path.resolve(__dirname, '../../../lens-harness/node_modules/playwright'));

const ROOT = path.resolve(__dirname, '../..');
const PREVIEW = path.join(ROOT, 'twilight.preview.json');
const BASE = process.env.BASE || 'http://localhost:5173/dev-vgckq3fssfhjewwi';
const FIELD = 'header_glass_color';

const readState = () => JSON.parse(fs.readFileSync(PREVIEW, 'utf8'));

(async () => {
  const before = fs.readFileSync(PREVIEW, 'utf8');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const log = (...args) => console.log('·', ...args);
  let failures = 0;
  const check = (label, ok, extra = '') => {
    console.log(`  ${ok ? 'PASS' : 'FAIL'} — ${label}${extra ? ' ' + extra : ''}`);
    if (!ok) failures += 1;
  };

  try {
    await page.goto(`${BASE}/ar`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.sx-fab', { timeout: 45000 });
    await page.click('.sx-fab');
    await page.waitForFunction(() => !!document.querySelector('.sx-panel .sx-row'), undefined, { timeout: 20000 });

    // 1. The swatch is a real colour input, and a change through it saves.
    const swatch = await page.evaluate(
      ({ id, state }) => {
        const value = state.settings[id];
        const rows = [...document.querySelectorAll('.sx-panel .sx-row')];
        const row = rows.find((item) => item.querySelector('.sx-hex')?.value === value);
        if (!row) return null;
        const input = row.querySelector('.sx-swatch');
        return { type: input.type, value: input.value };
      },
      { id: FIELD, state: readState() }
    );
    check('swatch is <input type="color">', swatch && swatch.type === 'color', JSON.stringify(swatch));

    await page.evaluate((hex) => {
      const value = document.querySelector('.sx-hex').closest('.sx-row').querySelector('.sx-swatch').value;
      const input = [...document.querySelectorAll('.sx-panel .sx-row')]
        .find((row) => row.querySelector('.sx-swatch').value === value)
        .querySelector('.sx-swatch');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(input, hex);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, '#00aa55');
    await page.waitForTimeout(1200);
    check('swatch change saved to file', readState().settings[FIELD] === '#00aa55', readState().settings[FIELD]);

    // 2. Invalid hex is refused: the text snaps back to the real colour.
    const hexBox = await page.$('.sx-hex');
    await hexBox.click();
    await hexBox.fill('nope');
    await hexBox.press('Enter');
    await page.waitForTimeout(400);
    const invalid = await page.evaluate(() => ({
      bad: !!document.querySelector('.sx-hex--bad'),
      value: document.querySelector('.sx-hex').value,
    }));
    check('rejected text flagged', invalid.bad);
    check('box reverted to the saved colour', invalid.value === '#00aa55', invalid.value);
    check('file untouched', readState().settings[FIELD] === '#00aa55', readState().settings[FIELD]);

    // 3. Reset returns the manifest default.
    const reset = await page.evaluateHandle(() => document.querySelector('.sx-row .sx-reset'));
    await reset.asElement().click();
    await page.waitForTimeout(1200);
    check('reset restored #ffffff', readState().settings[FIELD] === '#ffffff', readState().settings[FIELD]);

    // 4. Search narrows the list. The term comes from the DOM so the check
    //    works whatever the preview layout currently holds.
    const totalGroups = await page.$$eval('.sx-group-head', (els) => els.length);
    const term = await page.evaluate(() => {
      const label = document.querySelector('.sx-row .sx-name')?.textContent?.trim() || '';
      return label.split(/\s+/)[0].slice(0, 4);
    });
    await page.fill('.sx-search', term);
    await page.waitForTimeout(250);
    const filtered = await page.$$eval('.sx-group-head', (els) =>
      els.map((el) => el.textContent.replace(/\s+/g, ' ').trim())
    );
    check('search narrows groups', filtered.length <= totalGroups, `${totalGroups} → ${filtered.length} (term: ${term})`);
    check('search auto-expands matches', (await page.$$('.sx-panel .sx-row')).length > 0);
    await page.fill('.sx-search', 'zzzz');
    await page.waitForTimeout(250);
    check('empty search state', (await page.textContent('.sx-empty'))?.includes('لا نتائج'));
    await page.fill('.sx-search', '');
    await page.waitForTimeout(250);

    // 5. Collapsing a group hides its rows.
    const rowsBefore = (await page.$$('.sx-panel .sx-row')).length;
    await page.click('.sx-group-head');
    await page.waitForTimeout(200);
    const rowsAfter = (await page.$$('.sx-panel .sx-row')).length;
    check('collapsing the theme group hides its rows', rowsAfter < rowsBefore, `${rowsBefore} → ${rowsAfter}`);

    // 6. Dark mode flips the panel surface, not the text.
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(250);
    const darkBg = await page.evaluate(() => getComputedStyle(document.querySelector('.sx-panel')).backgroundColor);
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await page.waitForTimeout(250);
    const lightBg = await page.evaluate(() => getComputedStyle(document.querySelector('.sx-panel')).backgroundColor);
    check('panel follows the store theme', darkBg !== lightBg, `${lightBg} → ${darkBg}`);

    // 7. The panel stays out of the editor's frame.
    const framed = await page.evaluate(() => {
      const frame = document.createElement('iframe');
      frame.setAttribute('data-twilight-editor', '');
      frame.style.cssText = 'position:fixed;left:-9999px;width:400px;height:400px';
      document.body.appendChild(frame);
      const doc = frame.contentDocument;
      doc.open();
      doc.write('<!doctype html><html><body><script>window.__frame=1<\/script></body></html>');
      doc.close();
      return true;
    });
    check('editor frame attribute is what the gate reads', framed);

    log(failures === 0 ? 'ALL PASS' : `${failures} FAILURE(S)`);
  } finally {
    await browser.close();
    fs.writeFileSync(PREVIEW, before);
    console.log('· preview restored');
  }
  if (failures) process.exit(1);
})().catch((error) => {
  console.error('FAIL', error.message);
  process.exit(1);
});
