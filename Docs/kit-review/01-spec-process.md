# Kit review 01 — 規格與流程（Kaiju Tamagotchi build kit）

Lane: kit-review-1-spec · 2026-10-10 · 只讀研究，沒有改任何程式或其他文件。
Kit 根目錄：`scratchpad/kit/KaijuTamagotchi-build-kit/`（以下路徑都相對於它）。
對照的我們的文件：`CLAUDE.md`、`Docs/TASK.md`、`PLAN.md`、`TOOLS.md`、`DECISIONS.md`、`STYLE_BIBLE.md`、`RETRO.md`、`state/STATE.md`、`TODO.md`、`.claude/skills/latte-review`、`tools/sim.sh`。

---

## 1. 讀過的檔案（全部都從頭讀到尾）

| 檔案 | 行數 | 狀態 |
|---|---|---|
| `Docs/TASK.md` | 644 | read fully |
| `Docs/PIPELINE_LESSONS.md` | 159 | read fully |
| `CLAUDE.md` | 137 | read fully |
| `KIT_README.md` | 64 | read fully |
| `KIT_CONTENTS.json` | 35 | read fully |
| `Docs/KICKOFF.md` | 49 | read fully |
| `Docs/DOCS_INDEX.md` | 19 | read fully |
| `Docs/DECISIONS.md` | 33 | read fully |
| `Docs/TODO.md` | 10 | read fully |
| `Docs/state/ACCEPTANCE.json` | 302 | read fully（25 項） |
| `Docs/state/STATE.template.md` | 26 | read fully |
| `Docs/concepts/approved/README.md` | 40 | read fully |
| `Docs/concepts/reference_city_ui/README.md` | 8 | read fully |
| `Docs/concepts/approved/*.webp` | 36 張圖 | 只看一張合成圖：`Docs/kit-review/kaiju_concepts_sheet.jpg`（7 欄，2555×1362）。任務說 37，實際是 36 張圖 + README。 |

---

## 2. 各檔案摘要

**`Docs/TASK.md`（WHAT，644 行）** — 整份規格。§0 任務與三個核心想法、§1 觀眾會看到的「體驗路徑」逐步寫出、§2 owner 的時間優先順序 + 「不需要」清單 + 25 項驗收表（帶 P0/P1/P2）、§3 專案規則（素材來源、品牌與內容禁令、參考圖用法、不問問題）、§4 美術方向與 Avoid 清單、§5–§14 生物/管線/城市/破壞/生命/軍隊/鏡頭/VFX/HUD/幽默層/音效、§15 技術架構、§16 預算硬上限、§17 30 小時時鐘 + 里程碑 gate + 10 個 key moments（每個至少三輪 capture→review→fix）、§18 驗證（rampage bot、max-chaos、Reviewer）、§19 進度紀錄與磁碟、§20 交付物。用法：M0 讀一次全文，之後只看 DOCS_INDEX 指的行號範圍。

**`Docs/PIPELINE_LESSONS.md`（159 行）** — owner 先前幾次長跑（Overlord、WoW-like MMO、多家模型 benchmark）的濃縮教訓：工具清單與坑、生成路線（哪個 endpoint 贏過）、Unity/Blender 坑、長跑 harness 教訓（狀態放磁碟、不自評、截圖和數字都要、provenance、status tiers、token 計算）、「上鏡好看」的調色與 owner 否決過的樣子、給 prompt 的 15 條規則、已知風險。用法：某管線步驟失敗兩次才讀。

**`CLAUDE.md`（HOW，137 行）** — 工作規則：狀態檔（STATE 覆寫、TODO 帶 ID、ACCEPTANCE 只改四欄、DECISIONS 只增、jobs/ledger/clock）、壓縮後的重新定位三步、自主（不問、不停、重試兩次換路、卡 45 分鐘就砍）、紀錄節奏、車道表與「一車道一交付」、永遠可玩（壞了 20 分鐘修不好就 revert）、生成紀律、驗證（不自評、status words）、token 衛生、技能清單、邊界、壓縮保留清單。

**`KIT_README.md`（64 行）** — 給 owner 的包裝說明：唯一的 `.env`、三家預算與停止線、工具包內容表、與 owner 已決定的事、開跑前準備、為什麼比上一個工具包省 token（上次 98.7% token 是重送 context；這次 STATE 由 hook 印、500k 壓縮、車道回 15 行、一次阻塞等待、只有 Reviewer 看圖）。

