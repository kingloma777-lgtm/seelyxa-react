/* ==========================================================================
   The merchant's own model, pasted as text.

   Why this file exists. The theme editor has exactly one uploader — the
   `image` field — and it refuses a `.glb` outright («تعذّر رفع الصورة»), while
   Salla's own 3D product API wants a public CDN URL. So a merchant who owns a
   model but has nowhere to host it has no path at all.

   Except text. A `.gltf` is JSON, and its buffers can be embedded as base64,
   which collapses the whole model into one string — and a string is something
   the editor can store. That is the whole trick: no hosting, no uploader, no
   third-party service, and the merchant's model never leaves their store.

   Three things are accepted, most specific first:

     - a glTF JSON document (`{"asset": {"version": "2.0"}, …}`) — the
       single-file export every DCC tool offers ("glTF Embedded");
     - a `data:` URI holding a GLB in base64 — what a converter hands you;
     - a silhouette recipe (`{"profile": [[r, h], …]}`) — no file at all, for
       a merchant who wants a custom solid rather than a mesh.

   Recognising glTF by its own `asset.version` and not by the field's name is
   deliberate: a paste that happens to be valid JSON is not automatically a
   model, and silently treating it as one is how a merchant ends up staring at
   a blank canvas with no error.
   ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import { profileFromCode } from './productShape';

export type CodeModel =
  /** a glTF JSON document, ready for `GLTFLoader.parse` */
  | { kind: 'gltf'; json: string }
  /** a GLB, already decoded */
  | { kind: 'binary'; buffer: ArrayBuffer }
  /** a lathe silhouette, no file involved */
  | { kind: 'profile'; points: Array<[number, number]> };

/** A paste travels inside the page payload on EVERY request, so the ceiling is
 * about page weight, not about what a browser can parse.
 *
 * 400 000 characters ≈ 300 KB of binary model, and that is already a heavy
 * hero block. The number is deliberately far below the 1.2 M the field first
 * allowed, because a merchant who pasted an 11 MB car export (a 8.67 MB buffer
 * is 11.5 M base64 characters before any JSON scaffolding) did not get a slow
 * product — he got a storefront that had to ship 11 MB of settings JSON to
 * every visitor, and an editor that froze on every keystroke. A textarea is
 * the wrong home for a model that size; the link field is the right one. */
export const MAX_MODEL_CODE = 400_000;

/** Why a paste did or did not become a model. The reason is published on the
 * canvas (`data-code`) because "nothing rendered" and "your paste is too big"
 * look identical on screen, and only one of them is the merchant's to fix. */
export type CodeStatus =
  /** nothing pasted */
  | 'empty'
  /** a model, ready to build */
  | 'ok'
  /** past the ceiling — refused without being read */
  | 'oversize'
  /** the right size, but not a glTF document or a silhouette recipe */
  | 'unreadable';

export interface CodeCheck {
  status: CodeStatus;
  model: CodeModel | null;
}

/** Base64 of a `data:` URI → bytes. Null means "not a base64 data URI", which
 * the caller turns into "not a model" rather than into an empty scene. */
function decodeDataUri(uri: string): ArrayBuffer | null {
  const comma = uri.indexOf(',');
  if (comma < 0) return null;
  if (!/;base64/i.test(uri.slice(0, comma))) return null;
  const body = uri.slice(comma + 1).replace(/\s+/g, '');
  if (!body) return null;
  try {
    const binary = atob(body);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes.buffer;
  } catch {
    return null;
  }
}

/** Whatever the merchant pasted → a model plus the reason, or a reason alone.
 *
 * The order of the three guards is the whole point of this function:
 *
 *   1. LENGTH, before `trim()`. `trim()` allocates a copy, and on an 11 MB
 *      paste that copy is a hitch the merchant feels as "the editor hung".
 *      A string over the ceiling is never touched again — not trimmed, not
 *      sniffed, not parsed.
 *   2. SHAPE, a two-character sniff. `JSON.parse` on a 400 KB string is fine
 *      once; doing it on every keystroke is not, and a paste that is plainly
 *      not JSON never gets that far.
 *   3. CONTENT — only a document that passes both may be parsed.
 *
 * Null `model` is not an error state: the block falls back to the neutral
 * shape and keeps its type and its cards. */
export function checkModelCode(raw: unknown): CodeCheck {
  if (typeof raw !== 'string') return { status: 'empty', model: null };
  if (raw.length > MAX_MODEL_CODE) return { status: 'oversize', model: null };

  const text = raw.trim();
  if (!text) return { status: 'empty', model: null };

  if (text.startsWith('data:')) {
    const buffer = decodeDataUri(text);
    return buffer ? { status: 'ok', model: { kind: 'binary', buffer } } : { status: 'unreadable', model: null };
  }

  if (!text.startsWith('{') && !text.startsWith('[')) {
    return { status: 'unreadable', model: null };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { status: 'unreadable', model: null };
  }

  const asset = (parsed as { asset?: { version?: unknown } } | null)?.asset;
  if (asset && typeof asset.version === 'string') {
    return { status: 'ok', model: { kind: 'gltf', json: text } };
  }

  const points = profileFromCode(parsed);
  return points
    ? { status: 'ok', model: { kind: 'profile', points } }
    : { status: 'unreadable', model: null };
}

/** The model alone, for callers that only need that. */
export function parseModelCode(raw: unknown): CodeModel | null {
  return checkModelCode(raw).model;
}

/** Below this, parsing is cheaper than the bookkeeping a timer costs. */
const EAGER_MODEL_CODE = 20_000;

/** How long the settings have to stop changing before a big paste is read.
 *
 * `checkModelCode` is cheap on a huge string — the length guard answers before
 * anything is allocated — but it is not cheap on a *valid* 300 KB model, and
 * the editor pushes a settings update on every keystroke. Parsing there turned
 * typing into a slideshow, which the merchant reads as "the editor hangs",
 * exactly like the oversized paste did. So the parse waits for the typing to
 * stop; the stage keeps the previous model in the meantime, which is what it
 * was already showing. */
export function useModelCodeCheck(raw: string): CodeCheck {
  const [check, setCheck] = useState<CodeCheck>(() => checkModelCode(raw));
  const parsed = useRef(raw);

  useEffect(() => {
    if (parsed.current === raw) return;

    if (raw.length <= EAGER_MODEL_CODE) {
      parsed.current = raw;
      setCheck(checkModelCode(raw));
      return;
    }

    const timer = setTimeout(() => {
      parsed.current = raw;
      setCheck(checkModelCode(raw));
    }, 320);
    return () => clearTimeout(timer);
  }, [raw]);

  return check;
}
