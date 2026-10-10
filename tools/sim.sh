#!/bin/bash
# 用法: tools/sim.sh <tag> [query]  — 在 headed gstack 瀏覽器跑一次完整流程，按時間截圖到 $SHOTS，印出結果。
# query: auto=1（完美操作）/ hand=1（模擬手持不修正）/ hand=1&play=1（模擬玩家）/ mouse=1（滑鼠）
# 前置: python3 -m http.server 8765 在專案根目錄；browse connect --force-restart（headless 沒有 WebGL2）
B="$HOME/.claude/skills/gstack/browse/dist/browse"; S=${SHOTS:-/tmp/latte-shots}; mkdir -p "$S"
TAG=$1; Q=${2:-auto=1}
# PHONE=1 (default) emulates a 390x844 phone at DPR 3; PHONE=0 keeps the desktop window
if [ "${PHONE:-1}" = "1" ]; then $B cdp Emulation.setDeviceMetricsOverride '{"width":390,"height":844,"deviceScaleFactor":3,"mobile":true}' >/dev/null 2>&1; else $B cdp Emulation.clearDeviceMetricsOverride '{}' >/dev/null 2>&1; fi
$B goto "http://localhost:8765/?$Q&r=$RANDOM" >/dev/null 2>&1
$B js "document.getElementById('btn-enable').click(); 'clicked'" >/dev/null 2>&1; sleep 0.4
$B js "document.getElementById('btn-calib').click(); 'ok'" >/dev/null 2>&1; sleep 0.3
$B js "const b=document.getElementById('btn-steam'); b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); setTimeout(()=>b.dispatchEvent(new PointerEvent('pointerup',{bubbles:true})), 300); 'steaming'" >/dev/null 2>&1
sleep 1.2
$B js "document.getElementById('btn-start').click(); 'started'" >/dev/null 2>&1
T0=$(date +%s.%N)
for at in 2.3 5.0 7.2 9.1 10.4 12.6; do
  now=$(date +%s.%N); w=$(echo "$T0 + $at - $now" | bc); [ "$(echo "$w > 0" | bc)" = 1 ] && sleep $w
  $B screenshot "$S/$TAG-$at.png" >/dev/null 2>&1
done
$B console --errors 2>&1 | grep -v "404\|401\|UNTRUSTED" | head -5
$B js "document.getElementById('reveal-ratio').textContent + ' | ' + document.getElementById('reveal-title').textContent" 2>&1 | tail -1
