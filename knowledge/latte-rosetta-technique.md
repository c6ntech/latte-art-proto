# Rosetta (leaf) pour: technique numbers

Lane refs-rosetta (KIT_ADOPTION Q2), 2026-10-10. Collected so the motion data in `js/patterns/rosetta.js` can be checked against real pours instead of guessed.
Units follow `rosetta.js`: R = cup radius; +y = toward the player (the side the milk flows to); −y = the pitcher's side (far side); x = left/right.

Tags on every number:
- **measured**: I measured it from the CC0 video or the reference photos.
- **read**: a source states it (cited).
- **inferred**: my own estimate from the measured and read numbers.

## Sources

| id | source | what it gives |
|---|---|---|
| S1 | Complete Home Barista, "How to Pour a Rosetta Latte Art Pattern" https://completehomebarista.com/faqs/milk-latte-art/how-to-make-rosetta-latte-art/ | phase list, heights 8–10 cm / 1–2 cm, fill levels ½ and ¾, fast wiggle gives tight leaves |
| S2 | Verve Coffee, "Rosetta latte art" https://www.vervecoffee.com/blogs/the-verve-blog/how-to-pour-rosetta-latte-art | spout close to surface; small wiggle; cup full of layers when you reach the back; strike-through: slow down and raise a bit; big cup slower, small cup faster |
| S3 | Equator Coffees, "How to make latte art" https://www.equatorcoffees.com/blogs/journal/how-to-make-latte-art | fast flow to dive, nose up to slow; lower spout at ~¾ full; raise the tip to pull through |
| S4 | Tasting Table, "How To Pour A Rosetta Like A Pro" https://www.tastingtable.com/1601190/how-to-pour-rosetta/ | wiggle mostly from the wrist, speed up the wiggle as leaves bloom, "whip" through for the stem, medium flow |
| S5 | Barista Hustle (paywalled; only the search-result snippets were readable) https://www.baristahustle.com/?p=2411 ("The First Half — Shaking In Place"), https://www.baristahustle.com/?p=2331 ("Flow Rate, Width, & Height") | shake east–west around the bull's-eye; eddy flow can stretch a ~1 cm swipe to more than 15× its length; filling at 10–20 ml/s, then about 2× faster for the design; ~30 ml/s in a rosetta lesson |
| S6 | StudyRaid, "The Theory Behind Latte Art" https://app.studyraid.com/en/read/102680/4588541/the-theory-behind-latte-art | "2–3 times per second" wiggle (no source given, so I treat it as weak) |
| S7 | The Daily Meal, "8 Tips For Making Beautiful Latte Art" https://www.thedailymeal.com/drink/8-tips-making-beautiful-latte-art-slideshow | ease off the flow before the final pull, or the stream drags and smears the pattern |
| V1 | Video "Latte art leaf - 01.ogv", Anna Frodesiak, **CC0**, https://commons.wikimedia.org/wiki/File:Latte_art_leaf_-_01.ogv (720×480, 29.97 fps, 14.0 s) | measured timings, wiggle frequency, leaf count |
| P | The 8 photos `Docs/concepts/approved/latte/rosetta_ref_01..08.jpg` (sources in `Docs/concepts/approved/README.md`) plus `rosetta_owner_ref.jpg` | measured leaf counts, pattern extent, leaf width |

## Phases (real pour)

| phase | what the hand does | pitcher height | cup fill | duration (V1) |
|---|---|---|---|---|
| 1. Fill / sink | High, thin stream into the crema centre (small circles are optional); the milk dives under the crema. Cup is tilted toward the pitcher. | 8–10 cm (read S1); "high" (S3) | 0 → ½ (read S1) | ≈0.5–6.0 s, **≈5.5 s** (measured) |
| 2. Drop | Bring the spout down to almost touch the surface. Flow goes **up**, and a white dot surfaces. | 1–2 cm (read S1); "as close as possible without touching" (S2) | ≈½ | ≈6.0–6.4 s, ≈0.4 s (measured) |
| 3. Wiggle + move back | Wrist-only side-to-side shake. The pitcher slowly backs toward its own side while the cup levels out. Back-off speed matches how fast the cup fills (S1). Leaves form under the spout and the flow pushes them toward the far (player) side. | stays low, 1–2 cm (read S1/S2) | ½ → ¾ (read S1) | ≈6.4–8.6 s, **≈2.2 s** (measured) |
| 4. Lift + slow | Stop wiggling, raise the pitcher "a bit" and thin the stream (S2, S3, S7). | slightly higher; about 3–4 cm (inferred, V1 looks about 2–3× the wiggle height) | ≈¾ | ≈0.2 s (measured, rough) |
| 5. Pull-through | Thin stream drawn along the centre line from the small (pitcher-side) end through the big leaves to the far edge. This drags each leaf into a V and draws the stem. | raised; thin stream | ¾ → full | ≈8.8–9.6 s, **≈0.8 s** (measured) |

