import { test } from '@playwright/test';
import { login } from '../helpers/auth';
import { requestContract } from '../helpers/flows';
import { requireState } from '../helpers/demo-state';
import { screenshot } from '../helpers/evidence';

test('Solicitar el contrato del colaborador', async ({ page }) => {
  const staff = requireState('staff', 'Ejecuta primero: npm run demo:colaborador');
  await login(page);
  await requestContract(page, staff);
  await screenshot(page, 'demo-02-contrato-solicitado');
});
