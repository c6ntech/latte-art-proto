# Image Generation Lessons

Practical lessons learned from generating reference images via fal.ai (Banana).

These are dated observations, not one universal current model policy. Start
with `processes/3d-ai/tools.md` and the relevant task skill. September thumbnail
and supplementary-sheet updates coexist with the earlier concept rotation;
neither changes a user's selected provider or model for active work.

## API specifics

### Nano Banana 2 (default model)
- **Generate:** `fal-ai/nano-banana-2` — uses `aspect_ratio` parameter (e.g., "1:1")
- **Edit:** `fal-ai/nano-banana-2/edit` — requires `image_urls` (plural, ARRAY), not `image_url` singular. This is a common mistake.
- **Pro version:** `fal-ai/nano-banana-pro` — better realism and typography

### Nano Banana Pro Edit (for fan-art / IP-faithful edits)
- **Endpoint:** `fal-ai/nano-banana-pro/edit`
- Extra params that make a big difference:
  - `safety_tolerance: "6"` — string, maximum permissiveness (default lower settings block fan-art of known IP)
  - `enable_web_search: true` — model looks up canonical visual refs for known characters/objects, dramatically improves fidelity for established IP
  - `resolution: "2K"` — higher detail, matters for 3D-model extraction workflows
- For personal fanfic / non-commercial fan-art of protected IP, just name it directly in the prompt: `"Personal fan-art of <character> from <work> (<year>) by <creator>, for private non-commercial fan-art, recreate faithfully..."` — with `safety_tolerance: "6"` this goes through
- `generate.py` auto-applies these params when `"nano-banana-pro"` is in the model id

### Prompt-side content checker (2026-07-18, texture generation)
- `fal-ai/nano-banana-pro` rejects some prompts with `422 content_policy_violation` **before generation** — `safety_tolerance: "6"` does NOT bypass it.
- Brand names are the usual trigger: `"Chevy V8 valve cover"` and even `"classic American V8"` got flagged; a fully generic rephrase (`"orange crinkle enamel paint surface, hammered metal finish"`) passed instantly.
- Fix: strip brand/IP words from texture/material prompts, keep them purely descriptive.

### Background removal
- **Correct endpoint:** `fal-ai/imageutils/rembg`
- Tried `bria/background/remove` and `fal-ai/bria-rmbg` — both 404

### File upload for edits
- Use `fal_client.upload_file(path)` to get a remote URL
- Then pass that URL in `image_urls` array to the edit endpoint

## Generation workflow

### Model rotation — Nano Banana Pro + Grok Imagine 2 + Seedream 5 (updated 2026-08-20, supersedes the 2026-06-01 dual-model rule)
- The owner's standing combo for concept exploration is now: **`nano-banana-pro` + `grok-imagine-2` + `seedream-v5-pro`**, same prompt, side-by-side per concept in the review report.
- **Grok Imagine 2** (`xai/grok-imagine-image/v2.0/text-to-image` on fal, wired as `grok-imagine-2` in `generate.py`) is the newest addition — the owner rates it above GPT-Image-2 and it can occasionally REPLACE Nano Banana Pro as the lead model.
- **GPT-Image-2 is demoted** from the default combo (keep it available for its bold stylized takes when explicitly useful).
- **Always ask the owner which models to run** for a new generation batch — remind him of the current rotation and let him pick; don't silently assume.
- Run `generate.py` once per model with different `--run-id`s, then present side-by-side.

### Grok Imagine 2 API specifics (2026-08-20)
- **Text-to-image:** `xai/grok-imagine-image/v2.0/text-to-image` — takes `aspect_ratio` (2:1, 20:9, 16:9, 4:3, 3:2, 1:1, 2:3, 3:4, 9:16 ...) and `resolution` ("1k"/"2k").
- **Edit:** `xai/grok-imagine-image/v2.0/edit`.
- Gotcha: plain `xai/grok-imagine-image/v2.0` does NOT exist as a t2i path — API returns "Path /v2.0 not found"; the `/text-to-image` suffix is required. The un-suffixed `xai/grok-imagine-image` is the OLD v1 model.

