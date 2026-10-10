# Kit review 02：knowledge 與 3D/動畫流程（KaijuTamagotchi build kit）

> 車道 kit-review-2-knowledge，2026-10-10。唯讀研究；只寫這個檔。
> 工具包路徑：`scratchpad/kit/KaijuTamagotchi-build-kit/`（以下省略）。
> 背景：本專案為手機拉花遊戲（D001、D007、D008、D010、D011），目前最大問題是拉花圖案品質（對照 `rosetta_owner_ref.jpg`）與粗糙的手（Reviewer 4/10）。

## 1. 讀過的檔案

| 檔案 | 行數 | 狀態 |
|---|---|---|
| knowledge/image-gen-lessons.md | 115 | read fully |
| knowledge/3d-gen-preferences.md | 46 | read fully |
| knowledge/blender-game-animation-lessons.md | 390 | read fully |
| knowledge/overlord-character-animation-reviews.md | 205 | read fully |
| knowledge/overlord-quadruped-turning.md | 30 | read fully |
| knowledge/overlord-unity-test-input.md | 29 | read fully |
| knowledge/overlord-upright-locomotion.md | 80 | read fully |
| processes/3d-ai/animation-reference-selection.md | 208 | read fully |
| processes/3d-ai/blender-game-animation.md | 299 | read fully |
| processes/3d-ai/game-animation-polish.md | 105 | read fully |
| processes/3d-ai/higgsfield-cli.md | 60 | read fully |

共 11 檔、1,567 行。另讀了專案 context：CLAUDE.md、TASK、PLAN、TOOLS、DECISIONS、STYLE_BIBLE、ART_DIRECTION。
注意：`image-gen-lessons.md` 與 `3d-gen-preferences.md` 已在本專案 `knowledge/` 有副本（TOOLS.md）。

## 2. 每個檔案的摘要

**image-gen-lessons.md**：fal.ai 生圖的實戰紀錄。API 地雷（edit 要 `image_urls` 陣列、Grok 要 `/text-to-image` 後綴、去背用 `fal-ai/imageutils/rembg`）；owner 的模型組合（Nano Banana Pro + Grok Imagine 2 + Seedream 5 並排比較，每批先問 owner）；品牌名會觸發 422 內容檢查；「探索」與「重現」要分開寫提示詞（風格詞越重，越不像參考圖）；報告格式（深色、單欄大圖、點擊放大）。

**3d-gen-preferences.md**：owner 的 3D 生成偏好。CR1 被否決（"bad"）；固定管線為 Tripo v3.1 高面數（約 30 萬面、4K 貼圖）→ 減面 → xatlas UV → 烘焙到低面數；材質預設用 fal 上的 Patina（owner 最愛、預設必用）；同時出 Tripo 原貼圖與 Meshy 7 重貼圖兩版比較；生成只在 owner 要求時做。

**blender-game-animation-lessons.md**：Overlord（RTS）動畫的長篇教訓。重點：從上方遊戲鏡頭看得出來的轉身（步伐要寬、軀幹先轉）；先核准起始姿勢再生影片參考；骨架問題看起來像權重問題（先查骨頭軌跡）；時間用「間隔」算、不是樣本數；Action 沒 key 的通道會沿用上一個 Action 的值；藝術品質和技術保真是兩個問題；「elbow inward」被誤解的案例（要拿示範姿勢來釐清）；改網格要檢查所有動作片段；Blender 5.1 與 MCP 的實作細節。

**overlord-character-animation-reviews.md**：9/15–9/20 角色評審的整合。保留 owner 的即時修改；動作要從 RTS 鏡頭讀得出來（owner 9/24 重申）；先定好「拿道具的姿勢」再做動作庫；起始姿勢要有目的、相容；步態需要支撐、對側擺臂與身體反應；修整個過渡而不只是終點；owner 直接在 Blender 評審，不要做評審影片；數字通過不等於視覺接受；先擺好手臂解剖姿勢再把道具對到握把。

**overlord-quadruped-turning.md**：狼的 90° 轉身接入 Unity。補充片段分開匯入；導航 yaw 與步伐獨立；轉身結束時用四足的姿勢表做相位比對；0.35 s 有限 SmoothStep 混合；FBX 100 倍縮放造成邊界誤報。

