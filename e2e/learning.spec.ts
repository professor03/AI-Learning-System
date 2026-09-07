import { expect, test } from '@playwright/test';
import { jsPDF } from 'jspdf';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('ai-student-lastCheckIn', JSON.stringify(new Date().toISOString().split('T')[0]));
    localStorage.setItem('ai-student-onboarding', '3');
  });
});

test('offline demo, quiz, persistence and spaced review', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: '載入離線示範教材' }).click();
  await page.getByRole('button', { name: '補齊示範資料' }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ai-student-notes')!).length)).toBe(1);
  await page.getByRole('button', { name: '開始示範測驗' }).click();
  await page.getByRole('button', { name: '先進先出 FIFO', exact: false }).click();
  await page.getByRole('button', { name: /下一/ }).click();
  await page.getByRole('button', { name: '堆疊', exact: false }).click();
  await page.getByRole('button', { name: /下一/ }).click();
  await page.getByRole('button', { name: 'C C', exact: true }).click();
  await page.getByRole('button', { name: /完成|結果/ }).click();
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('ai-student-memory')!).state.quizHistory.length)).toBe(1);
  await page.goto('/');
  await page.getByRole('button', { name: '開始間隔複習' }).click();
  for (let i = 0; i < 4; i++) {
    await page.getByText('點擊翻轉', { exact: true }).click();
    await page.getByRole('button', { name: /記得/ }).click();
    await page.waitForTimeout(650);
  }
  await expect(page.getByText('複習完成！', { exact: true })).toBeVisible();
  const memory = await page.evaluate(() => JSON.parse(localStorage.getItem('ai-student-memory')!).state);
  expect(memory.atoms.every((atom: any) => atom.nextReview > Date.now() && atom.reps === 1)).toBe(true);
  expect(memory.learningSessions.at(-1).xpGained).toBe(40);
  expect(errors).toEqual([]);
});

test('LearnSight end-to-dashboard and reload, without storing credentials', async ({ page }) => {
  const summary = {
    session_id: 'browser-test', study_goal: '複習堆疊與佇列', planned_minutes: 25,
    started_at: '2026-09-07T10:00:00Z', ended_at: null as string | null,
    status: 'active', observation_count: 0, present_now: false, last_present_at: null,
    absence_started_at: null, away_reminder_eligible: false, source_id: 'ai-student-os', note: '',
  };
  await page.route('http://localhost:8000/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/sync')) { summary.observation_count++; summary.present_now = true; }
    if (path.endsWith('/end')) { summary.status = 'ended'; summary.ended_at = '2026-09-07T10:25:00Z'; }
    await route.fulfill({ json: path === '/auth/login' ? { access_token: 'test-secret-token' } : summary,
      headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' } });
  });
  await page.goto('/learnsight');
  await page.getByLabel('帳號', { exact: true }).fill('demo');
  await page.getByLabel('密碼', { exact: true }).fill('test-password');
  await page.getByRole('button', { name: '連線', exact: true }).click();
  await page.getByLabel('本次目標').fill(summary.study_goal);
  await page.getByRole('button', { name: '開始 LearnSight 時段' }).click();
  await page.getByRole('button', { name: '立即同步人數訊號' }).click();
  await expect(page.getByText('偵測到有人在畫面範圍', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '結束時段', exact: true }).click();
  await expect(page.getByText('讀書時段已結束並儲存，可到儀表板回顧。')).toBeVisible();
  await page.goto('/');
  await expect(page.getByText(summary.study_goal, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText(/實際時段 25 分鐘/)).toBeVisible();
  const stored = await page.evaluate(() => JSON.stringify(localStorage));
  expect(stored).not.toContain('test-secret-token');
  expect(stored).not.toContain('test-password');
  await page.screenshot({ path: 'test-results/learnsight-dashboard.png', fullPage: true });
});

test('PDF upload extracts text with bundled worker and stores validated notes', async ({ page }) => {
  let receivedPrompt = '';
  await page.route('**/api/ai/generate', async route => {
    receivedPrompt = route.request().postDataJSON().prompt;
    await route.fulfill({ json: { text: JSON.stringify({ summary: 'PDF 匯入成功', sections: [{ id: 's1', title: 'Queue', content: 'First in first out' }], terms: [{ term: 'FIFO', definition: '先進先出' }] }) } });
  });
  const pdf = new jsPDF(); pdf.text('Queue uses First In First Out (FIFO).', 20, 20);
  await page.goto('/upload');
  await page.locator('#file-input').setInputFiles({ name: 'queue.pdf', mimeType: 'application/pdf', buffer: Buffer.from(pdf.output('arraybuffer')) });
  await page.getByLabel('課程名稱').fill('PDF 測試教材');
  await page.getByRole('button', { name: '送出並產生筆記' }).click();
  await expect(page).toHaveURL(/\/notes\//);
  expect(receivedPrompt).toContain('First In First Out');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ai-student-notes')!)[0].summary)).toBe('PDF 匯入成功');
});
