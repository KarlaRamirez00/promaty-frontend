import { test, expect } from '@playwright/test';
import { screenshot } from '../helpers/evidence';

test.describe('Autenticación', () => {
  test('login exitoso redirige al inicio', async ({ page }) => {
    const user = process.env.PLAYWRIGHT_USER;
    const password = process.env.PLAYWRIGHT_PASSWORD;

    if (!user || !password) {
      throw new Error('Faltan PLAYWRIGHT_USER o PLAYWRIGHT_PASSWORD en el entorno.');
    }

    await page.goto('/login');
    await screenshot(page, 'login-01-pantalla-inicial');

    await page.getByTestId('login-email').locator('input').fill(user);
    await page.getByTestId('login-password').locator('input').fill(password);
    await screenshot(page, 'login-02-credenciales-ingresadas');

    await page.getByTestId('login-submit').click();
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15_000 });

    await screenshot(page, 'login-03-sesion-iniciada');
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('credenciales incorrectas muestran error', async ({ page }) => {
    await page.goto('/login');

    await page.getByTestId('login-email').locator('input').fill('incorrecto@example.test');
    await page.getByTestId('login-password').locator('input').fill('claveincorrecta');
    await page.getByTestId('login-submit').click();

    await expect(
      page.getByText(/correo o contraseña incorrectos/i),
    ).toBeVisible({ timeout: 10_000 });

    await screenshot(page, 'login-04-error-credenciales');
  });
});
