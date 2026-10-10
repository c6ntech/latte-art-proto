#!/bin/bash
# Pixel 9a over USB (Android Studio's adb; nothing to install).
#   tools/phone.sh status          list connected devices
#   tools/phone.sh shot [name]     screenshot the phone into Docs/progress/phone/<date>/<name>.png
#   tools/phone.sh log             tail Chrome console lines from the phone (Ctrl-C to stop)
#   tools/phone.sh open [url]      open the game (default: the live site) in the phone's Chrome
#   tools/phone.sh inspect         forward Chrome DevTools so chrome://inspect on the Mac sees the phone's tabs
# Phone setup once: Settings > About phone > tap Build number 7x; Developer options > USB debugging on; accept the prompt.
set -euo pipefail
ADB=$(command -v adb || echo "$HOME/Library/Android/sdk/platform-tools/adb")
URL_DEFAULT="https://c6ntech.github.io/latte-art-proto/"
cd "$(dirname "$0")/.."
case "${1:-status}" in
  status)  "$ADB" devices -l ;;
  shot)    d="Docs/progress/phone/$(date +%F)"; mkdir -p "$d"; f="$d/${2:-$(date +%H%M%S)}.png"
           "$ADB" exec-out screencap -p > "$f" && echo "$f" ;;
  log)     "$ADB" logcat -v brief chromium:I '*:S' ;;
  open)    "$ADB" shell am start -a android.intent.action.VIEW -d "${2:-$URL_DEFAULT}" com.android.chrome >/dev/null && echo "opened ${2:-$URL_DEFAULT}" ;;
  inspect) "$ADB" forward tcp:9222 localabstract:chrome_devtools_remote && echo "open chrome://inspect on the Mac (or http://localhost:9222/json)" ;;
  *) sed -n '2,8p' "$0"; exit 1 ;;
esac
