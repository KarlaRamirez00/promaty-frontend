import { test } from '@playwright/test';
import { login } from '../helpers/auth';
import { requestTermination } from '../helpers/flows';
import { requireState } from '../helpers/demo-state';
import { screenshot } from '../helpers/evidence';

test('Solicitar el finiquito del colaborador', async ({ page }) => {
  const staff = requireState('staff', 'Ejecuta primero: npm run demo:colaborador');
  await login(page);
  await requestTermination(page, staff);
  await screenshot(page, 'demo-04-finiquito-solicitado');
});
