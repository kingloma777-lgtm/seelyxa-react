#!/usr/bin/env python3
"""Shrink a GLB until it fits the paste field, then hand back the text.

    python tools/fit-model.py car.glb                  # aim for the 400k ceiling
    python tools/fit-model.py car.glb --chars 250000    # leave room for the rest
    python tools/fit-model.py car.glb -o car.txt        # write the paste-ready text

Why this exists. A product hero needs a silhouette, not a vehicle: the export
that froze the editor carried an 8.67 MB buffer across 120+ meshes — interior,
pedals, four wheels, brake discs — for a block that renders one object at
roughly 600 px wide. Decimation is the difference between "this model cannot be
used" and "this model is 180 KB and looks the same at that size".

It searches instead of guessing: it decimates, measures the *paste-ready text*
(not the GLB, which is a different number), and halves or eases the ratio until
the text fits. Blender does the geometry; this script only does the arithmetic
the merchant cannot do in their head.

Requires Blender on PATH (or --blender). No Python packages.
"""

import argparse
import base64
import json
import os
import shutil
import struct
import subprocess
import sys
import tempfile

#: must match MAX_MODEL_CODE in app/lib/modelCode.ts
BUDGET = 400_000

BLENDER_SCRIPT = r'''
import bpy, json, sys

cfg = json.loads(sys.argv[sys.argv.index('--') + 1])

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=cfg['src'])

meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
if not meshes:
    raise SystemExit('the file has no meshes')

if cfg['join'] and len(meshes) > 1:
    for o in bpy.context.scene.objects:
        o.select_set(False)
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.join()
    meshes = [bpy.context.view_layer.objects.active]

if cfg['ratio'] < 1.0:
    for o in meshes:
        before = len(o.data.polygons)
        mod = o.modifiers.new('fit', 'DECIMATE')
        mod.ratio = cfg['ratio']
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.modifier_apply(modifier=mod.name)
        print('decimate %s: %d -> %d faces' % (o.name, before, len(o.data.polygons)))

# Textures are where the bytes usually are: a 7 MB "model" is often 4 MB of
# 2048px PBR maps for an object that renders 600 px wide. Stripping them is
# not a loss here — the block paints the product itself — and scaling is the
# gentler option when the merchant wants to keep a logo baked in.
if cfg['strip']:
    for material in bpy.data.materials:
        if not material.use_nodes or material.node_tree is None:
            continue
        for node in list(material.node_tree.nodes):
            if node.type == 'TEX_IMAGE':
                material.node_tree.nodes.remove(node)
    for image in list(bpy.data.images):
        try:
            bpy.data.images.remove(image)
        except Exception:
            pass
    print('textures: stripped')
elif cfg['max_texture']:
    limit = int(cfg['max_texture'])
    for image in bpy.data.images:
        width, height = image.size
        if not width or not height:
            continue
        scale = limit / float(max(width, height))
        if scale < 1.0:
            image.scale(max(1, int(width * scale)), max(1, int(height * scale)))
            print('texture %s: %dx%d -> %dx%d' % (image.name, width, height, image.size[0], image.size[1]))

bpy.ops.export_scene.gltf(
    filepath=cfg['dst'],
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_animations=False,
    export_cameras=False,
    export_lights=False,
    export_image_format='JPEG',
    export_jpeg_quality=80,
)
'''


def glb_to_text(path: str) -> tuple[str, int]:
    """GLB → the paste-ready glTF text, and how many meshes it carries."""
    with open(path, 'rb') as handle:
        data = handle.read()
    if len(data) < 12 or data[:4] != b'glTF':
        raise SystemExit(f'{path}: not a GLB')

    document, binary, offset = None, b'', 12
    while offset + 8 <= len(data):
        length, kind = struct.unpack_from('<I4s', data, offset)
        chunk = data[offset + 8:offset + 8 + length]
        if kind == b'JSON':
            document = json.loads(chunk.decode('utf-8'))
        elif kind == b'BIN\x00':
            binary = chunk
        offset += 8 + length
    if document is None:
        raise SystemExit(f'{path}: no JSON chunk')

    for buffer in document.get('buffers') or []:
        if 'uri' not in buffer:
            if not binary:
                raise SystemExit(f'{path}: missing binary chunk')
            buffer['uri'] = (
                'data:application/octet-stream;base64,'
                + base64.b64encode(binary).decode('ascii')
            )
            break

    text = json.dumps(document, ensure_ascii=False, separators=(',', ':'))
    return text, len(document.get('meshes') or [])


