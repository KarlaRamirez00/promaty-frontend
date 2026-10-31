import { expect, type Page } from '@playwright/test';

const TYPING_DELAY_MS = 40;
const MAX_MONTHS_AHEAD = 12;

/** Escribe tecla a tecla, para que las máscaras de los campos actúen como con un usuario real. */
export async function typeInto(page: Page, testId: string, value: string): Promise<void> {
  const input = page.getByTestId(testId).locator('input, textarea').first();
  await input.click();
  await input.pressSequentially(value, { delay: TYPING_DELAY_MS });
}

/**
 * Elige una opción de un v-select o v-autocomplete. Sin `option` toma la primera;
 * `search` filtra un autocomplete antes de elegir.
 */
export async function selectOption(
  page: Page,
  testId: string,
  option?: string | RegExp,
  search?: string,
): Promise<void> {
  const field = page.getByTestId(testId);
  await expect(field.locator('input')).toBeEnabled();
  await field.locator('.v-field').click();
  if (search) await field.locator('input').pressSequentially(search, { delay: TYPING_DELAY_MS });

  // El menú lateral también expone ítems con rol "option": se acota al desplegable abierto.
  const options = page.locator('.v-overlay--active').getByRole('option');
  await (option ? options.filter({ hasText: option }) : options).first().click();
}

/** Abre el calendario y elige el primer día habilitado, avanzando de mes si hace falta. */
export async function pickDate(page: Page, testId: string): Promise<void> {
  await page.getByTestId(testId).locator('input').click();
  await page.locator('.v-date-picker-month').waitFor();

  const day = page
    .locator('.v-date-picker-month__day:not(.v-date-picker-month__day--adjacent) button:not([disabled])')
    .first();
  for (let month = 0; month < MAX_MONTHS_AHEAD && (await day.count()) === 0; month++) {
    await page.locator('.v-date-picker-controls__month button').last().click();
  }
  await day.click();
}
