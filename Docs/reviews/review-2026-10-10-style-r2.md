# Style review r2 (2026-10-10)

Lane: review-2026-10-10-style-r2. Visual only; game feel and difficulty not judged.

Inputs: `Docs/progress/2026-10-10/r2_3d_auto_{early,midpour,reveal}.jpg` against `Docs/concepts/approved/style/*.jpg`, rules in `Docs/STYLE_BIBLE.md`.
Contact sheets: `Docs/reviews/review-2026-10-10-style-r2_game.jpg`, `Docs/reviews/review-2026-10-10-style-r2_ref.jpg`. One extra close crop of the mid-pour frame (cup and hand).

## Scores (1-10, against the references)

| # | Area | Score | Notes |
|---|---|---|---|
| 1 | Geometry and silhouettes | 7 | 12-sided cup and saucer with inner/outer rim bevel and a faceted 10-sided pitcher match the bowls reference well. The handle is a small stub, and the arm is one long straight box with no taper or elbow. |
| 2 | Pixel texture treatment | 5 | The coffee has visible pixel noise and crema blotches. The ceramic and pitcher look almost smooth at phone size, and the wood planks are big, low-contrast smooth bands. The references' ceramics, skin and wood all carry clearly visible per-pixel grain. |
| 3 | Lighting and shadows | 7 | Warm key light from the upper left, soft cast shadows of the arm, pitcher and cup on the table, and the cup reads as lifted. Shading inside the rim is good. The vignette at the top is heavy, and the pitcher's shadow on the coffee is a dark smudge. |
| 4 | Colour palette and mood | 6 | Warm and muted overall, with ceramic and coffee on palette. The table is more saturated orange-amber than the references' greyer, desaturated wood, so the frame looks hotter and flatter than the refs. |
| 5 | Latte surface | 5 | The reveal reads as a layered pixel rosetta/tulip with brown separator lines, which is a real improvement. During the pour, the art is a small, near-pure-white stamp with hard binary edges and few mid tones, so it sits on the coffee instead of in it. The dashed ring is UI and was not counted. |
| 6 | Hand and arm | 4 | Navy sleeve, cream cuff, skin-tone hand: palette is right. But the hand is a blocky claw gripping the pitcher rim from above with prong fingers, there is no thumb or handle grip, and the sleeve is a flat, untextured beam. It is clearly weaker than the reference figures' faceted, textured hands. |
| 7 | Overall fit next to references | 6 | Same family as the refs: low-poly, nearest-pixel, soft light. It would pass as a distant sibling. Texture grain and the hand/stream are what give it away. |

## Three worst remaining defects

1. **Milk stream is a solid rod.** What I see: the pour is an opaque white faceted cylinder running from the spout straight into the coffee, so it reads as a stick or straw rather than liquid. Likely fix: make the stream thinner and tapering, with a slight wobble and milk-cream colour (not pure white), and break it at the surface with a small ripple or splash ring.
2. **Hand and arm are crude.** What I see: prong-like box fingers clamp the pitcher rim from above at the end of a uniform navy beam, with no thumb, no wrist turn and no texture. Likely fix: move the grip to the pitcher's handle side with a thumb block and wrapped finger block, taper the forearm, and give the sleeve and skin the same noisy pixel texture (with a few fold bands) as the other objects.
3. **Pixel texture too faint on ceramic and wood.** What I see: at phone size the cup, saucer and pitcher look smooth-shaded, and the table is broad smooth plank bands, unlike the visibly grainy surfaces in the references. Likely fix: raise per-texel noise toward the top of the bible's range (about 8%) with stronger 4-texel blotches, lower the texel density on the cup/pitcher so each pixel is visible, and add grain, knots and a darker, desaturated tone to the wood.
