"""Block until something is done, in ONE tool call (every poll from the agent re-sends the whole context).

    python3 tools/wait_for.py --url https://c6ntech.github.io/latte-art-proto/js/version.js --contains 1010-1440 --timeout 300
    python3 tools/wait_for.py --file Docs/runs/latest/checks.json --key summary --timeout 600
    python3 tools/wait_for.py --pid 12345 --timeout 3600                  # a background Blender or ffmpeg process
    python3 tools/wait_for.py --glob "assets/models/*.glb" --newer-than-now --timeout 900
(Ported from the Kaiju kit; --url uses curl because this Mac's python.org Python has no CA certificates.)

Prints one line (and the file's `summary` field when present). Exit 0 done, 2 timeout (a timeout is not a failure:
wait again or check the job by its id), 1 bad arguments.
"""
import argparse
import glob
import subprocess
import json
import os
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass
import time
from pathlib import Path


def pid_alive(pid):
    if os.name == "nt":
        import ctypes
        h = ctypes.windll.kernel32.OpenProcess(0x1000, False, pid)  # PROCESS_QUERY_LIMITED_INFORMATION
        if not h:
            return False
        code = ctypes.c_ulong()
        ctypes.windll.kernel32.GetExitCodeProcess(h, ctypes.byref(code))
        ctypes.windll.kernel32.CloseHandle(h)
        return code.value == 259  # STILL_ACTIVE
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--file")
    ap.add_argument("--glob")
    ap.add_argument("--pid", type=int)
    ap.add_argument("--url", help="wait until this URL serves a body containing --contains")
    ap.add_argument("--contains", default="")
    ap.add_argument("--key", help="wait until the JSON file has this key")
    ap.add_argument("--newer-than-now", action="store_true", help="ignore a file older than the start of this wait")
    ap.add_argument("--timeout", type=int, default=900)
    ap.add_argument("--every", type=float, default=3.0)
    a = ap.parse_args()
    if not (a.file or a.glob or a.pid or a.url):
        ap.print_usage()
        sys.exit(1)
    t0 = time.time()
    while time.time() - t0 < a.timeout:
        if a.url:
            try:
                body = subprocess.run(["curl", "-sf", "-H", "Cache-Control: no-cache", a.url], capture_output=True, text=True, timeout=20).stdout
            except Exception:
                body = ""
            if body and a.contains in body:
                print(f"{a.url} serves '{a.contains}' after {time.time() - t0:.0f} s")
                return
        elif a.pid is not None:
            if not pid_alive(a.pid):
                print(f"pid {a.pid} finished after {time.time() - t0:.0f} s")
                return
        elif a.glob:
            hits = [p for p in glob.glob(a.glob) if not a.newer_than_now or os.path.getmtime(p) >= t0]
            if hits:
                print(f"{len(hits)} match(es) after {time.time() - t0:.0f} s: {hits[0]}")
                return
        else:
            p = Path(a.file)
            if p.exists() and (not a.newer_than_now or p.stat().st_mtime >= t0):
                if a.key or p.suffix == ".json":
                    try:
                        data = json.loads(p.read_text(encoding="utf-8-sig"))
                    except Exception:
                        data = None  # still being written
                    if data is not None and (not a.key or a.key in data):
                        summary = data.get("summary") if isinstance(data, dict) else None
                        print(f"{p} ready after {time.time() - t0:.0f} s" + (f": {json.dumps(summary)[:600]}" if summary else ""))
                        return
                else:
                    print(f"{p} ready after {time.time() - t0:.0f} s")
                    return
        time.sleep(a.every)
    print(f"timeout after {a.timeout} s (not a failure: wait again or check the job by its id)")
    sys.exit(2)


if __name__ == "__main__":
    main()
