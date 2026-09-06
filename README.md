# AI Learning Assistant

一個智能學習助手應用,具備 3D 知識銀河可視化、AI 驅動的簡報生成、研究工具等功能。

## 功能特點

- 📚 **筆記上傳與管理**: 支援 PDF、圖片等多種格式
- 🌌 **3D 知識銀河**: 互動式 3D 視覺化學習內容
- 🎤 **AI 簡報生成**: 自動生成專業簡報,支援多種佈局
- 🔍 **研究助手**: AI 驅動的資料收集與整理
- 🐾 **學習寵物系統**: 遊戲化學習體驗
- 📱 **響應式設計**: 完美支援桌面和移動設備

## 技術棧

- **前端框架**: React + TypeScript + Vite
- **3D 視覺化**: react-force-graph-3d, three.js  
- **狀態管理**: Zustand
- **樣式**: Tailwind CSS
- **動畫**: Framer Motion
- **AI**: Google Generative AI

## 開始使用

### 安裝依賴

\`\`\`bash
npm install
\`\`\`

### 開發模式

\`\`\`bash
npm run dev
\`\`\`

### 建置生產版本

\`\`\`bash
npm run build
\`\`\`

## Git 版本控制

### 基本操作

#### 1. 查看當前狀態
\`\`\`bash
git status
\`\`\`

#### 2. 查看提交歷史
\`\`\`bash
git log --oneline
# 或查看詳細信息
git log
\`\`\`

#### 3. 創建新的提交
\`\`\`bash
# 添加所有更改的文件
git add .

# 或添加特定文件
git add src/components/MyComponent.tsx

# 提交更改
git commit -m "描述你的更改"
\`\`\`

#### 4. 回滾到之前的版本

**選項 A: 臨時查看舊版本(不改變歷史)**
\`\`\`bash
# 查看提交歷史,找到想回滾的 commit hash
git log --oneline

# 切換到該版本(例如: 8df6c7f)
git checkout 8df6c7f

# 回到最新版本
git checkout master
\`\`\`

**選項 B: 永久回滾(保留歷史記錄)**
\`\`\`bash
# 創建一個新的提交來撤銷之前的更改
git revert <commit-hash>
\`\`\`

**選項 C: 硬回滾(刪除歷史,慎用!)**
\`\`\`bash
# 警告:這會刪除所有之後的提交!
git reset --hard <commit-hash>
\`\`\`

### 連接到 GitHub

#### 1. 在 GitHub 創建新倉庫
訪問 https://github.com/new 創建一個新的倉庫

#### 2. 添加遠程倉庫
\`\`\`bash
git remote add origin https://github.com/你的用戶名/倉庫名稱.git
\`\`\`

#### 3. 推送到 GitHub
\`\`\`bash
# 第一次推送
git push -u origin master

# 之後的推送
git push
\`\`\`

#### 4. 從 GitHub 拉取更新
\`\`\`bash
git pull origin master
\`\`\`

### 分支管理

#### 創建新分支進行開發
\`\`\`bash
# 創建並切換到新分支
git checkout -b feature/新功能名稱

# 在新分支上工作和提交
git add .
git commit -m "添加新功能"

# 切換回主分支
git checkout master

# 合併新分支
git merge feature/新功能名稱
\`\`\`

## 推薦的工作流程

1. **開始新功能前先創建新分支**
   \`\`\`bash
   git checkout -b feature/功能名稱
   \`\`\`

2. **定期提交更改**
   \`\`\`bash
   git add .
   git commit -m "具體的更改描述"
   \`\`\`

3. **功能完成後合併到主分支**
   \`\`\`bash
   git checkout master
   git merge feature/功能名稱
   \`\`\`

4. **推送到 GitHub(如果已設置)**
   \`\`\`bash
   git push
   \`\`\`

## 環境變數設置

創建 \`.env\` 文件並添加你的 API 密鑰:

\`\`\`
VITE_GEMINI_API_KEY=你的_Google_AI_密鑰
\`\`\`

## 授權

MIT License
