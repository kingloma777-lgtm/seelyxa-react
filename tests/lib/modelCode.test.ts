import { describe, it, expect } from 'vitest';
import { checkModelCode, parseModelCode, MAX_MODEL_CODE } from '../../app/lib/modelCode';

/* The paste field is the only way a merchant can supply a model without
   hosting one: a `.gltf` is JSON, and its buffers can be embedded as base64,
   so the whole model fits in a setting. These pin what is and is not accepted
   — a wrong guess here renders a blank stage with no error anywhere. */

describe('parseModelCode', () => {
  it('accepts a glTF document pasted as text', () => {
    const json = JSON.stringify({ asset: { version: '2.0' }, scenes: [], nodes: [] });
    expect(parseModelCode(json)).toEqual({ kind: 'gltf', json });
  });

  /* glTF is recognised by its own `asset.version`, not by being valid JSON:
     anything else that parses is either a silhouette recipe or a mistake. */
  it('does not treat arbitrary JSON as a model', () => {
    expect(parseModelCode('{"hello": 1}')).toBeNull();
    expect(parseModelCode('[1, 2, 3]')).toBeNull();
    expect(parseModelCode('{"asset": {"version": 2}}')).toBeNull();
  });

  it('decodes a base64 data URI into bytes', () => {
    /* "glTF" — the GLB magic — is enough to prove the decode; a full model
       would only test atob. */
    const model = parseModelCode('data:model/gltf-binary;base64,Z2xURg==');
    expect(model?.kind).toBe('binary');
    const bytes = new Uint8Array((model as { buffer: ArrayBuffer }).buffer);
    expect(Array.from(bytes)).toEqual([0x67, 0x6c, 0x54, 0x46]);
  });

  it('refuses a data URI that carries no base64 payload', () => {
    expect(parseModelCode('data:text/plain,hello')).toBeNull();
    expect(parseModelCode('data:model/gltf-binary;base64,')).toBeNull();
  });

  it('reads a silhouette recipe, bare or under a profile key', () => {
    expect(parseModelCode('[[0,0],[0.2,0],[0.2,1],[0,1]]')?.kind).toBe('profile');
    expect(parseModelCode('{"profile": [[0,0],[0.2,0],[0.2,1],[0,1]]}')?.kind).toBe(
      'profile'
    );
  });

  it('refuses anything that is not a model', () => {
    expect(parseModelCode('')).toBeNull();
    expect(parseModelCode('   ')).toBeNull();
    expect(parseModelCode('hello world')).toBeNull();
    expect(parseModelCode('{ broken json')).toBeNull();
    expect(parseModelCode(undefined)).toBeNull();
    expect(parseModelCode(42)).toBeNull();
  });

  /* The paste travels inside the page payload on every request, so it is
     capped well below what the browser could parse; bigger models use the
     link field. */
  it('refuses a paste too large to travel in the page', () => {
    const huge = `{"asset":{"version":"2.0"},"pad":"${'x'.repeat(MAX_MODEL_CODE)}"}`;
    expect(parseModelCode(huge)).toBeNull();
  });
});

/* The reason a paste produced no product. On screen every failure looks the
   same — an absent product — so the reason is the only thing that can tell a
   merchant "your file is 29x too big" from "that is not a model". */
describe('checkModelCode', () => {
  it('names the three ways a paste succeeds', () => {
    expect(checkModelCode('{"asset":{"version":"2.0"}}')).toMatchObject({
      status: 'ok',
      model: { kind: 'gltf' },
    });
    expect(checkModelCode('data:model/gltf-binary;base64,Z2xURg==')).toMatchObject({
      status: 'ok',
      model: { kind: 'binary' },
    });
    expect(checkModelCode('[[0,0],[0.2,0],[0.2,1],[0,1]]')).toMatchObject({
      status: 'ok',
      model: { kind: 'profile' },
    });
  });

  it('separates an empty field from an unreadable paste', () => {
    expect(checkModelCode('').status).toBe('empty');
    expect(checkModelCode('   ').status).toBe('empty');
    expect(checkModelCode(undefined).status).toBe('empty');
    expect(checkModelCode('hello world').status).toBe('unreadable');
    expect(checkModelCode('{ broken json').status).toBe('unreadable');
    expect(checkModelCode('{"hello": 1}').status).toBe('unreadable');
  });

  /* The ceiling is checked before the content, so a real glTF document that is
     simply too big is refused as too big — never parsed, never trimmed. The
     merchant gets told which of the two problems they have. */
  it('refuses an oversized paste as oversized, even when it is a valid model', () => {
    const huge = `{"asset":{"version":"2.0"},"pad":"${'x'.repeat(MAX_MODEL_CODE)}"}`;
    const check = checkModelCode(huge);
    expect(check.status).toBe('oversize');
    expect(check.model).toBeNull();
  });

  /* An 8.67 MB buffer is 11.5 M characters once base64'd, which is the paste
     that actually froze a merchant's editor. It must be refused on its length
     alone — no parse, no decode, no copy. */
  it('refuses a real-world oversized model without decoding it', () => {
    const body = 'A'.repeat(11_560_688);
    const started = Date.now();
    const check = checkModelCode(`data:application/octet-stream;base64,${body}`);
    expect(check.status).toBe('oversize');
    expect(check.model).toBeNull();
    /* decoding 11.5 M characters is tens of milliseconds at best and hundreds
       on a slow laptop; the length check is a single comparison. The bound is
       loose enough not to flake and tight enough to catch a decode. */
    expect(Date.now() - started).toBeLessThan(15);
  });

  it('keeps the ceiling in a range the page can carry', () => {
    expect(MAX_MODEL_CODE).toBeLessThanOrEqual(400_000);
  });
});
