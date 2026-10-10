# review-2026-10-10-rosetta-r2: Rosetta, guided simulation round 2

- Reviewer: fresh visual-review sub-agent (did not build this). Card: `.claude/skills/latte-review/SKILL.md`.
- **This version (r2), v1010-1538**:
  - perfect pour `Docs/runs/20261010-153809_g6` (100% in the sweet spot)
  - bad pour `20261010-153831_bad_after4` (49% in the sweet spot)
  - hand pour that passed at 94%: `20261010-153858_play_after4`
- **Previous version (r1), v1010-1532**:
  - perfect pour `20261010-153246_g4`
  - bad pour `20261010-153301_bad_after3` (45% in the sweet spot)
- **Original baseline (context only)**: `20261010-152750_before_auto` (v1010-1527)
- References:
  - Main: `Docs/concepts/approved/latte/rosetta_owner_ref.jpg`
  - Game target: `assets/patterns/rosetta_target_preview.png`. It was regenerated at 15:36 between r1 and r2: target coverage went 0.37→0.36 and symmetry 0.46→0.44. The shape looks the same as in r1.
- The 72 px pixel-art look is intended and was not penalised.
- Images I looked at (contact sheets only, all in `Docs/reviews/`):
  - `review-2026-10-10-rosetta-r2_strips.jpg`: six formation strips (baseline, r1 good/bad, r2 good/bad/hand94)
  - `..._reveals.jpg`: the same six reveals
  - `..._ref.jpg`: owner photo and target preview
  - `..._closeup.jpg`: owner crop, target mask, and the 100% frames of r1 good, r2 good, r2 hand94 and r2 bad, upscaled nearest-neighbour
  - `..._formation.jpg`: 25/50/75/100% frames of r1 good, r2 good and r2 bad, upscaled
  - `..._phone390.jpg`: reveals at 390 px wide

## Script numbers (checks.json, computed by script)

| metric | r2 target | r1 good | **r2 good** | r2 bad (49%) | r2 hand (94%) |
|---|---|---|---|---|---|
| match | – | 0.94 | **0.99** | 0.47 | 0.70 |
| coverage | 0.36 | 0.40 | 0.36 | 0.43 | 0.42 |
| width | 0.68 | 0.68 | 0.68 | 0.72 | 0.67 |
| height | 0.67 | 0.67 | 0.68 | 0.75 | 0.68 |
| offset | 0.01 | 0.01 | 0.01 | 0.18 | 0.09 |
| symmetry | 0.44 | 0.48 | 0.45 | 0.42 | 0.60 |
| leaves | 3 | 3 | 3 | 3.5 | 3 |

Match 0.99 means r2 reproduces the game target almost exactly. The scores below are against the owner photo, so the gap between the target and the photo is still the main limit.

## Hard fails

| | r1 | r2 | r2 notes |
|---|---|---|---|
| H1 no stem / pull-through line through the middle | pass (borderline) | pass (borderline) | A white spine runs from the heart through the chevrons. It ends about 65% of the way down. At the very bottom there is only a 1–2 px brown tick, not a line. |
| H2 leaves do not alternate; clearly asymmetric | **FAIL** | **FAIL** | Same build as r1. The left side is a tall crescent arm that rises above the right side, and the right side has 3–4 lobes. The cuts are mirrored V chevrons, not alternating leaves. |
| H3 one big white mass, no brown separators (stamp) | pass (borderline) | pass (borderline) | The upper 2/3 has separators. The lower ~20% and the outer left crescent are still solid cream. |
| H4 pattern clearly off-centre | pass | pass | Offset 0.01. |
| H5 bad pour not smeared, or perfect pour smeared | pass | pass | The bad pour has a large displaced blob at bottom right and a curled, bent stem at lower left. The perfect pour is clean. |
| **Count** | **1** | **1** | |

## Scores (1–10, against the owner reference)

