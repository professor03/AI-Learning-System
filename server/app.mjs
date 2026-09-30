import { createServer, request as httpRequest } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.mjs': 'text/javascript', '.woff2': 'font/woff2' };

/** Local by default; public mode requires one explicit HTTPS origin. */
export function createApp({ generate, distDir = resolve('dist'), clock = Date.now,
  publicOrigin, visionPort, dailyAiLimit = 200 } = {}) {
  if (publicOrigin && !/^https:\/\/[a-z0-9-]+\.app\.github\.dev$/.test(publicOrigin)) throw new Error('Invalid Codespaces origin');
  if (visionPort && (!Number.isInteger(visionPort) || visionPort < 1024 || visionPort > 65535)) throw new Error('Invalid vision port');
  let requests = [];
  let active = 0;
  let day = Math.floor(clock() / 86_400_000), dailyRequests = 0;
  const server = createServer(async (req, res) => {
    const send = (status, payload) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(JSON.stringify(payload));
    };
    // Reject DNS rebinding and browser requests from other origins.
    const localHost = /^(localhost|127\.0\.0\.1):\d+$/.test(req.headers.host || '');
    if (!localHost && (!publicOrigin || req.headers.host !== new URL(publicOrigin).host)) return send(403, { error: '不允許此主機。' });
    const origin = req.headers.origin;
    const allowedOrigins = publicOrigin ? [publicOrigin] : ['http://127.0.0.1:5173', 'http://localhost:5173', `http://${req.headers.host}`];
    // Codespaces rewrites its own forwarded Origin to the internal HTTP port.
    // Accept only this exact rewrite with the configured public Host, never
    // arbitrary localhost ports or other forwarded hostnames.
    const rewrittenOrigin = publicOrigin && [new URL(publicOrigin).host, 'localhost:8787'].includes(req.headers.host)
      && ['http://localhost:8787', 'https://localhost:8787'].includes(origin);
    if (origin && !allowedOrigins.includes(origin) && !rewrittenOrigin) return send(403, { error: '不允許此來源。' });
    if (req.headers['sec-fetch-site'] === 'cross-site' && req.method !== 'GET' && req.method !== 'HEAD') return send(403, { error: '不允許跨站請求。' });
    const path = (req.url || '/').split('?')[0];
    if (path === '/api/health' && req.method === 'GET') return send(200, { status: 'ok', aiConfigured: Boolean(generate), cloudDemo: Boolean(publicOrigin), visionConfigured: Boolean(visionPort) });
    if (path.startsWith('/vision/')) {
      if (!visionPort) return send(503, { detail: '未啟用瀏覽器鏡頭服務。' });
      // Fixed loopback target and allowlisted routes; never expose YOLO admin APIs.
      const target = path.slice('/vision'.length);
      if (!(target === '/health' && req.method === 'GET') && !(req.method === 'POST' &&
        (/^\/auth\/guest$/.test(target) || /^\/api\/v1\/learnsight\/sessions(?:\/[a-f0-9]{32}\/(sync|end|frame|stop-camera))?$/.test(target)))) return send(404, { detail: '找不到展示 API。' });
      const chunks = []; let bytes = 0;
      try {
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 300_000) return send(413, { detail: '影格超過 300 KB。' });
          chunks.push(chunk);
        }
      } catch { if (!res.destroyed) send(408, { detail: '影格傳送中斷。' }); return; }
      const headers = { 'content-type': req.headers['content-type'] || 'application/json' };
      if (req.headers.authorization) headers.authorization = req.headers.authorization;
      const upstream = httpRequest({ hostname: '127.0.0.1', port: visionPort, path: target,
        method: req.method, headers, timeout: 20_000 }, response => {
        res.writeHead(response.statusCode || 502, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
        response.pipe(res);
      });
      upstream.on('timeout', () => upstream.destroy(new Error('timeout')));
      upstream.on('error', () => { if (!res.headersSent) send(503, { detail: '視覺服務尚未準備完成，請稍後重試。' }); else res.destroy(); });
      req.on('aborted', () => upstream.destroy());
      upstream.end(Buffer.concat(chunks));
      return;
    }
    if (path === '/api/ai/generate') {
      if (req.method !== 'POST') return send(405, { error: '請使用 POST。' });
      if (!req.headers['content-type']?.startsWith('application/json')) return send(415, { error: '需要 JSON 資料。' });
      if (!generate) return send(503, { error: '尚未設定 AI 金鑰，請在伺服器 .env 設定 GEMINI_API_KEY 後重新啟動。' });
      requests = requests.filter(time => clock() - time < 60_000);
      const nextDay = Math.floor(clock() / 86_400_000);
      if (nextDay !== day) { day = nextDay; dailyRequests = 0; }
      if (dailyRequests >= dailyAiLimit) return send(429, { error: '今日 AI 展示額度已用完；其他學習與鏡頭功能仍可操作。' });
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
          dailyRequests++;
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
  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  return server;
}
