"""Shared helpers for the latte game's Blender asset scripts (run in background Blender).

    blender -b --factory-startup --python art/blender/build_all.py

Conventions (match js/scene3d.js and Docs/STYLE_BIBLE.md):
- Units: 1 = cup inner radius at the liquid surface. Blender +X = game right, +Z = up, -Y = toward the player.
  The glTF exporter turns this into three.js +x right, +y up, +z toward the player.
- Faceted low-poly: round things are spun profiles with few segments, flat shaded.
- Pixel textures: small PNGs painted here with numpy, Closest (nearest) interpolation, repeat wrap,
  box-projected UVs at one texel density per material.
"""
import math
import os

import bmesh
import bpy
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TEX_DIR = os.path.join(ROOT, "art", "textures")
MODEL_DIR = os.path.join(ROOT, "assets", "models")
PREVIEW_DIR = os.path.join(ROOT, "art", "previews")
for d in (TEX_DIR, MODEL_DIR, PREVIEW_DIR):
    os.makedirs(d, exist_ok=True)

GRAIN = 1.6  # same as TUNING.view3d.grain


# ---------------------------------------------------------------- scene
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def link(obj, parent=None):
    bpy.context.scene.collection.objects.link(obj)
    if parent is not None:
        obj.parent = parent
    return obj


def empty(name, loc=(0, 0, 0), parent=None):
    e = bpy.data.objects.new(name, None)
    e.empty_display_size = 0.1
    e.location = loc
    return link(e, parent)


# ---------------------------------------------------------------- pixel textures
def _hex(c):
    return np.array([(c >> 16) & 255, (c >> 8) & 255, c & 255], dtype=np.float32) / 255.0


def paint_noisy(base, seed, w=32, h=32, amp=0.06, blotch=0.05, cell=4):
    rng = np.random.default_rng(seed)
    amp *= GRAIN
    blotch *= GRAIN
    coarse = rng.random((math.ceil(h / cell), math.ceil(w / cell))) - 0.5
    coarse = np.kron(coarse, np.ones((cell, cell)))[:h, :w]
    f = 1 + (rng.random((h, w)) - 0.5) * amp + coarse * blotch
    return _hex(base)[None, None, :] * f[..., None]


def paint_steel(base, seed, w=32, h=32):
    rng = np.random.default_rng(seed)
    col = (rng.random(w) - 0.5) * 0.12 * GRAIN
    y = np.arange(h)[:, None]
    f = 1 + col[None, :] + (rng.random((h, w)) - 0.5) * 0.05 * GRAIN + 0.06 * np.sin(y * 0.35)
    return _hex(base)[None, None, :] * f[..., None]


def paint_wood(seed, w=64, h=32):
    rng = np.random.default_rng(seed)
    tones = [_hex(c) for c in (0x7A5638, 0x6E4E33, 0x80603F, 0x664831)]
    out = np.zeros((h, w, 3), dtype=np.float32)
    plank = 8
    for p in range(math.ceil(h / plank)):
        off = rng.random() * 10
        end = int(rng.random() * w)
        for yy in range(p * plank, min(h, (p + 1) * plank)):
            x = np.arange(w)
            f = 1 + 0.06 * GRAIN * np.sin(x * 0.3 + off + 0.8 * np.sin(yy * 0.9 + off)) + (rng.random(w) - 0.5) * 0.06 * GRAIN
            if yy % plank == 0:
                f = f * 0.8
            else:
                f[end] *= 0.82
            out[yy] = tones[p % 4][None, :] * f[:, None]
    return out


def paint_fabric(base, seed, w=16, h=32):
    rng = np.random.default_rng(seed)
    f = 1 + (rng.random((h, w)) - 0.5) * 0.12
    f[:, ::4] *= 0.9
    f[::4, :] *= 1.08
    return _hex(base)[None, None, :] * f[..., None]


def save_texture(name, rgb):
    """rgb: HxWx3 floats in sRGB 0..1, row 0 = top. Saves art/textures/<name>.png and returns the bpy image."""
    h, w, _ = rgb.shape
    img = bpy.data.images.new(name, w, h, alpha=False)
    rgba = np.concatenate([np.clip(rgb, 0, 1), np.ones((h, w, 1))], axis=2).astype(np.float32)
    img.pixels.foreach_set(rgba[::-1].reshape(-1))  # Blender stores bottom row first
    path = os.path.join(TEX_DIR, name + ".png")
    img.filepath_raw = path
    img.file_format = "PNG"
    img.save()
    return img