**overlord-unity-test-input.md**：測試用的合成輸入裝置在測試中斷後殘留，導致真實滑鼠鍵盤失效。做法：測試前記錄狀態、所有結束路徑（含失敗、重載）都還原、拒絕重疊的重播、測完一定確認硬體輸入權已歸還。

**overlord-upright-locomotion.md**：雙足單位離開轉身時要比對「目前看得到的腳」來選步態相位；只加長混合時間解決不了領先腳對調的跳動。每個單位校準一次；SmoothStep 0.35 s；舊的 0.22 s 指數曲線讓手臂動得太快。導航不可為了等動畫而延遲。

**animation-reference-selection.md**：用 AI 影片挑動作參考的流程。先決定用途（角色參考或給 mocap 的真人）、鏡頭；owner 先核准起始姿勢，並把那張圖當影片的起始幀；每個動作 2 個 Seedance 2.5 + 1 個 MiniMax H3 Max；用具體階段描述動作；狀態標籤（Selected 綠、Candidate 黃、NEW、History）；拿舊影片當條件會重複舊錯；換演員要用影片當動作來源、圖當外觀。

**blender-game-animation.md**：從檢查輸入到交付的完整 Blender 流程。片段合約表（用途、時長、循環、事件、根運動、骨架）；標準轉身片段；可還原的工作區；蒙皮與壓力測試；先擋大動作與接觸點；從長參考衍生遊戲片段；拋光；Material Preview 交付偏好；可編輯的姿勢參考（Set Pose / Save Pose Reference）；烘焙執行期副本；複製到別的資料夾重新匯入驗證。

**game-animation-polish.md**：參考 Skullgirls GDC 演講改寫的 3D 拋光流程。先鎖合約與基準比較（同鏡頭、同速度）；先設計重要姿勢（剪影測試）；靠間距（spacing）塑造預備→釋放→恢復的節奏對比；主動作與跟隨分開；衝擊強調（drag、smear、放大、overshoot）各有檢查項；恢復要可中斷；hitstop 是引擎層的選擇；視覺評估與技術評估都要記錄。

**higgsfield-cli.md**：Higgsfield CLI 的查詢與續跑指令；保留 job ID，確認失敗前不要重送付費工作；下載輸出（遠端連結不耐久）；預估點數與實際扣款分開記；可沿用本次任務已給的授權。

## 3. 本專案可用的項目

價值：H 高 / M 中 / L 低。建議：**now** 現在採用 / **later** 之後採用（標明階段）/ **skip**。
凡會改到 `js/config.js`、`js/patterns/*` 或手感的項目，由主線執行並請 owner 用手機驗；此表只是建議。

### 3a. 鋼杯動作的可讀性與節奏（A02、TASK §2.8、D011）

