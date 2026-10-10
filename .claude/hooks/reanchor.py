#!/usr/bin/env python3
"""SessionStart hook (startup / resume / clear / compact).

Prints one small re-anchor pack into the context: STATE.md, the first open TODO items,
recent commits and uncommitted files. Keeps new sessions from re-reading every doc.
"""
import os
import subprocess
from pathlib import Path

ROOT = Path(os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd()))


def read(rel, limit):
    p = ROOT / rel
    if not p.exists():
        return f"({rel} does not exist)"
    t = p.read_text(encoding="utf-8", errors="replace").strip()
    return t if len(t) <= limit else t[:limit] + f"\n[truncated: shorten {rel}]"


def git(*args):
    try:
        return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, timeout=8).stdout.strip()
    except Exception as e:  # noqa: BLE001
        return f"(git failed: {e})"


todo = [l for l in read("Docs/TODO.md", 40000).splitlines() if l.startswith("- [ ]")]
head = "\n".join(l[:180] for l in todo[:10]) or "(no open items)"
if len(todo) > 10:
    head += f"\n(+{len(todo) - 10} more)"

pack = "\n".join([
    "# Re-anchor (project hook)",
    "Follow CLAUDE.md section 1: continue from STATE 'Next 1'. Do not re-read Docs/TASK.md in full.",
    "",
    "## Docs/state/STATE.md",
    read("Docs/state/STATE.md", 3500),
    "",
    "## Docs/TODO.md (first open items)",
    head,
    "",
    "## git log",
    git("log", "--oneline", "-8"),
    "",
    "## uncommitted",
    (git("status", "--short")[:900] or "(clean)"),
])
print(pack[:9000])
