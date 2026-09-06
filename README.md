# AI Learning System

一個以「理解、複習、追蹤學習行為」為核心的 AI 學習系統原型，整合筆記／PDF 學習、AI 問答與測驗、間隔複習，以及 LearnSight 動作辨識服務。

> 這是學習研究與推甄展示用的 prototype。部分資料層目前使用 mock data，Gemini API 與 YOLO/LearnSight 需要依照本機環境設定後才能完整運作。

## 專案亮點

- **AI 學習流程**：從教材或筆記建立學習內容，產生摘要、問答與測驗。
- **間隔複習**：以 FSRS-style 排程記錄答題結果，安排下一次複習。
- **LearnSight 整合**：連接 YOLO 動作辨識服務，支援開始、同步與結束學習工作階段。
- **學習儀表板**：集中查看學習進度、筆記、測驗與待複習內容。
- **React/TypeScript 前端**：以 Vite 建置，適合延伸為研究所專題展示或研究原型。

## 技術架構

- React + TypeScript + Vite
- Tailwind CSS、Framer Motion
- Zustand 狀態管理
- Google Gemini API（目前由前端呼叫，正式部署前應改用後端／Serverless proxy）
- FSRS-style spaced repetition
- LearnSight/YOLO HTTP API

主要程式位置：

- `src/routes/`：頁面與主要使用流程
- `src/components/`：可重用 UI 元件
- `src/lib/ai.ts`：AI 服務呼叫
- `src/lib/fsrs.ts`：複習排程邏輯
- `src/routes/LearnSight.tsx`：LearnSight 連線與工作階段控制
- `src/lib/api.ts`：目前的資料存取抽象層（部分為 mock data）

## 本機啟動

需要 Node.js 18+。

```bash
npm install
npm run dev
```

建置檢查：

```bash
npm run build
```

## 環境變數與安全提醒

建立本機 `.env`：

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

請勿將 `.env`、API key、使用者資料或模型檔案提交到 GitHub。Vite 的 `VITE_*` 變數會被打包到瀏覽器，因此正式上線時不應把真正的 Gemini key 放在前端；建議改成後端 API 或 Serverless Function，並限制金鑰來源與配額。

LearnSight 預設連線位址為 `http://localhost:8000`，可在系統設定或環境設定中改成實際服務位址。

## 目前完成度

### 已具備

- React/Vite 專案結構與主要頁面
- 筆記、測驗、學習計畫等前端流程
- FSRS-style 複習邏輯
- LearnSight 登入、開始、同步、結束的前端整合
- GitHub 公開專案整理

### 仍需驗證或加強

- 本機完整 `npm install`、`npm run build` 驗證
- Gemini key 的後端代理與錯誤處理
- 真實資料庫／帳號持久化
- LearnSight session 結果寫回儀表板
- 自動化測試與 CI
- 以真實教材完成一條可錄影展示的端到端流程

## Demo 建議

建議展示一條完整流程：

1. 匯入一份教材或筆記。
2. 由 AI 產生摘要與測驗。
3. 完成測驗並記錄 FSRS 複習排程。
4. 啟動 LearnSight，展示學習工作階段。
5. 回到儀表板查看學習紀錄與下一次複習時間。

## 專案定位

本專案不是只展示畫面，而是把 AI 教學、學習科學（間隔複習）與視覺／行為辨識串成一個可操作的研究原型。後續可朝學習成效評估、個人化推薦與多模態學習分析延伸。
