# 3D Generation Preferences — the owner's Taste (recorded 2026-08-28)

The owner's standing preferences for AI 3D asset generation (Customuse MCP + fal.ai).
These are defaults — he says when and what to generate; ask only if a case falls
outside them.

## Terms — do not confuse

- **Patina (fal.ai)** — about creating MATERIALS for a mesh. The owner's favorite.
  NOT the same thing as Meshy retexturing.
- **Meshy 7 retexture (Customuse `textureGeneration` node)** — a mesh
  re-texturing engine; one of the options, not the material tool.

## Mesh generation (Customuse) — the bake-down pipeline (locked 2026-08-28)

CR1 was tested on the Map01 props batch and REJECTED by the owner ("bad") — weak results. The standing pipeline is now:

1. **Tripo v3.1** (`tripoV31Mesh3d`) at HIGH poly (faceLimit ~300k) WITH its
   own texturing (4K) — quality first.
2. **Retopology** via `meshDecimation` (Blender Collapse; ratio tuned to land
   ~5-9k faces for props).
3. **UV Unwrap** via `uvUnwrap` (xatlas default).
4. **Bake** via `textureBaking`: source = the textured high-poly, target = the
   unwrapped low-poly, bakeChannel ["all"] (basecolor/normal/roughness/
   specular/metalness), 2K — the high-poly detail lands on the game mesh.

The optimized GAME asset is the bake node's output. Tripo P1 remains an option
for quick low-stakes props.

## Texturing

- **Default for textures/materials: Patina on fal.ai — mandatory unless the owner
  explicitly says otherwise.**
- On Customuse two texturing routes exist and both may be tested/compared:
  1. texture directly in the Tripo v3.1 generation (model + texture in one go);
  2. retexture the mesh via **Meshy 7** (`textureGeneration` node).
- The owner's preferred experiment shape: generate the model, immediately generate
  its texture, and produce BOTH the v3.1-textured and the Meshy-7-textured
  variants to compare.

## Workflow style

- Assemble node workflows on the Customuse canvas (one workflow per session),
  hand results (GLB/FBX/textures) back into the local project.
- The owner builds the MAP himself — generations happen when he asks; these
  preferences just remove the need to re-ask about model choice each time.
