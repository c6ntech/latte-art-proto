#!/usr/bin/env python3
"""PreCompact + PostCompact hook (ported from the Kaiju kit): log every compaction, snapshot STATE.md,
and flag a stale STATE.md so the SessionStart re-anchor hook warns before any new work. Never blocks."""
import json
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    ev = json.load(sys.stdin)
except Exception:  # noqa: BLE001
    ev = {}
root = Path(os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd()))
sd = root / "Docs" / "state"
sd.mkdir(parents=True, exist_ok=True)
now = datetime.now(timezone.utc)
rec = {"utc": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "event": ev.get("hook_event_name"), "trigger": ev.get("trigger")}
if ev.get("hook_event_name") == "PostCompact":
    rec.update(ev.get("compaction_info") or {})
else:
    st = sd / "STATE.md"
    age = int((now.timestamp() - st.stat().st_mtime) // 60) if st.exists() else None
    rec["state_age_min"] = age
    try:
        rec["head"] = subprocess.run(["git", "rev-parse", "--short", "HEAD"], cwd=root, capture_output=True, text=True, timeout=5).stdout.strip()
    except Exception:  # noqa: BLE001
        pass
    if st.exists():
        hist = sd / "history"
        hist.mkdir(exist_ok=True)
        shutil.copy2(st, hist / f"STATE_{now:%Y%m%d-%H%M%S}.md")
        for old in sorted(hist.glob("STATE_*.md"))[:-10]:
            old.unlink()
    if age is None or age > 30:
        (sd / "STALE_AT_COMPACT").write_text(
            f"STATE.md was {age} min old when the context was compacted at {rec['utc']} (HEAD {rec.get('head', '?')}). "
            "Before new work, bring STATE.md up to date from `git log --oneline` and `git status`.", encoding="utf-8")
with open(sd / "compactions.jsonl", "a", encoding="utf-8") as f:
    f.write(json.dumps(rec) + "\n")
sys.exit(0)