**`KIT_CONTENTS.json`（35 行）** — 工具包的清單：從主 repo 帶過來的技能、工具包自帶技能、knowledge/process 文件、腳本、驗收項目數。純打包用。

**`Docs/KICKOFF.md`（49 行）** — owner 要貼的訊息範本：開跑前 5 分鐘檢查、kickoff、resume（中斷後）、給鏡頭看的 6 行狀態、key-moment push（指定某個 K 跑三輪）、wrap-up（feature freeze + 交付）。把 owner 的介入標準化成幾句可貼的話。

**`Docs/DOCS_INDEX.md`（19 行）** — 每份文件一行、TASK 各節的行號範圍、「什麼時候才讀」。讓 agent 只讀需要的那一段。

**`Docs/DECISIONS.md`（33 行）** — 只增的決策紀錄，格式 `## D### · UTC · 標題 / Why / Rejected / Affects / Supersedes`，每筆 ≤ 6 行。開跑前就有 7 筆 owner 已定的決策。

**`Docs/TODO.md`（10 行）** — 佇列種子：`- [ ] T### P0 A## <what> · owner main|lane:<id> · check <how>`。每項連到驗收 ID、負責車道、檢查方式。

**`Docs/state/ACCEPTANCE.json`（302 行）** — 從 TASK §2 機械產生的 25 項：`id, p, tier_note, ref, title, check, passes, evidence, checked_utc, commit`。agent 只能改 passes/evidence/checked_utc/commit。

**`Docs/state/STATE.template.md`（26 行）** — 一份「填好的範例」STATE：Now（任務、步驟 3/5、在動的檔案、最後一次檢查結果）、Next 依序、Running、Dead ends、Decisions since last gate、Health（bot 結果、console、FPS、各家花費、磁碟）一行。

**`Docs/concepts/approved/README.md`（40 行）** — 36 張核准圖每張一行：這張用來看什麼、這張哪裡是錯的要忽略（「忽略上面的階段數」「TASK 5.2 優先」「不要紫色」）、對應哪個 key moment。用法：看合成圖，不一張張看。

**`Docs/concepts/reference_city_ui/README.md`（8 行）** — 第二個參考資料夾：只能拿來參考城市/破壞/UI 版面，裡面的生物是舊設計，**絕對不能**當生物輸入。示範「參考圖的用途邊界」。

**36 張核准圖（合成圖觀察）** — 目標樣貌由四類圖定義：(1) 設計表：白底側面一字排開的 7 階段、姿勢坡道、S7 四個方向、debris 標註、食物表；(2) **每一階段至少一張「遊戲內畫面」**：在遊戲鏡頭高度、帶 HUD、有那一階段的食物與敵人；(3) 6 張城市與氛圍；(4) 4 張幽默層 UI（來電、進化彈窗、鬧脾氣、標題機器）+ 2 張區域地圖。也就是說：**每一個驗收項目和每一個 key moment 都有一張「長這樣才算」的圖**。

---

## 3. 可以搬到我們專案的候選

價值：H 直接幫到拉花品質或 owner 迴圈；M 有幫助但不急；L 錦上添花。
建議：adopt now / adopt later / skip。「已有」= 我們文件已經有，只列差距。

