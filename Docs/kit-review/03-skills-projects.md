# Kit review 03 — skills and Overlord project write-ups

Lane: kit-review-3-skills-projects · 2026-10-10 · read-only research. Nothing else was edited.
Kit root: `scratchpad/kit/KaijuTamagotchi-build-kit/` (paths below are relative to it).
Local facts checked: `ffmpeg` installed; `blender` not installed; `fal_client` Python module not installed; no `FAL_KEY`.

## 1. Files read

| # | File | Lines | Status |
|---|---|---:|---|
| 1 | dot-claude/skills/blender-game-animation/SKILL.md | 129 | read fully |
| 2 | dot-claude/skills/fal-ai-generation/SKILL.md | 78 | read fully (identical to our `.claude/skills/fal-ai-generation/SKILL.md`, `diff` clean) |
| 3 | dot-claude/skills/fal-ai-generation/examples/WALKTHROUGH.md | 34 | read fully |
| 4 | dot-claude/skills/fal-ai-generation/examples/concept.json | 7 | read fully |
| 5 | dot-claude/skills/fal-ai-generation/examples/edit.json | 8 | read fully |
| 6 | dot-claude/skills/fal-ai-generation/references/mcp-workflow.md | 93 | read fully |
| 7 | dot-claude/skills/fal-ai-generation/references/prompting-and-review.md | 49 | read fully |
| 8 | dot-claude/skills/fal-ai-generation/references/setup.md | 52 | read fully |
| 9 | dot-claude/skills/fal-ai-generation/scripts/fal_job.py | 214 | read fully |
| 10 | dot-claude/skills/fal-ai-generation/scripts/test_fal_job.py | 57 | read fully |
| 11 | dot-claude/skills/fal-ai-generation/scripts/requirements.txt | 2 | read fully |
| 12 | dot-claude/skills/kaiju-creature-pipeline/SKILL.md | 128 | read fully |
| 13 | dot-claude/skills/progress-capture/SKILL.md | 56 | read fully |
| 14 | dot-claude/skills/unity-editor-ops/SKILL.md | 52 | read fully |
| 15 | projects/overlord/animation-workflow/README.md | 107 | read fully |
| 16 | projects/overlord/animation-workflow/NEXT_BATCH.md | 137 | read fully |
| 17 | projects/overlord/animation-workflow/quadruped-locomotion.md | 158 | read fully |
| 18 | projects/overlord/animation-workflow/upright-locomotion.md | 10 | read fully |
| 19 | projects/overlord/animation-workflow/skullgirls-polish.md | 72 | read fully |
| 20 | projects/overlord/animation-workflow/roster-turns-2026-09-18/HANDOFF.md | 69 | read fully |
| 21 | projects/overlord/animation-workflow/wolf-turn90-final01/HANDOFF.md | 109 | read fully |

Total 21 files, 1,621 lines. Project context read: `CLAUDE.md`, `Docs/TASK.md`, `Docs/PLAN.md`, `Docs/TOOLS.md`, `Docs/DECISIONS.md`, `.claude/skills/latte-loop`, `.claude/skills/latte-review`.

Note: many files link to sources NOT in the kit (`processes/3d-ai/blender-game-animation.md`, `game-animation-polish.md`, `animation-reference-selection.md`, `knowledge/blender-game-animation-lessons.md`, `overlord-character-animation-reviews.md`, `scripts/ledger.py`, `tripo_p2.py`, `glow_mask.py`, `make_timelapse.py`, `disk_watchdog.py`, `evidence/scripts/*`). Only the summaries above are available to us.

## 2. Per-file summaries

