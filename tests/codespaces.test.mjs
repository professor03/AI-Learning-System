import { afterEach, expect, test } from 'vitest';
import { createServer, request as httpRequest } from 'node:http';
import { createApp } from '../server/app.mjs';
const servers = [];
afterEach(async () => { await Promise.all(servers.splice(0).map(server => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }))); });
async function start(options) {
  const server = createApp(options); servers.push(server);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return `http://127.0.0.1:${server.address().port}`;
}
test('cloud origin is explicit, not a wildcard', async () => {
  const origin = 'https://example-8787.app.github.dev';
  const url = await start({ publicOrigin: origin });
  expect((await fetch(url + '/api/health', { headers: { origin } })).status).toBe(200);
  expect((await fetch(url + '/api/health', { headers: { origin: 'https://another-8787.app.github.dev' } })).status).toBe(403);
  expect((await fetch(url + '/vision/auth/guest', { method: 'POST', headers: { 'sec-fetch-site': 'cross-site' } })).status).toBe(403);
  expect((await fetch(url + '/api/health', { headers: { 'sec-fetch-site': 'cross-site' } })).status).toBe(200);
  expect(() => createApp({ publicOrigin: 'https://evil.example' })).toThrow();
});
test('gateway proxies only bounded public vision routes', async () => {
  const target = createServer((req, res) => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ path: req.url, token: req.headers.authorization })); });
  servers.push(target); await new Promise(resolve => target.listen(0, '127.0.0.1', resolve));
  const url = await start({ visionPort: target.address().port });
  const response = await fetch(url + '/vision/auth/guest', { method: 'POST', headers: { Authorization: 'Bearer test' } });
  expect(await response.json()).toEqual({ path: '/auth/guest', token: 'Bearer test' });
  expect((await fetch(url + '/vision/admin/start', { method: 'POST' })).status).toBe(404);
  expect((await fetch(url + '/vision/auth/guest', { method: 'POST', body: 'a'.repeat(300001) })).status).toBe(413);
});
test('Codespaces origin rewrite requires exact public host and internal port', async () => {
  const url = await start({ publicOrigin: 'https://example-8787.app.github.dev' });
  const request = headers => new Promise((resolve, reject) => {
    const req = httpRequest(url + '/api/health', { headers }, res => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
    req.on('error', reject); req.end();
  });
  expect(await request({Host:'example-8787.app.github.dev',Origin:'http://localhost:8787'})).toBe(200);
  expect(await request({Host:'example-8787.app.github.dev',Origin:'https://localhost:8787'})).toBe(200);
  expect(await request({Host:'localhost:8787',Origin:'https://localhost:8787'})).toBe(200);
  expect(await request({Host:'example-8787.app.github.dev',Origin:'http://localhost:8000'})).toBe(403);
  expect(await request({Origin:'http://localhost:8787'})).toBe(403);
});
test('cloud daily AI quota bounds billable calls', async () => {
  const url = await start({ generate: async () => 'real provider adapter', dailyAiLimit: 1 });
  const run = () => fetch(url + '/api/ai/generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt: 'test' }) });
  expect((await run()).status).toBe(200); expect((await run()).status).toBe(429);
});
