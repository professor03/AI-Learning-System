# 功能與驗證紀錄（2026-09-07）

本次從 GitHub main 的 dd084ef 建立工作副本。

## 已實作

- AI 的筆記、測驗、聊天室、研究構想、讀書計畫與批次卡片統一經 Node 後端代理。
- LearnSight 儲存已結束時段摘要；兩個頁面共用歷史、匯出與清除功能。
- 固定離線教材、三題測驗與四張記憶卡，可用於展示與可重複的 UI 測試。
- 修正 FSRS-style 使用過期 elapsed_days、複習視窗未映射 lastReview，以及複習結束紀錄少算最後一題 XP 的問題。
- 驗證 AI 筆記結構與測驗選項／答案，阻擋不完整輸出。
- PDF worker 隨程式建置，限制檔案大小／頁數，對空白或掃描文件給出提示。
- 移除未使用的 pdf-parse／pptxgenjs 依賴，更新使用中的 PDF 元件，補上 lockfile 與 CI。

## 驗證界線

單元與瀏覽器測試使用固定時間、範例教材與模擬 AI／YOLO 回應。這些測試可確認流程和資料保存，不能證明真實生成品質、攝影機準確率或學習成效。

需要後續實測：個人 Gemini key、實際 YOLO 帳號與攝影機、不同 PDF 教材、目標裝置。帳號同步、雲端部署與學習成效研究尚未完成。

本機驗證結果：21 項核心測試通過；3 條 Chrome 瀏覽器流程通過；TypeScript 與 Vite 正式建置通過；npm audit 當次回報 0 項弱點。瀏覽器驗證使用 Windows 已安裝的 Chrome 與正式建置服務。GitHub Actions 執行結果應另以倉庫紀錄核對。

## 維護與展示

1. npm ci 安裝固定依賴。
2. npm test 執行核心測試。
3. npm run build 完成型別與正式建置檢查。
4. npm start 啟動展示服務，網址 http://127.0.0.1:8787。
5. 首頁載入離線示範教材；有金鑰再使用上傳功能。
6. npm run test:e2e 執行瀏覽器驗證（需先安裝 Playwright 瀏覽器或指定 Chrome）。
