import { expect, type Page } from '@playwright/test';
import { buildDemoStaff, rutPattern, type DemoStaff } from './demo-data';
import { pickDate, selectOption, typeInto } from './vuetify';

const FORM_REDIRECT_TIMEOUT_MS = 20_000;

/** Crea un colaborador con RUT nuevo desde el formulario y vuelve a la lista. */
export async function createStaff(page: Page): Promise<DemoStaff> {
  const staff = buildDemoStaff();

  await page.goto('/staff');
  await page.getByTestId('list-new').click();
  await expect(page.getByRole('heading', { name: 'Nuevo colaborador' })).toBeVisible();

  await typeInto(page, 'staff-rut', staff.rut);
  await typeInto(page, 'staff-first-name', staff.firstName);
  await typeInto(page, 'staff-paternal-last-name', staff.paternalLastName);
  await typeInto(page, 'staff-maternal-last-name', staff.maternalLastName);
  await pickDate(page, 'staff-birth-date');
  await typeInto(page, 'staff-email', staff.email);
  await typeInto(page, 'staff-phone', staff.phone);
  await selectOption(page, 'staff-registered-sex');
  await selectOption(page, 'staff-marital-status');
  await selectOption(page, 'staff-nationality');
  await selectOption(page, 'staff-education-level');

  await typeInto(page, 'staff-address', 'Avenida Providencia 1234');
  await selectOption(page, 'staff-region');
  await selectOption(page, 'staff-provincia');
  await selectOption(page, 'staff-comuna');

  await typeInto(page, 'staff-emergency-name', 'Contacto Emergencia');
  await typeInto(page, 'staff-emergency-phone', '987654321');

  await selectOption(page, 'staff-shoe-size');
  await selectOption(page, 'staff-clothing-size');
  await selectOption(page, 'staff-afp');
  await selectOption(page, 'staff-health-system');

  await selectOption(page, 'staff-bank');
  await selectOption(page, 'staff-account-type', 'Cuenta corriente');
  await typeInto(page, 'staff-account-number', '12345678');

  await page.getByTestId('staff-submit').click();
  await expect(page).toHaveURL(/\/staff$/, { timeout: FORM_REDIRECT_TIMEOUT_MS });
  return staff;
}

/** Envía la solicitud de un contrato indefinido para el colaborador. */
export async function requestContract(page: Page, staff: DemoStaff): Promise<void> {
  await page.goto('/contracts');
  await page.getByTestId('list-new').click();
  await expect(page.getByRole('heading', { name: 'Nuevo contrato' })).toBeVisible();

  await selectOption(page, 'contract-staff', rutPattern(staff.rut), staff.firstName);
  await selectOption(page, 'contract-type', 'Indefinido');
  await pickDate(page, 'contract-start-date');
  await selectOption(page, 'contract-cost-center');
  await selectOption(page, 'contract-company');
  await selectOption(page, 'contract-job-title');
  await selectOption(page, 'contract-site');
  await typeInto(page, 'contract-base-salary', '800000');
  await selectOption(page, 'contract-weekly-hours', '45 horas');
  await selectOption(page, 'contract-work-days', '5 días');

  await page.getByTestId('contract-submit').click();
  await expect(page).toHaveURL(/\/contracts$/, { timeout: FORM_REDIRECT_TIMEOUT_MS });
}