| ID | 項目 | 來源 | 在拉花遊戲的具體用途 | 價值 | 前置／成本 | 建議 |
|---|---|---|---|---|---|---|
| K01 | **從遊戲鏡頭看得出來的幅度**：要有目的、看得見的動作；從上方看不出來的小幅度不值得調 | polish §2「RTS amplitude rule」；reviews「Motion must read from the RTS camera」 | 手腕搖晃 ±0.18R 與拉穿要在 70° 俯角、手機尺寸下看得出來；評判用實際鏡頭截圖，不用近拍 | H：直接對應 TASK §2.8「看得見、有節奏」 | 低；sim 截圖用遊戲鏡頭 | now |
| K02 | **轉身要「寬步＋軀幹先轉」才讀得出來**；整個身體原地轉會在俯視鏡頭下消失 | lessons「Standard turns…」；workflow §1 | 搖晃不要只是壺嘴小平移：加壺身旋轉與前臂反向轉動，讓剪影改變；拉穿時壺身明顯傾斜前移 | H：俯視下純平移看起來像沒動 | 低；呈現層 | now |
| K03 | **間距塑造節奏**：預備逐漸累積到可讀的極點，快速轉到動作，恢復用不同節奏；平均分布會讓每段都一樣慢 | polish §3 | 拉莖前的預備動作（TASK §2.8）：慢慢後收/抬高 → 快速拉穿 → 收尾；pattern 關鍵幀的緩動曲線依此設計 | H：讓玩家能預判 | pattern 資料；影響手感，需 owner 手機驗 | now（主線） |
| K04 | **主動作與跟隨分開**：先決定由誰帶動，下游部位延遲反應；不要每個部位都加一樣的正弦擺動 | polish §4；lessons「Gait asymmetry…」 | 前臂帶動 → 手腕 → 壺身 → 奶流有延遲；客人的手：手臂帶動、杯子延遲 | H：讓手看起來活的，修 4/10 的手 | 低；呈現層 | now |
| K05 | **只看終點不夠，要檢查關鍵幀之間**；用連續切線穿過移動中的控制點，不然會「走走停停」 | lessons「Standard turns…」（continuous tangents）；reviews「Repair the whole transition」 | 搖晃與拉穿的插值改用 Catmull-Rom 類連續切線；在 sim 以細時間步取樣落點，找頓點 | H：頓點會直接在流體裡留下痕跡 | 低；pattern.js 插值 | now（主線） |
| K06 | **疊加偏移會讓總方向短暫反轉**：鐘形偏移加在變化的基底上，要分開定義絕對方向並檢查單調 | lessons「Standard turns…」 | 搖晃（左右）疊在後退/拉穿（前後）上時，檢查前後分量是否單調；反轉會讓葉脈打結 | M：可能是圖案品質原因之一 | 低；sim 加一個檢查 | now |
| K07 | **Overshoot 不能比遊戲事件更早接觸** | polish §5；lessons「Partial Actions…」 | 預備動作與拉穿的視覺不能讓奶流比判定時間先落到新位置；客人拍走時，視覺接觸要和杯子被打飛的事件同幀 | M | 低 | later（P4） |
| K08 | **Hitstop 是引擎選擇**：不要把延遲藏在動畫裡，也不要隱性凍結全域時間 | polish §7 | 失敗拍走、成功揭曉的停頓不可暫停流體或判定時鐘，要明確設計 | M | 低 | later（P4） |
| K09 | **恢復要有用、可中斷**：不要拖長的裝飾尾巴；遊戲邏輯擁有時間，不等動畫跑完 | polish §6；locomotion「never delay navigation」 | 無限重來不等待（TASK §2.6）；揭曉 ≤1.5 s；客人的手轉場可跳過、不擋陀螺儀輸入 | M | 低 | later（P4） |
| K10 | **閒置不能完全凍住**（凍住的腿看起來沒生命），但要克制：呼吸、小幅回到前方 | reviews「Weight transfer…」；workflow §6 | ready 畫面拿鋼杯的手加極小的呼吸晃動（位置不動，符合 D001） | M：與 K01 有張力，閒置不是主要動作 | 低 | later |
| K11 | **有限的 SmoothStep 過渡優於指數趨近**；0.22 s 指數曲線讓手臂動得太快，0.35 s SmoothStep 被接受 | upright-locomotion §4；quadruped-turning | 呈現層過渡（鏡頭移近揭曉、客人的手、預備動作淡入）以 0.35 s SmoothStep 為起點；輸入平滑 0.12 s 不在此列 | M | 低 | later |
| K12 | **過渡要比對「目前看得到的姿勢」來選相位**，只加長混合解決不了跳動 | upright-locomotion「Accepted behavior」 | 搖晃 → 拉穿、ready → 開始倒，從當下壺身角度接續，不從固定相位重來 | M | 低 | later |
| K13 | **阻尼彈簧次要動作要先跑幾個循環再取樣**，避免啟動暫態破壞循環 | lessons「Gait asymmetry…」；workflow §6 | 奶流擺動、杯子被拍時的晃動、液面晃動若用彈簧，先預熱 | L | 低 | later |

### 3b. 拿鋼杯的手（手 4/10 的問題）

