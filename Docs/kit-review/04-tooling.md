# Kit review 4: tooling (scripts, hooks, settings, installers)

Lane: kit-review-4-tooling · 2026-10-10 · read-only review. No code or config was changed.
Kit root: `scratchpad/kit/KaijuTamagotchi-build-kit` (Unity + Blender + Tripo/Higgsfield/fal, Windows/PowerShell, 30-hour unattended run).
Our project: static WebGL2 latte game on GitHub Pages, macOS, owner in the loop.

Verified on this Mac during the review: `python` does **not** exist (only `python3` 3.12.4, python.org build); Pillow 12.2, numpy 1.26, requests installed; `fal_client` **missing**; uv/uvx at `~/.local/bin`; ffmpeg at `/opt/homebrew/bin`; adb exists at `~/Library/Android/sdk/platform-tools/adb` but is **not on PATH**; no Blender; 95 GB free disk; Claude Code 2.1.295. `ImageFont.truetype("arial.ttf")` **fails** on macOS (no font-name lookup), so the kit's and our contact sheet fall back to the tiny bitmap font.

---

## 1. Files read

All files were read fully (every line).

| File | Lines | Status |
|---|---|---|
| scripts/check_env.py | 73 | read fully |
| scripts/contact_sheet.py | 61 | read fully |
| scripts/disk_watchdog.py | 46 | read fully |
| scripts/envfile.py | 30 | read fully |
| scripts/glow_mask.py | 108 | read fully |
| scripts/higgsfield.ps1 | 23 | read fully |
| scripts/ledger.py | 127 | read fully |
| scripts/stats.py | 70 | read fully |
| scripts/tripo_p2.py | 195 | read fully |
| scripts/wait_for.py | 87 | read fully |
| scripts/3d/center_glb_bottom.py | 84 | read fully |
| scripts/blender/uv_check.py | 145 | read fully |
| scripts/capture/make_timelapse.py | 153 | read fully |
| dot-claude/hooks/compaction_log.py | 47 | read fully |
| dot-claude/hooks/keep_working.py | 39 | read fully |
| dot-claude/hooks/lane_contract.py | 23 | read fully |
| dot-claude/hooks/reanchor.py | 132 | read fully |
| dot-claude/settings.json | 88 | read fully |
| host-tools/desktop_timelapse.ps1 | 36 | read fully |
| host-tools/make_desktop_timelapse.ps1 | 21 | read fully |
| host-tools/stop_desktop_timelapse.ps1 | 11 | read fully |
| install_kit.ps1 | 91 | read fully |
| mcp.json | 16 | read fully |
| env.example | 16 | read fully |
| requirements.txt | 4 | read fully |
| **Total** | **1,726** | |

Our side, read fully for comparison: `CLAUDE.md` (68), `Docs/TOOLS.md` (59), `tools/sim.sh` (21), `tools/stamp.sh` (25), `tools/check_env.py` (104), `tools/contact_sheet.py` (61), `.claude/settings.json` (38), `.claude/hooks/reanchor.py` (50), `js_check.py` (32), `lane_contract.py` (20), `.mcp.json.example` (14), `.gitignore` (5), skill heads of `latte-loop`, `latte-review`, `fal-ai-generation` (+ its `references/setup.md`, `scripts/requirements.txt`).

---

## 2. Per file

### Scripts

**check_env.py** — M0 smoke test, spends nothing. Loads `.env` via envfile; checks TRIPO_API_KEY / FAL_KEY present; Tripo balance (free GET); fal key validity via `GET api.fal.ai/v1/models/pricing` with `Authorization: Key …` (free); Higgsfield login through PowerShell; ffmpeg; Blender (`BLENDER_EXE`); disk >= 40 GB; `Docs/state/clock.json`. Output: one OK/FAIL line each, exit 1 if any FAIL. Platform: Windows hints (winget, powershell). Deps: requests.

