# Project Status

最後更新：2026-09-06

## 已完成

- React + TypeScript + Vite 前端專案
- 筆記、教材、測驗與學習計畫相關頁面
- AI 摘要、問答、出題與 PBL 流程
- FSRS-style 複習排程邏輯
- LearnSight/YOLO 登入、開始、同步、結束流程
- GitHub 專案整理與公開 README
- 研究助手提示詞已禁止產生虛假引用網址
- .env.example 已提供本機設定範例

## 待完成

### 高優先

- [ ] 以後端或 Serverless Function 代理 Gemini API
- [ ] 將 LearnSight session 寫入學習紀錄並顯示在儀表板
- [ ] 使用固定教材完成端到端 Demo
- [ ] 在本機完成 npm install 與 npm run build 驗證

### 中優先

- [ ] 加入 FSRS 核心函式測試
- [ ] 加入 PDF 匯入與 AI 出題錯誤處理測試
- [ ] 補上 package-lock.json
- [ ] 建立 GitHub Actions 的建置檢查

### 推甄展示

- [ ] 製作 3 分鐘 Demo 影片
- [ ] 製作系統架構圖
- [ ] 製作一頁式專題介紹
- [ ] 準備限制與未來研究方向

## 驗收標準

專案可以被視為「可展示 prototype」的條件：

1. 新使用者能依 README 啟動專案。
2. 使用固定教材能完成摘要、出題、作答與複習排程。
3. LearnSight 能完成一次登入、開始、同步、結束。
4. Demo 過程不會暴露 API key 或私人資料。
5. README 清楚區分已完成、prototype 與待開發功能。