| ID | 項目 | 來源 | 用途 | 價值 | 前置／成本 | 建議 |
|---|---|---|---|---|---|---|
| K14 | **先定好拿道具的姿勢，再做動作庫**；手要一直握著實物；檢查手腕、手肘的特寫 | reviews「Establish the carry pose…」；workflow §1 | 先做一個正確的「握鋼杯把手」靜態姿勢（四指包住把手、拇指在上、手腕微屈），近拍確認，再衍生搖晃 | H：直接對應目前最弱的素材 | 低；scene3d.js 方塊手 | now |
| K15 | **先擺解剖正確的手臂，再把道具對到握把**；不可反折手肘手腕讓道具朝前；道具掛在獨立的握把節點，可單獨調整 | reviews「Mounted General revision 03」 | 方塊手層級：手臂 → 手 → `gripNode` → 鋼杯（有自己的偏移）；換鋼杯造型只改握把偏移 | H | 低 | now |
| K16 | **模糊的方向詞要拿示範姿勢釐清**：「elbow inward」被誤解成把手肘拉進肋骨 | lessons「Clarify rotation against a demonstrated pose」 | owner 說「手腕再進來一點」時，給 2–3 張截圖選，或請他拍自己拿鋼杯的手；示範即權威 | H：同一位 owner，同樣的說話方式 | 低 | now |
| K17 | **owner 示範的姿勢是權威**，不要因為幾何中心好量就重新置中 | reviews「Mounted General」9/20 follow-up | 若 owner 用調參面板或照片給出手/壺角度，照用，不用演算法「修正」 | M | 低 | now |
| K18 | **可編輯的姿勢參考**（Set Pose／Save Pose Reference／Return）：owner 喜歡自己擺姿勢 | workflow §8b；reviews 9/20 | T004 調參面板之後，加一個除錯用「姿勢編輯」：手腕角、握把偏移、壺身傾角滑桿，存成 JSON 給主線 | M：owner 已證明喜歡直接示範 | 中；一個除錯面板 | later（T004 後） |
| K19 | **先在目的地控制器測粗姿勢，再做昂貴的清理** | workflow §5；polish 前言 | 手的新姿勢先部署到手機看，再細修貼圖與面數 | H | 低 | now |
| K20 | **改網格要重查所有動作片段**（放大的螫針在 Death 穿地） | lessons「Artistic polish…」；polish §8 | 換鋼杯或手的模型（造型）後，重跑每套 pattern 檢查壺嘴與杯緣穿插；**壺嘴位置要是資料**，奶流起點跟著造型走 | H（P5 造型）：不然換造型會讓奶流錯位 | 低；先把壺嘴錨點資料化 | later（設計 now） |
| K21 | **道具的方向要兩個軸**（法線不代表朝上） | reviews「Mounted General」 | 每個鋼杯造型定義 spout-forward 與 up 兩個錨點 | M | 低 | later（P5） |

### 3c. 動作資料、時間與 pattern（A11、PATTERN_GUIDE）

| ID | 項目 | 來源 | 用途 | 價值 | 前置／成本 | 建議 |
|---|---|---|---|---|---|---|
| K22 | **每個 Action 都要 key 所有通道的預設值**；沒 key 的通道切換時會沿用舊值 | lessons「Partial Actions…」「Warrior review」 | 每個 `js/patterns/*.js` 必須明確寫出所有通道（或由 loader 補預設值）；換 pattern 或重來時，鋼杯傾角/高度不可沿用上一杯 | H：A11「動作是資料」的隱性 bug 來源 | 低；loader 驗證 | now（主線） |
| K23 | **用具體階段描述動作**：預備姿勢、重心轉移、出手、跟隨、恢復；寫明真實速度；來源時長和遊戲時鐘分開 | reference-selection §2 | PATTERN_GUIDE 的 keyframe 用命名階段：高位注入 → 降低 → 搖晃 → 拉穿 → 收起；客人的手：進場、放下、放手、離場 | H | 低；寫進 PATTERN_GUIDE | now |
| K24 | **片段合約表**（用途、時長、循環/單次、事件、根運動、骨架） | workflow §1 | 為客人的手三段（放杯/端走/拍走）與鋼杯預備動作各寫一張：時長、事件（杯落定、杯離手、拍擊接觸）、是否可中斷 | H（P4）：便宜且防止動畫與邏輯不同步 | 低 | later（P4） |
| K25 | **時間用間隔算，不是樣本數**：`duration=(last-first)/fps`、`fraction=time/duration`；只改 fps 會改速度 | lessons「Count time intervals…」；workflow §7 | 手機匯出的 30 Hz 傾斜軌跡（T002）與 `?replay=`（T003）：時間戳以秒計，不用索引×固定 dt；重播比例誤差 ±3% 的潛在來源 | M | 低 | now（T002/T003） |
| K26 | **重新計時保留正規化事件**：快 15% = 時長 ÷ 1.15，事件比例不變 | reviews「Gait needs support…」 | LEVEL 流速參數縮放 pattern 時間時，預備動作與拉穿的相對位置不變 | M | 低 | later（P3） |
| K27 | **從長參考衍生短遊戲片段**；動作回到起始姿勢，連發才接得上 | lessons「Reference reconstruction…」；workflow §7 | 倒完回到 ready 姿勢，讓「無限重來」接得順；客人放杯的起始姿勢與上一杯離場銜接 | M | 低 | later |
| K28 | **骨架失敗看起來像權重失敗**：先查骨頭軌跡，再改網格 | lessons「Rig failures…」 | 拉花糊或形狀錯時，先疊加「設計落點軌跡」與「實際注入點」於截圖，確定是動作資料問題還是流體模型問題，再調參 | H：對應 CLAUDE.md §3「三輪不動就換模型」，幫助判斷要換哪一層 | 低；sim 加軌跡疊圖 | now |
| K29 | **參考重建與遊戲動作是兩個交付物**；單一鏡頭無法還原深度，推測的部分要標示 | lessons「Reference reconstruction…」；workflow §1 | 從 owner 照片（或真實拉花影片）推導動作時，標明哪些是觀察到的（路徑形狀）、哪些是推測（鋼杯高度、流量） | M | 低 | now |

