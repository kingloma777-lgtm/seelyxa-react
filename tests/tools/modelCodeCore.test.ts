import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MAX_MODEL_CODE } from '../../app/lib/modelCode';

/* The studio page is what a merchant actually uses to get a model into the
   paste field, so its arithmetic has to be right without a browser: a wrong
   byte offset here produces a document that loads as a blank scene, and the
   merchant blames the block.

   The converter is inlined in the page — one file, so a copy of it cannot
   arrive half-loaded — and it is evaluated here straight out of that file, so
   the tests can only ever exercise the code the merchant actually runs. */

const html = readFileSync(resolve(process.cwd(), 'tools/model-code-studio.html'), 'utf8');

function extractCore(page: string): string {
  const begin = page.indexOf('/* == MODEL-CORE-BEGIN == */');
  const end = page.indexOf('/* == MODEL-CORE-END == */');
  expect(begin).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(begin);
  return page.slice(begin, end);
}

const core = new Function(`${extractCore(html)}\nreturn ModelCodeCore;`)() as {
  MAX_MODEL_CODE: number;
  build: (options: Record<string, unknown>) => Promise<Built>;
  isGlb: (bytes: Uint8Array) => boolean;
};

interface Built {
  text: string;
  chars: number;
  fits: boolean;
  binaryBytes: number;
  document: Record<string, unknown> & {
    buffers?: { byteLength: number; uri?: string }[];
    bufferViews?: { byteOffset?: number; byteLength: number; buffer?: number }[];
    images?: unknown[];
    materials?: Record<string, unknown>[];
    accessors?: { type?: string; componentType?: number }[];
    meshes?: { primitives: { attributes: Record<string, number>; indices?: number }[] }[];
  };
  notes: string[];
}

const encoder = new TextEncoder();

/** A GLB with a JSON chunk and a binary chunk — the shape every exporter writes. */
function makeGlb(document: unknown, binary: Uint8Array): Uint8Array {
  const json = encoder.encode(JSON.stringify(document));
  const jsonPad = (4 - (json.length % 4)) % 4;
  const binPad = (4 - (binary.length % 4)) % 4;
  const total = 12 + 8 + json.length + jsonPad + (binary.length ? 8 + binary.length + binPad : 0);

  const bytes = new Uint8Array(total);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, total, true);

  let offset = 12;
  view.setUint32(offset, json.length + jsonPad, true);
  view.setUint32(offset + 4, 0x4e4f534a, true);
  bytes.set(json, offset + 8);
  bytes.fill(0x20, offset + 8 + json.length, offset + 8 + json.length + jsonPad);
  offset += 8 + json.length + jsonPad;

  if (binary.length) {
    view.setUint32(offset, binary.length + binPad, true);
    view.setUint32(offset + 4, 0x004e4942, true);
    bytes.set(binary, offset + 8);
  }
  return bytes;
}

/* A minimal but complete scene: one triangle strip of four vertices, indices,
   and one "texture" that is really 900 bytes of noise — the case where the
   weight is in the image, not the mesh. */
const POSITION_BYTES = 48;
const INDEX_BYTES = 12;
const IMAGE_BYTES = 900;
const UV_BYTES = 32;
const TANGENT_BYTES = 48;