| ID | 項目 | 來源 | 在拉花遊戲裡長什麼樣 | 價值 | 前置 / 成本 | 建議 |
|---|---|---|---|---|---|---|
| S01 | **目標樣貌用一組圖定義，每個驗收項與 key moment 都有一張圖** | approved/README；TASK §3 References；合成圖 | `Docs/concepts/approved/latte/` 從 1 張擴到 6–10 張真實 rosetta：正上方、不同葉數、好/普通/糊掉；外加 1 張「遊戲內目標畫面」（俯視杯子+鋼杯+手+HUD，按 STYLE_BIBLE 生/畫）。README 每張寫「看什麼、忽略什麼」 | H：目前只有一張參考照，Reviewer 能比的維度太少，「葉數、莖、外形」都只靠一張 | owner 拍照或 CC 授權照（免費）；目標畫面需 Figma 生圖點數或手繪 | adopt now |
| S02 | **成形過程表（像 creature_evolution_a 的「階段一字排開」）** | TASK §6 step 1、`creature_evolution_a.webp` | 從真實拉花影片抽 5 格：倒 20/40/60/80/100% 時杯面長怎樣，排成一條。`tools/sim.sh` 在相同進度截圖排成同一條，Reviewer 逐格比 | H：我們現在只比成品；問題常在中段（例：中段是「白色硬邊印章」，r2 review） | 找一支俯拍拉花影片 + ffmpeg 抽幀；約 30 分鐘 | adopt now |
| S03 | **鎖定設計規則（可檢查的不變條件）** | TASK §5.1「Rules that must hold at every stage」 | `Docs/PATTERN_RULES.md` 或 approved/README 一節：rosetta 必須：葉片約 7 對沿中線疊、中間一條細白莖穿到底、上窄下寬、置中、約佔杯面 65%、白與咖啡交界有淡棕邊、不是純白印章。每條都能被 Reviewer 或指標判斷 | H：把 owner 的口頭標準變成每次都檢查的清單；T018 已有一部分 | 文件 15 分鐘 | adopt now |
| S04 | **Key moments 清單 + 每個至少三輪 capture→review→fix，截圖保留，本身就是驗收項** | TASK §17.3、A19；KICKOFF §4 | K1 葉子在倒的過程中成形、K2 揭曉放大、K3 出界那段真的糊掉、K4 打奶泡儀式、K5 翻倒；之後 K6 客人的手。每輪：固定鏡頭截圖 → 新 context Reviewer 打分+三缺點 → 修一個 → 再截。新增驗收 A18「key moments 各 ≥ 3 輪」 | H：kit 品質的主要來源；我們已有 Reviewer 但沒有「指定時刻 × 指定輪數」的節奏 | 只花時間；Reviewer 每輪一個子代理 | adopt now |
| S05 | **ACCEPTANCE.json 的欄位格式** | `state/ACCEPTANCE.json`；CLAUDE §1 | 依 TASK §3 機械產生 17 項：`id,p,ref,title,check,who,passes,evidence,checked,commit`（多一個 `who`：agent/Reviewer/owner）。只改四欄 | H：T005 還沒做；RETRO 已經說「過了要有證據」 | 10 分鐘腳本 | 已有規則，**檔案還不存在** → adopt now |
| S06 | **驗收要在真的遊玩上跑，證據放 `Docs/acceptance/<時間>/`，每個 gate 重跑全部並把分數寫進 DEVLOG** | TASK §2 Acceptance test | 每個階段出口跑一次「驗收回合」：sim 截圖 + owner 手機數據 + Reviewer 報告放同一個時間資料夾，DEVLOG 一行「A 項通過 n/17」 | M：讓「現在到哪」一眼可見；PLAN 有出口條件但沒有「全部重跑」的儀式 | 時間 | adopt later（P1 出口時第一次） |
| S07 | **驗證機器人輸出機器可讀的 `checks.json`（含 summary 欄）** | TASK §18 rampage bot；CLAUDE §8 | `tools/sim.sh` 除了印文字，寫 `Docs/runs/<時間>/checks.json`：模式、甜蜜點比例、翻倒、fps min/avg、console errors、各截圖路徑、summary 一行 | M：可以比較版本、讓 hook/STATE 自動帶最後結果 | 半小時 | adopt now（小改） |
| S08 | **截圖用「固定進度點」而不是牆鐘時間** | TASK §18（fixed checkpoints）、§19.2 story cameras | 現在 `sim.sh` 在 2.3/5.0/…秒截圖，受載入速度影響。改成遊戲在倒到 25/50/75/100% 時發事件、sim 等事件再截；加 T021 的 `?shot=` 固定鏡頭、關掉 debug UI 與虛線圈 | H：S02、S04 的比較要可重現；同一格跨版本才能比 | T021 已列；1 小時 | adopt now |
| S09 | **數字和眼睛都要：probe + 看圖** | PIPELINE §4 Verification（截圖漏 bug、數字漏 bug） | 從流體 dye buffer 算拉花指標：白色佔杯面比、左右對稱度、沿中軸的明暗條紋數（≈葉數）、重心偏移、中線白莖連續長度。寫進 checks.json；同時算 `rosetta_owner_ref.jpg` 的同一組指標當目標 | H：讓「葉子太小 45% vs 65%」這種事每次自動量，不靠 Reviewer 感覺；調參時有客觀方向 | 1–2 小時（canvas readPixels + 簡單統計） | adopt now |
| S10 | **Reviewer：新 context、對核准圖打分、列三個最糟缺點、先修缺點再加功能** | TASK §18 Reviewer lane；CLAUDE §7 | 已有（`latte-review`）。差距：評分表第 3 項還是「像不像鬱金香」（D011 已改 rosetta）；沒有寫「平均 < 7 不開新功能」；沒有成形過程（S02）那一格比較 | H | 改技能文字 10 分鐘 | 已有，**修正 rubric** → adopt now |
| S11 | Status words：implemented / agent-verified / pending owner；不自稱 owner 接受 | CLAUDE §7；PIPELINE §4 | 已有（CLAUDE §4） | — | — | 已有 |
| S12 | STATE 整份覆寫、Now/Next/Running/Dead ends/Health | CLAUDE §1；STATE.template | 已有。差距：kit 的範本有「Step 3/5」「Last check 的檔案路徑」「Decisions since last gate」，我們的 STATE 沒有步驟進度與最後檢查的路徑 | M | 改範本 | 已有，小補 |
| S13 | DECISIONS 加 `Supersedes:` 欄 | `DECISIONS.md` 格式行 | D011（rosetta）取代了 TASK §1/A02/A10 的鬱金香，但沒標記；加 `取代：` 欄就能 grep 出哪些舊規格已失效 | M：TASK.md 現在 A02 寫 `tulip.js`、A10 寫「四層鬱金香」，和 D011 矛盾 | 1 分鐘/筆 | adopt now |
| S14 | TODO 每項帶 驗收 ID + 負責車道 + 檢查方式 | `TODO.md` | 已有（缺 `owner main|lane` 欄，對我們不重要） | L | — | 已有 |
| S15 | DOCS_INDEX：每份文件一行 + TASK 行號範圍 + 什麼時候讀 | `DOCS_INDEX.md` | 我們 TASK 才 89 行，暫不需要；文件變多（PATTERN_GUIDE、ART_DIRECTION、kit-review）後，在 reanchor hook 印一個 10 行索引 | L | 15 分鐘 | adopt later |
| S16 | 壓縮時保留清單 | CLAUDE「Compact instructions」 | 已有（CLAUDE §8） | — | — | 已有 |
| S17 | SessionStart 重新定位 hook、車道合約 hook | CLAUDE §1、§4 | 已有（reanchor.py、lane_contract.py）。TODO T008 還開著，應關掉 | L | — | 已有，清 TODO |
| S18 | **owner 的優先順序（照這個順序花時間）+ 落後時從底部砍** | TASK §2 Priorities；§17.1 | TASK 加一節：1 拉花樣貌與成形 → 2 手感 → 3 揭曉時刻 → 4 其他。之後章節與造型膨脹時，按這個順序砍並記 DECISIONS | M：PLAN 有階段，但沒寫「衝突時誰先」 | 文件 10 分鐘 | adopt now |
| S19 | 「不需要（除非 P0/P1 全過）」清單 | TASK §2 Not needed | 已有（TASK §8 不做）。可補：多圖案前先讓 rosetta 過 7 分 | L | — | 已有 |
| S20 | **硬 gate：之後不加新系統，只做內容與打磨** | TASK §17.2 M3 hour-20 gate | 「手感凍結」gate：P1 出口後不再改輸入模型與飄移模型，只動資料檔與呈現；「流體凍結」gate：rosetta ≥ 7 後流體模型凍結，其他圖案只寫資料 | M：防止 P2–P5 又回頭改核心 | 寫進 PLAN | adopt later（P1 出口時） |
| S21 | **先在一個素材上把管線打通、做 A/B 定下配方，再平行放大** | TASK §6（S1 先跑完、A/B 定配方）；PIPELINE §4 | 圖案庫：先把 rosetta 做到 Reviewer ≥ 7 + 指標接近照片，凍結流體配方，再開愛心/天鵝車道。美術：手（A2）打通再做造型 | H：PLAN P2 現在是四個 Pattern 車道並行，風險是四個都卡在同一個流體問題 | 只是順序 | adopt now（改 PLAN P2 順序） |
| S22 | **預先寫好的 fallback** | TASK §8.8、§6 step 2「max 3 attempts then…」 | 拉花品質的 Plan B 寫進 DECISIONS 草案：若流體三輪仍 < 7，混合做法（完美段用預先模擬或手繪的葉形當注入導引/遮罩，出界段仍用真流體糊掉，保持 A06「糊掉是真的」）。要 owner 決定 | M–H：避免無限調參；我們已有「三輪換模型」，但沒有事先寫好的下一個模型 | owner 一句話 | adopt now（提出給 owner） |
| S23 | **「每個動作都有物理回應」（everything reacts，能藏小缺點）** | TASK §8.9 | 倒奶時杯面漣漪、奶柱落點小水花、傾斜時液面晃、杯盤輕響、Android 震動、蒸汽、出界時濺出咖啡漬在杯盤上 | M–H：r2 review 說奶流像一根棍子；回饋讓手感與樣貌都變好 | 程式時間；震動 iOS 網頁不支援 | adopt later（P4，奶流回饋可早做） |
| S24 | **影片會剪到的那一刻給最好的特效** | TASK §1「stage-up… gets the best VFX」；§5.7 | 我們的那一刻是揭曉：鏡頭拉近 + 拉花亮一下 + 分數 + 一句評語，1.5 秒內；可分享的結果圖 | M：PLAN P4 已有揭曉動畫，差在「把最多打磨放這」的明確優先 | — | 已有一部分，adopt later |
| S25 | **幽默層與語氣規格（認真的世界 × 荒謬的一層）** | TASK §0 tone、§13.1 | 拉花本身認真寫實，上面一層冷面幽默：客人的手有個性（不耐煩敲桌、拍照）、評語卡（「葉子 7 片，莖略歪，客人已經發 IG 了」）、荒謬章節的客人台詞（外太空、奇怪容器）。寫一份 ≥ 30 句的台詞庫與「不拿真人/品牌開玩笑」規則 | M：六章節裡「荒謬現場」「外太空」需要語氣指引 | 寫作時間；配音之後才需付費 | adopt later（P3–P4） |
| S26 | **品牌與 IP 規則：可辨識的剪影，不用品牌名與 logo；生圖 prompt 不放品牌字** | TASK §3 Names；CLAUDE §6 | 造型（咖啡機、鋼杯、手套）會想像某些名牌機器：只做剪影致敬，不放品牌名/logo；prompt 不寫品牌字（生圖服務會 422） | M：造型與上架前必須 | 無 | adopt later（P5 前寫進 STYLE_BIBLE） |
| S27 | 外部素材授權紀錄 `Docs/LICENSES.md` | TASK §3 Free assets | 倒奶聲、濺聲、音樂若用 Freesound CC0 等，記來源與授權 | M | 無 | adopt later（P4 音效時） |
| S28 | 付費生成：硬上限、90% 停止、ledger、先估價、每個素材最多 3 次 | TASK §16；CLAUDE §6 | 已列在 TOOLS（`tools/ledger.py` 未做）。接 fal/Figma 點數前做 | M | fal key、預算數字 | 已列，adopt later |
| S29 | 每個生成素材一份收據（endpoint、request id、prompt、費用、路徑）；已接受的不重生 | PIPELINE §6 rule 11；CLAUDE §1 | `assets/<id>/asset.json` | L–M | — | adopt later（第一次生圖時） |
| S30 | 「輪詢逾時不是失敗，用 ID 接續」 | CLAUDE §6 | 生圖/圖轉 3D 時用 | L | — | adopt later |
| S31 | **效能預算表 + 預算管理器自動降級** | TASK §8.6、§15 | 已有預算（STYLE_BIBLE：2 萬三角形、40 次繪製、≥ 50 fps）。差距：手機 fps 還沒量；沒有自動降級（fps < 50 時流體格數或 3D 陰影降一級） | M | 手機 debug 數據 | 已有預算，降級 adopt later |
| S32 | **最壞情況測試（max-chaos fixture）** | TASK §8.6、§18 | `?stress=1`：最高流體解析度、3D、陰影、粒子、背景全開，在兩支手機上量 fps；每個階段出口跑一次 | M：之後章節（外太空、環境干擾）會加東西 | 30 分鐘 + owner 手機一次 | adopt later |
| S33 | **固定故事鏡頭 + 每次重要改動截圖 + `log.jsonl`（時間、功能、說明、檔案、commit）** | TASK §19.2 | `Docs/progress/` 已有按日期的截圖。補：`log.jsonl` 帶版本號；用同一個 `?shot=` 鏡頭，之後能做「拉花怎麼變好的」對照條 | M：給 owner 看進度、給 Reviewer 跨版本比較 | 30 分鐘 | adopt later（跟 S08 一起） |
| S34 | Timelapse / 「怎麼做出來的」影片素材 | TASK §19.3、§20 | 若 owner 之後想做開發日誌或宣傳：把 S33 的截圖按版本合成 GIF/MP4 | L | ffmpeg | skip（除非 owner 要） |
| S35 | **體驗路徑逐步寫出（每一步都要能玩、好看）** | TASK §1 | 現在只有一杯；之後寫完整路徑：標題 → 章節 → 客人的手放杯 → 打奶泡 → 倒 → 揭曉 → 客人端走/拍走 → 下一杯。每步一行「看到什麼」 | M：P3–P4 開始前對齊 owner 的畫面 | 文件 20 分鐘 | adopt later |
| S36 | 一個 profile 驅動所有依章節變化的數值（不在別處硬寫） | TASK §5.2 stage profile | 已有方向（`js/config.js`、PLAN P3 `js/levels/<chapter>.js`）。補一句規則：章節相關數值只能在 level 檔 | L | — | 已有 |
| S37 | 參考資料夾的用途邊界（「這組只能看 X，絕不能當 Y 的輸入」）與衝突時誰優先 | reference_city_ui/README；approved/README | 已有（style/ 不能評圖案）。補：每張圖「忽略什麼」、「TASK 與圖衝突時 TASK 優先」 | L | — | 已有，小補 |
| S38 | owner 介入用的固定訊息範本 | `KICKOFF.md` | 給 owner 的幾句可貼話：「手機回報」（版本、幾杯、過幾杯、感覺一句、貼數據）、「狀態，6 行」、「對 K# 跑三輪」、「收尾」 | M：owner 在迴圈裡，回報格式一致省來回 | 文件 10 分鐘 | adopt now（放 TOOLS §4） |
| S39 | 卡住的時間上限 + 重試兩次換路 | CLAUDE §2 | 已有「同一件事調參三輪不動換模型」。可加：同一缺點兩個 session 沒進展 → 寫下試過什麼、提 fallback（S22）給 owner | L–M | — | 已有，小補 |
| S40 | 壞了 20 分鐘修不好就 revert | CLAUDE §5 | 我們部署給手機玩：sim auto 不過或 console 有錯 → revert 再推，不帶壞版本給 owner | M | — | adopt now（一句規則） |
| S41 | 「沒打開過的圖不要描述」；主線最多看一張縮圖，判斷交給 Reviewer | CLAUDE §7–§8 | 主線只確認「有沒有壞」，已有；補這一句 | L | — | 已有，小補 |
| S42 | token 衛生：一次阻塞等待、腳本只印 ~20 行、log 進檔 | CLAUDE §8 | 部署後確認：寫一個 `tools/wait_deploy.sh`（curl 輪詢直到 version.js 是新版，最多 3 分鐘，一次呼叫） | L–M | 15 分鐘 | adopt later |
| S43 | 開跑前與 owner 鎖定的決策先寫進 DECISIONS | `DECISIONS.md` D001–D007；KIT_README | 已有（RETRO 教訓 3）。之後每個新章節/造型系統開始前，先把 owner 的選擇寫成 D 再動手 | — | — | 已有 |
| S44 | 交付報告：implemented / agent-verified / pending owner 分開，沒記錄的寫「未記錄」不寫 0 | TASK §20 REPORT；PIPELINE §4 | 每個階段出口的 DEVLOG 段落照這三欄寫 | L | — | adopt later |
| S45 | 「只在遊戲鏡頭下判斷樣貌，不在 Blender 或單獨素材圖判斷」；素材單獨好看放進場景會衝突 | PIPELINE §5 | 手、造型、背景一律在手機尺寸、遊戲鏡頭的截圖裡評（sim 390×844） | M | — | 已有一部分，寫進 STYLE_BIBLE |
| S46 | owner 否決過的樣子清單（placeholder 感、錄影裡有 debug HUD 等） | PIPELINE §5 | STYLE_BIBLE 加「owner 否決過」：太難、圖案像印章、奶流像棍子、甜蜜點大到整杯…；Reviewer 截圖不帶 debug UI | M | — | adopt now（一節文件） |