### 3d. 評審做法（CLAUDE.md §4、latte-review）

| ID | 項目 | 來源 | 用途 | 價值 | 前置／成本 | 建議 |
|---|---|---|---|---|---|---|
| K30 | **基準與候選並排，同時長、同鏡頭、同光線、正常速度決定**；慢動作只用來解釋 | polish §1、§8 | Reviewer 比較 rosetta 版本時，同一個 seed、同一個時間點的截圖並排（contact_sheet.py），再加 owner 參考照 | H | 低；sim 固定 seed | now |
| K31 | **視覺評估與技術評估分開記錄**；數字通過不等於視覺接受；agent 評估不是 owner 核准 | polish「Pass record」、§8；reviews「Review and delivery habits」 | Reviewer 報告分「視覺」「技術」兩段；與我們的 implemented / agent-verified / pending owner 一致 | H：強化既有規則 | 很低 | now |
| K32 | **不要偏好最新一版**；保留候選，讓 owner 的選擇決定；更多條件不代表更好 | lessons「Starting poses…」；reference-selection §3 | 圖案迭代保留前幾版截圖與參數；新版不自動取代 | M | 低 | now |
| K33 | **狀態標籤**：Selected（綠）、Candidate（黃）、NEW、History；名稱固定；不刪舊檔 | reference-selection §3 | 風格框（A1）、造型、pattern 版本給 owner 挑時使用；顏色要在 owner 實際看的地方（手機）確認 | M | 低 | later（A1） |
| K34 | **保留已接受的版本與命名備份**；成功版改用乾淨名稱；只有授權才刪被否決的 | reviews「Review and delivery habits」 | `rosetta.js` 被接受的參數留快照；tulip 已保留為 `?pattern=tulip`（D011）是同一做法 | M | 低 | now |
| K35 | **保留使用者的即時修改**：硬碟上的檔案可能比使用者的現場修正還舊 | reviews「Preserve the user's model and live edits」 | T004 調參面板：owner 存在手機上的值是權威；部署新預設值不可悄悄蓋掉；owner 回報的數字先記進 STATE 再改 config | M | 低 | now（T004） |
| K36 | **owner 在自己的工具裡評審；除非要求，不做評審影片或圖庫**；內部 contact sheet 可以 | reviews「Review and delivery habits」 | owner 在手機上評審；不要主動做影片或 HTML 圖庫；Reviewer 用 contact sheet | M | 無 | now |
| K37 | **先完成主版本，再轉到變體** | reviews「Review and delivery habits」（Classic 再 Pyro） | 先把 rosetta 做到 ≥7/10，再做愛心、鬱金香、天鵝；造型先做一款鋼杯再複製 | M | 無 | now |

### 3e. 測試輸入與重播（T002、T003）