function scene(options: { extraAttribute?: boolean } = {}) {
  const binary = new Uint8Array(
    POSITION_BYTES + INDEX_BYTES + IMAGE_BYTES + UV_BYTES + (options.extraAttribute ? TANGENT_BYTES : 0)
  );
  for (let index = 0; index < binary.length; index += 1) binary[index] = index % 251;

  const afterImage = POSITION_BYTES + INDEX_BYTES + IMAGE_BYTES;
  const bufferViews = [
    { buffer: 0, byteOffset: 0, byteLength: POSITION_BYTES, target: 34962 },
    { buffer: 0, byteOffset: POSITION_BYTES, byteLength: INDEX_BYTES, target: 34963 },
    { buffer: 0, byteOffset: POSITION_BYTES + INDEX_BYTES, byteLength: IMAGE_BYTES },
    { buffer: 0, byteOffset: afterImage, byteLength: UV_BYTES, target: 34962 },
  ];
  const accessors = [
    { bufferView: 0, componentType: 5126, count: 4, type: 'VEC3' },
    { bufferView: 1, componentType: 5123, count: 6, type: 'SCALAR' },
    { bufferView: 3, componentType: 5126, count: 4, type: 'VEC2' },
  ];

  /* its own bufferView, so dropping the attribute actually frees bytes */
  if (options.extraAttribute) {
    bufferViews.push({
      buffer: 0,
      byteOffset: afterImage + UV_BYTES,
      byteLength: TANGENT_BYTES,
      target: 34962,
    });
    accessors.push({ bufferView: 4, componentType: 5126, count: 4, type: 'VEC3' });
  }

  const attributes: Record<string, number> = { POSITION: 0, TEXCOORD_0: 2 };
  if (options.extraAttribute) attributes.TANGENT = 3;

  const document = {
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes, indices: 1, material: 0 }] }],
    materials: [
      {
        pbrMetallicRoughness: {
          baseColorTexture: { index: 0 },
          metallicRoughnessTexture: { index: 0 },
        },
        normalTexture: { index: 0 },
        name: 'body',
      },
    ],
    textures: [{ source: 0 }],
    images: [{ bufferView: 2, mimeType: 'image/png' }],
    accessors,
    bufferViews,
    buffers: [{ byteLength: binary.length }],
  };
  return { document, binary };
}

const entry = (bytes: Uint8Array) => ({ name: 'model.glb', bytes });

