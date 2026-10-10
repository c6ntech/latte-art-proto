# 工具堆疊

`python3 tools/check_env.py` 隨時印出下面每一項的現況（不花錢、不印金鑰）。

## 1. 總表

| 層 | 項目 | 用途 | 現況 | 下一步 / 誰 |
|---|---|---|---|---|
| 遊戲 | 靜態網頁：ES modules、WebGL2、Canvas 2D、Web Audio | 整個遊戲，沒有建置步驟 | 就緒 | — |
| 遊戲 | three.js r170 + GLTFLoader | 3D 呈現（D007），放在 `vendor/`，檔名帶版本 | 就緒 | — |
| 美術 | Blender 5.2.2 + `art/blender/build_assets.py` | 場景素材（杯、鋼杯＋手、桌、客人的手）→ `assets/models/*.glb` | 就緒（D013） | `Blender -b --factory-startup --python art/blender/build_assets.py [-- 名稱]` |
| 本機測試 | `tools/wait_for.py` | 一次呼叫等待：檔案、程序、或 `--url` 上線 | 就緒 | 部署後用 |
| 手機 | `tools/phone.sh` | Pixel 截圖、log、開網址、遠端偵錯 | 就緒 | 接上手機 |
| Python | `.venv` + `requirements.txt` | 工具與 fal 用的套件（含 https 憑證） | 就緒 | `.venv/bin/python tools/…` |
| 部署 | `gh` + GitHub Pages | 推 main 約 60 秒上線 | 就緒 | — |
| 本機測試 | gstack `browse`（headed） | 跑完整流程、截圖、抓 console | 就緒 | headless 沒有 WebGL2 |
| 本機測試 | `tools/sim.sh` | 一鍵流程 + 定時截圖 + 印比例 | 就緒 | — |
| 本機測試 | `tools/contact_sheet.py` | 多張截圖合成一張，給 Reviewer | 就緒 | — |
| 本機測試 | `tools/check_env.py` | 全部工具的健康檢查 | 就緒 | — |
| 本機測試 | `tools/stamp.sh` | 寫入版本號與 import map（破 Pages 的 10 分鐘快取） | 就緒 | 每次部署前跑 |
| 手機 | adb（Android Studio 內建） | Pixel 9a 截圖、logcat、Chrome 遠端偵錯看 console 與 fps | 有，沒接手機 | **你**：開 USB 偵錯、接線 |
| 手機 | Safari Web Inspector | iPhone 15 Pro 看 console 與效能 | 未開 | **你**：iPhone 設定 › Safari › 進階 › 網頁檢閱器 |
| 手機 | 遊戲內數據匯出 + `?replay=` | 手感數據回流 | 未做 | T002、T003 |
| Claude 連接器 | Figma | `generate_image` 生圖（扣 Figma AI 點數）；Weave 模型庫 | 已連；Weave 未連結 | **你**：到 app.weavy.ai 設定裡連結 Figma 帳號，我才查得到有哪些模型（含是否有圖轉 3D） |
| Claude 連接器 | Google Drive | 你放參考照、手機錄影給我 | 已連 | — |
| Claude 連接器 | Claude Docs | 計畫文件要分享給別人時用 | 已連 | — |
| MCP（本機） | fal.ai MCP | 生圖、圖轉 3D、Patina 材質、音效 | 範本在 `.mcp.json.example` | 之後需要時（D008）：給 `FAL_KEY` 與預算上限 |
| MCP（本機） | Blender MCP（`uvx blender-mcp@2.0.0`，外掛已啟用、遙測關） | 互動調整模型、截圖 | 就緒（D013） | 重開 Claude Code、開 Blender、按外掛面板 Connect |
| MCP（本機） | Chrome DevTools MCP | 效能追蹤；透過 adb 轉接可能可接 Pixel 的 Chrome | 未裝 | 接上 Pixel 後我驗證可不可行 |
| MCP（plugin） | context7 | 查 three.js 等文件 | 已裝 | — |
| Hooks（專案） | SessionStart 重新定位 | 新 session 自動印 STATE、TODO、git | 就緒，已測 | — |
| Hooks（專案） | PostToolUse JS 語法檢查 | 每次改 `.js` 自動 `node --check`，失敗擋下 | 就緒，已測（抓得到 10-09 那種錯） | — |
| Hooks（專案） | SubagentStart 車道合約 | 每個子代理拿到同一份規則 | 就緒，已測 | — |
| Skills（專案） | `latte-loop` | 改 → 檢查 → 模擬 → 版本 → 部署 → 確認 → 回報 | 就緒 | — |
| Skills（專案） | `latte-review` | 新 context 的 Reviewer 對照參考照打分 | 就緒，缺參考照 | **你**：T006 參考照 |
| Skills（專案） | `fal-ai-generation`（你的，從工具包複製） | fal 生圖、圖轉 3D、材質、音效的標準做法 | 就緒，缺金鑰 | 同 fal |
| Skills（專案） | `latte-assets` | 概念圖 → 3D → Blender → glTF → three.js 的管線 | 未寫 | D007 決定後寫 |
| Skills（專案） | `latte-pattern` | 新增一套拉花動作的寫法與自驗 | 未寫 | P2 開始前 |
| Skills（已有） | gstack：browse、qa、benchmark、design-shotgun、design-consultation | 測試、效能、UI 變體與設計系統 | 已裝 | 選單與 HUD 設計時用 |
| 知識（專案） | `knowledge/image-gen-lessons.md`、`3d-gen-preferences.md` | 你既有的生圖地雷與 3D 管線偏好 | 已從工具包複製 | 生圖前必讀 |
| 記帳 | `tools/ledger.py` | 付費生成的花費紀錄與上限 | 未做 | 第一次付費生成前從工具包移植 |

