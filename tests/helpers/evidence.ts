import { type Page } from '@playwright/test';
import * as path from 'path';

export async function screenshot(page: Page, name: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  await page.screenshot({
    path: path.join('test-results', 'evidencias', filename),
    fullPage: true,
  });
}