---

## 4. 為什麼這個工具包能做出高品質（具體）

1. **目標是圖，不是形容詞。** 36 張核准圖裡，每一個階段都有一張「在遊戲鏡頭高度、帶 HUD」的畫面，每個 key moment 都對得到一張；README 還寫每張「忽略哪裡」。Reviewer 永遠有東西可以比。
2. **指定時刻 × 指定輪數。** 10 個 key moments，每個至少三輪 capture→新 context Reviewer 打分+三個最糟缺點→修→再截，而且「做滿三輪」本身是 P0 驗收（A19）。品質不是靠希望，是靠排進流程的迭代次數。
3. **做的人和評的人分開。** Reviewer 是新 context、只看縮圖/合成圖、對照核准圖；status words 分三級；owner 接受永遠不自己寫。
4. **設計規則寫成可檢查的不變條件**（「只能橘色，永不紫藍」「每階段 debris 來自前一階段的食物」「姿勢逐階段上升」），Reviewer 每次逐條勾。
5. **先打通一個、A/B 定配方、再平行放大**（S1 走完全管線再開其他六階段），避免同一個錯誤乘以七。
6. **硬 gate 與從底部砍。** 第 20 小時核心必須完成且最佳化，之後只做內容與打磨；落後就按 owner 的優先順序從底部砍並記錄。時間被花在最重要的地方。
7. **數字和眼睛同時要。** 前幾次長跑的教訓：只看截圖漏了 4 個 bug，只看數字漏了一艘離水 2 m 的船。所以有 rampage bot 的 checks.json + 固定檢查點截圖 + Reviewer。
8. **預算早量、上限硬、fallback 先寫好。** M1 就做壓力測試與 S7 全景渲染測試；budget manager 自動降級；失敗的路線（預模擬崩塌、VFX-only）事先寫在規格裡。
9. **「每個動作都有回應」與「把最好的特效放在會被剪進影片的那一刻」**：觀感品質集中在觀眾會看到的地方，小缺點被回饋掩蓋。
10. **狀態與 token 紀律讓長跑不退化**：STATE 由 hook 印、不重讀文件、車道回 15 行、只有 Reviewer 看圖；上一個工具包 98.7% 的 token 是重送 context。

