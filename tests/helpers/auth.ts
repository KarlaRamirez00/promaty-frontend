import { expect, type Page } from '@playwright/test';
import { typeInto } from './vuetify';

export async function login(page: Page): Promise<void> {
  const user = process.env.PLAYWRIGHT_USER;
  const password = process.env.PLAYWRIGHT_PASSWORD;

  if (!user || !password) {
    throw new Error('Faltan PLAYWRIGHT_USER o PLAYWRIGHT_PASSWORD en el entorno.');
  }

  await page.goto('/login');
  await typeInto(page, 'login-email', user);
  await typeInto(page, 'login-password', password);
  await page.getByTestId('login-submit').click();
  await expect(page).not.toHaveURL(/\/login$/);
}
