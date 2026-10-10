# STATE（整份重寫，不 append；60 行以內）
更新：2026-10-10 · 線上版本 v1010-1337 · 階段 P0 工作流基礎 + A0 3D 呈現

## 現在
**v1010-1337：一次倒完不中斷（D010）、預設圖案葉子 rosetta（D011）、瞄準輔助只縮小玩家誤差（D012）。** 鬱金香在 ?pattern=tulip。
3D 呈現（D007）已上線：three.js r170、程式生成的稜角杯子/杯盤/鋼杯/手、canvas 像素貼圖、流體 72 格液面、杯子隨手機傾斜、揭曉鏡頭拉近。2D 在設定裡可切回。
奶泡分層（D009）：每段注入一個層 id，相遇處畫咖啡色線；完美操作下是有層次的鬱金香。
版本號（T001）：右下角 v1010-1232；tools/stamp.sh 寫 import map 破 Pages 快取。
Reviewer r2（Docs/reviews/review-2026-10-10-style-r2.md）：幾何 7、貼圖 5、光影 7、色調 6、拉花 5、手 4、整體 6。r2 後已改：顆粒加強（grain 1.6）、奶流變細變奶油色並漸細。

## 下一步（照順序）
1. owner 手機試玩 v1010-1337：3D 與 2D 比較手感（T020）、fps（設定 › 顯示除錯數據）
2. T002 複製數據 + T003 重播（手感數據回流）
3. T018 葉子大小、中間的莖、底端咖啡色洞
4. T019 手的造型（Reviewer 最低分 4）

## 等 owner
- 手機試玩 v1010-1337 的回報（版本號要對）

## 死路（不要再試）
- claude.ai Artifact 放遊戲：裝置動作 API 被封鎖（D003）
- gstack headless 測 WebGL：沒有 WebGL2，要 browse connect --force-restart
- 高斯推開場求分層：調不出來；1/r 推開 + 層 id 才行（D009）
- 金屬度高但沒有環境貼圖：鋼杯會變黑
- python urllib 抓 https：這台沒 CA 憑證，用 curl

## 健康
sim（手機尺寸 390×844，rosetta）：auto 100% · hand=1 100/89/92% · hand=1&play=1 100/98/100% · 2D 100% · console 無錯
3D 效能（桌機）：5 次繪製、約 540 三角形、60 fps · 手機 fps 未量