1. **blender-game-animation/SKILL.md** — Rig + animate a supplied model in Blender for a game. Order: inspect task → rig/skin and test extremes → block support/contact before secondary motion → explicit timing in seconds and normalized event fractions → owner-editable "Set Pose" workflow → usable playback → bake to runtime skeleton, export, re-import from a copied folder and compare → report approval / export verification / engine integration as separate facts.
2. **fal-ai-generation/SKILL.md** — Operation choice (concept vs faithful edit vs mesh vs material), `recommend_model` → `get_model_schema` → pricing, submit-and-retain receipts, never duplicate a billable job on timeout, download before trusting CDN, keep rejected takes, record technical completion separately from visual acceptance.
3. **WALKTHROUGH.md** — A no-spend rehearsal (`submit --dry-run`) then real `submit` / `status` / `result` against one receipt; the visual criteria are written before generating.
4. **concept.json** — Neutral text-to-image input (single object, centered, neutral bg, even light, readable silhouette, no lettering; 1:1, 2K, 1 image, png).
5. **edit.json** — Faithful edit input: "keep exact same … change only X … preserve Y"; placeholder `example.invalid` URL that the script refuses to submit.
6. **mcp-workflow.md** — fal MCP tool table (recommend/search/schema/pricing/upload/run/submit/check/result), verified routes (`fal-ai/patina/material`, `tripo3d/h3.1/image-to-3d`), local-upload via helper, recovery rules, Bearer (MCP) vs `Key` (REST) header difference.
7. **prompting-and-review.md** — Vary meaningful dimensions for exploration; for edits name what stays + the one change; assign roles to each reference; neutral flat light for reference sheets; PBR channel/colour-space checks; delivery review checklist (full size, count, framing, identity, missing parts, unintended additions, one verdict per output, never hide failed takes).
8. **setup.md** — Copy the folder, own fal key, MCP at `https://mcp.fal.ai/mcp` with `Authorization: Bearer`, env var not committed, `pip install -r scripts/requirements.txt`, dry run does not touch network.
9. **fal_job.py** — Queue helper: `submit` (exclusive `job.json` receipt; `submission_unknown` keeps the guard; refuses placeholder URLs), `status`, `result` (saved `result.json` reused; provider-error detection; recursive media URL discovery incl. `*_urls` and material maps; HTTPS-only, 512 MB cap, hashed filenames), `upload` (sha256-keyed receipt, reuse). Never prints keys or signed URLs.
10. **test_fal_job.py** — 8 unittest cases (dry run loads no SDK, duplicate blocked, uncertain submission keeps guard, processing never re-submits, provider error not downloaded, nested media found, saved result needs no network, placeholder refused). Runs without a key.
11. **requirements.txt** — `fal-client>=0.13.2,<1`, `python-dotenv>=1,<2`.
12. **kaiju-creature-pipeline/SKILL.md** — Per-stage asset pipeline: "key rules first" (budget cap + stop at 90%, max 3 attempts, prove stage 1 end to end before parallel lanes, reject list, never regenerate an accepted asset, asset.json); multiview sheet → Tripo P2 with face limits → Blender UV check with pass thresholds → cleanup rules (scale, pivot, axis, metallic 0, real PNG) → debris kitbash parented to bones → RGBA packed mask → shader (glow, spread dissolve) → master skeleton → captures + Reviewer per stage.
13. **progress-capture/SKILL.md** — "Captures are part of the job": desktop timelapse every 180 s, fixed story cameras per feature never moved, capture after each significant change and ≥ every 5 min, `log.jsonl` (time, feature, caption, file, commit), per-feature timelapse + storyboard, compression presets, retention sweep, disk levels.
14. **unity-editor-ops/SKILL.md** — Unity MCP lessons: one integrator mutates the editor, wait on a result file in one call instead of polling, fixtures write JSON with `summary`, end-of-frame UI capture, material/import rules, recording with fixed capture delta time, kill by PID, commit before risky operations.
15. **overlord/README.md** — Worked example of the approved wolf: 10-step successful sequence, final clip contract table (engine name, author action, range, duration, behavior), script snapshot map with prerequisites and warnings, final model/rig facts, re-import numbers, "add a new case rather than replace evidence".
16. **NEXT_BATCH.md** — Restart guide: dated banner updates at top, "read before next character" ordered list, current editable sources table, "start the next batch without losing prior work" checklist (inspect live unsaved state, write clip list first, approve base before variants, keep experiments separate, verify portable export, record approved/verified/pending).
17. **quadruped-locomotion.md** — Approved 9-clip baseline; controller refinement after owner found Move waited on planted turns (responsiveness fix); contract: code owns displacement/heading, clip only local motion, apply heading exactly once; acceptance: review at normal speed, before/after, geometric check of lean sign, measure the deformed sole, don't call an imperfect check "zero sliding".
18. **upright-locomotion.md** — 10-line standard: per-unit foot-phase calibration, fixed 2x turn steps, 0.35 s eased exits, preserve speed/stride/combat timing.
19. **skullgirls-polish.md** — Owner-requested study of a GDC animation talk: timestamped principle table (silhouette, anticipation vs telegraphing, favour key poses, follow-through, smears, overshoot, rough-in-game first, unequal exposure, hitstop, too much easing around idle hurts responsiveness), "what this changes in our workflow" table, "adapt with care", evidence status.
20. **roster-turns HANDOFF.md** — Handoff for 10 turn clips across 5 rigs: status banner, files table, timing events in fractional frames, per-character measurements, numbered receiving-agent steps, sha256-checked sidecar, verification numbers, reproducibility commands, explicit "not a claim of later approval".
21. **wolf-turn90 HANDOFF.md** — Model handoff: approval/verification/pending banner, "Start here", clip table (take, range, duration, yaw, loop), import + bind steps, "gameplay work the receiving agent must complete", current balance values read (not changed), verification list, editable source + reproduction command.