| ID | 項目 | 來源 | 用途 | 價值 | 前置／成本 | 建議 |
|---|---|---|---|---|---|---|
| K38 | **合成輸入不可殘留**：測試前記錄狀態；正常結束、失敗、重載時都還原；拒絕重疊重播；測完確認真實輸入權已歸還 | unity-test-input | `?replay=` 與桌機模擬注入的假 deviceorientation：只在 URL 旗標下啟用；畫面顯示「REPLAY」標記；重播不寫入 localStorage 的設定與調參值；結束後移除監聽器；一次只能跑一個重播 | H：重播殘留會汙染 owner 的手機數據與設定 | 低；T003 設計時納入 | now（T003） |
| K39 | **在使用者實際看的環境確認**（主題會把綠色重新上色） | reference-selection §3 | 顏色與 UI 在手機上確認（adb 截圖或 owner 截圖），不只看桌機 | M | 需 adb | later |

### 3f. 生圖（A1 風格框、背景、造型、剪影）

| ID | 項目 | 來源 | 用途 | 價值 | 前置／成本 | 建議 |
|---|---|---|---|---|---|---|
| K40 | **先決定是「探索」還是「重現」**：風格詞重 → 不像參考；重現要拿掉風格詞、用 "recreate the exact X, do not redesign" | image-gen「Style keywords vs reference fidelity」 | A1 風格框 = 探索（可用風格詞）；依 `Docs/concepts/approved/style/` 做背景/造型 = 重現（只描述要保留的特徵）；拉花本身是流體算的，不生圖 | H | 需 FAL_KEY 與預算上限 | later（A1） |
| K41 | **提示詞不放品牌名**：品牌會在生成前觸發 422，`safety_tolerance` 也繞不過 | image-gen「Prompt-side content checker」 | 咖啡機造型寫 "chrome lever espresso machine"，不寫 La Marzocco；鋼杯不寫品牌 | H：造型是 P5 主要內容 | 無 | later（已記在 ART_DIRECTION） |
| K42 | **模型組合並排、每批先問 owner** | image-gen「Model rotation」 | 生風格框前提醒 owner 目前組合（NB Pro + Grok Imagine 2 + Seedream 5），讓他選 | H：owner 明確要求 | 無 | later |
| K43 | **API 地雷**：edit 要 `image_urls` 陣列；Grok 要 `/text-to-image`；去背 `fal-ai/imageutils/rembg`（bria 404）；`fal_client.upload_file` | image-gen「API specifics」 | 造型與剪影素材去背；以 owner 的照片做 edit | M | FAL_KEY | later |
| K44 | **並行生成（5+ workers）、一定存遠端 URL 到 results.json** | image-gen「Always parallel」「Always save remote URLs」 | 一批造型/背景一起跑；edit 流程需要 URL | M | 低 | later |
| K45 | **參考圖預設中灰背景**；「clean shape language, readable silhouette」；60/30/10 配色比 | image-gen「Prompt defaults」 | 造型參考圖用中灰底，去背與做黑剪影都較容易；剪影可讀性提示詞直接對應「未取得顯示黑剪影」 | M | 低 | later（P5） |
| K46 | **生圖結果要縮成本專案的像素規格**（工具包預設的 "stylized 3D UE5 render" 錨點與我們的風格相反） | image-gen「Style anchoring」對照 STYLE_BIBLE | 錨點改寫成：low-poly faceted, low-res pixel texture, soft realistic light, near top-down；生成後縮到 ≤64 px、最近鄰、限制調色盤 | M | 低 | later |
| K47 | **報告：單欄大圖、每張圖可點開原尺寸** | image-gen「Variant grid UX」 | 給 owner 挑風格框/造型時的比較頁 | M | 低 | later（A1） |

### 3g. 3D 素材管線與付費生成紀錄

