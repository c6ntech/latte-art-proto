#!/usr/bin/env python3
"""SubagentStart hook: give every helper agent the same short lane contract."""
import json
import sys

try:
    json.load(sys.stdin)
except Exception:  # noqa: BLE001
    pass

contract = (
    "LANE CONTRACT (latte project hook). "
    "1) Do only the deliverable in your task message: lane id, inputs, output path, check, out of scope. "
    "2) Never change js/config.js, js/patterns/* or deploy unless the task says so; the main loop owns tuning and deploys. "
    "3) Put long notes in Docs/reviews/ or Docs/lanes/<lane-id>.md; never paste logs, file bodies or images into your reply. "
    "4) Open images only downscaled or as one contact sheet (python3 tools/contact_sheet.py). "
    "5) Do not judge game feel or difficulty; only the owner's phone can. Visual scores compare against Docs/concepts/approved/. "
    "6) Final reply at most 15 lines: RESULT done|partial|failed; OUTPUT paths; EVIDENCE; NOTES max 3 bullets."
)
print(json.dumps({"hookSpecificOutput": {"hookEventName": "SubagentStart", "additionalContext": contract}}))