## 3. Candidates for our project

Value: H/M/L. Rec: **now** = adopt now, **later** = adopt when its phase starts, **skip**.

### 3a. Pattern quality, motion and review (our biggest current problem)

| ID | Item | Source | Concrete use in the latte game | Value | Prereq / cost | Rec |
|---|---|---|---|---|---|---|
| P01 | Video reference as evidence for poses and timing; "authored, not measured"; disclose inference | blender-game-animation §Establish; README step 1 (contact sheets from 24 fps videos) | Get a real rosetta pour video (owner films one, or a tutorial). `ffmpeg` → frames → `tools/contact_sheet.py`. Measure wiggle frequency, wiggle amplitude vs cup radius, pull-back speed, pull-through timing, pitcher height changes. Put measured numbers into `js/patterns/rosetta.js` instead of guessing. | H — rosetta vs owner photo is the #1 problem; today the motion data is invented | ffmpeg (installed); owner time to film 1 pour or pick a video | now |
| P02 | Research method: timestamped principle table + "what this changes in our workflow" + "adapt with care" | skullgirls-polish.md | One lane studies 1–2 rosetta technique videos the same way → `knowledge/latte-rosetta-technique.md` (timestamps, principle, which pattern field / fluid param it maps to). | H — converts real barista knowledge into pattern data | Time only | now |
| P03 | Tune on stage 1, then freeze; one-time A/B of the recipe, log as a decision, reuse for every stage | kaiju §2 "S1 A/B", §7 "tune on S1, then freeze" | Run a single A/B of fluid models (e.g. conveyor on/off, 1/r push vs alternative) on rosetta, Reviewer-scored against `rosetta_owner_ref.jpg`; log D###; then freeze fluid params and let new patterns change only pattern data. | H — stops endless global re-tuning; matches CLAUDE §3 "3 rounds → change model" | Time; Reviewer runs | now |
| P04 | Protect approved work with fingerprints | blender-game-animation §Author ("channel fingerprint"); quadruped §Acceptance | Golden check in `latte-loop`: hash the approved pattern file + a golden sim screenshot of perfect-play rosetta; diff (perceptual / pixel) on every fluid change so a tweak for one pattern can't silently break the approved one. | H — rosetta and tulip share `fluid.js` | Small script around `tools/sim.sh` | now |
| P05 | Keep experiments separate until accepted; approve base before variants; transfer to siblings after approval | NEXT_BATCH "Start the next batch" | Experiments live in `js/patterns/rosetta_v2.js` or `?pattern=` / config variant flags; the default changes only after Reviewer + owner. Heart/swan derive from the accepted rosetta. | H | None | now |
| P06 | Diagnose a broken frame from neighbouring frames; find the causing layer before adding on top | blender-game-animation §Author | When a pattern artefact appears, take sim shots at fixed time steps around it and identify cause (injection, conveyor, pressure solve, layer-id display, pattern keyframe) before tuning. | M | None | now |
| P07 | Polish pass checklist: readable silhouette at real game size, anticipation (telegraph), favour key poses, follow-through, overshoot, rough-in-game first, too much easing around idle hurts responsiveness | blender-game-animation §Author; skullgirls table | Apply to the pitcher wrist wiggle + prep motion (TASK §2.8 "預備動作"), the hand, and later the customer's-hand place / take / slap. Prep motion = enemy-style telegraph the player reads. | H for P4, M now | None | now (as review checklist) |
| P08 | Test rough motion with the gameplay clock before expensive polish | blender-game-animation §Author; skullgirls 09:43 | Customer's-hand transition and pitcher motion: grey-box timing in the real game first, owner tries it on phone, then model/texture. | H | None | later (P4) — rule now |
| P09 | Timing explicit in seconds + normalized event fraction; resample, don't just change fps | blender-game-animation §Make game timing explicit; README clip contract | `Docs/PATTERN_GUIDE.md`: each pattern lists total duration (s) and events as fractions (wiggle start, pull-through, stop). Transitions list contact time (e.g. slap contact at 0.45). Changing duration rescales events proportionally. | M | None | later (P2 guide) |
| P10 | Responsiveness beats animation fidelity: never make input wait for an animation | quadruped §Sept 11 controller refinement | Prep motion, reveal zoom, customer's hand must never block restart ("無限重來，不用等"); every transition interruptible by tap. | H | None | now (principle) |
| P11 | Code owns position; animation only local motion; apply heading/offset exactly once | quadruped §Controller contract; wolf HANDOFF "apply heading exactly once" | Pattern data owns the spout point; any hand/pitcher mesh animation (wiggle, tilt) must not also move the pour origin, or the stream double-moves and the sweet-spot math disagrees with the visual. | M | None | now (principle) |
| P12 | Review at normal speed and before/after, not stills only | quadruped §Acceptance ("readability at normal speed", "before/after playback") | Reviewer also gets a short clip / time-strip of the pour (sim shots every 0.25 s → strip) and the previous version's sheet for before/after. | M | ffmpeg | now |
| P13 | Owner-editable "Set Pose": named joints, save pose reference, nothing overwrites manual edits | blender-game-animation §Make pose references editable; NEXT_BATCH §Sept 20 | Fix the crude hand with owner in the loop: dev page `?pose=hand` with sliders per finger/thumb/wrist (blocky segments), "copy pose JSON"; owner tunes on phone, agent commits the JSON. Same idea for pitcher grip. | H — owner approved this workflow before and the hand is a top complaint | ~1 session; no Blender | now / soon |
| P14 | Reject list per asset family | kaiju key rule 3 | `latte-review` hard-fails for rosetta: no central pull-through line, leaves not alternating/symmetric, white blob without brown separation lines, pattern off-centre, brown halo. Any hard-fail = score capped. | M | None | now |

