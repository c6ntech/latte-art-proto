# review-2026-10-10-rosetta-r1 — Rosetta: free simulation vs guided simulation

- Reviewer: fresh visual-review sub-agent (did not build this). Card: `.claude/skills/latte-review/SKILL.md`.
- **Before** (v1010-1446 behaviour): good pour `Docs/runs/20261010-152750_before_auto` (build v1010-1527); bad pour `20261010-153014_bad_before` (v1010-1529, 35% in sweet spot)
- **After** (guided simulation, v1010-1532): good pour `20261010-153246_g4`; bad pour `20261010-153301_bad_after3` (45% in sweet spot); hand pour that passed at 95% `20261010-153316_mid_after`
- Reference: `Docs/concepts/approved/latte/rosetta_owner_ref.jpg` (main); game target `assets/patterns/rosetta_target_preview.png`
- The 72 px pixel-art look is intended and was not penalised.
- Images I looked at (contact sheets only):
  - `Docs/reviews/review-2026-10-10-rosetta-r1_strips.jpg` (five formation strips)
  - `..._reveals.jpg` (four reveals)
  - `..._ref.jpg` (owner reference + target)
  - `..._phone390.jpg` (before/after reveal at 390 px wide)
  - `..._closeup.jpg` (reference crop vs the 100% frames)

## Script numbers (checks.json; computed by script, not estimated)

| metric | target | before good | after good | after bad | after hand 95% |
|---|---|---|---|---|---|
| match | – | 0.15 | **0.94** | 0.43 | 0.59 |
| coverage | 0.37 | 0.11 | 0.40 | 0.51 | 0.46 |
| width | 0.68 | 0.36 | 0.68 | 0.85 | 0.65 |
| height | 0.67 | 0.58 | 0.67 | 0.71 | 0.81 |
| offset | 0.01 | 0.26 | 0.01 | 0.07 | 0.17 |
| symmetry | 0.46 | 0.16 | 0.48 | 0.39 | 0.47 |

Note: match 0.94 means the after version reproduces the **game target** almost exactly. The visual scores below compare against the **owner photo**, so any gap between the derived target and the photo shows up here as a defect.

## Hard fails

| | Before | After |
|---|---|---|
| H1 no stem / pull-through line through the middle | **FAIL**: an oval "shell" of fanned streaks with a spiral at the base; no centre line | pass (borderline): a white centre spine runs from the heart through the chevrons, but it stops about 60% of the way down |
| H2 leaves do not alternate left/right; clearly asymmetric | **FAIL**: streaks fan out like a scallop shell; there are no leaves | **FAIL**: the left side is one thick crescent arm while the right side has three lobes; the cuts are symmetric V chevrons and do not alternate |
| H3 one big white mass with no brown separators (stamp) | pass | pass (borderline): the lower third and the left arm are solid white; the upper half has separators |
| H4 pattern clearly off-centre | pass visually (centred left-right, sits a little low; script offset 0.26) | pass (offset 0.01) |
| H5 bad pour not visibly smeared, or perfect pour smeared | pass | pass |
| **Count** | **2** | **1** |

## Scores (1–10, against the owner reference)

| # | Criterion | Before | After | Δ | Note (after) |
|---|---|---|---|---|---|
| 1 | Outline: leaf shape, narrow top, wide base, centred, about 65% of the cup | 3 | 6 | ↑ | Right size, centred, heart on top. The outline is a round C / crescent rather than the reference's tapered teardrop. |
| 2 | Leaves: about 7 pairs, stacked along the midline, each one separate | 3 (H2 cap) | 3 (H2 cap) | = | About 3–4 cuts against the reference's 6–7 thin pairs. Left and right do not match. |
| 3 | Stem: thin, straight, through every leaf | 2 (H1 cap) | 5 | ↑ | A spine is readable from the heart down. It is thick and white, not a thin pull-through, and is lost in the solid base. |
| 4 | Edges and texture: clean white/coffee edge, light-brown rim, reads as foam not plastic | 5 | 6 | ↑ | Crisp edge, faint brown halo, foam speckle. Inner leaves are flat cream, the brown cuts are thick, and there is no tinted leaf edge. |
| 5 | Formation: 25→100% shows inflow, rise, leaf stacking, pull-through; nothing appears suddenly | 5 | 2 | ↓ | At 25% the cup is empty. By 50% the finished pattern is already there, and 50/75/100% look almost the same: it appears all at once. |
| 6 | Bad pour really smears, and you can tell which part | 5 | 7 | ↑ | The bad pour is clearly torn. The right-hand leaves survive while the top-left and middle wash out, so you can see which part failed. Before, the whole cup was random marbling. |
| 7 | Readable at phone size | 4 | 8 | ↑ | At 390 px it reads at once as a rosetta/leaf with a heart. Before, it read as a shell or pine cone. |
| | **Average** | **3.86** | **5.29** | ↑ +1.43 | |

Verdict: clearly better than before, but still below the bar (1 hard fail, average < 7).

## Three worst remaining defects (AFTER)

1. **The pattern appears all at once.**
   - Seen: at 25% the cup is empty; by 50% the finished rosetta is already there; 50→75→100% barely change. No inflow, rise, stacking or pull-through is visible.
   - Likely layer: **fluid** (the guide pulls to the full target too early instead of building up over the pour). Possibly **display** if the target is blended in directly.
2. **Too few leaves, and they are lopsided.**
   - Seen: about 3–4 brown cuts against the reference's 6–7 thin alternating pairs. The left side is one wide crescent arm, the right side has three lobes, and the cuts are mirrored Vs rather than alternating.
   - Likely layer: **assets**. `rosetta_target_preview.png` already has this shape and the run matches it at 0.94, so the derived target, not the simulation, is now the ceiling.
3. **Solid white base with no stem.**
   - Seen: the lower third of the pattern is one white mass. The spine stops there, and no thin brown pull-through line runs from the heart to the base. This is also where the leaf turns into a round C outline.
   - Likely layer: **assets** (the target mask has no base cuts or stem), plus **motion data** (no final narrow pull-through stroke that cuts through).

## Other observations (not scored)

- The hand pour that passed at 95% (`mid_after`) looks visibly worse than the 100% pour:
  - The base is a heavy blob with brown smears.
  - The right leaves have broken off.
  - Height is 0.81 and offset 0.17.
  - For 5% of the pour outside the sweet spot, the visual damage looks out of proportion. The owner should check this on a phone; this review does not judge difficulty.
- In every strip, the 25% frame shows only a small brown hook. No white appears in the first quarter of the pour.
