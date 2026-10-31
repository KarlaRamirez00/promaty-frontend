import { defineConfig } from '@playwright/test';
import 'dotenv/config';

const SLOW_MO_MS = Number(process.env.DEMO_SLOW_MO ?? 400);

export default defineConfig({
  testDir: './tests/demo',
  timeout: 10 * 60_000,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL,
    headless: false,
    // Sin viewport fijo, la página ocupa la ventana maximizada y se adapta a cualquier pantalla.
    viewport: null,
    locale: 'es-CL',
    video: 'on',
    screenshot: 'only-on-failure',
    launchOptions: { slowMo: SLOW_MO_MS, args: ['--start-maximized'] },
  },
});