**Total pour ≈ 9 s** (measured V1). This was a small cup, and S2 says bigger cups go slower.
Flow (read S5): about 10–15 ml/s while filling, then about 2× (20–30 ml/s) for the design. So the wiggle flow is about 2× the fill flow.

## Wiggle frequency (measured, V1)

- Method: ffmpeg at the native 29.97 fps from 6.0 s to 8.6 s. In each frame I tracked the x-centroid of pale (milk) pixels in the stream/spout area (HSV S<0.38, V>0.55). I also made 10 fps and 30 fps contact sheets to check by eye (in the scratchpad, not kept).
- Peaks of the centroid fall on frames 14, 22, 34, 41, 50, 58. The gaps are 8, 12, 7, 9, 8 frames, so the mean is **8.8 frames = 0.29 s per full cycle (left + right) ≈ 3.4 Hz**. The FFT peak of the detrended signal is **3.46 Hz**, which agrees.
- That gives **one half-swing (one leaf) ≈ 0.15 s**, about 6.8 half-swings per second.
- Caveats:
  - The video is oblique and handheld, and the barista holds the cup, so the camera moves too.
  - The centroid mixes in foam that has already surfaced, so the amplitude comes out too small. The frequency is still reliable.
  - Tracking the dark pitcher body gave no clean peak (the hand and shadow are in the way), so I did not use it.
- Read: S6 says 2–3 Hz full cycles, i.e. 0.17–0.25 s per half-swing (weak source). S1 and S4 say a faster wiggle gives tighter, smaller leaves and a slower one gives wider leaves.
- The count holds together: 2.2 s × 3.4 Hz ≈ 7.5 full cycles ≈ 15 half-swings. The finished V1 pattern shows only about 5–6 clear pairs, because the first leaves merge into the wide base.

## Wiggle amplitude and pattern size

- Hand amplitude (inferred): S5 says the eddy flow stretches a swipe of about 1 cm to more than 15× its length. So the spout itself moves only about ±0.5 cm. On a cappuccino cup of about 9–10 cm inner diameter (R ≈ 4.5–5 cm, inferred), that is **about ±0.1R**.
- V1 centroid swing (measured, too small for the reason above): about 15–25 px peak-to-peak on a cup about 330 px wide, i.e. about ±0.05–0.08R. This is a lower bound.
- The leaves are much wider than the hand swing. Measured on the top-down photos (P), with R = inner cup radius:

| ref | leaf pairs | tip y | stem end y | half-width of leaves at the base | half-width near the tip |
|---|---|---|---|---|---|
| ref_01 | ≈11 | −0.90R | +0.96R | ≈0.53R (swirl wings to ≈0.8R) | ≈0.13R |
| ref_03 | ≈6 | −0.78R | +0.88R | ≈0.67R | ≈0.15R |
| ref_04 | ≈13 (fern) | −0.94R | +0.94R | ≈0.41R | ≈0.08R |
| ref_07 | ≈11 | −0.85R | +0.81R | ≈0.58R (wings fill the cup) | ≈0.12R |
| owner ref (oblique) | ≈7 | — | — | ≈0.55R (rough, oblique) | — |

- **The pattern spans about −0.85R (tip, pitcher side) to +0.9R (stem end, player side), ≈1.7R** (measured). It is centred in the cup.
- **The leaves taper from a half-width of ≈0.4–0.67R at the base to ≈0.1–0.15R at the tip**, a ratio of about 0.2–0.3 (measured). The spacing between leaves also shrinks toward the tip: about 0.15–0.3R per pair along the axis, tightest near the tip (measured, approximate).
- Leaf count across all 9 photos: 4, 6, 6, 6, 7, 8, 11, 11, 13 pairs. **A typical good rosetta has 6–11 pairs**. Average or beginner ones have 4–6 fat pairs (ref_06, ref_08). (Measured; counts are ±1.)

## Moving back