def find_blender(explicit: str | None) -> str:
    if explicit:
        return explicit
    found = shutil.which('blender')
    if found:
        return found
    for base in (
        r'C:\Program Files\Blender Foundation',
        '/Applications/Blender.app/Contents/MacOS',
        '/usr/share/blender',
    ):
        if os.path.isdir(base):
            for name in sorted(os.listdir(base), reverse=True):
                candidate = os.path.join(base, name, 'blender.exe' if os.name == 'nt' else 'blender')
                if os.path.isfile(candidate):
                    return candidate
                candidate = os.path.join(base, name)
                if os.path.isfile(candidate) and name == 'Blender':
                    return candidate
    raise SystemExit('Blender not found — pass --blender PATH')


def decimate(blender: str, source: str, ratio: float, join: bool,
             max_texture: int, strip: bool) -> str:
    """Run one decimation pass; returns the temp GLB it wrote."""
    out = os.path.join(tempfile.mkdtemp(prefix='fit-model-'), 'out.glb')
    script = os.path.join(tempfile.mkdtemp(prefix='fit-script-'), 'pass.py')
    with open(script, 'w', encoding='utf-8') as handle:
        handle.write(BLENDER_SCRIPT)
    config = json.dumps({
        'src': source, 'dst': out, 'ratio': ratio, 'join': join,
        'max_texture': max_texture, 'strip': strip,
    })
    result = subprocess.run(
        [blender, '--background', '--python', script, '--', config],
        capture_output=True,
        text=True,
    )
    if not os.path.isfile(out):
        tail = (result.stdout or '')[-1200:] + (result.stderr or '')[-1200:]
        raise SystemExit(f'Blender produced nothing at ratio {ratio}:\n{tail}')
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description='Decimate a GLB until its text fits the field')
    parser.add_argument('source', help='the .glb file')
    parser.add_argument('-o', '--output', help='write the paste-ready text here')
    parser.add_argument('--chars', type=int, default=BUDGET, help=f'character ceiling (default {BUDGET:,})')
    parser.add_argument('--ratio', type=float, help='skip the search and use this decimation ratio')
    parser.add_argument('--keep-parts', action='store_true', help='do not join the meshes first')
    parser.add_argument('--max-texture', type=int, default=512,
                        help='downscale textures so the longest side is this (default 512, 0 = leave)')
    parser.add_argument('--strip-textures', action='store_true',
                        help='remove textures entirely — right for a product the block paints itself')
    parser.add_argument('--blender', help='path to the blender executable')
    parser.add_argument('--force', action='store_true', help='write the text even if it is over the ceiling')
    args = parser.parse_args()

    original, meshes = glb_to_text(args.source)
    print(f'source: {len(original):,} characters, {meshes} mesh(es), ceiling {args.chars:,}')
    if len(original) <= args.chars and not args.ratio:
        print('already fits — nothing to do.')
        if args.output:
            with open(args.output, 'w', encoding='utf-8', newline='\n') as handle:
                handle.write(original)
            print(f'{args.output}: {len(original):,} characters')
        return

    blender = find_blender(args.blender)
    join = not args.keep_parts

    # The text size is not linear in the ratio (JSON scaffolding is fixed, and
    # decimation hits some meshes harder than others), so this searches rather
    # than solves: four halvings, then the best fit found.
    ratios = [args.ratio] if args.ratio else [0.5, 0.25, 0.12, 0.06, 0.03]
    best = None
    for ratio in ratios:
        glb = decimate(blender, args.source, ratio, join, args.max_texture, args.strip_textures)
        text, _ = glb_to_text(glb)
        print(f'  ratio {ratio:<5} → {len(text):,} characters  ({os.path.getsize(glb) / 1024:,.0f} KB glb)')
        if best is None or len(text) < len(best[1]):
            best = (ratio, text, glb)
        if len(text) <= args.chars:
            break

    ratio, text, glb = best
    print('')
    if len(text) <= args.chars:
        print(f'  fits at ratio {ratio}: {len(text):,} / {args.chars:,} characters')
    else:
        print(f'  best was ratio {ratio} at {len(text):,} characters — still {len(text) / args.chars:.1f}x the ceiling.')
        print('  This model is a scene, not a product: drop the parts you will never see')
        print('  (interior, wheels, hardware), or host the GLB and use the link field.')

    if args.output:
        with open(args.output, 'w', encoding='utf-8', newline='\n') as handle:
            handle.write(text)
        print(f'{args.output}: {len(text):,} characters')
    if len(text) > args.chars and not args.force:
        raise SystemExit(2)


if __name__ == '__main__':
    main()
