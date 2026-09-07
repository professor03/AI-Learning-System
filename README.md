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
- Google Gemini API（由 Node.js 本機後端代理，金鑰不進入前端）
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

需要 Node.js 22.12 以上。先將 `.env.example` 複製為 `.env`，有 Gemini 金鑰時填入 `GEMINI_API_KEY`；不填也能體驗離線示範。

```bash
npm ci
npm run dev
```

開啟 http://127.0.0.1:5173。這個命令同時啟動前端與本機 AI 後端。

穩定展示模式（直接使用正式建置）：

```bash
npm run build
npm start
```

## 環境變數與安全提醒

建立本機 `.env`：

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-flash-latest
```

`npm start` 的展示網址為 http://127.0.0.1:8787。所有 AI 功能經過 `/api/ai/generate`，後端限制輸入長度、請求頻率、來源與逾時，並遮蔽供應商錯誤中的敏感資訊。舊版的 `VITE_GEMINI_API_KEY` 已不使用，請從舊 `.env` 移除；若舊版曾公開部署，應重新簽發金鑰。

目前後端僅監聽本機，適合個人展示。公開部署仍需要身分驗證、HTTPS、每位使用者的用量限制與正式資料庫；不能只把前端放到靜態網站就使用 AI 功能。

LearnSight 預設連線位址為 `http://localhost:8000`，可在系統設定或環境設定中改成實際服務位址。

## 目前完成度

### 已具備

- React/Vite 專案結構與主要頁面
- 筆記、測驗、學習計畫等前端流程
- FSRS-style 複習邏輯
- LearnSight 登入、開始、同步、結束的前端整合
- GitHub 公開專案整理
- 首頁離線示範：預先編寫的教材、三題測驗與四張複習卡
- LearnSight 已結束時段保存在目前瀏覽器，儀表板可回顧／匯出／清除，最多 200 筆
- AI 摘要與測驗的回應格式驗證，避免儲存缺少答案或章節的結果
- PDF／TXT 匯入限制與錯誤提示，PDF 解析元件隨專案提供
- 核心單元測試、瀏覽器流程測試與 GitHub Actions 設定

### 仍需驗證或加強

- 真實資料庫／帳號持久化
- 使用你自己的 Gemini 金鑰驗證實際生成品質
- 以實際 YOLO 服務、帳號與攝影機驗證現場訊號
- 掃描 PDF 的 OCR、圖片與錄音輸入尚未支援
- 研究助手目前僅產生構想，沒有即時網頁檢索，不提供生成的引用網址
- 儀表板的舊「今日任務」仍以示範資料初始化；LearnSight 新紀錄為獨立的本機保存資料

## Demo 建議

不需金鑰的展示：首頁點「載入離線示範教材」，依序閱讀筆記、開始示範測驗、開始間隔複習。這些內容明確標示為預先編寫，不能作為 AI 生成品質的實驗證據。

有金鑰與攝影機後，展示完整流程：

1. 匯入一份教材或筆記。
2. 由 AI 產生摘要與測驗。
3. 完成測驗並記錄 FSRS 複習排程。
4. 啟動 LearnSight，展示學習工作階段。
5. 回到儀表板查看學習紀錄與下一次複習時間。

LearnSight 只提供人員存在的聚合訊號；時段分鐘數不等於專注分鐘數。進行中的連線可跨頁面保留，重新整理會清除登入憑證，因此請先結束時段。僅已結束時段會寫入歷史。

## 驗證

```bash
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

瀏覽器測試使用正式建置。AI 與 YOLO 回應由固定測試資料代替，驗證的是介面、API 串接與資料保存，不代表真實模型準確率。測試不需要私密金鑰，也不會呼叫付費 AI。

Windows 已安裝 Chrome 時，可設定 `PLAYWRIGHT_CHANNEL=chrome` 執行瀏覽器測試。若開發模式受到本機目錄權限限制，請使用上面的正式建置展示模式。

## 專案定位

本專案不是只展示畫面，而是把 AI 教學、學習科學（間隔複習）與視覺／行為辨識串成一個可操作的研究原型。後續可朝學習成效評估、個人化推薦與多模態學習分析延伸。
