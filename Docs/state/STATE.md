# STATE（整份重寫，不 append；60 行以內）
更新：2026-10-10 · 線上版本 v1010-1545 · 計畫 v3 · KIT_ADOPTION 全部採用（D015）

## 現在
導引式模擬上線（D014）：完美倒法形狀相似度 0.99（之前 0.15）；出界照樣糊（壞的 0.47）。評審 3.86 → 5.29 → 5.71。
前後對照：Docs/runs/（checks.json）、Docs/reviews/review-2026-10-10-rosetta-r1/r2.md、Docs/progress/2026-10-10/before|after。
新工具：tools/shot.sh、latte_metrics.py、make_target.py、?replay=、?pose=1、複製數據按鈕。

## 下一步（照順序）
1. 等 owner：目標圖要不要換或修（評審說葉片少、底部無莖是目標圖本身的限制）；手機試玩 v1010-1545 與回傳數據
2. Q-3 第三輪評審（換目標圖後）→ 達標就凍結（Q6）
3. F-2 手機輪：用 owner 回傳的數據重播調參
4. A-2 owner 用 ?pose=1 擺手，結果存 assets/poses/hand.json

## 等 owner
- 目標圖：照原照片、或用 Docs/concepts/approved/latte/rosetta_ref_01–08 其中一張、或我畫一張對稱的
- Q10：fal 金鑰與上限（建議 USD 20），風格框才能開始
- 手機：玩 5 杯貼「複製數據」；?pose=1 擺手後按「複製姿勢」貼回來

## 死路（不要再試）
- Artifact 放遊戲（陀螺儀被封鎖）· headless 測 WebGL · 高斯推開/噴流求葉形 · 雙側分層線 · 金屬沒環境貼圖
- 導引用平均品質（壞倒法會被修好）· 沉奶算覆蓋（葉子提早出現）· 直線揭露前緣（假的水平切線）
- python urllib 抓 https（用 curl 或 .venv）

## 健康
shot.sh：完美 match 0.99 · 手持 不修正 68/94/95% · 模擬玩家 94/95/97% · 重播誤差 0.1% · 2D、tulip、?assets=0 正常 · console 無錯