describe('model-code-core', () => {
  it('agrees with the field ceiling the block enforces', () => {
    expect(core.MAX_MODEL_CODE).toBe(MAX_MODEL_CODE);
  });

  it('recognises a GLB by its magic, not its extension', () => {
    const { document, binary } = scene();
    expect(core.isGlb(makeGlb(document, binary))).toBe(true);
    expect(core.isGlb(encoder.encode(JSON.stringify(document)))).toBe(false);
  });

  it('folds a GLB binary chunk into one embedded buffer', async () => {
    const { document, binary } = scene();
    const built = await core.build({ entry: entry(makeGlb(document, binary)), textures: 'keep' });

    const buffers = built.document.buffers ?? [];
    expect(buffers).toHaveLength(1);
    expect(buffers[0].uri?.startsWith('data:application/octet-stream;base64,')).toBe(true);
    expect(buffers[0].byteLength).toBe(binary.length);
    expect(built.document.images).toHaveLength(1);
  });

  it('produces text the block will accept: valid JSON with an asset version', async () => {
    const { document, binary } = scene();
    const built = await core.build({ entry: entry(makeGlb(document, binary)), textures: 'keep' });
    expect(() => JSON.parse(built.text)).not.toThrow();
    expect((JSON.parse(built.text) as { asset: { version: string } }).asset.version).toBe('2.0');
  });

  /* Stripping the image has to remove the bytes as well as the reference: the
     buffer is what gets base64'd into the paste, so a deleted `images` array
     on its own would shrink nothing. */
  it('strips textures down to the geometry, bytes and all', async () => {
    const { document, binary } = scene();
    const built = await core.build({ entry: entry(makeGlb(document, binary)), textures: 'strip' });

    expect(built.document.images).toBeUndefined();
    expect(built.binaryBytes).toBe(POSITION_BYTES + INDEX_BYTES + UV_BYTES);
    expect(built.binaryBytes).toBeLessThan(binary.length);

    const material = built.document.materials?.[0] as Record<string, unknown>;
    expect(material.normalTexture).toBeUndefined();
    const pbr = material.pbrMetallicRoughness as Record<string, unknown>;
    expect(pbr.baseColorTexture).toBeUndefined();
    expect(pbr.metallicRoughnessTexture).toBeUndefined();
  });

  it('drops the bufferView an image used to live in', async () => {
    const { document, binary } = scene();
    const built = await core.build({ entry: entry(makeGlb(document, binary)), textures: 'strip' });
    expect(built.document.bufferViews).toHaveLength(3);
  });

  /* A glTF from Blender usually points at siblings; a merchant who drags the
     .gltf alone gets a message naming the file, not a blank scene. */
  it('reads sibling buffers and refuses a missing one by name', async () => {
    const { document, binary } = scene();
    const external = { ...document, buffers: [{ byteLength: binary.length, uri: 'scene.bin' }] };

    const built = await core.build({
      entry: { name: 'scene.gltf', bytes: encoder.encode(JSON.stringify(external)) },
      files: { 'scene.bin': binary },
      textures: 'keep',
    });
    expect(built.document.buffers?.[0].uri?.startsWith('data:')).toBe(true);

    await expect(
      core.build({
        entry: { name: 'scene.gltf', bytes: encoder.encode(JSON.stringify(external)) },
        textures: 'keep',
      })
    ).rejects.toThrow(/scene\.bin/);
  });

  /* Vertex colours and a second UV set have no consumer in this block, so
     dropping them is free — but only if their accessors go too. */
  it('prunes attributes and the accessors that only they used', async () => {
    const { document, binary } = scene({ extraAttribute: true });
    const before = await core.build({ entry: entry(makeGlb(document, binary)), textures: 'keep' });
    const after = await core.build({
      entry: entry(makeGlb(document, binary)),
      textures: 'keep',
      prune: true,
    });

    const attributes = after.document.meshes?.[0].primitives[0].attributes ?? {};
    expect(attributes.TANGENT).toBeUndefined();
    expect(attributes.POSITION).toBe(0);
    expect(after.binaryBytes).toBeLessThan(before.binaryBytes);
    expect(after.chars).toBeLessThan(before.chars);
  });


  /* `primitive.indices` is an accessor index that does not sit under an
     `accessor` key, so a collector that only looks for that key drops the
     index buffer and leaves the primitive pointing at whatever slid into its
     slot. The document stays valid JSON and loads — as garbage. */
  it('keeps the index accessor pointing at the index accessor', async () => {
    const { document, binary } = scene({ extraAttribute: true });
    const built = await core.build({
      entry: entry(makeGlb(document, binary)),
      textures: 'keep',
      prune: true,
    });

    const primitive = built.document.meshes?.[0].primitives[0];
    const accessors = built.document.accessors ?? [];
    expect(primitive?.indices).toBeTypeOf('number');
    expect(accessors[primitive!.indices!].type).toBe('SCALAR');
    expect(accessors[primitive!.indices!].componentType).toBe(5123);
    expect(accessors[primitive!.attributes.POSITION].type).toBe('VEC3');
    expect(accessors[primitive!.attributes.TEXCOORD_0].type).toBe('VEC2');
  });


  /* The only verdict that matters: the block hands this exact string to
     `GLTFLoader.parse`, so the converter's output is read by the same loader
     here. A document that passes every structural assertion and still parses
     to an empty scene would fail the merchant in the one way the studio is
     supposed to prevent. */
  it('writes a document the block\'s own loader can read', async () => {
    const { document, binary } = scene({ extraAttribute: true });
    const built = await core.build({
      entry: entry(makeGlb(document, binary)),
      textures: 'strip',
      prune: true,
    });

    const gltf = await new Promise<{ scene: { getObjectByProperty: (key: string, value: boolean) => { geometry: { attributes: { position: { count: number } }; index: { count: number } } } | undefined } }>(
      (resolve, reject) => new GLTFLoader().parse(built.text, '', resolve, reject)
    );
    const mesh = gltf.scene.getObjectByProperty('isMesh', true);
    expect(mesh?.geometry.attributes.position.count).toBe(4);
    expect(mesh?.geometry.index.count).toBe(6);
  });

  it('says "too big" with a ratio the merchant can act on', async () => {
    const document = {
      asset: { version: '2.0' },
      scenes: [{ nodes: [] }],
      extras: { filler: 'x'.repeat(MAX_MODEL_CODE) },
    };
    const built = await core.build({
      entry: { name: 'huge.gltf', bytes: encoder.encode(JSON.stringify(document)) },
      textures: 'keep',
    });
    expect(built.fits).toBe(false);
    expect(built.ratio).toBeGreaterThan(1);
    expect(built.chars).toBeGreaterThan(MAX_MODEL_CODE);
  });

  it('explains a file that is not a model at all', async () => {
    await expect(
      core.build({ entry: { name: 'notes.txt', bytes: encoder.encode('hello') }, textures: 'keep' })
    ).rejects.toThrow(/glTF|GLB/);
  });
});
