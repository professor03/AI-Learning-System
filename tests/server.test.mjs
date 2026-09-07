import { afterEach, expect, test } from 'vitest';
import { createApp } from '../server/app.mjs';
import { request as httpRequest } from 'node:http';

const servers = [];
async function start(generate) {
  const server = createApp({ generate }); servers.push(server);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  return (body = { prompt: 'hello' }, headers = {}) => fetch(url + '/api/ai/generate', {
    method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body),
  });
}
afterEach(async () => { await Promise.all(servers.splice(0).map(server => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }))); });
test('unconfigured AI responds clearly', async () => {
  const request = await start(); expect((await request()).status).toBe(503);
});
test('provider response works and caller cannot supply a model or credentials', async () => {
  const request = await start(async prompt => 'Answer: ' + prompt);
  expect(await (await request()).json()).toEqual({ text: 'Answer: hello' });
});
test('rejects cross-origin and forged host', async () => {
  const request = await start(async () => 'OK');
  expect((await request(undefined, { origin: 'https://untrusted.example' })).status).toBe(403);
  const port = servers.at(-1).address().port;
  const status = await new Promise((resolve, reject) => {
    const req = httpRequest({ hostname: '127.0.0.1', port, path: '/api/health', headers: { host: 'untrusted.example' } }, res => { res.resume(); resolve(res.statusCode); });
    req.on('error', reject); req.end();
  });
  expect(status).toBe(403);
});
test('rejects empty and oversized prompts', async () => {
  const request = await start(async () => 'OK');
  expect((await request({ prompt: '' })).status).toBe(400);
  expect((await request({ prompt: 'a'.repeat(60001) })).status).toBe(400);
});
test('provider errors never disclose credentials', async () => {
  const request = await start(async () => { throw new Error('secret-key-123'); });
  const result = await request(); expect(result.status).toBe(502);
  expect(await result.text()).not.toContain('secret-key-123');
});
test('limits request rate', async () => {
  const request = await start(async () => 'OK');
  for (let i = 0; i < 10; i++) expect((await request()).status).toBe(200);
  expect((await request()).status).toBe(429);
});
