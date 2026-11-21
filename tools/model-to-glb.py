# Turns whatever a merchant or designer sends into one self-contained GLB.
#
# Why this exists: Salla's theme editor has no file field — `image` is the only
# uploader and it refuses anything that is not an image — and Salla's own 3D
# product API demands a public external CDN URL for the model. So a model only
# reaches the block as a GLB sitting at a URL. This script is the offline half:
# it normalises a source file into that GLB once, and the result is bundled in
# `public/reference/` (or uploaded to any host) from then on.
#
#   blender --background --python tools/model-to-glb.py -- <in> <out.glb>
#
# Accepts .usd .usda .usdc .usdz .glb .gltf .fbx .obj .blend.
import os
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
if len(argv) < 2:
    raise SystemExit("usage: blender --background --python model-to-glb.py -- in out.glb")

source, target = os.path.abspath(argv[0]), os.path.abspath(argv[1])
ext = os.path.splitext(source)[1].lower()

if not os.path.exists(source):
    raise SystemExit(f"missing input: {source}")

if ext == ".blend":
    bpy.ops.wm.open_mainfile(filepath=source)
else:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if ext in {".usd", ".usda", ".usdc", ".usdz"}:
        bpy.ops.wm.usd_import(filepath=source)
    elif ext in {".glb", ".gltf"}:
        bpy.ops.import_scene.gltf(filepath=source)
    elif ext == ".fbx":
        bpy.ops.import_scene.fbx(filepath=source)
    elif ext == ".obj":
        bpy.ops.wm.obj_import(filepath=source)
    else:
        raise SystemExit(f"unsupported extension: {ext}")

meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
if not meshes:
    # The usual cause with .usd: the file is a root stage that references a
    # `payloads/` folder which was not downloaded with it, so there is no
    # geometry in the file at all.
    raise SystemExit("the file imported no meshes — for .usd, check its payloads/ folder is present")

bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(
    filepath=target,
    export_format="GLB",
    export_apply=True,
    export_yup=True,
)

tris = sum(len(o.data.loop_triangles) for o in meshes)
print(f"EXPORTED {target} meshes={len(meshes)} tris={tris}")