### Always parallel
- Use `ThreadPoolExecutor` with 5+ workers
- Sequential generation is unacceptably slow (21 images: ~10min sequential vs ~30sec parallel)
- `generate.py` has `--workers` flag, default 5

### Always save remote URLs
- Save remote URLs in `results.json` even when `--skip-existing`
- URLs are needed for edit workflows — lost them once, had to re-upload everything

## Prompt defaults for 3D reference images

### Background
- **Default: solid medium gray** (`solid uniform medium gray background`)
- Not white (too bright), not dark (hides silhouette), not patterned
- White only when explicitly requested

### A-pose vs variant A
- **A-pose** = standard 3D rigging pose: arms 30° from body, facing camera, legs apart, palms down
- **Variant A** = first prompt variation in A/B/C set
- These are completely different things — never confuse them

### Style anchoring
- Always include: `stylized 3D Unreal Engine 5 render, non-photoreal, not cartoon`
- Color: state 60/30/10 ratio explicitly with specific materials
- Silhouette: `clean shape language, readable silhouette`

## Style keywords vs reference fidelity — inverse relationship

When working with reference images, there is a sharp tradeoff between style direction and reference faithfulness:

- **Heavy style keywords** (Arcane, Guilty Gear Strive, BioShock Infinite, Spider-Verse) **dominate** generation and override reference fidelity. The model averages toward the style, losing identity from the reference.
- **For faithful recreation** (matching an IP character/object, recreating an exact design): strip ALL style keywords, lead with `"recreate the exact X, do not redesign, preserve every detail"`, describe only the design features that must be preserved, minimize stylistic direction.
- **For exploration** (v1 — seeding variety across 5 different vibes): style keywords are valuable levers. Use them to differentiate variants.

**Concrete example from the Akira project:**
- v3 with `"cel-shaded anime 3D in the style of Arcane Netflix and Guilty Gear Strive"` → generic anime, character unrecognizable, bike completely off-model.
- v4 with identical reference but stripped prompts (`"recreate the exact bike from the reference, do not redesign"`) → canonical Kaneda and his bike with proper CAPSULE/A.F.M. decals and yellow-red color block.

**Rule of thumb:** decide first whether this generation is **exploration** or **recreation**. Write the prompt for that mode, not both.

## Reports

### Style
- All HTML reports use shared style: `scripts/shared/report_style.py`
- **Dark report theme:** black background (#0a0a0c), pink accents (#f0a0b0), Inter font
- Cards: #18181b with #2a2a2e borders, 8px radius
- KPI cards, bar charts, status badges, image variant grids — all covered
- Reports are viewed inside the React dashboard (iframe), so they must look good embedded

### Variant grid UX for image-gen reports
- Use `grid-template-columns: 1fr` (NOT `repeat(3, 1fr)`) — each variant gets the full width of the card so you can actually SEE the image at useful size. Small thumbnails are useless for reviewing generations.
- Wrap every `<img>` in `<a href="..." target="_blank" rel="noopener">` with `cursor: zoom-in` — click opens full-resolution in a new tab for inspection.
- Applied in `scripts/image-gen/generate.py::build_html()`.

### Iteration tabs in the React dashboard
- Keep complete step names visible and wrap onto additional rows. The former abbreviated-tab rule was superseded by the September Workspace usability update.
- Follow `processes/workspace-authoring.md`; a hover title does not replace a readable, clickable tab.

### Workspace
- All work outputs go to `workspace/` — NOT scripts/
- Each entity gets a folder: `workspace/YYYY-MM-DD_slug/`
- State tracked in `workspace/workspace.json`
- Dashboard: `npm run dev` → Vite + React at localhost:3009
