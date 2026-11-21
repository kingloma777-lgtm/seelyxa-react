import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';

/* The core has its own tests; this one proves the *page* is wired to it — the
   file input reaches `build`, the verdict is written, and the copy button is
   only live when the text actually fits. A page that renders a green tick and
   copies nothing is worse than no page at all. */

const tools = resolve(process.cwd(), 'tools');
const html = readFileSync(resolve(tools, 'model-code-studio.html'), 'utf8');

/** A GLB with one primitive; `fillerChars` pads the JSON to push it over the
 *  ceiling, which is exactly how a real model gets there — weight, not shape. */
function makeGlb(fillerChars = 0): Uint8Array {
  const binary = new Uint8Array(48 + 12);
  for (let index = 0; index < binary.length; index += 1) binary[index] = index % 251;

  const document = {
    asset: { version: '2.0' },
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 4, type: 'VEC3' },
      { bufferView: 1, componentType: 5123, count: 6, type: 'SCALAR' },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 48 },
      { buffer: 0, byteOffset: 48, byteLength: 12 },
    ],
    buffers: [{ byteLength: binary.length }],
    extras: fillerChars ? { filler: 'x'.repeat(fillerChars) } : {},
  };

  const json = new TextEncoder().encode(JSON.stringify(document));
  const jsonPad = (4 - (json.length % 4)) % 4;
  const binPad = (4 - (binary.length % 4)) % 4;
  const total = 12 + 8 + json.length + jsonPad + 8 + binary.length + binPad;
  const bytes = new Uint8Array(total);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, total, true);
  view.setUint32(12, json.length + jsonPad, true);
  view.setUint32(16, 0x4e4f534a, true);
  bytes.set(json, 20);
  bytes.fill(0x20, 20 + json.length, 20 + json.length + jsonPad);
  const binStart = 20 + json.length + jsonPad;
  view.setUint32(binStart, binary.length + binPad, true);
  view.setUint32(binStart + 4, 0x004e4942, true);
  bytes.set(binary, binStart + 8);
  return bytes;
}

async function openStudio() {
  const dom = await JSDOM.fromFile(resolve(tools, 'model-code-studio.html'), {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
  });
  await new Promise((done) => dom.window.addEventListener('load', done));
  return dom;
}

async function drop(dom: JSDOM, name: string, bytes: Uint8Array) {
  const { window } = dom;
  const input = window.document.getElementById('picker') as unknown as HTMLInputElement;
  const file = new window.File([bytes as unknown as BlobPart], name);
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  input.dispatchEvent(new window.Event('change', { bubbles: true }));
  /* the page paints once (30 ms) before it builds, then works through a
     promise chain — 300 ms covers it without a fake clock */
  await new Promise((done) => setTimeout(done, 300));
  return window.document;
}

describe('model-code-studio page', () => {
  /* One file, because the ways this page travels — mailed, copied to a
     desktop, opened from a preview panel under another base path — all break a
     sibling `<script src>` silently: the page renders, the drop zone looks
     ready, and every drop does nothing. */
  it('carries its converter inline, with no sibling script to lose', () => {
    expect(html).not.toMatch(/<script[^>]+src=/);
    expect(html).toContain('/* == MODEL-CORE-BEGIN == */');
    expect(html).toContain('var ModelCodeCore');
  });

  it('turns a dropped GLB into text and enables the copy button', async () => {
    const dom = await openStudio();
    const document = await drop(dom, 'model.glb', makeGlb());

    expect(document.getElementById('result')?.className).toContain('on');
    expect(document.getElementById('verdict')?.textContent).toContain('يدخل الحقل');
    expect((document.getElementById('copy') as HTMLButtonElement).disabled).toBe(false);

    const text = (document.getElementById('preview') as HTMLTextAreaElement).value;
    const parsed = JSON.parse(text) as { buffers: { uri: string }[] };
    expect(parsed.buffers[0].uri.startsWith('data:application/octet-stream;base64,')).toBe(true);
    dom.window.close();
  });

  /* The whole point of the page is to say "don't paste this" before the
     merchant tries. A verdict that still offers the copy button is the bug. */
  it('refuses to hand over text over the ceiling', async () => {
    const dom = await openStudio();
    const document = await drop(dom, 'huge.glb', makeGlb(400_000));

    expect(document.getElementById('verdict')?.textContent).toContain('أكبر من الحقل');
    expect((document.getElementById('copy') as HTMLButtonElement).disabled).toBe(true);
    expect(document.getElementById('advice')?.style.display).toBe('block');
    dom.window.close();
  });
});
