#!/bin/bash
# Fixed-point capture of one pour (KIT_ADOPTION Q3, Q5). Grabs the 72 px latte surface at 25/50/75/100% of the
# pour, a reveal screenshot, measures the final surface against the pattern target, writes checks.json.
#   tools/shot.sh <tag> [query]          e.g. tools/shot.sh after auto=1 ; tools/shot.sh before "auto=1&guide=0"
# Output: Docs/runs/<yyyymmdd-HHMMSS>_<tag>/{latte_25..100.png, strip.png, reveal.jpg, metrics.json, checks.json}
# Needs: python3 -m http.server 8765 in the project root; headed gstack browser (browse connect --force-restart).
set -uo pipefail
cd "$(dirname "$0")/.."
B="$HOME/.claude/skills/gstack/browse/dist/browse"; PY=.venv/bin/python
TAG=${1:?tag}; Q=${2:-auto=1}
RUN="Docs/runs/$(date +%Y%m%d-%H%M%S)_$TAG"; mkdir -p "$RUN"
js(){ $B js "$1" 2>/dev/null | tail -1; }
$B cdp Emulation.setDeviceMetricsOverride '{"width":390,"height":844,"deviceScaleFactor":3,"mobile":true}' >/dev/null 2>&1
$B goto "http://localhost:8765/?$Q&shot=1&r=$RANDOM" >/dev/null 2>&1
sleep 1.2
js "document.getElementById('btn-enable').click(); 1" >/dev/null; sleep 0.4
js "document.getElementById('btn-calib').click(); 1" >/dev/null; sleep 0.3
js "const b=document.getElementById('btn-steam'); b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); setTimeout(()=>b.dispatchEvent(new PointerEvent('pointerup',{bubbles:true})),300); 1" >/dev/null
sleep 1.2
js "document.getElementById('btn-start').click(); 1" >/dev/null
for P in 25 50 75 100; do
  for i in $(seq 1 400); do
    v=$(js "window.__latte.progress")
    [ "$(echo "${v:-0} >= $P/100" | bc -l)" = 1 ] && break
    sleep 0.05
  done
  js "window.__latte.grab(); 1" >/dev/null; sleep 0.15
  js "window.__latte.grabbed" | $PY -c "import sys,base64; d=sys.stdin.read().strip(); open('$RUN/latte_$P.png','wb').write(base64.b64decode(d.split(',',1)[1]))" 2>/dev/null
done
sleep 1.6
$B screenshot "$RUN/reveal.png" >/dev/null 2>&1
RES=$(js "document.getElementById('reveal-ratio').textContent + ' | ' + document.getElementById('reveal-title').textContent")
VER=$(js "document.getElementById('build').textContent")
TARGET=$(js "window.__latte.targetPath || ''")
[ -z "$TARGET" ] && TARGET=assets/patterns/rosetta_target.png
$PY tools/latte_metrics.py "$RUN/latte_100.png" --target "$TARGET" --json "$RUN/metrics.json" > "$RUN/metrics.txt"
$PY - "$RUN" "$TAG" "$Q" "$VER" "$RES" <<'EOF'
import json, sys
from PIL import Image
run, tag, q, ver, res = sys.argv[1:6]
tiles = [Image.open(f"{run}/latte_{p}.png").convert("RGB").resize((216, 216), Image.NEAREST) for p in (25, 50, 75, 100)]
strip = Image.new("RGB", (216 * 4 + 30, 216), (20, 16, 12))
for i, t in enumerate(tiles): strip.paste(t, (i * 226, 0))
strip.save(f"{run}/strip.png")
im = Image.open(f"{run}/reveal.png").convert("RGB"); im.thumbnail((780, 1688)); im.save(f"{run}/reveal.jpg", quality=88)
import os; os.remove(f"{run}/reveal.png")
m = json.load(open(f"{run}/metrics.json"))
summary = f"{tag}: {res} · " + open(f"{run}/metrics.txt").read().strip()
json.dump({"tag": tag, "query": q, "version": ver, "result": res, "metrics": m["metrics"], "target": m.get("target"), "summary": summary},
          open(f"{run}/checks.json", "w"), ensure_ascii=False, indent=1)
print(summary)
EOF
echo "$RUN"
