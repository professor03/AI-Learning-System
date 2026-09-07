import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e', workers: 1, timeout: 45_000,
  use: {
    baseURL: 'http://127.0.0.1:8787', viewport: { width: 1440, height: 1000 },
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    screenshot: 'only-on-failure', trace: 'retain-on-failure',
  },
  webServer: { command: 'node server/index.mjs', url: 'http://127.0.0.1:8787', reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === '1', timeout: 120_000 },
});