---

## 5. 不適用

- Unity / URP / PhysX / Input System 坑 — 引擎
- Tripo P2、Higgsfield 3D 路線、`face_limit`、UV check — D008
- Blender 骨架、動畫家族、foot locking、Mixamo — 無骨架
- 30 小時時鐘、Stop hook 不准停、「不問問題」 — owner 在迴圈
- 桌面每 3 分鐘截圖、磁碟 watchdog、Blender 檔交付 — 規模
- 城市生成、破壞支撐圖、群眾/交通/軍隊、無線電台詞 — 類型
- 影片看板、新聞畫面 — 範圍
- Windows build、AnkleBreaker 標示、Higgsfield 共用帳號計帳 — 平台
- Token 成本計算與 YouTube 交付報告 — 無影片交付
- `KIT_CONTENTS.json`、`.env` 打包流程 — 打包用
- 平行 4–8 車道 — 迭代短（P2 圖案車道例外，已在 PLAN）

---

## 附註：順便發現的不一致（沒有修改，留給主線）

- `Docs/TASK.md` §1「一套動作：鬱金香」、A02「依 `js/patterns/tulip.js`」、A10「四層分明的鬱金香加莖」與 D011（預設 rosetta）矛盾。
- `.claude/skills/latte-review/SKILL.md` 評分第 3 項仍是「像不像鬱金香」。
- `Docs/ACCEPTANCE.json` 尚不存在（T005 未做）；TODO T008 的 hook 依 TOOLS.md 已就緒，可關。
