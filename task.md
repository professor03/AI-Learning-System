# AI Student v3.0 執行追蹤 (Task Tracker)

## Phase 1: 基礎演算法層建置 (Core Algorithm Layer)
- `[x]` 1.1 實作 FSRS 引擎 (`src/lib/fsrs.ts`)
- `[x]` 1.2 實作本地 RAG 檢索引擎 (`src/lib/searchEngine.ts`)

## Phase 2: 系統減法工程與狀態綁定 (Data Binding & UI Trimming)
- `[x]` 2.1 刪除多餘功能 (`KnowledgeGalaxy`, `PresentationStudio` 及路由)
- `[x]` 2.2 升級 Memory Bank 資料結構 (`useMemoryStore.ts`)

## Phase 3: 知識處理與應用層 (Knowledge & Application Layer)
- `[x]` 3.1 擴充 AI 生成邏輯 (`src/lib/ai.ts` 新增 `generatePBLScenario`)
- `[x]` 3.2 開發 PBL 挑戰介面 (`src/components/pbl/PblChallenge.tsx`)

## Phase 4: 動機與互動層強化 (Motivation & Interaction Layer)
- `[ ]` 4.1 RAG 檢索引擎與聊天室對接 (`ChatSidebar.tsx`)
- `[ ]` 4.2 寵物狀態與 FSRS 綁定 (`PetCompanion.tsx`, `useAppStore.ts`)