| ID | 項目 | 來源 | 用途 | 價值 | 前置／成本 | 建議 |
|---|---|---|---|---|---|---|
| K48 | **Patina 是材質預設**（owner 最愛） | 3d-gen-preferences「Texturing」 | P5 造型（鋼杯表面、手套布料）若用生成材質，先用 Patina，再縮成 32–64 px 像素貼圖 | M：與 D008（程式畫貼圖）並存，只在程式畫不出時用 | FAL_KEY、預算 | later（P5） |
| K49 | **高面數生成 → 減面 → UV → 烘焙** | 3d-gen-preferences「Mesh generation」 | 只有手（A2）可能用；目標面數要從 5–9k 改成 ≤1,000（D008），且烘焙後重做像素貼圖 | L：與 D008 衝突，需 owner 決定 | Blender、FAL_KEY | later（A2，需確認） |
| K50 | **兩種貼圖路線都出、並排比較** | 3d-gen-preferences「Texturing」 | 若做 A2 的手：Tripo 原貼圖 vs 程式像素貼圖兩版給 owner 選 | L | 同上 | later |
| K51 | **付費工作紀錄**：保留 job/request ID；等待逾時不代表失敗，先查再重送；下載輸出（遠端連結不耐久）；預估點數和實際扣款分開記；沿用本任務已給的授權 | higgsfield-cli「Discover and resume」 | 移植 `tools/ledger.py` 時套用到 fal：每次生成記錄模型、request ID、輸入、本地路徑、費用；輸出存進 repo | M | 低 | later（第一次付費生成前） |
| K52 | **交付驗證要真的載入**：複製到別處測試，避免從舊路徑解析到貼圖；強制載入像素確認尺寸 | lessons「Texture validation…」；workflow §10 | 加入 glTF/PNG 素材時，用部署後的 GitHub Pages 網址驗證（Pages 路徑大小寫敏感，macOS 不敏感）；載入後確認 NearestFilter、尺寸、三角形數 | M | 低 | later（第一個外部素材時） |
| K53 | **Blender MCP 操作**：不保留 globals；長呼叫逾時時 Blender 可能還在跑，重試前先查；腳本存檔；改用目前暴露的 MCP 工具 | lessons「Blender MCP fallback」 | 若 A2 用 Blender MCP 減面/匯出手部模型 | L | 安裝 Blender | later（A2） |
| K54 | **交付的 .blend 要能以 Material Preview 看到真材質**（EEVEE、studio HDRI） | workflow §8a | 若交給 owner 看 .blend 檔 | L | Blender | later（A2） |

### 3h. 動作參考（真實拉花的動作）

| ID | 項目 | 來源 | 用途 | 價值 | 前置／成本 | 建議 |
|---|---|---|---|---|---|---|
| K55 | **先核准起始姿勢，並用那張圖當影片起始幀** | reference-selection §1–2；lessons「Starting poses…」 | 若生成「俯視倒 rosetta」或「客人的手放杯」參考影片：先給 owner 核准第一幀（手、鋼杯、杯子、俯視角） | M | 影片生成費用 | later |
| K56 | **鏡頭依用途決定**；開批前記錄用途、鏡頭、起始姿勢 | reference-selection §0 | 動作時序參考用接近遊戲的俯視；手部外形參考用 3/4 視角 | M | 無 | later |
| K57 | **每個動作 2 Seedance 2.5 + 1 MiniMax H3 Max**；確認確切模型 ID | reference-selection §2 | 若生成客人的手三段參考影片時的起始配方（需先確認 fal 上有沒有） | L：也可以直接用真實拉花影片當參考，更準 | 費用 | later |
| K58 | **拿舊影片當條件會複製舊錯**；改用起始圖＋特定中間姿勢 | reference-selection §3 | 若用 image edit 改造型時，舊圖的錯誤會被帶進新圖，同理 | L | 無 | later |

## 4. 這些檔案裡 owner 的偏好與品味

生圖：
- 概念探索的固定組合：「`nano-banana-pro` + `grok-imagine-2` + `seedream-v5-pro`, same prompt, side-by-side」（2026-08-20）。
- Grok Imagine 2：「the owner rates it above GPT-Image-2 and it can occasionally REPLACE Nano Banana Pro as the lead」。GPT-Image-2 降級，只在需要大膽風格時用。
- 「**Always ask the owner which models to run** for a new generation batch … don't silently assume.」
- 參考圖背景：「solid medium gray」；不要白（太亮）、不要深（藏剪影）、不要花紋；白色只在要求時。
- Kaiju 的風格錨點是 "stylized 3D Unreal Engine 5 render, non-photoreal, not cartoon"（**本專案已由 D007 改成低面數＋像素貼圖，不可沿用**）。
- 報告：深色（#0a0a0c）、粉色強調（#f0a0b0）、Inter 字型；單欄大圖、點擊放大；「Small thumbnails are useless for reviewing」；分頁標籤要完整名稱。
- 速度：「Sequential generation is unacceptably slow」。

