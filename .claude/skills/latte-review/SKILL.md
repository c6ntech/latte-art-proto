---
name: latte-review
description: 拉花成品的視覺評審 — 用新 context 的子代理把遊戲截圖和 Docs/concepts/approved/ 的真實拉花照片比對，打分並列出三個最糟的缺點。任何改動流體、動作資料或呈現層之後、宣稱「圖案變好」之前使用。主線不自己評分。
---

# 拉花視覺評審

主線改了東西後，開一個**新的** general-purpose 子代理（不要 fork，不要把你的結論給它），任務卡如下：

```
車道：review-<日期>-<主題>
輸入：
  - 遊戲截圖：<路徑，最多 6 張>
  - 參考照：Docs/concepts/approved/*（README 說明每張用途）
先做：python3 tools/contact_sheet.py "<截圖 glob>" --out Docs/reviews/<車道>_game.jpg
      python3 tools/contact_sheet.py "Docs/concepts/approved/*.jpg" --out Docs/reviews/<車道>_ref.jpg
只看這兩張合成圖。
評分（各 1–10，對照參考照）：
  1. 層次：每一瓣有沒有分開，中間有沒有咖啡色線
  2. 邊緣：白與咖啡的交界是否清楚、有沒有淡棕色邊
  3. 形狀：整體像不像鬱金香（對稱、上寬下窄、層數）
  4. 莖：有沒有一條白色的莖或切口
  5. 質感：像不像真的奶泡（不是塑膠、不是霧）
  6. 失敗時：糊掉的那杯是否「看得出是哪一段糊」
輸出：Docs/reviews/<車道>.md：分數表、三個最糟缺點（每個一句「看到什麼」+ 一句「可能是哪個參數或模型」）。
不做：不改程式、不改參數、不判斷手感或難度。
回覆：15 行內。
```

## 主線拿到結果後

- 平均 < 7：先修最糟的那一個缺點，再評一次。不要同時修三個。
- 把分數記進 DEVLOG（日期、版本、平均分）。
- 沒有參考照（`Docs/concepts/approved/` 空）就不能評；先完成 TODO T006。
