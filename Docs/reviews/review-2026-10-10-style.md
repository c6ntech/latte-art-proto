# Style review 2026-10-10 (lane review-2026-10-10-style)

Compared: game captures `Docs/progress/2026-10-10/3d_auto_midpour.jpg`, `3d_auto_reveal.jpg`, `3d_hand_drift_tilt.jpg`
against `Docs/concepts/approved/style/*.jpg` (bowls table, hotpot table, people in store, seaside houses).

Contact sheets: `Docs/reviews/review-2026-10-10-style_game.jpg`, `Docs/reviews/review-2026-10-10-style_ref.jpg`.
Single image inspected: crop of `3d_auto_midpour.jpg` (cup + hand region).
Note: the glob `3d_*.jpg` also matched `3d_first_pass_midpour.jpg` (older pass, pitcher renders near-black); it is on the sheet but not scored.

## Scores (1-10, game vs references)

| # | Criterion | Score | Notes |
|---|-----------|-------|-------|
| 1 | Geometry faceting and silhouettes | 7 | Cup and saucer are clean ~12-sided prisms with crisp edges, close to the reference bowls. Pitcher is faceted and reads well. Cup handle is a tiny stub; the arm is a single untapered box. |
| 2 | Pixel texture treatment | 6 | Nearest-neighbour noise is present on wood, cup and pitcher, edges stay crisp (not a low-res render). Texel size is inconsistent: wood texels are large, cup/saucer noise is finer, the latte grid is coarser again; arm and sleeve have almost no texture. |
| 3 | Lighting and shadows | 6 | Single key light with a soft cast shadow and a contact shadow under the saucer; the inner cup wall gets a shadow. Table is lit almost uniformly, no falloff or ambient occlusion in plank gaps; the arm shadow is a large flat dark slab. References show softer gradients and bounce light. |
| 4 | Colour palette and mood | 5 | Warm, but the table is a saturated orange-amber and the sleeve a saturated teal; references are warmer-muted with greyed browns and desaturated accents. Cup cream and milk white sit well. |
| 5 | Latte surface | 4 | Pattern is crisp pixel art, which fits, but it is one flat white tone on one flat brown: no crema gradient, no darker rim, no soft milk-into-espresso edge, no layered ridges. An orange outline ellipse (guide ring) is painted on the surface and reads as part of the art. The pour stream is a smooth untextured tube. |
| 6 | Hand and arm | 3 | Hand is a small orange block with two fork-like fingers, same hue as the table; the arm is a long thin teal box with no wrist, cuff, or shading change. It looks like a placeholder next to the reference people. |
| 7 | Overall fit next to references | 5 | Cup/saucer would sit next to the bowls image; table, latte surface and arm would not. |

## Three worst defects

1. **Hand and arm look like placeholder primitives.**
   What I see: the hand is a small orange block with two prong fingers in nearly the table's colour, attached to a long, thin, untextured teal box with no wrist or cuff.
   Likely fix: model a 6-8 sided tapered forearm with a sleeve cuff and a hand with a thumb wrapped round the pitcher handle, about 1.3x current hand size, a muted skin tone (around #C89A7A) clearly lighter and pinker than the table, and the same pixel-noise texture density as the cup.

2. **Latte surface is flat two-tone and carries an orange guide ring.**
   What I see: the milk pattern is a single flat white on a single flat brown, with no crema tone shift or layered ridges, and an orange outline ellipse sits on the surface as if it were part of the art.
   Likely fix: add a 3-4 step palette to the latte texture (dark rim #4A2A18, crema mid #8A5A34, milk edge blend #D9C2A0, milk #F2E8D8) with 1-texel blended edges on each pour layer, and move the guide ring off the surface texture (thin overlay, low alpha, or hidden at reveal).

3. **Table is too saturated and reads as a brick wall.**
   What I see: short staggered planks with heavy dark seams in bright orange-amber make the top-down table look like brick, and its saturation outshouts the cup.
   Likely fix: lengthen the planks (about 3-4x current length, or long boards), thin the seams to 1 texel at about 60% darkness, drop saturation about 30% toward a muted walnut (around #7A5638 / #8E6844), and add slight light falloff or vignette toward the screen edges.