3D：
- CR1 被否決：「bad」。
- 固定管線 Tripo v3.1 高面數＋自帶貼圖 → 減面 → UV → 烘焙；「quality first」。
- 「Default for textures/materials: **Patina on fal.ai — mandatory unless the owner explicitly says otherwise**」；Patina 是 owner 的最愛；不要把它和 Meshy 重貼圖搞混。
- 喜歡的實驗形狀：同時出 v3.1 貼圖版與 Meshy 7 版比較。
- 「The owner builds the MAP himself — generations happen when he asks」：生成由他決定時機，偏好只是為了不必每次重問模型。

動作與評審：
- 「favor visible, purposeful body and limb dynamics from the elevated game camera. Small movements that only read in a close-up are usually not worth a separate polish pass」（9/24）。
- 否決過：同側手腳擺動（Urs）、拖長的凍結預備姿勢（Scorpid「long frozen brace」）、真人 mocap 第一版（鏡頭與站姿被偷改）、射手 16 支真人重做（「too human」）、會覆寫他手動修改的自製解算器、可被選到的扭轉輔助骨。
- 喜歡並要求延續：直接 FK 姿勢控制、Set Pose／Save Pose Reference；「Treat the owner's demonstrated fitting as the authority」。
- 用詞可能很簡短：「elbow inward」實際指「自然下垂、掌心朝前」；要用示範姿勢釐清。
- 「The owner reviews directly in Blender」；「Do not make review videos or add a Blender Review gallery unless requested」。
- Blender 視窗要保持開著，透過 MCP 在原檔儲存，不要重開或搶前景。
- 交付 .blend 一律 Material Preview＋studio HDRI。
- 狼的攻擊接觸點要求在 75–80%；0.22 s 指數過渡「moved the arms too quickly」，0.35 s SmoothStep 被接受。
- 動作參考：先核准起始姿勢；每動作 2 Seedance 2.5 + 1 MiniMax H3 Max；先在角色上試、選好再做真人版；換真人用 Seedance 2.5 Video Edit（「standing decision … not an unresolved choice to ask again」）。
- 先做完主版本再做變體（Classic 先，再 Pyro）。
- 保留已接受版本與備份；只有他授權才刪被否決的。
- 已經決定的路線不要重複問：「these are planning decisions, not repeated approval gates」；「Do not turn this reminder into repeated approval requests」。
- 會主動要求把教訓寫下來（多處「added … with the owner's explicit request to preserve the lessons」），也會請 agent 研究 GDC 演講來改進流程（Skullgirls）。
- 付費：「Reuse authorization already given for the current task」；預估點數與實際扣款分開。

## 5. 不適用

- **骨架、蒙皮、權重清理、IK、FBX/GLB 骨架匯出驗證**（lessons 多節、workflow §3–4、§9–10）：D007/ART_DIRECTION 明定不用骨架；手是固定姿勢的方塊剛體。
- **四足與雙足轉身、步態相位表、Unity 接入**（quadruped-turning、upright-locomotion 的實作細節）：我們沒有行走角色、不用 Unity；只取「比對目前姿勢」與「SmoothStep 0.35 s」的概念（K11、K12）。
- **Unity Editor 輸入裝置、SessionState**（unity-test-input 的實作）：我們是網頁；只取「合成輸入不可殘留」原則（K38）。
- **Mixamo 取得、Dryad、Mounted General 的具體骨頭與幀數**：角色專屬數值。
- **真人 mocap、QuickMagic、Seedance 換演員流程**（reference-selection §5）：我們沒有要捕捉的人體動作。
- **Nano Banana Pro 同人創作（`safety_tolerance: "6"`、web search）**：我們不做 IP 同人圖。
- **Higgsfield CLI 指令本身**：TOOLS.md 已決定以 fal 為主；只取付費紀錄原則（K51）。
- **Workspace／React 儀表板慣例**（`workspace/YYYY-MM-DD_slug`、localhost:3009）：我們用 `Docs/reviews/`、`Docs/progress/`。
- **UE5 風格錨點、5–9k 面的道具目標**：與 D007、D008（≤1,000 面、像素貼圖）衝突。
- **Blender 5.1 API 細節（action slot、preview range、Bone.vector）**：只在 A2 真的用 Blender 時才回頭查。
