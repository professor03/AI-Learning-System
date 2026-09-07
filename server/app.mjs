import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.mjs': 'text/javascript', '.woff2': 'font/woff2' };

/** Local-only service; injected provider lets tests run without paid AI calls. */
export function createApp({ generate, distDir = resolve('dist'), clock = Date.now } = {}) {
  let requests = [];
  let active = 0;
  return createServer(async (req, res) => {
    const send = (status, payload) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(JSON.stringify(payload));
    };
    // Reject DNS rebinding and browser requests from other origins.
    if (!/^(localhost|127\.0\.0\.1):\d+$/.test(req.headers.host || '')) return send(403, { error: '僅允許本機連線。' });
    const origin = req.headers.origin;
    if (origin && origin !== 'http://127.0.0.1:5173' && origin !== 'http://localhost:5173' && origin !== `http://${req.headers.host}`) return send(403, { error: '不允許此來源。' });
    const path = (req.url || '/').split('?')[0];
    if (path === '/api/health' && req.method === 'GET') return send(200, { status: 'ok', aiConfigured: Boolean(generate) });
    if (path === '/api/ai/generate') {
      if (req.method !== 'POST') return send(405, { error: '請使用 POST。' });
      if (!req.headers['content-type']?.startsWith('application/json')) return send(415, { error: '需要 JSON 資料。' });
      if (!generate) return send(503, { error: '尚未設定 AI 金鑰，請在伺服器 .env 設定 GEMINI_API_KEY 後重新啟動。' });
      requests = requests.filter(time => clock() - time < 60_000);
      if (requests.length >= 10 || active >= 2) return send(429, { error: '請求過於頻繁，請稍候再試。' });
      requests.push(clock());
      active++;
      try {
        const chunks = [];
        let bytes = 0;
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 256_000) return send(413, { error: '教材過大，請分段處理。' });
          chunks.push(chunk);
        }
        let data;
        try { data = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
        catch { return send(400, { error: 'JSON 格式錯誤。' }); }
        if (typeof data?.prompt !== 'string' || !data.prompt.trim() || data.prompt.length > 60_000) return send(400, { error: '內容需介於 1～60,000 字元。' });
        let timer;
        try {
          const text = await Promise.race([
            generate(data.prompt),
            new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), 60_000); }),
          ]);
          if (typeof text !== 'string' || !text.trim()) throw new Error('empty response');
          send(200, { text });
        } finally { clearTimeout(timer); }
      } catch {
        // Provider error text may contain credentials. Never return or log it.
        send(502, { error: 'AI 暫時無法產生內容，請檢查服務設定與配額後重試。' });
      } finally { active--; }
      return;
    }
    if (path.startsWith('/api/')) return send(404, { error: '找不到 API。' });
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(405, { error: '不支援的方法。' });
    try {
      const filePath = resolve(distDir, '.' + decodeURIComponent(path));
      if (!filePath.startsWith(resolve(distDir) + sep) && filePath !== resolve(distDir)) return send(403, { error: '不允許此路徑。' });
      let body;
      let extension = extname(filePath);
      try { body = await readFile(filePath); }
      catch {
        if (extension) return send(404, { error: '找不到檔案。' });
        body = await readFile(resolve(distDir, 'index.html'));
        extension = '.html';
      }
      res.writeHead(200, { 'Content-Type': MIME[extension] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch { send(404, { error: '尚無前端建置，請執行 npm run build，或使用 npm run dev。' }); }
  });
}