### 3b. Asset pipeline (hand, customer's hand, skins, backgrounds)

| ID | Item | Source | Concrete use | Value | Prereq / cost | Rec |
|---|---|---|---|---|---|---|
| P15 | `fal_job.py` receipt-guarded queue (no duplicate billable job, `submission_unknown`, provider-error check, download to `assets/`, sha256 upload reuse) | fal scripts/fal_job.py | The only path for paid generation when MCP can't read local files (hand reference upload, skins). Already copied. | H | `pip install -r requirements.txt`, FAL_KEY, budget in TASK (CLAUDE §7) | later (first paid gen) |
| P16 | Free install check: `test_fal_job.py` + `submit --dry-run` | test_fal_job.py; WALKTHROUGH | Add both to `tools/check_env.py` so "fal ready" is proven without spending. | M | `pip install fal-client python-dotenv` (free) | now |
| P17 | MCP order: `recommend_model` → `get_model_schema` → `get_pricing` → `submit_job` → `check_job` → `get_job_result` | mcp-workflow.md | Standard sequence in a future `latte-assets` skill; pricing before any batch. | M | fal MCP + key | later |
| P18 | Budget cap, stop at 90 %, max 3 attempts per asset, ledger | kaiju key rule 1 | TASK gets a fal budget line; `tools/ledger.py` (TOOLS.md already lists it) records each job; max 3 attempts per asset then change approach. | H — CLAUDE §7 requires a cap before spending | ledger port from kit (another lane's files) | later (before first paid job) |
| P19 | Faithful edit prompt: "keep X, change only Y"; assign roles to references (pose from A, style from B) | prompting-and-review §Concepts; edit.json | Hand concept: pose from owner photo of a real hand holding a pitcher, style from `Docs/concepts/approved/style/`; skin variants as edits of the approved pitcher ("change only the colour/finish"). Black silhouettes stay procedural. | H for skins, M for hand | fal key + money | later |
| P20 | Neutral reference sheet: plain light bg, front/side/back, same size, even light, no shadows, no text | kaiju §1; prompting-and-review (flat light) | Reference sheet of the blocky hand / pitcher / glove for procedural modelling in three.js (D008) or image-to-3D. | M | fal or Figma `generate_image` | later (A1/A2) |
| P21 | Prove one asset end to end before parallel lanes | kaiju key rule 2 | Skins: prove one pitcher skin fully (concept → model → pixel texture → in game → black silhouette → unlock) before batching machines/pitchers/gloves. Same for A2 hand. | H | Time | later (A2, P5) — rule now |
| P22 | Never regenerate an accepted asset; per-asset `asset.json` (job ids, credits, faces, maps, recipe, verdict) | kaiju key rule 5, §10 | `assets/<id>/asset.json` for every generated or hand-built model; lanes check it before generating. | M | None | later |
| P23 | Import cleanup checklist: scale, pivot, forward axis, merge by distance, recalc normals, metallic 0, real PNG maps, downsample | kaiju §4; unity-editor-ops §Materials | glTF into three.js: force `metalness=0` (glTF default can look dark), pivot at wrist/handle, ≤ 1,000 faces (D008), nearest-filter pixel textures, no mipmaps for pixel look. | M | Blender for heavy cases | later (A2) |
| P24 | Background-Blender UV check with numeric pass thresholds | kaiju §3 | If an image-to-3D hand is used: check UVs before re-texturing as pixel art. | L | Blender install | later / likely skip (D008) |
| P25 | Rigid parts parented to the nearest bone (no skinning) | kaiju §6 | Blocky low-poly hands: each finger segment a rigid box parented to a joint (three.js `Group` hierarchy); cheap, matches D007 "no skeleton/skinning". Basis for P13 pose tool and customer's-hand animation. | M | None | now (design note) |
| P26 | Packed RGBA mask + animated spread dissolve | kaiju §7–8 ("_GlowSpread" noise dissolve) | Skin unlock: black silhouette → revealed with a noise dissolve driven by one uniform; R = tint mask for colour variants of one mesh. | M | Shader work only | later (P5) |
| P27 | Material generation route `fal-ai/patina/material` | mcp-workflow §Other verified routes; kaiju §8 | Optional tileable surfaces (counter wood, metal) downsampled to pixel textures; canvas-drawn remains default (D008). | L | fal key + money | later / probably skip |
| P28 | Delivery review checklist: full size, count, framing, identity, missing parts, unintended additions; one verdict per output; keep rejected takes with reasons | prompting-and-review §Delivery review | Asset variant of `latte-review` for generated concepts and models. | H | None | now (skill text) |

### 3c. Handoff, status and knowledge formats

| ID | Item | Source | Concrete use | Value | Prereq / cost | Rec |
|---|---|---|---|---|---|---|
| P29 | Handoff template: status banner (approved / verified / pending + who owns next step), "Start here", table (name, range, duration, loop), import/bind steps, "work the receiver must complete", values read-not-changed, verification numbers, reproduction command | wolf-turn90 HANDOFF; roster HANDOFF | Lanes delivering a hand model, a pattern, or a sound pack hand back with this shape in `Docs/lanes/<lane>.md`; main loop integrates. | H | None | now (template in latte-assets / lane contract) |
| P30 | Separate facts: source approval vs export verification vs engine integration; agent QA vs owner visual approval; "do not infer new approval" | blender-game-animation §Bake; quadruped §Acceptance; NEXT_BATCH | Extend our status words: add *exported/verified* (asset files OK) vs *integrated* (in game) besides *implemented / agent-verified / pending owner*. | M | None | now |
| P31 | Manifest + validation sidecars with sha256 | roster HANDOFF §Files, step 2 | `assets/<id>/manifest.json` (faces, textures, pivot, scale, version) + `validation.json`; pattern files could carry a sha in ACCEPTANCE evidence. | M | None | later |
| P32 | Copied-folder re-import check | blender-game-animation §Bake; README | Load an exported `.glb` from a copied folder in a clean three.js test page; GitHub Pages is case-sensitive and path-sensitive, so check texture paths resolve on Pages, not just locally. | M | None | later (A2) |
| P33 | Restart guide shape: dated banners, "read before next" list, "current editable sources" table, "start next batch without losing prior work" checklist | NEXT_BATCH.md | `Docs/patterns/README.md`: table of patterns (file, status, last Reviewer score, version) + checklist for adding a pattern; feeds the planned `latte-pattern` skill. | M | None | later (P2) |
| P34 | "Record findings that would change the next agent's decisions"; add a new case, don't overwrite evidence; workflow vs lessons kept separate | blender-game-animation §Deliver; README §Maintaining | `knowledge/latte-fluid-lessons.md` (e.g. "Gaussian push couldn't layer → 1/r", "layer id per injection", "conveyor for rosetta"), separate from DEVLOG narrative. | M | None | now |
| P35 | Read live values before claiming; values read are reported, not changed | wolf HANDOFF "Saved Wolf balance at handoff … not changed" | Reports quote current `TUNING` values read from `js/config.js` rather than memory; lanes state "values read, not changed". | L | None | now |

### 3d. Progress capture ("how the game was made" videos)

| ID | Item | Source | Concrete use | Value | Prereq / cost | Rec |
|---|---|---|---|---|---|---|
| P36 | Fixed "story cameras" per feature, never moved | progress-capture §Story cameras | Our cameras = fixed sim URLs: same pattern, seed, `?auto=1`, same `?replay=<id>`, same viewport size (phone portrait). Defined once in a `Docs/progress/CAMERAS.md`. Makes every capture comparable over months. | H — owner wants progress videos | None | now |
| P37 | Capture after each significant change + `log.jsonl` (time, feature, caption, file, commit) | progress-capture §capture rule | `tools/sim.sh` already writes shots to `Docs/progress/<date>/`; add `<UTC>__<caption>.jpg` naming and one `log.jsonl` line with the build version. | H | Small script change | now |
| P38 | Per-feature timelapse + storyboard; master timelapse | progress-capture §Compile | `ffmpeg` compile of `Docs/progress/<feature>/` → `_out/<feature>.mp4` + storyboard (contact sheet) at each milestone: "rosetta from blob to leaf". | H | ffmpeg (installed) | later (first milestone) |
| P39 | Gameplay recording at each milestone with the same route | progress-capture §Gameplay | Record the same `?replay=` run in headed browser (screen recording) + owner's phone screen recording at each phase exit. | M | Owner phone recording | later |
| P40 | Compression presets; never re-encode twice; no raw + optimized duplicates | progress-capture §Compression | JPEG q90 stills, x264 `-crf 20 -preset slow -pix_fmt yuv420p -movflags +faststart`. Keeps the public repo small. | M | ffmpeg | now (with P37) |
| P41 | Retention sweep | progress-capture §Retention | Delete raw fal downloads after integration (keep receipt + preview + one contact sheet); keep progress JPEGs and logs. | L | None | later |
| P42 | Desktop timelapse every 180 s | progress-capture §Always running | Mac equivalent would be `screencapture -x` on a timer. TOOLS.md §2 already declined it; ask owner only if he wants desktop footage in the story video. | L | Disk; privacy | skip (unless owner asks) |

### 3e. Small general ops lessons

| ID | Item | Source | Concrete use | Value | Prereq / cost | Rec |
|---|---|---|---|---|---|---|
| P43 | Wait in one call on a result file with a `summary` field; never poll in a loop | unity-editor-ops §Compiles | `tools/sim.sh` writes `Docs/progress/.../result.json` with `summary`; lanes read that once instead of scraping console. | M | Small change | later |
| P44 | Only one integrator mutates the live thing; lanes deliver files + a queue item | unity-editor-ops §Session start | Already our lane contract (main loop owns config/deploy). Confirms it. | — | — | already adopted |
| P45 | Capture UI at end of frame | unity-editor-ops §UI | WebGL screenshots must be taken in the same frame or with `preserveDrawingBuffer`; otherwise blank/stale captures in browse. | L | None | now (note in sim) |
| P46 | Commit before risky operations; kill processes by PID | unity-editor-ops §Recovery | Before big fluid refactors commit; stop `http.server 8765` by PID, not `pkill python`. | L | None | now |

### 3f. Which kit skills should become our project skills

| Kit skill | Decision | Our skill | What to carry over |
|---|---|---|---|
| fal-ai-generation | Keep as-is (already copied, identical) | `fal-ai-generation` | Add nothing inside the kit copy; put project rules (budget, output dir, ledger, `knowledge/` first) in `latte-assets`. Install deps + run tests (P16). |
| kaiju-creature-pipeline | Adapt (structure, not content) | `latte-assets` (already planned in TOOLS.md) | Key-rules-first header, budget/attempt caps (P18), prove one end to end (P21), never regenerate / asset.json (P22), reject list, import cleanup for three.js (P23), rigid-parts hierarchy (P25), per-step captures, handoff template (P29), unlock dissolve (P26). |
| blender-game-animation | Adapt a small subset; no rigging now | Section in `latte-pattern` + `latte-assets` (motion part) | Video reference evidence (P01), timing in seconds + fractions (P09), preserve approved / fingerprints (P04, P05), diagnose neighbours (P06), polish pass (P07), rough in game first (P08), owner Set Pose tool (P13), separate status facts (P30). |
| progress-capture | Adapt now | `latte-capture` (new, small) | P36–P41 with macOS + ffmpeg; no desktop timelapse, no disk watchdog. |
| unity-editor-ops | Skip as a skill | — | Fold P43, P45, P46 into `latte-loop`. |
| Overlord write-ups | Use as templates | `latte-review` (motion variant), `latte-pattern` | Skullgirls research method (P02) + polish checklist (P07); restart-guide shape (P33); handoff format (P29). |

### 3g. What our `latte-loop` and `latte-review` are missing

**latte-loop**
- No regression guard for approved patterns (P04 golden screenshot / fingerprint); only "截圖只確認沒壞".
- Expected result in §3 table still says "成功，四層鬱金香" although the default is rosetta (D011); should name the rosetta and the golden.
- No experiment-isolation rule (P05): tuning goes straight into the default pattern.
- No capture logging (P36–P37): shots land in a dated folder without caption, camera id or version → cannot build the progress video later.
- Report template lacks status words (implemented / agent-verified / pending owner) and "values read" (P30, P35).
- No "commit before risky refactor" / kill-by-PID ops notes (P46); no WebGL capture-timing note (P45).

**latte-review**
- Criteria are tulip-centric (「整體像不像鬱金香」「四層」) while the default is rosetta and the reference is `rosetta_owner_ref.jpg` → criteria must be rewritten per pattern (leaf count, alternating symmetry, central pull-through, brown separation lines, centring).
- No hard-fail reject list (P14).
- Stills only: no motion/readability review of the pour at normal speed, no time-strip, no anticipation/follow-through check (P07, P12).
- No before/after (previous version's sheet) comparison (P12).
- No asset-review variant for generated or hand-built models (P28): count, framing, identity, missing parts, unintended additions, one verdict per output, keep rejected takes.
- Does not check readability at actual phone size (Skullgirls/RTS "silhouette at actual size") — add one sheet downscaled to real on-screen pixel size.
- Does not record version/commit per score inside the review file (only DEVLOG).

## 4. Owner preferences and working habits recorded in these files

These are the Kaiju/Overlord owner's notes (the same owner as ours, per TOOLS.md "你的，從工具包複製").
- Wants processes captured as reusable knowledge: "requested that the process become reusable knowledge and a completely new animation skill" (README).
- Likes direct manual control: "The owner approved General's Set Pose workflow: directly editable named joints, independent prop adjustment, saved clip/frame pose references" (NEXT_BATCH); "No solver or playback timer may overwrite direct posing edits" (blender skill).
- Wants to inspect real materials himself: "The owner needs to inspect and tweak real materials; do not leave Workbench/Solid texture display" (blender skill).
- "Review directly in Blender; no automatic review-video gallery" (NEXT_BATCH); "Keep Blender open … Do not reopen or foreground it."
- Motion-reference preference: "Character-first selection with optional human remakes is his current preference"; "Approve the starting pose before video generation, then compare two Seedance 2.5 takes and one MiniMax H3 Max take"; standing decision "Seedance 2.5 Video Edit with the accepted character video as motion authority".
- Responsiveness matters: owner's review found "a Move from rest waited for one-second planted turns" → fixed so steps "must not gate travel" (quadruped).
- Sets standards by example and expects them reused: "explicitly requested the nine-clip composition as the baseline"; turns included "by default (the owner, 2026-09-17)".
- Commissions research to improve craft: Skullgirls talk "Studied on 2026-09-11 at the owner's request".
- Story of the build matters: "The owner tells the story of how the game was made; captures are part of the job" (progress-capture).
- Spending discipline: credit cap, "stop at 4,500", "Max 3 attempts"; "use existing task authorization without asking again for already-approved work"; "Stop at the requested result; additional attempts need a reason and available task budget" (fal).
- Honesty of status: "Never hide failed takes or call an unchecked batch approved"; "Do not infer new approval"; "agent-verified rather than separately owner-reviewed".
- Hard-won Unity lessons: "Each one cost hours" (unity-editor-ops) — he values encoded lessons to avoid repeat failures.
- Gameplay balance is protected from art work: "Preserve approved movement/combat balance"; values "were read from current assets and were not changed by this task".

## 5. Not applicable

- Unity editor ops (instances, compiles, Play Mode, URP, FBX import, Animator, NavMesh, LOD Groups) — we are a static WebGL site, no Unity.
- Rigging/skinning, IK, digitigrade legs, weights, baking to a runtime skeleton, FBX export — D007/D008: rigid low-poly parts, no skeleton; revisit only if a skinned hand is ever needed.
- Locomotion contracts (gait phase, stride, run-turn bank, foot-phase matching, 2x turn steps, root motion) — nothing walks in our game.
- Tripo P2 face-limit table, debris library, kitbash, master skeleton per stage, monster-family motion references, speed ∝ √scale — kaiju-specific.
- URP Shader Graph glow, bloom, HDR emission, point lights along a spine — no glow in a café cup scene (only the dissolve idea, P26, transfers).
- Hitstop, fighting-game smears/unequal exposure — no impact combat; at most a tiny accent on the "slap away" transition.
- Disk watchdog and 40/20/10 GB levels, NVENC live capture — small web project on a Mac; no long unattended runs.
- Desktop timelapse every 3 minutes — already declined in TOOLS.md §2 (keep unless owner asks).
- Overlord file paths, GUIDs, character tables, measured numbers (434 poses, 0.234375 frames) — evidence for another game.
- Higgsfield image edit (kaiju §1) — fal covers it (TOOLS.md §2).
