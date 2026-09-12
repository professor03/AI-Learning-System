/** Real two-repository verification. No mocked HTTP responses and no camera access.
 * node scripts/verify-yolo-integration.mjs --yolo PATH --python PATH --video PATH --weights PATH
 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:net';
import { chromium, expect } from '@playwright/test';
import { createApp } from '../server/app.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, arg, i, all) => i % 2 ? pairs : [...pairs, [arg.slice(2), all[i+1]]], []));
for (const key of ['yolo','python','video','weights']) if (!args[key]) throw new Error(`Missing --${key}`);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
await mkdir(resolve(root, 'integration-results'), { recursive: true });
const out = await mkdtemp(resolve(root, 'integration-results/real-yolo-'));
const password = randomBytes(24).toString('hex');
const username = 'integration-check';
const yolo = resolve(args.yolo);
const logs = { api: '', detector: '' };
const children = [];
const start = (command, argv, options, label) => {
  const child = spawn(command, argv, { ...options, windowsHide: true, stdio: ['ignore','pipe','pipe'] });
  child.stdout.on('data', data => { logs[label] += data; });
  child.stderr.on('data', data => { logs[label] += data; });
  child.on('error', error => { logs[label] += `\nProcess error: ${error.message}`; });
  children.push(child); return child;
};
const port = await new Promise((done, reject) => {
  const probe = createServer(); probe.on('error', reject);
  probe.listen(0,'127.0.0.1', () => { const p = probe.address().port; probe.close(() => done(p)); });
});
const web = createApp({ distDir: resolve(root, 'dist') });
await new Promise(done => web.listen(0,'127.0.0.1',done));
const origin = `http://127.0.0.1:${web.address().port}`;
const api = `http://127.0.0.1:${port}`;
await mkdir(resolve(out,'ultralytics'),{recursive:true});
const env = { ...process.env, DATABASE_URL:'sqlite:///'+resolve(out,'test.db').replaceAll('\\','/'),
  DATASTORE_PATH:resolve(out,'datastore.json'), FRAME_OUTPUT_DIR:resolve(out,'frames'), HLS_OUTPUT_DIR:resolve(out,'hls'),
  DISABLE_CAMERA_STREAMS:'true', RTSP_CAMERA_URL:'', MJPG_CAMERA_URL:'',
  CORS_ORIGINS:origin, YOLO_CONFIG_DIR:resolve(out,'ultralytics'), PYTHONUNBUFFERED:'1',
  INTEGRATION_USERNAME:username, INTEGRATION_PASSWORD:password, INTEGRATION_PORT:String(port) };
const bootstrap = `import os
from src.database.models import get_database_manager
from src.database.user_repository import UserRepository
from src.auth.security import DEFAULT_ROLE_PERMISSIONS
get_database_manager().create_tables()
UserRepository().create_user(username=os.environ['INTEGRATION_USERNAME'], password=os.environ['INTEGRATION_PASSWORD'], role='admin', permissions=DEFAULT_ROLE_PERMISSIONS['admin'])
import uvicorn
uvicorn.run('src.server.app:app', host='127.0.0.1', port=int(os.environ['INTEGRATION_PORT']))`;
let browser, context;
const report = { started_at:new Date().toISOString(), video_kind:'existing local recorded sample, not author-shot footage', mocked_responses:false, camera_opened:false, checks:[] };
try {
  start(args.python,['-c',bootstrap],{cwd:yolo,env},'api');
  console.log('Checking local API availability');
  await expect.poll(async () => { try { return (await fetch(api+'/healthz', {signal:AbortSignal.timeout(2000)})).status; }
    catch(error) { report.connection_error = `${error.message}: ${error.cause?.code || ''} ${error.cause?.message || ''}`; return 0; } },{timeout:20000,intervals:[500,1000]}).toBe(200);
  delete report.connection_error;
  console.log('API ready; checking browser flow');
  browser = await chromium.launch({ channel:process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless:true });
  context = await browser.newContext({viewport:{width:1440,height:1080},
    ...(process.env.INTEGRATION_RECORD_VIDEO === '1' ? {recordVideo:{dir:out,size:{width:1440,height:1080}}} : {})});
  await context.addInitScript(() => {
    localStorage.setItem('ai-student-lastCheckIn',JSON.stringify(new Date().toISOString().split('T')[0]));
    localStorage.setItem('ai-student-onboarding','3');
  });
  const page = await context.newPage();
  const pageErrors = []; page.on('pageerror',e=>pageErrors.push(e.message));
  const syncs = [];
  page.on('response', async response => {
    if (response.url().endsWith('/sync')) {
      try { syncs.push({http_status:response.status(),body:await response.json()}); } catch { /* recorded as request failure by UI */ }
    }
  });
  await page.goto(origin+'/learnsight');
  await page.getByLabel('YOLO 服務網址').fill(api);
  await page.getByLabel('帳號',{exact:true}).fill(username);
  await page.getByLabel('密碼',{exact:true}).fill(password);
  await page.getByRole('button',{name:'連線',exact:true}).click();
  await expect(page.getByRole('button',{name:'已連線',exact:true})).toBeVisible();
  await page.getByLabel('本次目標').fill('YOLO 真實人物訊號整合驗證');
  await page.getByRole('button',{name:'開始 LearnSight 時段'}).click();
  await expect(page.getByRole('heading',{name:'人物訊號暫時無法使用'})).toBeVisible();
  report.checks.push('no detector data is unavailable, not zero people');
  await page.screenshot({path:resolve(out,'01-waiting.png'),fullPage:true});
  const detector = start(args.python,['scripts/detect_demo.py',resolve(args.video),'--duration','35','--weights',resolve(args.weights)],{cwd:yolo,env},'detector');
  await expect(page.getByRole('heading',{name:'偵測到有人在畫面範圍',exact:true})).toBeVisible({timeout:90000});
  await expect(page.getByTestId('vision-provenance')).toContainText('YOLO 真實推論');
  await page.screenshot({path:resolve(out,'02-real-detector-connected.png'),fullPage:true});
  report.checks.push('real model -> shared telemetry -> authenticated API -> React UI');
  const beforeCount = syncs.filter(item=>item.http_status===200).at(-1)?.body.observation_count || 0;
  await page.getByTitle('應用程式',{exact:true}).click();
  await page.getByRole('link',{name:'Notes',exact:false}).click();
  await expect(page).toHaveURL(/\/notes$/);
  await expect.poll(()=>syncs.filter(item=>item.http_status===200).at(-1)?.body.observation_count || 0,
    {timeout:15000,intervals:[1000]}).toBeGreaterThan(beforeCount);
  report.checks.push('automatic real telemetry sync continues while reading the Notes route');
  await page.getByTitle('應用程式',{exact:true}).click();
  await page.getByRole('link',{name:'LearnSight',exact:false}).click();
  await expect.poll(() => detector.exitCode,{timeout:60000,intervals:[1000]}).not.toBeNull();
  if(detector.exitCode!==0) throw new Error('Detector failed; see detector log');
  await expect(page.getByRole('heading',{name:'人物訊號暫時無法使用'})).toBeVisible({timeout:15000});
  await expect(page.getByText('偵測已停止或來源已離線；這不代表畫面無人。 無法判斷有人或無人。',{exact:true})).toBeVisible();
  report.checks.push('detector stop displayed as unavailable, not absence');
  await page.screenshot({path:resolve(out,'03-detector-stopped.png'),fullPage:true});
  await page.getByRole('button',{name:'結束時段',exact:true}).click();
  await expect(page.getByText('讀書時段已結束並儲存，可到儀表板回顧。')).toBeVisible();
  await page.goto(origin+'/');
  await expect(page.getByText('YOLO 真實人物訊號整合驗證',{exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByText('YOLO 真實人物訊號整合驗證',{exact:true})).toBeVisible();
  const history = await page.evaluate(()=>JSON.parse(localStorage.getItem('ai-learning-learnsight-history-v1')));
  expect(history[0].signal_origin).toBe('detector');
  expect(history[0].observation_count).toBeGreaterThan(0);
  const stored = await page.evaluate(()=>JSON.stringify(localStorage));
  expect(stored).not.toContain(password); expect(stored).not.toContain('access_token');
  expect(pageErrors).toEqual([]);
  await page.screenshot({path:resolve(out,'04-history-after-reload.png'),fullPage:true});
  report.checks.push('ended summary persisted across reload; no password or token in localStorage');
  report.history=history; report.syncs=syncs; report.passed=true;
} catch(error) { report.passed=false; report.error=error.message; process.exitCode=1; }
finally {
  try { if(context) await context.close(); if(browser) await browser.close(); }
  catch(error) { report.cleanup_error=error.message; report.passed=false; process.exitCode=1; }
  for(const child of children) if(child.exitCode===null) child.kill();
  web.close();
  for(const [label,content] of Object.entries(logs)) await writeFile(resolve(out,label+'.log'),content.replaceAll(password,'[redacted]'));
  report.finished_at=new Date().toISOString();
  await writeFile(resolve(out,'verification.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({out,passed:report.passed,checks:report.checks,error:report.error}));
}