**contact_sheet.py** — glob of images -> one JPEG grid, long edge <= 2,560 px, file-name captions, `--last N`, `--cols`. Deps: Pillow. Assumes 16:9 cells and Windows font names (arial/segoeui). **Byte-identical to our `tools/contact_sheet.py`** (ours still has the kit's docstring paths).

**disk_watchdog.py** — loop (default 60 s) writing `Docs/state/disk.json` and flag files `DISK_LOW/CRITICAL/STOP` at 40/20/10 GB; reanchor reads the flags. Stdlib only, cross-platform.

**envfile.py** — tiny `.env` loader into `os.environ` (no python-dotenv), never prints values; aliases `FALAI_KEY` / `MRMAK_MCP_FAL_AUTHORIZATION` -> `FAL_KEY`. Stdlib, cross-platform. Imported by check_env, stats, tripo_p2.

**glow_mask.py** — numpy/Pillow texture tool for the kaiju's lava glow: HSV hue mask from a Tripo base-colour map, pack into RGBA (glow/spread/wet/detail), dilate into UV gutters using a coverage bake, preview. Assumes Unity import settings (BC7, sRGB off). Deps: numpy, Pillow.

**higgsfield.ps1** — PowerShell wrapper that loads `HIGGSFIELD_*` vars from `.env` and runs the `higgsfield` npm CLI. Windows/PowerShell; paid service with OAuth login.

**ledger.py** — append-only spend ledger `Docs/state/ledger.jsonl` (add / verdict / status), per-provider caps and stop lines (tripo 5,000 cr, higgsfield 10,000 cr, fal 50 USD stop 45), regenerates `Docs/COSTS.md`, exit 3 when a stop line is reached. Stdlib only, cross-platform.

**stats.py** — writes `Docs/STATS.json`: run hours from clock.json, commit count, **C# file/line counts under `Assets/`**, Unity `_Generated/**/asset.json` verdicts, ledger totals, capture count, P0 acceptance from `Docs/state/ACCEPTANCE.json`, last rampage run. Unity-shaped; depends on ledger + envfile.

**tripo_p2.py** — direct Tripo v3 REST client: balance, multiview/image-to-model (model P2-20260801, texture v3.5), retexture, wait/download, dry-run. Writes receipts, `jobs.jsonl` and ledger rows; 429 retry. Deps: requests, TRIPO_API_KEY (paid). Output paths are Unity `Assets/_Generated/...`.

**wait_for.py** — block in ONE tool call until a file exists (optionally newer than now / has a JSON key), a glob matches, or a PID exits; exit 0 done, 2 timeout ("not a failure"). Stdlib; has a Windows PID branch plus POSIX `os.kill(pid,0)`, so it runs on macOS as is.

**3d/center_glb_bottom.py** — Blender bpy batch: re-origin every GLB/glTF in a folder to bbox bottom-centre, export GLB. Needs Blender (`--background --python`). Cross-platform once Blender exists.

**blender/uv_check.py** — Blender bpy: per mesh UV area, islands, overlap %, texel-density spread (p90/p10), pass/fail thresholds, optional UV-coverage PNG. Needs Blender. Cross-platform.

**capture/make_timelapse.py** — `Docs/progress/<feature>/<yyyymmdd-HHMMSS>__caption.jpg` -> captioned MP4 per feature (+ storyboard sheet) or one master video, via ffmpeg concat demuxer. Deps: Pillow, ffmpeg. Cross-platform except the font names (same macOS font fallback issue).

### Hooks and settings

**hooks/reanchor.py** — SessionStart pack (<= 9,500 chars): "do not re-read" rule, STALE_AT_COMPACT warning, disk flags, run clock vs milestones, STATE.md (4,200 chars), first 12 TODO items, running external jobs from `jobs.jsonl`, `DOCS_INDEX.md`, last 5 commits + dirty paths.

**hooks/compaction_log.py** — PreCompact: snapshot STATE.md to `Docs/state/history/` (keeps 20), log HEAD + STATE age, write `STALE_AT_COMPACT` if STATE > 30 min old. PostCompact: log tokens before/after. Never blocks.

**hooks/keep_working.py** — Stop hook: exit 2 ("do not stop", rewrite STATE if stale, continue with Next 1 / TODO / acceptance test) unless the owner interrupted, `.claude/ALLOW_STOP` exists or `session_window.json` "until" has passed. Built for unattended runs.

**hooks/lane_contract.py** — SubagentStart additionalContext: 6 rules (deliverable only, notes in `Docs/lanes/`, small tool output, **wait with one blocking call or Monitor, never repeated polling**, **log external jobs to jobs.jsonl**, 15-line reply incl. `QUEUE` and `COST`).

**settings.json** — env: `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP=1000`, `CLAUDE_CODE_AUTO_COMPACT_WINDOW=500000`, `MAX_MCP_OUTPUT_TOKENS=10000`, `DISABLE_AUTOUPDATER=1`; `promptCacheTtl: "1h"`; `autoMemoryEnabled: false`; hooks wired with **`python`** (does not exist on our Mac).

### Host tools and installers

**host-tools/desktop_timelapse.ps1 / make_ / stop_** — ffmpeg `gdigrab` desktop frame every 180 s as WebP with a PID file; make = concat to MP4; stop = kill PID. Windows only (`gdigrab`, `Start-Process`).

**install_kit.ps1** — copies the kit into a Unity project (CLAUDE.md + AGENTS.md, Docs, scripts, dot-claude -> .claude, mcp.json -> .mcp.json), creates `.env` from env.example, decodes a base64 Higgsfield login into `.secrets/`, fills `{{UNITY_MCP_SERVER_DIR}}` etc., appends Unity `.gitignore` lines. Windows/PowerShell, Unity.

**mcp.json** — `unity` (node bridge on port 7890) and `blender` (`{{BLENDER_MCP_COMMAND}}`, `BLENDER_PATH` env). No fal entry (kit's fal goes through the skill/`.env`).

**env.example** — TRIPO_API_KEY, FAL_KEY, HIGGSFIELD_* (incl. base64 credentials), BLENDER_EXE (Windows path), with per-provider caps in comments.

**requirements.txt** — requests, pillow, numpy, fal-client>=0.5.

---

## 3. Port assessment

Value: H = helps the daily loop now; M = helps a planned step (fal / 3D assets / progress video); L = little or none for a web game.

| ID | Item | What it gives the latte project (concrete) | Value | Port effort | Prerequisite | Recommendation |
|---|---|---|---|---|---|---|
| T01 | wait_for.py | One blocking call instead of polling: wait for `tools/sim.sh` screenshots, a background `python3 -m http.server`, a Blender/ffmpeg PID. **Add a `--url URL --contains TEXT` mode (via curl, CA-cert issue)** so "push -> wait until Pages serves `js/version.js` with the new VERSION" is one call (CLAUDE.md §3 requires this check every deploy). We have nothing like it. | H — every deploy waits ~60 s today with ad-hoc sleeps/curl | small edit (add `--url` mode) | none | **port now** |
| T02 | lane_contract.py (kit rules 4, 5, COST) | We already have a lane contract (ours adds latte rules: no config/pattern edits, no feel judgement). Ours lacks "wait with one blocking call, never repeated status calls" and, once paid jobs exist, "log external jobs" + `COST` line. | H (rule 4 now), M (rules 5/COST later) | small edit (2 sentences) | none / fal key for rule 5 | **port rule 4 now**, rule 5 + COST when fal is on |
| T03 | contact_sheet.py | We already have it (identical). What ours lacks: (a) macOS font — `arial.ttf` does not resolve, add `/System/Library/Fonts/Supplemental/Arial.ttf` / `Helvetica.ttc`; (b) 16:9 cells waste ~70 % of each cell on our 390x844 portrait screenshots (progress shots are 780x1688) — derive cell aspect from the first image or add `--aspect 9:19.5`; (c) docstring still says `scripts/` and kaiju paths. Reviewer lanes (latte-review) see bigger thumbnails for the same token cost. | H — used by every Reviewer lane | small edit | Pillow (installed) | **port fixes now** |
| T04 | ledger.py | Spend cap and receipts before the first paid fal call (CLAUDE.md §7: "write the budget cap before spending"; TOOLS.md row "tools/ledger.py — not done"). Edit CAPS to `fal` (+ optional `figma_ai` credits), keep `Docs/state/ledger.jsonl` + `Docs/COSTS.md`. | M now, H at first paid call | small edit (CAPS, drop higgsfield) | fal key + budget in TASK | **port when needed** (right before the first fal job) |
| T05 | envfile.py | Same `.env` loader for ledger/check_env/fal scripts; no python-dotenv needed. The fal skill's `fal_job.py` already reads `.env` itself. | M (only with T04/T06) | none | none | **port with T04** |
| T06 | check_env.py | We already have a better macOS version (node, gh, Pages-live diff, adb devices, browse, Blender app path, uvx, fal_client, .mcp.json, hooks, skills, reference photos). Ours lacks: (a) **free fal key validation** (pricing API; do it with curl because of the CA issue), (b) disk free line, (c) a non-zero exit for scripts. Skip Tripo/Higgsfield/clock checks. | M | small edit | fal key for (a) | **port (a)+(b) when the fal key arrives** |
| T07 | reanchor.py (kit) | We already have a simpler reanchor (STATE 3,500 chars, 10 TODO, 8 commits, dirty files; no matcher so it also runs on `/clear` — good). Kit extras worth taking: the explicit "CLAUDE.md is already in context, do not re-read …" line, the `STALE_AT_COMPACT` warning (pairs with T08), and the running-jobs section from `jobs.jsonl` once fal jobs exist. Skip clock/milestones, disk flags, DOCS_INDEX (we have none). | M | small edit | none (jobs part: fal) | **port the "do not re-read" line + stale warning now**; jobs section later |
| T08 | compaction_log.py | PreCompact snapshot of STATE.md + "STATE was N min old" flag picked up by reanchor -> after a compaction mid-tuning, the agent first rewrites STATE from git. Useful because CLAUDE.md §8 relies on STATE being fresh. PostCompact token log is nice-to-have. TOOLS.md §2 currently lists it as "deliberately not used". | M — cheap insurance in long tuning sessions | small edit (`python3`, keep 10 snapshots, gitignore `Docs/state/history/`) | none | **port when needed** (if a compaction ever loses state); low risk to port now |
| T09 | make_timelapse.py | Turns `Docs/progress/<date>/*.jpg` into a captioned MP4 + storyboard: a "how the latte game evolved" video for the owner/devlog. Our files are named `3d_auto_reveal.jpg` (no `yyyymmdd-HHMMSS__` prefix) so captions/ordering need a small change, plus the macOS font fix. Not needed for the core loop. | M (owner-facing), L (dev loop) | small edit (naming, font) | ffmpeg (installed), Pillow | **port when needed** (when the owner wants a progress video) |
| T10 | uv_check.py | QA for any generated/imported mesh before baking pixel textures (asset step A2 / `latte-assets` skill): UV area, overlaps, density spread, coverage PNG. Today all 3D is procedural (D008), so no UVs to check. | M later, L now | none (runs as is) | Blender | **port when needed** (with the first GLB asset) |
| T11 | center_glb_bottom.py | Re-origin GLBs to bottom-centre so a cup/pitcher/hand dropped into three.js sits on y=0 without manual offsets (glTF exporter converts Blender Z-up to +Y-up). | M later | none | Blender | **port when needed** (with T10) |
| T12 | requirements.txt | We have no project requirements file; Pillow/numpy are only system-installed and `fal_client` is missing. A `requirements.txt` (pillow, numpy, requests, `fal-client>=0.13.2,<1` to match our skill, python-dotenv) + a uv venv makes the Python tools reproducible. | M | small edit (versions) | uv (installed) | **port now** |
| T13 | env.example | We have `.env` gitignored but no example file. A 4-line `.env.example` (`FAL_KEY=`, optional `TRIPO_API_KEY=`, `BLENDER_EXE=/Applications/Blender.app/Contents/MacOS/Blender`, budget comment) tells the owner exactly what to fill. Drop all Higgsfield lines. | M | small edit | none | **port now** |
| T14 | mcp.json | We already have `.mcp.json.example` with fal (HTTP + `${FAL_KEY}`) and blender (`uvx blender-mcp`) — better than the kit's (no unity, no placeholder installer). `BLENDER_PATH` env is not used by `blender-mcp` (it talks to the Blender add-on socket, port 9876). | L | none | — | **skip** (ours is ahead) |
| T15 | .gitignore lines from install_kit | Ours (5 lines) lacks: `.venv/`, `.secrets/`, `Docs/state/history/` (if T08), `Docs/progress/_out/` and `*.mp4` (if T09), `*.blend1`, `.claude/settings.local.json`. | M | small edit | — | **port the relevant lines when the matching tool is ported** (`.venv/` now with T12) |
| T16 | disk_watchdog.py | Disk-level flags. We have 95 GB free and a few MB of screenshots per day; no recordings or Blender batches. | L | none | — | **skip** (a disk line in check_env, T06, is enough) |
| T17 | stats.py | Tool-sourced numbers file. Ours would need different inputs (JS lines, sim ratios, ACCEPTANCE.json at `Docs/` not `Docs/state/`, ledger). STATE.md "Health" already carries the numbers the owner reads. | L | rewrite | — | **skip** (revisit only if a STATS file is ever required) |
| T18 | tripo_p2.py | Direct Tripo P2 (cheaper per call, multiview). Our plan is image-to-3D through fal (fal hosts Tripo/Hunyuan), one key, one ledger. | L | small edit (paths) | TRIPO_API_KEY (paid) | **skip** unless the owner chooses a direct Tripo account |
| T19 | glow_mask.py | Kaiju lava-glow mask packing for Unity. No equivalent need (latte textures are procedural canvas pixel art). | L | — | — | **skip** |
| T20 | higgsfield.ps1 | Higgsfield CLI wrapper. TOOLS.md §2 already decided: not used (fal covers it). | L | rewrite for macOS (trivial zsh) | Higgsfield account (paid) | **skip** |
| T21 | host-tools desktop timelapse (3 files) | Owner "how it was made" desktop video. `gdigrab` is Windows only; macOS needs `ffmpeg -f avfoundation` or a `screencapture -x` loop + Screen Recording permission for the terminal. TOOLS.md §2: sim screenshots are our progress record. | L | rewrite for macOS | ffmpeg, owner grants Screen Recording | **skip** (port only if the owner asks for a desktop timelapse) |
| T22 | install_kit.ps1 | Windows/Unity installer with placeholder fill and Higgsfield credential decode. Our copy is done by hand already. | L | not portable (and not needed) | — | **skip** |
| T23 | keep_working.py (Stop hook) | Forces the agent to continue. Directly conflicts with our loop: latte-loop ends at "deploy, report version, wait for the owner's phone data". | L (harmful) | — | — | **skip** (already decided in TOOLS.md §2) |
| T24 | settings.json keys | See section 4. | mixed | small edit | — | `promptCacheTtl` 1h + `MAX_MCP_OUTPUT_TOKENS` yes; others no |

---

## 4. Settings and hooks

Note: the kit hooks call `python`; on this Mac only `python3` exists. Every ported hook command must use `python3` (ours already do). Keep hooks stdlib-only so they never depend on the venv.

| Kit setting | What it does | Our in-the-loop workflow | Recommend |
|---|---|---|---|
| `CLAUDE_CODE_AUTO_COMPACT_WINDOW=500000` | Compacts relative to a 500k window, i.e. lets context grow to ~500k before auto-compact (meant for a 1M-context model on a 30 h run). | Our sessions are short iterations re-anchored by STATE.md. A bigger live context makes every turn slower and costlier and only delays compaction. | **No** |
| `promptCacheTtl: "1h"` | Prompt cache lives 1 h instead of 5 min. | Our loop has long idle gaps: deploy -> owner plays 5-10 cups on the phone -> pastes data back, usually > 5 min. With 5-min TTL each reply after a phone test re-pays the whole prefix. 1 h cache writes cost more per write but one cache hit after a pause pays for it. Verify the key is honoured by Claude Code 2.1.295 (`/config` or the claude-code-guide) before relying on it. | **Yes** (highest-value setting) |
| `MAX_MCP_OUTPUT_TOKENS=10000` | Caps any single MCP tool result (default is larger). | Protects context from Figma `get_design_context`/`get_metadata`, fal model schemas and Blender scene dumps. 10k is enough for a fal `get_model_schema`; raise per session if a result is cut. | **Yes** |
| `autoMemoryEnabled: false` | Turns off Claude's automatic memory files. | Our single source of truth is `Docs/state/STATE.md`, `DECISIONS.md` and CLAUDE.md; auto memory can carry stale tuning conclusions across sessions ("feel is OK") that contradict CLAUDE.md §4. Project-level setting, so it does not touch `~/.claude` (CLAUDE.md §7). Owner may prefer to keep it; gstack `/learn` is separate and unaffected. | **Yes** (owner's call; low risk) |
| `DISABLE_AUTOUPDATER=1` | Freezes the Claude Code version. | Protects a 30 h unattended run from a mid-run update. We are attended and benefit from fixes; the owner can pin globally if an update ever breaks hooks. | **No** |
| `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP=1000` | Lets a Stop hook block up to 1,000 times. Only meaningful with keep_working.py (unverified env name; kit-specific). | We have no Stop hook and should not add one. | **No** |

| Hook | Recommend | Reason |
|---|---|---|
| reanchor.py (SessionStart) | **Keep ours; add 2 kit pieces** (T07) | Ours already covers STATE/TODO/git and runs on clear too. Add the "already in context, do not re-read" line and the STALE_AT_COMPACT warning; add running fal jobs once T04/T05 exist. Skip clock, milestones, disk flags, DOCS_INDEX. |
| compaction_log.py (PreCompact/PostCompact) | **Yes, small** (T08) | Cheap, never blocks, and makes a stale STATE.md visible right after compaction — the moment we are most likely to lose the current tuning step. Gitignore the history folder. |
| keep_working.py (Stop) | **No** (T23) | The owner ends each iteration; a "do not stop" hook would make the agent keep tuning without phone data, against CLAUDE.md §2/§4. |
| lane_contract.py (SubagentStart) | **Keep ours; add kit rule 4 now** (T02) | Rule "wait with one blocking call (wait_for.py) or a background Monitor, never repeated status calls" saves context in sim and review lanes. Add job logging + COST once paid jobs exist. |
| js_check.py (ours, PostToolUse) | Keep | Not in the kit; it is our best hook (catches silent module syntax errors). |

---

## 5. Environment setup checklist for our Mac

Legend: **free/paid** · **owner** = needs the owner (account, GUI click, money, change outside the project) · **agent** = the agent can run it inside the project.

| # | Step | Commands | Cost | Who |
|---|---|---|---|---|
| E1 | Project Python venv with uv (uv already installed) | `cd "/Users/hsiangyutsai/Documents/Visual Studio/Barista"`<br>`uv venv .venv --python 3.12`<br>`echo ".venv/" >> .gitignore` | free | agent |
| E2 | Python packages (requirements.txt from T12) | `uv pip install --python .venv/bin/python pillow numpy requests "fal-client>=0.13.2,<1" "python-dotenv>=1,<2"`<br>(then `uv pip freeze --python .venv/bin/python > requirements.txt`)<br>Run tools with `.venv/bin/python tools/…`; hooks stay on system `python3` (stdlib only). | free | agent |
| E3 | HTTPS certs for python.org Python (only if a script must use `urllib`; requests/fal-client bundle certifi) | `open "/Applications/Python 3.12/Install Certificates.command"` — or keep the project rule "use curl for https". | free | owner (changes the system Python) — optional |
| E4 | ffmpeg (timelapse T09, any video) | already installed: `ffmpeg -version \| head -1` (else `brew install ffmpeg`) | free | done |
| E5 | adb on PATH (Pixel 9a screenshots, logcat, Chrome remote debug) | `echo 'export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"' >> ~/.zshrc && source ~/.zshrc`<br>`adb devices` (after enabling USB debugging on the Pixel and accepting the RSA prompt) | free | owner (edits `~/.zshrc`; phone settings + cable) |
| E6 | Blender (T10, T11, asset step A2) | `brew install --cask blender`<br>Headless check: `/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python-expr "import bpy; print(bpy.app.version_string)"`<br>Add `BLENDER_EXE=/Applications/Blender.app/Contents/MacOS/Blender` to `.env`. | free (~1 GB download) | owner (approve install) |
| E7 | Blender MCP add-on (for interactive Blender MCP; not needed for headless scripts) | `curl -L -o ~/Downloads/blender_mcp_addon.py https://raw.githubusercontent.com/ahujasid/blender-mcp/main/addon.py`<br>Blender › Edit › Preferences › Add-ons › Install from Disk › enable "Blender MCP"; 3D view › N sidebar › BlenderMCP › "Connect to MCP server" (port 9876). | free | owner (GUI clicks; Blender must be open) |
| E8 | Blender MCP server via uvx | `uvx blender-mcp --help` (pre-fetches the package)<br>`cp .mcp.json.example .mcp.json` (gitignored; remove the `fal` block until E9 is done)<br>Start Claude Code, approve the project MCP server, check `/mcp` shows `blender` connected. | free | agent (copy) + owner (approve server prompt) |
| E9 | fal key in gitignored `.env` | Owner: create a key at https://fal.ai/dashboard/keys (inference scope) and add prepaid credits.<br>`printf 'FAL_KEY=%s\n' '<key>' >> .env` (`.env` is already in `.gitignore`)<br>Free validity check: `set -a; source .env; set +a; curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Key $FAL_KEY" "https://api.fal.ai/v1/models/pricing?endpoint_id=fal-ai/flux/schnell"` -> 200<br>Before any paid call: write the budget cap in `Docs/TASK.md` (CLAUDE.md §7) and port ledger.py (T04). | **paid** (credits); check is free | owner (account, money, budget) |
| E10 | fal MCP config | `.mcp.json` fal block (from our example): `"type": "http", "url": "https://mcp.fal.ai/mcp", "headers": {"Authorization": "Bearer ${FAL_KEY}"}`.<br>Claude Code expands `${FAL_KEY}` from **the shell that launches claude**, not from `.env`, so start sessions with: `set -a; source .env; set +a; claude`.<br>Verify in session: `/mcp` shows `fal`; listing tools / `get_model_schema` is free. | free to connect; generations paid | owner (launch habit / approve server) |
| E11 | Tripo direct key (only if T18 is ever wanted) | `printf 'TRIPO_API_KEY=%s\n' '<key>' >> .env`; free check: `curl -s -H "Authorization: Bearer $TRIPO_API_KEY" https://openapi.tripo3d.ai/v3/account/balance` | paid | owner — not recommended (use fal) |
| E12 | Final check | `python3 tools/check_env.py` (after T06 also validates the fal key and disk) | free | agent |

Not needed on our Mac (kit-only): Unity + Unity MCP node bridge, PowerShell, Higgsfield CLI (`npm i -g @higgsfield/cli`) and its OAuth credentials, winget, `gdigrab` desktop capture.
