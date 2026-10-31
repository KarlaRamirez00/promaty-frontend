import { test } from '@playwright/test';
import { login } from '../helpers/auth';
import { createStaff } from '../helpers/flows';
import { writeState } from '../helpers/demo-state';
import { screenshot } from '../helpers/evidence';

test('Crear un colaborador', async ({ page }) => {
  await login(page);
  const staff = await createStaff(page);
  writeState({ staff });
  await screenshot(page, 'demo-01-colaborador-creado');
  console.log(`Colaborador creado: ${staff.firstName} ${staff.paternalLastName} — ${staff.rutFormatted}`);
});
