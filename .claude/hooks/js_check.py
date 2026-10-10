#!/usr/bin/env python3
"""PostToolUse hook (Edit | Write | MultiEdit): syntax-check every edited .js file.

A module with a syntax error does not throw visibly in the game; the page just sits on the
first screen. This catches it right after the edit. Exit 2 sends stderr back to Claude.
"""
import json
import shutil
import subprocess
import sys

try:
    ev = json.load(sys.stdin)
except Exception:  # noqa: BLE001
    sys.exit(0)

path = (ev.get("tool_input") or {}).get("file_path") or ""
if not path.endswith(".js"):
    sys.exit(0)

node = shutil.which("node") or "/opt/homebrew/bin/node"
try:
    r = subprocess.run([node, "--check", path], capture_output=True, text=True, timeout=20)
except Exception as e:  # noqa: BLE001
    sys.stderr.write(f"js_check hook could not run node: {e}")
    sys.exit(0)

if r.returncode != 0:
    msg = (r.stderr or r.stdout).strip()[-1500:]
    sys.stderr.write(f"node --check failed for {path}:\n{msg}\nFix the syntax before doing anything else.")
    sys.exit(2)
sys.exit(0)
