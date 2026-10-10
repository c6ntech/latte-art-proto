"""Build every scene asset of the latte game in Blender and export GLBs + previews.

    /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup --python art/blender/build_assets.py [-- name ...]

Outputs: assets/models/<name>.glb (loaded by js/scene3d.js), art/textures/*.png, art/previews/<name>.png,
art/blender/<name>.blend (editable source, compressed). Dimensions follow js/scene3d.js (1 unit = cup inner radius).
Style: Docs/STYLE_BIBLE.md (faceted low-poly, nearest-filtered pixel textures).
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

import lib  # noqa: E402

LIQ = 0.86  # liquid surface height above the cup base; inner radius there is exactly 1.0


def save_blend(name):
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(lib.ROOT, "art", "blender", name + ".blend"), compress=True)


# ------------------------------------------------------------------ cup + saucer
def build_cup():
    lib.reset()
    ceramic = lib.material("ceramic", lib.save_texture("ceramic", lib.paint_noisy(0xEBE6DD, 3, 32, 32, 0.05, 0.05)), roughness=0.45)
    saucer_m = lib.material("saucer", lib.save_texture("saucer", lib.paint_noisy(0xE2DCCF, 4, 32, 32, 0.05, 0.05)), roughness=0.5)
    root = lib.empty("cup_root")
    cup = [(0, 0), (0.74, 0), (0.8, 0.06), (1.0, 0.5), (1.12, 0.96), (1.13, 1.03), (1.08, 1.06), (1.04, 1.05),
           (1.03, 1.0), (1.0, LIQ), (0.94, 0.6), (0.72, 0.24), (0, 0.2)]
    lib.mesh_obj("cup_body", lib.lathe(cup, 12), ceramic, root)
    saucer = [(0, -0.12), (0.9, -0.12), (1.35, -0.08), (1.7, 0.02), (1.76, 0.08), (1.68, 0.09), (1.3, 0.0), (0.86, -0.02), (0, -0.02)]
    lib.mesh_obj("saucer", lib.lathe(saucer, 12), saucer_m, root)
    # handle: a C of four tapered 5-sided segments on the +X side
    c, R = Vector((1.12, 0, 0.55)), 0.36   # big enough to read from the near top-down camera
    pts = [c + Vector((math.cos(a) * R * 1.05, 0, math.sin(a) * R)) for a in [math.radians(d) for d in (-80, -40, 0, 40, 80)]]
    segs = [lib.prism(0.09, 0.09, (pts[i + 1] - pts[i]).length + 0.04, 5, pts[i], pts[i + 1] - pts[i]) for i in range(4)]
    lib.mesh_obj("cup_handle", lib.merge(*segs), ceramic, root)
    lib.empty("liquid_center", (0, 0, LIQ), root)
    return root


# ------------------------------------------------------------------ pitcher + barista hand
def hand_parts(skin, cuff, sleeve, parent, origin, scale, mirror_y=False):
    """Blocky hand gripping a vertical bar at `origin` (the bar runs along Z), arm leaving along -X and down."""
    s = scale
    o = Vector(origin)
    def P(x, y, z):
        return o + Vector((x * s, (-y if mirror_y else y) * s, z * s))

    # back of the hand on the outside of the bar
    palm = lib.box(0.2 * s, 0.4 * s, 0.46 * s, P(-0.14, 0.0, 0.0), bevel=0.02 * s)
    # four fingers wrap round the front of the bar (toward the player, -Y) and curl back on the jug side
    fingers = []
    for i in range(4):
        z = 0.17 - i * 0.115
        fingers.append(lib.box(0.24 * s, 0.1 * s, 0.095 * s, P(0.0, -0.17, z), bevel=0.012 * s))       # across the front
        fingers.append(lib.box(0.09 * s, 0.17 * s, 0.09 * s, P(0.1, -0.07, z), bevel=0.012 * s))       # curl round the jug side
    knuckles = lib.box(0.12 * s, 0.12 * s, 0.46 * s, P(-0.06, -0.15, -0.0), bevel=0.02 * s)
    thumb = [lib.box(0.26 * s, 0.1 * s, 0.1 * s, P(0.0, 0.08, 0.3), rot=(0, 0.25, 0), bevel=0.012 * s),
             lib.box(0.12 * s, 0.09 * s, 0.09 * s, P(0.15, 0.06, 0.27), bevel=0.01 * s)]
    wrist = lib.box(0.26 * s, 0.34 * s, 0.34 * s, P(-0.33, 0.0, 0.05), rot=(0, -0.2, 0), bevel=0.02 * s)
    lib.mesh_obj("hand_skin", lib.merge(palm, knuckles, wrist, *fingers, *thumb), skin, parent)
    lib.mesh_obj("hand_cuff", lib.box(0.12 * s, 0.44 * s, 0.44 * s, P(-0.48, 0.0, 0.11), rot=(0, -0.35, 0), bevel=0.015 * s), cuff, parent)
    d = Vector((-math.cos(0.35), 0, -math.sin(0.35)))
    lib.mesh_obj("hand_sleeve", lib.prism(0.2 * s, 0.27 * s, 3.4 * s, 6, P(-0.52, 0.0, 0.1), d), sleeve, parent)


def posable_hand(skin, cuff, sleeve, parent, origin, scale):
    """Hand gripping the vertical handle bar at `origin`, built as jointed parts for the pose tool (KIT_ADOPTION Q8).
    Nodes (names are read by js/scene3d.js): grip (whole hand, pivot on the bar) > palm, finger_0..3 (pivot at the
    knuckle, curl turns round the bar), thumb (pivot at its base), wrist (pivot at the wrist) > wrist box, cuff, forearm."""
    grip = lib.empty("grip", origin, parent)
    grip.scale = (scale, scale, scale)
    lib.mesh_obj("palm", lib.merge(lib.box(0.2, 0.4, 0.46, (-0.14, 0.0, 0.0), bevel=0.02),
                                   lib.box(0.12, 0.12, 0.46, (-0.06, -0.15, 0.0), bevel=0.02)), skin, grip)
    for i in range(4):
        z = 0.17 - i * 0.115
        piv = Vector((-0.1, -0.17, z))
        f = lib.empty(f"finger_{i}", piv, grip)
        def R(x, y, zz):
            return Vector((x, y, zz)) - piv
        lib.mesh_obj(f"finger_{i}_mesh", lib.merge(lib.box(0.24, 0.1, 0.095, R(0.0, -0.17, z), bevel=0.012),
                                                    lib.box(0.09, 0.17, 0.09, R(0.1, -0.07, z), bevel=0.012)), skin, f)
    tp = Vector((-0.1, 0.07, 0.3))
    th = lib.empty("thumb", tp, grip)
    lib.mesh_obj("thumb_mesh", lib.merge(lib.box(0.26, 0.1, 0.1, Vector((0.0, 0.08, 0.3)) - tp, rot=(0, 0.25, 0), bevel=0.012),
                                          lib.box(0.12, 0.09, 0.09, Vector((0.15, 0.06, 0.27)) - tp, bevel=0.01)), skin, th)
    wp = Vector((-0.24, 0.0, 0.05))
    wr = lib.empty("wrist", wp, grip)
    lib.mesh_obj("wrist_mesh", lib.box(0.26, 0.34, 0.34, Vector((-0.33, 0.0, 0.05)) - wp, rot=(0, -0.2, 0), bevel=0.02), skin, wr)
    lib.mesh_obj("cuff_mesh", lib.box(0.12, 0.44, 0.44, Vector((-0.48, 0.0, 0.11)) - wp, rot=(0, -0.35, 0), bevel=0.015), cuff, wr)
    d = Vector((-math.cos(0.35), 0, -math.sin(0.35)))
    lib.mesh_obj("forearm_mesh", lib.prism(0.2, 0.27, 3.4, 6, Vector((-0.52, 0.0, 0.1)) - wp, d), sleeve, wr)
    return grip


def build_pitcher():
    lib.reset()
    steel = lib.material("steel", lib.save_texture("steel", lib.paint_steel(0xC3C8CC, 11)), roughness=0.42, metallic=0.12)
    steel_dark = lib.material("steel_dark", lib.save_texture("steel_dark", lib.paint_steel(0x9AA1A7, 13, 16, 16)), roughness=0.45, metallic=0.1)
    foam = lib.material("foam", lib.save_texture("foam", lib.paint_noisy(0xF3ECE0, 5, 16, 16, 0.05, 0.04)), roughness=0.9)
    skin = lib.material("skin", lib.save_texture("skin", lib.paint_noisy(0xC89A7A, 21, 16, 16, 0.08, 0.07)), roughness=0.8, texel=0.03)
    cuff = lib.material("cuff", lib.save_texture("cuff", lib.paint_noisy(0xE3DCCF, 25, 16, 16, 0.06, 0.05)), roughness=0.9)
    sleeve = lib.material("sleeve", lib.save_texture("sleeve", lib.paint_fabric(0x34485A, 23)), roughness=0.95, texel=0.05)
    root = lib.empty("pitcher_root")
    prof = [(0, 0), (0.52, 0), (0.56, 0.08), (0.55, 0.7), (0.46, 1.12), (0.48, 1.3), (0.45, 1.31), (0.43, 1.14), (0.51, 0.7), (0.5, 0.12), (0, 0.1)]

    def spout(co):
        if co.z < 1.0:
            return co
        w = max(0.0, math.cos(math.atan2(co.y, co.x))) ** 4 * min(1.0, (co.z - 1.0) / 0.3)
        return Vector((co.x * (1 + 0.55 * w), co.y * (1 - 0.25 * w), co.z + 0.12 * w))

    lib.mesh_obj("jug", lib.lathe(prof, 10, spout), steel, root)
    from bmesh.ops import create_circle  # noqa: F401
    import bmesh
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, segments=10, radius=0.44)
    bmesh.ops.translate(bm, vec=(0, 0, 1.08), verts=bm.verts)
    lib.mesh_obj("foam", bm, foam, root)
    lib.mesh_obj("handle", lib.merge(lib.box(0.1, 0.14, 0.75, (-0.78, 0, 0.68), bevel=0.015),
                                     lib.box(0.3, 0.12, 0.09, (-0.64, 0, 0.98), bevel=0.01),
                                     lib.box(0.3, 0.12, 0.09, (-0.64, 0, 0.38), bevel=0.01)), steel_dark, root)
    posable_hand(skin, cuff, sleeve, root, (-0.8, 0, 0.7), 1.3)
    lib.empty("spout_tip", (0.48 * 1.55, 0, 1.42), root)
    return root


# ------------------------------------------------------------------ table
def build_table():
    lib.reset()
    wood = lib.material("wood", lib.save_texture("wood", lib.paint_wood(7)), roughness=0.85, texel=0.0625)
    import bmesh
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=18)
    root = lib.empty("table_root")
    lib.mesh_obj("table_top", bm, wood, root)
    return root


# ------------------------------------------------------------------ customer's hand (place / take away, and slap)
def build_customer_hand():
    lib.reset()
    skin = lib.material("skin_customer", lib.save_texture("skin_customer", lib.paint_noisy(0xB98B6A, 31, 16, 16, 0.08, 0.07)), roughness=0.8, texel=0.03)
    cuff = lib.material("cuff_customer", lib.save_texture("cuff_customer", lib.paint_noisy(0xD9CFB8, 33, 16, 16, 0.06, 0.05)), roughness=0.9)
    sleeve = lib.material("sleeve_customer", lib.save_texture("sleeve_customer", lib.paint_fabric(0x8A4B3C, 35)), roughness=0.95, texel=0.05)
    root = lib.empty("customer_root")
    s = 1.3
    # pose "hold": hand comes from the right (+X), thumb on top of the saucer rim, fingers under it
    hold = lib.empty("pose_hold", (0, 0, 0), root)
    o = Vector((1.85, 0, 0.0))
    def P(x, y, z):
        return o + Vector((x * s, y * s, z * s))
    parts = [lib.box(0.42 * s, 0.38 * s, 0.12 * s, P(0.08, 0, -0.12), bevel=0.02 * s)]                       # palm under the rim
    for i in range(4):
        parts.append(lib.box(0.32 * s, 0.085 * s, 0.08 * s, P(-0.26, -0.15 + i * 0.1, -0.16), bevel=0.01 * s))  # fingers under the saucer
    parts.append(lib.box(0.3 * s, 0.1 * s, 0.1 * s, P(-0.18, -0.2, 0.08), rot=(0, 0, -0.3), bevel=0.012 * s))  # thumb on top
    lib.mesh_obj("hold_skin", lib.merge(*parts), skin, hold)
    lib.mesh_obj("hold_cuff", lib.box(0.12 * s, 0.42 * s, 0.4 * s, P(0.36, 0, -0.08), bevel=0.015 * s), cuff, hold)
    lib.mesh_obj("hold_sleeve", lib.prism(0.2 * s, 0.27 * s, 3.4 * s, 6, P(0.4, 0, -0.08), (1, 0, 0.12)), sleeve, hold)
    # pose "slap": flat open palm, fingers together, coming down from the right
    slap = lib.empty("pose_slap", (0, 0, 0.6), root)
    o = Vector((1.6, 0.3, 0.6))
    parts = [lib.box(0.44 * s, 0.4 * s, 0.1 * s, P(0, 0, 0), bevel=0.02 * s)]
    for i in range(4):
        parts.append(lib.box(0.36 * s, 0.085 * s, 0.07 * s, P(-0.38, -0.15 + i * 0.1, 0), bevel=0.01 * s))
    parts.append(lib.box(0.26 * s, 0.09 * s, 0.08 * s, P(-0.12, -0.27, 0), rot=(0, 0, -0.6), bevel=0.01 * s))
    lib.mesh_obj("slap_skin", lib.merge(*parts), skin, slap)
    lib.mesh_obj("slap_cuff", lib.box(0.12 * s, 0.44 * s, 0.34 * s, P(0.28, 0, 0), bevel=0.015 * s), cuff, slap)
    lib.mesh_obj("slap_sleeve", lib.prism(0.2 * s, 0.27 * s, 3.4 * s, 6, P(0.32, 0, 0), (1, 0.15, 0.25)), sleeve, slap)
    slap.location.y += 2.6  # keep the two poses apart in the preview; the game places each pose itself
    return root


BUILDERS = {"cup": build_cup, "pitcher": build_pitcher, "table": build_table, "customer_hand": build_customer_hand}
PREVIEW = {"cup": dict(target=(0, 0, 0.5), dist=5.5), "pitcher": dict(target=(-0.6, 0, 0.8), dist=7.5),
           "table": dict(target=(0, 0, 0), dist=8), "customer_hand": dict(target=(1.5, 1.3, 0.2), dist=8)}

if __name__ == "__main__":
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    names = argv or list(BUILDERS)
    for n in names:
        root = BUILDERS[n]()
        path = lib.export_glb(n, root)
        save_blend(n)
        lib.preview(n, **PREVIEW[n])
        print(f"BUILT {n}: {path} ({os.path.getsize(path)} bytes)")