| # | Criterion | Baseline | r1 | **r2** | r2 vs r1 | Note (r2) |
|---|---|---|---|---|---|---|
| 1 | Outline: leaf shape, narrow top, wide base, centred, ~65% of the cup | 3 | 6 | **6** | = | Right size and centred, with a heart on top. Still a round C / crescent rather than the photo's tapered teardrop. The left arm tip pokes up past the heart line. |
| 2 | Leaves: ~7 pairs along the midline, each separate | 3 | 3 | **3** (H2 cap) | = | About 4 mirrored chevron cuts against 6–7 thin pairs in the photo. Left and right still differ in kind (arm vs lobes). |
| 3 | Stem: thin, straight, through every leaf | 2 | 5 | **5** | = | The spine reads from the heart down, but it is a thick white ridge and disappears into the solid base. There is no thin pull-through line. |
| 4 | Edges and texture: clean edge, light-brown rim, foam not plastic | 5 | 6 | **6** | = | Crisp edge, faint brown halo and foam speckle are the same as r1. Leaves are flat cream with thick brown cuts and no beige graded edge like the photo. A few stray white pixels sit under the base and look like noise. |
| 5 | Formation: inflow, rise, stacking, pull-through; nothing appears suddenly | 5 | 2 | **5** | ↑ +3 | Real progress: at 50% only the base wedge with two V cuts is there, by 75% leaves are stacked up to a soft heart, and at 100% the heart is sharp. The order (base first, then smaller leaves up to the heart) is right. But at 25% there is still no white, 50→75% is a big jump, and the growth looks like a bottom-up wipe of the final mask. No pull-through moment is visible. |
| 6 | Bad pour really smears, and you can tell which part | 5 | 7 | **7** | = | Clearly broken. The upper-left leaves and heart survive, the right half of the base is one shapeless blob (visible as an off-centre blob from 50%), and the stem bends into a curl. The red section in the middle of the timing bar lines up with the base/mid leaves that failed. |
| 7 | Readable at phone size (390 px) | 4 | 8 | **8** | = | Reads at once as a rosetta with a heart. Almost identical to r1 at this size. |
| | **Average** | **3.86** | **5.29** | **5.71** | ↑ +0.43 | |

Verdict: a small improvement, all of it in formation. The finished picture is effectively the same as r1. Still below the bar: 1 hard fail (H2) and an average under 7.

## Three worst remaining defects (r2)

1. **Too few leaves, mirrored and lopsided (H2).**
   - Seen: about 4 thick mirrored V cuts instead of 6–7 thin stacked pairs. The left side is one tall crescent arm and the right side has round lobes.
   - Likely layer: **assets**. The run matches `rosetta_target_preview.png` at 0.99, so the derived target is now the ceiling. More simulation tuning cannot fix this.
2. **Solid base and no pull-through stem.**
   - Seen: the spine stops about 65% of the way down. The lowest ~20% of the leaf is a solid cream mass with only a pixel tick where the stem should exit. The photo's thin stem through every leaf down to the base tip is missing.
   - Likely layer: **assets** (the target has no base cuts or stem line), plus **motion data** (no final narrow pull-through stroke that visibly cuts through).
3. **Formation looks like a mask wipe, not a pour.**
   - Seen: the cup is empty at 25%, a base wedge appears at 50%, and by 75% the whole leaf set is already there. Leaves do not appear one by one with a wiggle, and no stem is drawn at the end.
   - Likely layer: **fluid** (the guide reveals the target from the bottom up instead of depositing leaf by leaf). Possibly **display** if the target alpha is blended in.

## Other observations (not scored)

- **Hand pour that passed at 94%**:
  - The heart and upper leaves merge into broad lobes, the heart is lost, and the base is a wide blob.
  - Damage is smaller than the r1 95% hand pour (offset 0.09 vs 0.17, height 0.68 vs 0.81), but 6% out of the sweet spot still costs the heart.
  - Only the owner on a phone can judge whether that feels fair.
- **Bad pour**: the 50% frame already shows the failure (an off-centre blob at bottom right). This is good for criterion 6.