- What the pitcher does (read S1, S2): it backs off slowly at the same rate the cup fills. You should reach the back (pitcher side) when the cup is full of layers; arriving early means you moved back too fast.
- Distance (inferred): the last, smallest leaf sits at about −0.75R and the tip at about −0.85R. The first leaves end up at about +0.6 to +0.9R, but the flow pushes them there. So the spout itself travels less than the pattern does, roughly from +0.4R to −0.7R (≈1.1R) during the 2.2 s wiggle, i.e. **≈0.5R/s**.
- Tasting Table (S4) frames this as moving the *cup* forward instead of the pitcher back. The relative motion is the same.

## Pull-through

- Speed (measured V1): about 0.8 s (±0.2 s) for the whole stem. Over a stem of about 1.7R that is **≈2R/s**, about 4× faster than the back-off.
- Stream (read S2, S3, S7): thinner and slower than in the wiggle, with the pitcher raised a bit. If you do not ease off, the stem smears the leaves (S7).
- Path (measured P): from just beyond the tip (≈−0.85R) to the stem end (≈+0.9R), straight down the centre line.

## Our `rosetta.js` value → suggested value

Current file: `W = { start 3.35, halves 14, step 0.21, y0 0.24, y1 −0.46, a0 0.18, a1 0.08, pullH 0.6, pullFlow 0.5 }`. The pull runs from y = y1−0.08 = −0.54 to +0.44 (0.98R) in 1.3 s. I only suggest values here; the main loop decides on tuning and game feel.

| parameter | ours | suggested | tag and source |
|---|---|---|---|
| halves (half-swings = leaves) | 14 (7 pairs) | **14** (keep; range 12–20) | measured: owner ref ≈7 pairs; V1 ≈15 halves; photos 6–11 good pairs |
| step (s per half-swing) | 0.21 | **0.15** (range 0.15–0.17) | measured V1 3.4 Hz → 0.147 s; read S6 2–3 Hz → 0.17–0.25 (weak) |
| wiggle duration (halves−1)×step | 2.73 s | **≈2.0–2.2 s** | measured V1 ≈2.2 s |
| a0 (first swing, spout) | 0.18R | **0.15–0.18R** spout, *if* the sim spreads milk; the target is a leaf half-width of ≈0.55R at the base | inferred from S5 (hand ≈±0.1R); measured leaf width (P) |
| a1 (last swing) | 0.08R | **0.05R** | measured taper top/base ≈0.2–0.3 (P); ours is 0.44 |
| y0 (wiggle start) | +0.24R | **+0.40R** | inferred: the base leaves have to end up at +0.6 to +0.9R (measured P) |
| y1 (wiggle end) | −0.46R | **−0.70R** | measured: last leaf ≈−0.75R, tip −0.78 to −0.94R (P) |
| back-off speed (y0−y1)/duration | 0.70R / 2.73 s = 0.26R/s | **≈1.1R / 2.1 s ≈ 0.5R/s** | inferred (P + V1) |
| pull start y (y1−0.08) | −0.54R | **−0.80R** | measured tip −0.78 to −0.94R (P) |
| pull end y | +0.44R | **+0.85R** | measured stem end +0.81 to +0.96R (P) |
| pull duration | 1.3 s | **0.8 s** (range 0.6–1.0) | measured V1 |
| lift before the pull (tw → tw+0.3) | 0.3 s | **0.2 s** | measured V1, rough |
| pullH | 0.6 | **≈0.4** (higher than the wiggle's 0.2–0.28, lower than the fill's 1.0) | inferred from read heights: fill 8–10 cm, drop 1–2 cm (S1), pull "a bit higher" (S2, S3) → about 3–4 cm ≈ 0.35–0.45 of fill height; depends on how main.js maps h |
| drop / wiggle h | 0.2 → 0.28 | **keep 0.15–0.25** | read S1: 1–2 cm vs 8–10 cm ≈ 0.1–0.25 |
| pullFlow | 0.5 | **keep 0.4–0.5** (thinner than the wiggle) | read S2, S7 |
| fill flow vs wiggle flow | 0.7 vs 1.0 | **≈0.5 vs 1.0** | read S5: 10–15 ml/s fill, about 2× for the design |
| fill phase length | 2.2 s (0.9–3.1) | real ≈5.5 s; fine to compress for a game | measured V1 |
| total pour | ≈7.2 s (0.9 → tw+2.0) | real ≈9 s | measured V1 |

Caveats:
- V1 is a single barista, filmed obliquely, with a small cup. A top-down video with a free licence would let us measure the amplitude properly; I did not find one on Wikimedia Commons.
- I could not read the Barista Hustle text past the paywall. Its numbers here come from search snippets only.