# ---------------------------------------------------------------- materials
def material(name, img, roughness=0.7, metallic=0.0, texel=0.035):
    """Principled material with a nearest-filtered, repeating pixel texture. texel = world size of one texel."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = img
    tex.interpolation = "Closest"
    tex.extension = "REPEAT"
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    m["tw"] = texel * img.size[0]  # world size of one texture repeat (u), used by box_uv
    m["th"] = texel * img.size[1]  # (v)
    return m


def flat_color(name, rgb, roughness=0.6):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*rgb, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    return m


# ---------------------------------------------------------------- geometry
def mesh_obj(name, bm, mat, parent=None, flat=True):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = not flat
    obj = bpy.data.objects.new(name, me)
    obj.data.materials.append(mat)
    link(obj, parent)
    box_uv(obj, mat)
    return obj


def lathe(profile, segments, deform=None):
    """Spin a (r, z) profile around Z into a faceted surface. deform(co) may move vertices (e.g. a spout)."""
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0.0, z)) for r, z in profile]
    edges = [bm.edges.new((verts[i], verts[i + 1])) for i in range(len(verts) - 1)]
    bmesh.ops.spin(bm, geom=verts + edges, cent=(0, 0, 0), axis=(0, 0, 1), angle=2 * math.pi, steps=segments, use_duplicate=False)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    if deform:
        for v in bm.verts:
            v.co = deform(v.co.copy())
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def box(sx, sy, sz, loc=(0, 0, 0), rot=(0, 0, 0), bevel=0.0):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(sx, sy, sz), verts=bm.verts)
    if bevel > 0:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=1, affect="EDGES")
    from mathutils import Euler
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Euler(rot).to_matrix())
    bmesh.ops.translate(bm, vec=loc, verts=bm.verts)
    return bm


def prism(r0, r1, length, sides, loc, direction):
    """Tapered n-sided prism from loc along direction (unit), radius r0 at the start, r1 at the end."""
    from mathutils import Vector
    d = Vector(direction).normalized()
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=sides, radius1=r0, radius2=r1, depth=length)
    # cone is along Z centred at origin; move so it starts at 0 and rotate to direction
    bmesh.ops.translate(bm, vec=(0, 0, length / 2), verts=bm.verts)
    rot = Vector((0, 0, 1)).rotation_difference(d).to_matrix()
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=rot)
    bmesh.ops.translate(bm, vec=loc, verts=bm.verts)
    return bm


def merge(*bms):
    out = bmesh.new()
    for b in bms:
        me = bpy.data.meshes.new("tmp")
        b.to_mesh(me)
        b.free()
        out.from_mesh(me)
        bpy.data.meshes.remove(me)
    return out


def box_uv(obj, mat):
    """Box projection at one texel density, so every face of every asset shows pixels of the same size."""
    tw, th = mat.get("tw", 1.0), mat.get("th", 1.0)
    me = obj.data
    bm = bmesh.new()
    bm.from_mesh(me)
    uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        n = f.normal
        ax = max(range(3), key=lambda i: abs(n[i]))
        for l in f.loops:
            co = l.vert.co
            a, b = [(co.y, co.z), (co.x, co.z), (co.x, co.y)][ax]
            l[uv].uv = (a / tw, b / th)
    bm.to_mesh(me)
    bm.free()


# ---------------------------------------------------------------- export and preview
def export_glb(name, root):
    bpy.ops.object.select_all(action="DESELECT")
    for o in [root] + list(root.children_recursive):
        o.select_set(True)
    path = os.path.join(MODEL_DIR, name + ".glb")
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", use_selection=True, export_yup=True,
                              export_apply=True, export_extras=False, export_cameras=False, export_lights=False)
    return path


def preview(name, target=(0, 0, 0.5), dist=6.0, pitch=70, yaw=0, res=640):
    """Render a near top-down preview (the game camera's angle) to art/previews/<name>.png."""
    sc = bpy.context.scene
    try:
        sc.render.engine = "BLENDER_EEVEE_NEXT"
    except TypeError:
        sc.render.engine = "BLENDER_EEVEE"
    sc.render.resolution_x = res
    sc.render.resolution_y = res
    sc.render.film_transparent = False
    world = bpy.data.worlds.new("w")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.16, 0.11, 0.08, 1)
    world.node_tree.nodes["Background"].inputs[1].default_value = 0.9
    sc.world = world
    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
    sun.data.energy = 3.5
    sun.data.angle = math.radians(8)
    sun.rotation_euler = (math.radians(38), math.radians(-20), math.radians(-35))
    link(sun)
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    cam.data.lens = 50
    p, y = math.radians(pitch), math.radians(yaw)
    from mathutils import Vector
    t = Vector(target)
    cam.location = t + Vector((math.sin(y) * math.cos(p) * dist, -math.cos(y) * math.cos(p) * dist, math.sin(p) * dist))
    cam.rotation_euler = (t - cam.location).to_track_quat("-Z", "Y").to_euler()
    link(cam)
    sc.camera = cam
    sc.render.filepath = os.path.join(PREVIEW_DIR, name + ".png")
    bpy.ops.render.render(write_still=True)
    for o in (sun, cam):
        bpy.data.objects.remove(o)
