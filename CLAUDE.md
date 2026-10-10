# CLAUDE.md — 拉花遊戲（暫名）工作規則

這個檔案是 HOW。WHAT 在 `Docs/TASK.md`。這裡的規則優先於你之後自己推論出來的任何做法。
文件與對話用繁體中文；程式、識別字、commit 訊息用英文。

## 1. 狀態在檔案裡，對話是用完即丟的

- `Docs/state/STATE.md`：「你在這裡」。每完成一個項目、每次 commit 前整份重寫（不是 append），60 行以內。
- `Docs/TODO.md`：佇列，一行一項，ID 在前（`- [ ] T012 P0 A05 <做什麼> · 檢查 <怎麼驗>`）。做完移到 `Docs/archive/TODO_DONE.md`。
- `Docs/DECISIONS.md`：只增不改，一筆 6 行以內，有 ID（`D007`）。用 grep 找，不整份讀。
- `Docs/ACCEPTANCE.json`：驗收項目（從 TASK §3 產生）。只改 `passes / evidence / checked / commit`，不新增不刪除。`passes: true` 一定要有證據檔。
- `Docs/DEVLOG.md`：只增不改，給人看的里程碑與教訓。
- 新 session 開始：先讀 STATE.md 和 TODO 前 10 行，`git log --oneline -10`。不要重讀 TASK.md 全文；需要時看對應章節。

## 2. 手感只有在手機上才算數

- 桌機模擬（`tools/sim.sh`）只用來做回歸測試、看圖案長相、估難度區間。**不可以**用它宣稱「手感 OK」或「夠簡單」。
- 任何影響手感的改動（`TUNING`、pattern、input），改完要：(1) 部署，(2) 在回覆裡寫清楚版本號與改了哪一個參數，(3) 請 owner 用手機玩並回傳數據（揭曉頁的「複製數據」）。
- 拿到手機數據後，先用 `?replay=` 在桌機重播，再調參數；不要憑想像調。
- 「正常手機」的現實：拿著看螢幕時不是平的；手會微抖（±1–2°）也會慢慢偏（±3–5°）；傾斜過頭會自動轉橫向；iOS 要在點擊內要權限；玩家可能開著舊版快取。每一條都要有對應處理，見 TASK §6。

## 3. 一次一件事，改完就部署

- 一個 commit 只做一個可驗證的改動。commit 訊息說「改了什麼、為什麼、怎麼驗」。
- 畫面右下角永遠顯示 build 版本（短 commit hash + 日期）。owner 回報時先問版本。
- 推上 `main` 約 60 秒後 GitHub Pages 更新。推完要 `curl` 確認新版已上線再回報。
- 參數全部放 `js/config.js`，程式裡沒有魔術數字。調參改 config，不改邏輯。
- 同一件事調參三輪還不動，就是模型錯了，換模型（例：奶泡分層靠高斯推開調不出來，換成 1/r 才分層）。

## 4. 你不自己評分

- 圖案好不好看：開一個新 context 的 Reviewer 子代理，拿截圖對照 `Docs/concepts/approved/` 的真實拉花照片打分、列三個最糟缺點。你自己看圖只是確認「有沒有壞掉」。
- 手感好不好、難不難：只有 owner 的手機能判斷。狀態用詞：*implemented*、*agent-verified*（模擬或 Reviewer 驗過）、*pending owner*（任何手感與視覺項目的預設）。不要寫「owner 已接受」。
- 數字來自工具（`tools/sim.sh` 的輸出、手機回傳的 JSON），不手算、不估。

## 5. 編輯與驗證的紀律

- 改程式用 Edit 工具做小而精確的替換；不要用 Python 字串批次替換整段（這次因此出過一次語法錯、一次改到一半停掉）。
- 每次改完 JS 跑 `node --check` 或 parse check，再跑 `tools/sim.sh auto`，才部署。
- 瀏覽器測試用 gstack browse 的 headed 模式（`browse connect --force-restart`）；headless 沒有 WebGL2。
- Claude.ai Artifact 不能用陀螺儀，不要再試。部署只走 GitHub Pages。

## 6. 子代理的用法

| 車道 | 做什麼 | 寫到哪 |
|---|---|---|
| 主線（你） | 遊戲程式、config、部署、文件 | `js/`, `Docs/` |
| Reviewer（新 context） | 拿截圖對照參考照打分、列缺點 | `Docs/reviews/<日期>.md` |
| Pattern 作者 | 依 `Docs/PATTERN_GUIDE.md` 寫一套新動作資料並用 `tools/sim.sh` 自驗 | `js/patterns/<id>.js` + 截圖 |
| Explore | 查資料、讀長文件、找程式碼 | 只回結論 |

子代理回覆 15 行以內：結果、輸出路徑、證據、備註。細節寫檔案。不要 fork 自己去做 review。

## 6.5 工具、技能、hooks（壓縮後技能清單會消失，這段不會）

- 專案 hooks（`.claude/settings.json`）：SessionStart 自動印 STATE/TODO/git；每次 Edit/Write `.js` 自動 `node --check`，失敗會被擋下，先修；子代理自動拿到車道合約。
- 專案技能：`latte-loop`（改完到部署回報的每一步）、`latte-review`（Reviewer 任務卡）、`fal-ai-generation`（owner 的生圖與圖轉 3D 做法）。
- 全部工具現況：`python3 tools/check_env.py`；清單與缺口：`Docs/TOOLS.md`。
- 美術方向與建模分工：`Docs/ART_DIRECTION.md`（3D-lite 提案，待 D007）。生圖前必讀 `knowledge/`。

## 7. 邊界

- 只動這個專案資料夾。推送只到 `origin main`。不開新 repo、不改帳號、不花錢（之後若接 fal.ai 生圖，先在 TASK 寫預算上限再動）。
- 不改 `~/.claude` 的全域設定。專案 hooks 若有，只在 `.claude/` 內。

## 8. 壓縮上下文時保留

目前的 TODO ID 與步驟、未 commit 的檔案清單、未解的錯誤訊息原文、owner 最近一次手機回報的數字、最近一次 `tools/sim.sh` 結果、最近的 DECISIONS ID。丟掉：檔案內容、工具輸出、截圖描述、已解決的錯誤。
