# STATE（整份重寫，不 append；60 行以內）
更新：2026-10-10 · commit 5a4f56e（程式）· 文件、hooks、技能尚未 commit（等 owner 看過）· 階段 P0 工作流基礎

## 現在
本 session 完成：
- 文件骨架：CLAUDE.md、Docs/TASK.md、RETRO.md、PLAN.md（含美術軌道）、DECISIONS.md、TODO.md、TOOLS.md、ART_DIRECTION.md、DEVLOG.md
- 專案 hooks（.claude/settings.json）：SessionStart 重新定位、PostToolUse JS 語法檢查、SubagentStart 車道合約。三個都用真實輸入測過。
- 專案技能：latte-loop、latte-review、fal-ai-generation（從工具包複製）
- tools/：sim.sh、contact_sheet.py、check_env.py；knowledge/ 兩份 owner 既有偏好；.mcp.json.example（fal、Blender）
線上版本：https://c6ntech.github.io/latte-art-proto/ = commit 5a4f56e。
owner 最後回報：「還是太難了」（10-09，版本未確認）。

## 下一步（照順序）
1. T001 版本號 + T002 複製數據 + T003 重播
2. T004 手機端調參面板
3. T013 A0 3D 灰盒（呈現層，和 P1 並行）
4. T009 請 owner 玩 5–10 杯回傳數據

## 等 owner
- D007 美術方向（建議 3D-lite，見 ART_DIRECTION.md；建議先看 A0 再定）
- T017：FAL_KEY 與預算上限、同意裝 Blender、Pixel USB 偵錯、iPhone 網頁檢閱器、Weave 連結
- T006：3–5 張真實鬱金香拉花參考照

## 死路（不要再試）
- claude.ai Artifact 放遊戲：裝置動作 API 被封鎖（D003）
- gstack headless 測 WebGL：沒有 WebGL2，要 `browse connect --force-restart`
- 高斯推開場調參求分層：調不出來，1/r 才行
- python urllib 抓 https：這台的 python.org Python 沒裝 CA 憑證，用 curl

## 健康
tools/check_env.py：node、gh、ffmpeg、browse、Pillow、Pages、hooks、skills OK；缺 Blender、FAL_KEY、fal_client、手機連線、參考照
sim：auto 100% · hand=1 100/72/93% · hand=1&play=1 98/100/98% · 手機 fps 未量
