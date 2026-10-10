# STATE（整份重寫，不 append；60 行以內）
更新：2026-10-10 · 線上版本 v1010-1446 · 計畫 v3（Docs/PLAN.md）

## 現在
等 owner 回覆 `Docs/KIT_ADOPTION.md` 的 16 個決定（Q1–Q16）。計畫 v3 依這些決定排序。
本 session 完成：工具包全文審閱（Docs/kit-review/01–04）、Blender 管線與 Blender MCP（D013）、工具移植、文件矛盾修正。
遊戲：一次倒完的葉子（D010–D012）、Blender 素材（杯、鋼杯＋手、桌面）、程式版備用（?assets=0）。

## 下一步（照順序，依 owner 決定）
1. Q-0 量測工具：?shot= 成形條、checks.json、覆蓋/對稱/葉數/莖長、核准版截圖比對（Q3、Q5）
2. F-0 數據回流：T002 複製數據、T003 重播、T004 調參面板（Q9）
3. Q-1 參考：葉子照與俯拍倒奶影片（Q2，需 owner 或我找授權影片）
4. A-2 手的姿勢頁（Q8）

## 等 owner
- KIT_ADOPTION.md 的 Q1–Q16
- 手機試玩 v1010-1446（右下角版本要對）：葉子、Blender 素材、搖晃看起來是不是手在跳
- Q10 要用 fal 的話：金鑰與預算上限；Q15：adb 加 PATH、Pixel 接線

## 死路（不要再試）
- claude.ai Artifact 放遊戲：裝置動作 API 被封鎖（D003）
- gstack headless 測 WebGL：沒有 WebGL2，要 browse connect --force-restart
- 高斯推開或噴流求葉形：只會捲成兩瓣蝴蝶；要輸送帶模型（D011）
- 雙側分層線：細葉變棕色網格；要單側一格（D011）
- 金屬度高但沒有環境貼圖：鋼杯會變黑
- python urllib 抓 https：系統 Python 沒憑證；用 curl 或 .venv

## 健康
sim（390×844、rosetta、Blender 素材）：auto 100% · hand 91% · play 100% · 2D 100% · ?assets=0 100% · console 無錯
3D：5 次繪製、約 510 三角形 · 手機 fps 未量 · tools/check_env.py：只缺 FAL_KEY、手機連線
