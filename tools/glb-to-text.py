#!/usr/bin/env python3
"""GLB → one-file glTF text, ready to paste into «كود المجسم».

    python tools/glb-to-text.py model.glb
    python tools/glb-to-text.py model.glb -o model.txt

Why this exists: the theme editor refuses a `.glb` upload and Salla does not
host 3D models, so the block accepts the model as *text*. A `.gltf` is JSON,
and a GLB is that JSON plus a binary chunk — this script folds the chunk back
into the JSON as a base64 data URI, which is exactly the "glTF Embedded" export
Blender produces, without needing Blender.

No dependencies: `struct`, `json`, `base64`. Run it once per model, paste the
output, done — the merchant never needs hosting.

If the merchant does not have Python (or Blender), `model-code-studio.html`
next to this file does the same job in a browser: drag the `.glb` onto it, it
converts, shrinks the textures, and prints the character count. That page is
the one to hand a merchant; this script is for the developer's terminal.

It also does the arithmetic the merchant cannot do in their head. The field
holds 400,000 characters, and that ceiling is about page weight: the string is
stored in the store's settings and shipped with every page view. A raw car
export is 8.7 MB of buffer, which is 11.5 million characters once base64'd —
29 times the ceiling, and enough to freeze the editor on paste. This script
says so, in those numbers, before the merchant finds out the hard way.
"""

import argparse
import base64
import json
import struct
import sys

GLB_MAGIC = b'glTF'
CHUNK_JSON = b'JSON'
CHUNK_BIN = b'BIN\x00'


def glb_to_gltf(data: bytes) -> dict:
    """A GLB → the same glTF document with its binary chunk inlined."""
    if len(data) < 12:
        raise SystemExit('not a GLB: too short')
    magic, version, length = struct.unpack_from('<4sII', data, 0)
    if magic != GLB_MAGIC:
        raise SystemExit(f'not a GLB: magic is {magic!r}')
    if version != 2:
        raise SystemExit(f'unsupported GLB version {version}')

    document = None
    binary = b''
    offset = 12
    while offset + 8 <= min(length, len(data)):
        chunk_length, chunk_type = struct.unpack_from('<I4s', data, offset)
        chunk = data[offset + 8:offset + 8 + chunk_length]
        if chunk_type == CHUNK_JSON:
            document = json.loads(chunk.decode('utf-8'))
        elif chunk_type == CHUNK_BIN:
            binary = chunk
        offset += 8 + chunk_length

    if document is None:
        raise SystemExit('the GLB has no JSON chunk')

    buffers = document.get('buffers') or []
    if not buffers:
        raise SystemExit('the glTF has no buffers to inline')
    # a GLB stores its binary chunk as the first buffer, with no uri
    for buffer in buffers:
        if 'uri' not in buffer:
            if not binary:
                raise SystemExit('the glTF references a buffer the GLB does not carry')
            buffer['uri'] = (
                'data:application/octet-stream;base64,'
                + base64.b64encode(binary).decode('ascii')
            )
            break
    return document


#: must match MAX_MODEL_CODE in app/lib/modelCode.ts
BUDGET = 400_000


def report(size: int, budget: int, meshes: int) -> bool:
    """Print the verdict; True when the text fits the field."""
    print('', file=sys.stderr)
    if size <= budget:
        print(
            f'  {size:,} / {budget:,} characters — fits, with '
            f'{budget - size:,} to spare.',
            file=sys.stderr,
        )
        return True

    print(f'  {size:,} characters, budget is {budget:,}.', file=sys.stderr)
    print(f'  That is {size / budget:.1f}x the ceiling — paste it and the editor', file=sys.stderr)
    print('  freezes before it ever reaches the field.', file=sys.stderr)
    print('', file=sys.stderr)
    print('  What to do, in order of how much it helps:', file=sys.stderr)
    if meshes > 20:
        print(f'    1. Drop parts. {meshes} meshes is a whole vehicle; a hero', file=sys.stderr)
        print('       needs the body, not the interior, the pedals and four wheels.', file=sys.stderr)
    else:
        print(f'    1. Drop parts. {meshes} mesh(es) means the weight is in the', file=sys.stderr)
        print('       triangles, not the object count — go to step 2.', file=sys.stderr)
    print('    2. Decimate in Blender (Modifier → Decimate, ratio 0.1–0.2).', file=sys.stderr)
    print('    3. Export with Draco (Export → glTF → Compression → Draco).', file=sys.stderr)
    print('    4. Still over? Host the .glb and use the link field instead.', file=sys.stderr)
    return False


def main() -> None:
    parser = argparse.ArgumentParser(description='GLB → paste-ready glTF text')
    parser.add_argument('source', help='the .glb file')
    parser.add_argument('-o', '--output', help='write here instead of stdout')
    parser.add_argument(
        '--minify',
        action='store_true',
        help='no indentation: ~20%% shorter, which matters against the character cap',
    )
    parser.add_argument(
        '--max',
        type=int,
        default=BUDGET,
        help=f'the field\'s ceiling (default {BUDGET:,}, matching the block)',
    )
    parser.add_argument(
        '--force',
        action='store_true',
        help='exit 0 even when the text is over the ceiling',
    )
    args = parser.parse_args()

    with open(args.source, 'rb') as handle:
        document = glb_to_gltf(handle.read())

    text = json.dumps(
        document,
        ensure_ascii=False,
        indent=None if args.minify else 1,
        separators=(',', ':') if args.minify else None,
    )

    if args.output:
        with open(args.output, 'w', encoding='utf-8', newline='\n') as handle:
            handle.write(text)
        print(f'{args.output}: {len(text):,} characters', file=sys.stderr)
    else:
        sys.stdout.write(text)
        print(f'\n\n[{len(text):,} characters]', file=sys.stderr)

    fits = report(len(text), args.max, len(document.get('meshes') or []))
    if not fits and not args.force:
        raise SystemExit(2)


if __name__ == '__main__':
    main()
