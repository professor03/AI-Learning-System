# Codespaces 實戰 Demo：AI Learning System × YOLO LearnSight

本文件描述真實執行路徑，而非只播放成果影片的展示頁。
這是受限研究 Demo，不等同已完成生產部署或永久可用的網站。

## 兩個不同網址，請勿混淆

| 網址 | 用途 | 是否需要登入 GitHub |
|---|---|---|
| `https://codespaces.new/professor03/AI-Learning-System` | 建立自己的雲端開發環境 | 需要；消耗建立者的額度 |
| `https://<codespace-name>-8787.app.github.dev/learnsight` | 擁有者已啟動、設定為 Public 的實戰展示 | 公開後不需要 |

給評審的是第二種網址，不是 VS Code 編輯器網址，也不是一鍵建立入口。
已於 2026-10-01 驗證 [公開展示網址](https://musical-bassoon-qx95v7p7j55fxpp6-8787.app.github.dev/learnsight)，健康檢查、真實圖片推論與時段結束已通過；本人即時鏡頭與 Gemini 生成尚未驗證。

## 擁有者：首次啟動

1. 開啟 [一鍵建立入口](https://codespaces.new/professor03/AI-Learning-System)，選 main 與 2-core。
2. 自動安裝 Node 22、Python 3.12、CPU PyTorch、YOLOv8n，再建置前端。第一次需下載模型和套件，可能花數分鐘。
3. 自動啟動隔離的 YOLO 服務（只監聽 127.0.0.1:8000）與 8787 網頁閘道。
4. Codespaces 底部 Ports 找到 8787，右鍵 → Port Visibility → Public。
   或於 Codespace 終端機執行 `bash scripts/codespaces_public.sh`，此命令先檢查兩個服務，再公開 8787。
5. 複製 Forwarded Address，在未登入 GitHub 的瀏覽器開啟 `/learnsight`；不要只在自己的登入狀態驗證。
6. 額外開 `/api/health` 與 `/vision/health`：確認 web 正常、model_ready=true。

`postStartCommand` 會在重啟後重新啟動服務，啟動器避免重複啟動。
**GitHub 規則：重啟或移除重加連接埠後，Public 會恢復 Private，必須再次公開。**
不使用持續 ping 或其他方式繞過停機、帳號限制與額度管理。

## 訪客：完整實戰步驟

1. 進入 LearnSight，填寫目標與分鐘數，按「開始 LearnSight 時段」。無需共用作者帳號；後端產生記憶體訪客憑證。
2. 閱讀並勾選影格傳送同意，再按「開啟自己的前置鏡頭」，接受此 HTTPS 網址的瀏覽器鏡頭授權。
3. 每次推論結束後約 3 秒，再送一張最大 640×480 的 JPEG。頁面顯示真實模型人物框、信心分數、CPU 推論耗時與時段狀態。
4. 在鏡頭內 → 離開鏡頭範圍 → 返回，各維持至少 10 秒。觀察人物數及綠色／藍色狀態變化。
5. 按「停止鏡頭與傳送」：鏡頭關閉，狀態變成不可判定，而不是 0 人。
6. 按「結束時段」：摘要保存於自己的瀏覽器歷史紀錄，可匯出 JSON。重新整理會清除登入憑證。
7. 無鏡頭可選自己的 JPEG／PNG（10 MB 以下）；瀏覽器縮圖後才上傳。這仍是真實推論，但不是即時鏡頭測試。

多人畫面的人物數不能識別哪個人是學習者。若人離開但其他人留在鏡頭內，
仍可能显示有人。遮擋、光線、鏡頭角度可能造成漏檢；不判定注意力、動作或學習成效。

## AI 生成不是預製答案

筆記、測驗、複習、摘要歷史在訪客自己的瀏覽器操作。
Gemini 真實生成需擁有者在 GitHub Settings → Codespaces → Secrets
建立 `GEMINI_API_KEY`，並授權此倉庫；**不要把金鑰寫進 README、提交 Git 或貼進聊天**。
金鑰只由 Node 後端使用。重啟 Codespace 後確認 `/api/health` 的 `aiConfigured=true`。
未設定時會明確返回「尚未設定 AI 金鑰」，不偷偷替換成範例答案。
雲端限制每日最多 20 次 AI 呼叫、每分鐘 10 次、最多 2 個同時請求。
供應商配額與帳戶預算仍須另外設定；服務重啟會重置記憶體計數，這不是付費帳戶的硬性總支出上限。

系統保留明確標示的「離線示範教材」；那是固定教材展示，不能宣稱為當次模型生成。

## 隱私與公開安全邊界

- 只有 8787 網頁閘道對外；8000 不轉送。不能公開原本的 YOLO 管理 API、RTSP、相機控制或任意檔案服務。
- 閘道只允許固定目標與指定路由，不接受使用者輸入的代理網址。
- 驗證唯一 Codespaces 網址與來源，拒絕跨站請求；不使用萬用 CORS。
- 每位訪客用 256-bit 隨機憑證，時段屬於獨立服務物件；不能用別人的 session ID 查詢。
- 每個憑證 2 小時、最多 20 時段；同時最多 64 個有效訪客。
- 影格上限 300 KB、1280×960；每訪客至少間隔 2 秒，整體每分鐘最多 120 次、模型一次服務一人。
- 影格僅暫存在記憶體，不存檔、不錄影、不辨識身分。影像會傳至擁有者的 GitHub Codespace，並非完全留在本機。
- 停止、離開頁面、結束時段會關閉前端鏡頭；延遲推論不得覆蓋已結束或停止的時段。
- 雲端摘要與憑證不持久化，服務重啟會清除；已結束摘要存在訪客自己的 localStorage。

這些保護是公開 Demo 最小邊界，不是完整滲透測試、SLA 或正式多租戶平台認證。
公開連結的任何人都可使用展示資源；在長時間分享之前確認帳號預算。

## 啟動故障排除

| 狀況 | 檢查方式 |
|---|---|
| 轉址 GitHub 登入 | Ports 的 8787 還是 Private；改 Public |
| 網址離線／502 | Codespace 是否運行，查看 `.demo/supervisor.log`、`.demo/web.log`、`.demo/vision.log` |
| 模型尚未準備 | 首次模型下載／套件安裝未完成；檢查 vision.log |
| 鏡頭拒絕 | HTTPS、瀏覽器相機權限、是否被其他程式占用；可改用圖片 |
| 429 | CPU 忙碌／展示額度到達；等待，不改用假資料 |
| 憑證過期或 404 | 服務重啟或憑證過期，重新整理並開始新時段 |
| 手動重啟服務 | `python scripts/codespaces_start.py`；若服務已運行，不啟動第二份 |

## 送件／面試前檢查表

- [ ] 啟動 Codespace，8787 已公開
- [ ] 未登入視窗能開啟網址
- [ ] 真實鏡頭完成入鏡／離開／返回，保留該次錄影
- [ ] 停止鏡頭顯示不可判定，結束摘要可匯出
- [ ] 兩個獨立瀏覽器的時段不混用
- [ ] Gemini 真實生成成功，或明確告知未設定，不假裝已驗證
- [ ] 錄影、README、備審 QR Code 指向已驗證網址
- [ ] 保留 GitHub 實測影片備援：Codespaces 停機時評審仍能看證據

本次部署紀錄與剩餘待驗證項目見下方驗證狀態；網址可用性受 Codespaces 停機、Private 設定及額度限制影響。

已通過與尚待實測的項目見 [驗證狀態](codespaces-validation.md)。

參考：[GitHub 連接埠轉送](https://docs.github.com/en/codespaces/developing-in-a-codespace/forwarding-ports-in-your-codespace)
與 [Codespaces 安全性](https://docs.github.com/en/codespaces/reference/security-in-github-codespaces)。
