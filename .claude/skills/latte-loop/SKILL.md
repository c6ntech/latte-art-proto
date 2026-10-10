---
name: latte-loop
description: 拉花遊戲的開發迴圈 — 改一個東西、語法檢查、桌機模擬、蓋版本、commit 與 push、確認 GitHub Pages 上線、回報版本給 owner。改了 js/、js/config.js 或 js/patterns/ 之後、要給 owner 手機測之前使用。
---

# 拉花開發迴圈

規則先講（壓縮後也要記得）：
1. **一次一個改動。** 一個 commit 只改一個參數或一個模型。owner 才分得出是哪個改動造成的差別。
2. **手感不在桌機判斷。** 模擬只證明「沒壞」和「難度區間」，不證明「好玩」或「夠簡單」。
3. **回報一定附版本**，並說清楚 owner 要做什麼、回傳什麼。

## 1. 改

- 參數改 `js/config.js`；動作改 `js/patterns/<id>.js`；邏輯才改其他檔。
- 用 Edit 工具做小而精確的替換。專案的 PostToolUse hook 會對每個 `.js` 跑 `node --check`，失敗就先修。
- 用 Bash 改檔時 hook 不會觸發，改完自己跑第 2 步。

## 2. 檢查

```bash
for f in js/*.js js/patterns/*.js; do node --check "$f" || echo "FAIL $f"; done
```

## 3. 桌機模擬

前置：專案根目錄 `python3 -m http.server 8765`，以及 headed 瀏覽器（headless 沒有 WebGL2）：

```bash
~/.claude/skills/gstack/browse/dist/browse connect --force-restart
```

| 什麼時候 | 指令 | 期待 |
|---|---|---|
| 每次 | `SHOTS=Docs/progress/$(date +%F) tools/sim.sh auto auto=1` | 成功，四層鬱金香 |
| 動了手感 | `tools/sim.sh hand hand=1`（跑 3 次） | 有過有不過 |
| 動了手感 | `tools/sim.sh play "hand=1&play=1"`（跑 3 次） | 全過 |

截圖印出來只確認「沒壞」。好不好看交給 `latte-review`。結果寫進 STATE 的「健康」。

## 4. 版本、commit、push

- `tools/stamp.sh`：寫 `js/version.js`（月日-時分）並更新 `index.html` 的 import map，每個模組帶 `?v=`，破 Pages 的 10 分鐘快取。版本顯示在畫面右下角。
- commit 訊息：改了什麼、為什麼、怎麼驗；附 TODO ID。
- `git push origin main`

## 5. 確認上線

```bash
for i in $(seq 1 30); do curl -s https://c6ntech.github.io/latte-art-proto/js/config.js | grep -q "<這次改的字串>" && { echo "live after ${i}0s"; break; }; sleep 10; done
```

沒看到就不要回報「已上線」。

## 6. 回報 owner（範本）

```
新版 <hash> 已上線（右下角版本號是這個才算）。
這版只改了：<一個參數，舊值 → 新值>，理由：<一句>。
請：重新整理，倒 5 杯，每杯揭曉頁按「複製數據」貼回來；有感覺就用自己的話說。
```

## 7. 收尾

重寫 `Docs/state/STATE.md`，TODO 打勾，DEVLOG 一行（版本、改動、owner 回報）。
