#!/usr/bin/env python3
"""Free smoke test of every tool this project uses. Spends nothing, never prints key values.

    python3 tools/check_env.py

One line per tool: OK / MISSING / WARN, then what to do. Exit 0 always (it is a report).
"""
import json
import os
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOME = Path.home()
lines = []


def row(status, name, note=""):
    lines.append(f"{status:<8}{name:<22}{note}")


def run(cmd, timeout=10):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return r.returncode, (r.stdout + r.stderr).strip()
    except Exception as e:  # noqa: BLE001
        return 1, str(e)


def env_has(name):
    if os.environ.get(name):
        return "env"
    envf = ROOT / ".env"
    if envf.exists() and any(l.split("=", 1)[0].strip() == name and l.split("=", 1)[1].strip()
                             for l in envf.read_text().splitlines() if "=" in l and not l.startswith("#")):
        return ".env"
    return None


# core
row("OK" if shutil.which("node") else "MISSING", "node", run(["node", "-v"])[1] if shutil.which("node") else "brew install node")
code, out = run(["gh", "auth", "status"])
row("OK" if code == 0 else "MISSING", "gh auth", "logged in" if code == 0 else "gh auth login")
row("OK" if shutil.which("ffmpeg") else "WARN", "ffmpeg", "" if shutil.which("ffmpeg") else "brew install ffmpeg (timelapses only)")
browse = HOME / ".claude/skills/gstack/browse/dist/browse"
row("OK" if browse.exists() else "MISSING", "gstack browse", "use headed: browse connect --force-restart" if browse.exists() else "/gstack-upgrade")
try:
    import PIL  # noqa: F401
    row("OK", "python Pillow", "tools/contact_sheet.py")
except Exception:  # noqa: BLE001
    row("MISSING", "python Pillow", "pip3 install pillow")

# live site
# curl, not urllib: the python.org build on this Mac ships without CA certificates
try:
    remote = subprocess.run(["curl", "-sf", "https://c6ntech.github.io/latte-art-proto/js/config.js"],
                            capture_output=True, timeout=15).stdout
    local = (ROOT / "js/config.js").read_bytes()
    if not remote:
        row("WARN", "Pages live", "unreachable")
    else:
        row("OK" if remote == local else "WARN", "Pages live",
            "matches local config.js" if remote == local else "live differs from local (unpushed or deploying)")
except Exception as e:  # noqa: BLE001
    row("WARN", "Pages live", f"check failed: {e}")

# devices
adb = shutil.which("adb") or str(HOME / "Library/Android/sdk/platform-tools/adb")
if Path(adb).exists():
    code, out = run([adb, "devices"])
    devs = [l for l in out.splitlines()[1:] if l.strip().endswith("device")]
    row("OK" if devs else "WARN", "adb (Pixel 9a)", f"{len(devs)} device(s)" if devs else "plug in Pixel, enable USB debugging")
else:
    row("MISSING", "adb", "Android Studio > SDK Manager > Platform-Tools")

# 3D / art pipeline
blender = shutil.which("blender") or ("/Applications/Blender.app/Contents/MacOS/Blender" if Path("/Applications/Blender.app").exists() else None)
row("OK" if blender else "MISSING", "Blender", "" if blender else "brew install --cask blender (needed for asset step A2)")
row("OK" if shutil.which("uvx") else "MISSING", "uvx (Blender MCP)", "" if shutil.which("uvx") else "curl -LsSf https://astral.sh/uv/install.sh | sh")
for key, why in (("FAL_KEY", "image, image-to-3D, Patina materials, SFX"), ("TRIPO_API_KEY", "optional, direct Tripo")):
    where = env_has(key)
    row("OK" if where else ("MISSING" if key == "FAL_KEY" else "WARN"), key, f"found in {where}" if where else why)
try:
    import fal_client  # noqa: F401
    row("OK", "python fal_client", "")
except Exception:  # noqa: BLE001
    row("MISSING", "python fal_client", "pip3 install -r .claude/skills/fal-ai-generation/scripts/requirements.txt")

# claude config
mcp = ROOT / ".mcp.json"
if mcp.exists():
    names = list((json.loads(mcp.read_text()).get("mcpServers") or {}).keys())
    row("OK", ".mcp.json", ", ".join(names) or "(empty)")
else:
    row("WARN", ".mcp.json", "none yet; copy .mcp.json.example once keys and Blender exist")
hooks = ROOT / ".claude/settings.json"
row("OK" if hooks.exists() else "MISSING", "project hooks", ", ".join((json.loads(hooks.read_text()).get("hooks") or {}).keys()) if hooks.exists() else "")
skills = sorted(p.parent.name for p in (ROOT / ".claude/skills").glob("*/SKILL.md"))
row("OK" if skills else "MISSING", "project skills", ", ".join(skills))
approved = [p for p in (ROOT / "Docs/concepts/approved").glob("*") if p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")]
row("OK" if approved else "WARN", "reference photos", f"{len(approved)} image(s)" if approved else "Docs/concepts/approved/ is empty (T006)")

print("\n".join(lines))
