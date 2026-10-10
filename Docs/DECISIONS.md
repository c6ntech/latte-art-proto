# DECISIONS（只增不改；一筆 6 行以內；用 grep 找）
# 格式：## D### · 日期 · 標題 / 為什麼 / 否決了 / 影響

## D001 · 2026-10-08 · 鋼杯與手固定不動，難度在杯子本身難平衡
為什麼：owner：「拉花的手、位置不應該跳來跳去，而是固定在一個地方，是杯子很難平衡，需要用手機陀螺儀去接的感覺。」
否決了：原需求第 3 點「鋼杯左右擺動時杯子要跟著移動」。
影響：`js/patterns/*` 的 x 固定 0；`TUNING.balance` 飄移；TASK §2.2–2.3。

## D002 · 2026-10-09 · 要順暢簡單、過得了關，圖案要自然出現
為什麼：owner 兩次手機實測都說幾乎不可能過。
做法：飄移放慢放小、甜蜜點放大、死區與平滑、瞄準輔助 30%、推開改 1/r 讓層次自然疊出。
影響：`TUNING`、A14 的通過率標準、P1 的工作流（手機數據回流）。

## D003 · 2026-10-08 · 部署走 GitHub Pages（公開 repo c6ntech/latte-art-proto）
為什麼：claude.ai Artifact 對所有觀看者封鎖裝置動作 API，陀螺儀不能用；Pages 是 https、推完 60 秒上線。
否決了：Artifact、Vercel/Netlify（沒裝 CLI）。
影響：所有測試網址；repo 公開。

## D004 · 2026-10-08 · 角度對應位置，不是速度；飄移加在位置上
為什麼：owner 原需求明定。飄移若改成加速度會更像「平衡」但違反這條，列為 P1 的候選試驗，不先做。
影響：`cupFromTilt`、`TUNING.balance`。

## D005 · 2026-10-10 · 手感只在手機上判斷；桌機模擬只做回歸與難度區間
為什麼：兩次「太難」都來自桌機調參沒有手的雜訊。
做法：揭曉頁匯出 JSON、桌機 `?replay=` 重播、畫面顯示版本號、一次只改一個參數。
影響：CLAUDE.md §2–3、PLAN P0–P1。

## D006 · 2026-10-10 · 工作流採用 Kaiju 工具包的文件骨架，不採用無人長跑的部分
為什麼：owner 在迴圈裡、迭代短；需要的是狀態檔、決策紀錄、驗收證據、Reviewer 分離，不需要 30 小時時鐘與 Stop hook。
影響：`CLAUDE.md`、`Docs/` 結構、`tools/sim.sh`。

## D007 · 2026-10-10 · 呈現：3D 低面數 + 像素貼圖，接近俯視的 2.5D
為什麼：owner 提供 4 張參考圖並指定「這種視覺風格、接近俯視的 2.5D」。也讓杯子能跟手機一起傾斜，幫手感。
做法：three.js r170（vendor/）、程式生成的稜角模型、canvas 畫的像素貼圖、流體輸出 72 格當液面貼圖；2D 保留為設定裡的備用。
否決了：純 2D、預渲染圖片、完整 3D（骨架動畫與 3D 流體）。影響：`js/scene3d.js`、`Docs/STYLE_BIBLE.md`、A10、A17。

## D008 · 2026-10-10 · 素材以程式生成為主，AI 圖轉 3D 退為備用
為什麼：這個風格要的是極少的面與像素貼圖；Tripo 等工具輸出高面數平滑模型，和風格相反，且要減面與重新貼圖。
做法：旋轉體與方塊在程式裡生成；貼圖在 canvas 上畫。只有程式做不出的複雜物件才走生圖或圖轉 3D，且要減到 1,000 面內並重新做像素貼圖。
影響：Blender、FAL_KEY 從「必要」降為「之後需要時」；`Docs/ART_DIRECTION.md`、`Docs/TOOLS.md`。

## D009 · 2026-10-10 · 奶泡分層靠「每次注入一個層 id」
為什麼：同一個奶量通道裡，奶落在奶上沒有邊界，鬱金香的四層會融成一塊。
做法：染料改兩個通道（奶量、層 id）；每段注入換一個 id；顯示時兩個 id 相遇處畫一條咖啡色線。2D 與 3D 都適用。
影響：`js/fluid.js` 的 splat 與 display、`TUNING.pour.layerIds`、`TUNING.sim.layerLine`。

## D010 · 2026-10-10 · 一次倒完不中斷，圖案在倒的過程中於杯子中央成形
為什麼：owner：「奶泡鋼杯不要倒牛奶下去又再收起來，而是一直倒不要停完成拉花，目標就是倒的過程在中間拉花」。
做法：動作資料的流量從開始到收尾不歸零；高拿（h 高）奶沉下去表面不變白、幾乎不推開（`sinkH`、`pushMinSurf`）；分層靠高度節奏或資料裡的 `L`。
影響：`js/patterns/*`、`main.js` 注入、`pattern.js` 預備動作（只在長距離移動時）。

## D011 · 2026-10-10 · 預設圖案改為葉子（rosetta），不要鬱金香
為什麼：owner 提供照片並說「不要鬱金香，畫一個這樣的」（`Docs/concepts/approved/latte/rosetta_owner_ref.jpg`）。
做法：手腕左右小幅搖晃（±0.18R，手的位置不動）邊往鋼杯方向退，再往玩家方向拉穿。流體加「輸送帶」：壺嘴前方窄帶的奶泡往前帶，不經壓力投影（不會捲成兩個渦）。
分層線改成單側一格寬；新注入的奶擁有落點表面的層 id。鬱金香保留為 `?pattern=tulip`。
影響：`js/patterns/rosetta.js`、`fluid.js`（conveyor、splat、display）、`TUNING.pour`。

## D012 · 2026-10-10 · 瞄準輔助只縮小玩家誤差，不縮小鋼杯本身的動作
為什麼：舊做法把落點往甜蜜點中心拉 30%，連鋼杯的設計動作也縮小，圖案被壓小、搖晃被吃掉。
做法：落點 = 設計落點 + 玩家誤差 ×（1 − assist）。強度不變，所以對玩家的難度不變。
影響：`main.js` 注入段；模擬：hand 100/89/92%、play 100/98/100%。

## D013 · 2026-10-10 · 素材改用 Blender 設計（取代 D008 的「程式生成為主」）
為什麼：owner：「use blender to design all relevant assets for the project」。
做法：`art/blender/build_assets.py`（背景 Blender 腳本，可重跑）產生 `assets/models/*.glb`、`art/textures/*.png`、`art/previews/*.png`、可編輯 `.blend`；
遊戲載入 GLB 取代程式版，載入失敗時保留程式版（`?assets=0` 強制程式版）。風格規則不變（STYLE_BIBLE：低面數、像素貼圖、最近鄰）。Blender MCP 已裝供互動調整。
取代：D008。影響：`js/scene3d.js`（loadAssets）、`tools/stamp.sh`（import map 加 three）、Docs/TOOLS.md、ART_DIRECTION.md。