## 2. 工具包裡有、我們刻意不用的

| 項目 | 原因 |
|---|---|
| Unity、Unity MCP | 我們是網頁遊戲 |
| Stop hook「不准停」、30 小時時鐘、壓縮紀錄 | 工具包是無人長跑；我們是 owner 在迴圈裡的短迭代 |
| Higgsfield CLI | fal 已涵蓋；除非你想用那個帳號 |
| 桌面每 3 分鐘截圖 | `tools/sim.sh` 的截圖就是我們的進度紀錄 |
| 骨架與動畫技能（blender-game-animation） | 3D-lite 不用骨架；之後真的要做動畫再搬 |

## 3. 每日工作流

照 `latte-loop` 技能。重點：一次一個改動、改完自動語法檢查、模擬只證明沒壞、回報附版本、手感只看手機數據。

## 4. owner 的手機測試流程

1. 打開網址，確認右下角版本號是我說的那個（T001 之後）。
2. iPhone 先開旋轉鎖定；Android 按「啟用陀螺儀」會進全螢幕。
3. 像端著一杯咖啡的姿勢拿平，按歸零。
4. 倒 5–10 杯，每杯揭曉頁按「複製數據」貼回來（T002 之後）。
5. 有感覺直接用自己的話說，數字我從數據看。

## 5. 量測與重播（D014、KIT_ADOPTION Q3/Q5/Q9）

| 工具 | 做什麼 |
|---|---|
| `tools/shot.sh <tag> [query]` | 在倒到 25/50/75/100% 抓 72 格液面、揭曉截圖、量測，寫 `Docs/runs/<時間>_<tag>/checks.json` |
| `tools/latte_metrics.py` | 形狀相似度（對目標）、覆蓋、寬高、對稱、偏心、葉數 |
| `tools/make_target.py` | 照片 → 72 格目標圖（展平杯面橢圓、去暈、置中） |
| `?replay=Docs/replays/<名>.json` | 重播手機數據（REPLAY 標記、不寫設定）；自測：原本 88.7%、重播 88.6% |
| `?pose=1` | 手的姿勢工具；結果存 `assets/poses/hand.json` |

## 6. 給 owner 的手機回報範本

```
版本：v____（右下角）　手機：Pixel 9a / iPhone 15 Pro
倒了 __ 杯，過了 __ 杯
感覺（一句）：
（每杯揭曉頁按「複製數據」，貼在下面）
```
