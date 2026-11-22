import { test } from '@playwright/test';
import { login } from '../helpers/auth';
import { requestAnnex } from '../helpers/flows';
import { requireState } from '../helpers/demo-state';
import { screenshot } from '../helpers/evidence';

test('Solicitar el anexo del colaborador', async ({ page }) => {
  const staff = requireState('staff', 'Ejecuta primero: npm run demo:colaborador');
  await login(page);
  await requestAnnex(page, staff);
  await screenshot(page, 'demo-03-anexo-solicitado');
});
