# TODO（一行一項，ID 在前；做完移到 Docs/archive/TODO_DONE.md）
# 格式：- [ ] T### P0|P1|P2 A## <做什麼> · 檢查 <怎麼驗>

- [ ] T001 P0 A13 畫面右下角顯示 build 版本；tools/stamp.sh 寫 js/version.js · 檢查 手機上看得到 hash
- [ ] T002 P0 A14 揭曉頁「複製數據」匯出一次倒的 JSON（版本、設定、裝置、fps、Hz、比例、傾斜與落點軌跡）· 檢查 貼回來能解析
- [ ] T003 P0 A14 ?replay=<id> 桌機重播手機 JSON；tools/sim.sh replay 印比例 · 檢查 與手機比例差 ≤ 3%
- [ ] T004 P0 A14 設定「進階」調參面板：飄移幅度/速度、輔助、甜蜜點寬、靈敏度，即時生效 · 檢查 owner 滑桿能找到好玩的值
- [ ] T005 P0 -- Docs/ACCEPTANCE.json 從 TASK §3 產生；tools/sim.sh 截圖存 Docs/progress/ · 檢查 檔案存在
- [ ] T006 P0 A10 Docs/concepts/approved/ 放 3–5 張真實鬱金香拉花參考照（owner 提供或 CC 授權）· 檢查 README 說明每張用途
- [ ] T007 P0 A10 Reviewer 子代理對現在的完美操作截圖打分、列三個最糟缺點 · 檢查 Docs/reviews/ 一份
- [ ] T008 P1 -- .claude/hooks/reanchor.sh：SessionStart 印 STATE、TODO 前 10 行、git log · 檢查 /hooks 看得到
- [ ] T009 P0 A14 P1 第一輪：owner 手機 5–10 杯回傳數據，重播分析手抖頻譜與偏移 · 檢查 Docs/replays/ 有檔、DEVLOG 一行
- [ ] T010 P1 A03 候選：飄移改加速度模型（D004 的例外試驗），只在 owner 說不像端杯子時做 · 檢查 owner 比較兩版
- [ ] T011 P1 A10 甜蜜點縮回偏上一小塊、圖案前後位移改用高度與流量表達 · 檢查 auto 截圖仍是四層鬱金香
- [ ] T012 P1 A11 Docs/PATTERN_GUIDE.md 動作資料寫法與自驗標準 · 檢查 子代理照它能寫出愛心
- [ ] T013 P0 -- A0 3D 灰盒：three.js 場景、程式生成杯子/杯盤/鋼杯、杯子隨手機傾斜、液面貼流體、設定切 2D/3D · 檢查 owner 手機比較兩版，記 D007
- [ ] T014 P1 -- A1 風格框三方向各兩張 · 檢查 owner 選定，放 Docs/concepts/approved/
- [ ] T015 P1 -- A2 拿鋼杯的手：概念圖 → 圖轉 3D → Blender → glTF → 遊戲 · 檢查 手機上顯示、fps 不掉
- [ ] T016 P1 -- 寫 latte-assets 技能與 tools/ledger.py（D007 決定後）· 檢查 check_env 列出
- [ ] T017 P0 -- owner 設定：FAL_KEY 與預算上限、Blender 安裝、Pixel USB 偵錯、iPhone 網頁檢閱器、Weave 連結 · 檢查 tools/check_env.py 全 OK
