import { expect, type Page } from '@playwright/test';
import { buildDemoStaff, rutPattern, type DemoStaff } from './demo-data';
import { pickDate, selectOption, typeInto } from './vuetify';

const FORM_REDIRECT_TIMEOUT_MS = 20_000;
const CONTRACT_ATTACHMENT_COUNT = 5;
const SAMPLE_DOCUMENT = {
  name: 'documento-demo.pdf',
  mimeType: 'application/pdf',
  buffer: Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n'),
};

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

  // Los cinco documentos del contrato son obligatorios; se adjunta el mismo archivo de muestra a cada uno.
  const fileInputs = page.locator('input[type="file"]');
  await expect(fileInputs).toHaveCount(CONTRACT_ATTACHMENT_COUNT);
  for (let index = 0; index < CONTRACT_ATTACHMENT_COUNT; index++) {
    await fileInputs.nth(index).setInputFiles(SAMPLE_DOCUMENT);
  }

  await page.getByTestId('contract-submit').click();
  await expect(page).toHaveURL(/\/contracts$/, { timeout: FORM_REDIRECT_TIMEOUT_MS });
}

/** Solicita un anexo de aumento de sueldo para el colaborador (su contrato demo es indefinido). */
export async function requestAnnex(page: Page, staff: DemoStaff): Promise<void> {
  await page.goto('/annexes');
  await page.getByTestId('list-new').click();
  await expect(page.getByRole('heading', { name: 'Nuevo anexo' })).toBeVisible();

  await selectOption(page, 'annex-staff', rutPattern(staff.rut), staff.firstName);
  await selectOption(page, 'annex-type', /sueldo/i);
  await pickDate(page, 'annex-effective-date', 'last');
  await typeInto(page, 'annex-new-base-salary', '900000');
  await typeInto(page, 'annex-description', 'Aumento de sueldo por buen desempeño');

  await page.getByTestId('annex-submit').click();
  await expect(page).toHaveURL(/\/annexes$/, { timeout: FORM_REDIRECT_TIMEOUT_MS });
}

/** Solicita el finiquito (no definitivo) del colaborador. */
export async function requestTermination(page: Page, staff: DemoStaff): Promise<void> {
  await page.goto('/terminations');
  await page.getByTestId('list-new').click();
  await expect(page.getByRole('heading', { name: 'Nuevo finiquito' })).toBeVisible();

  await selectOption(page, 'termination-staff', rutPattern(staff.rut), staff.firstName);
  await pickDate(page, 'termination-date');
  await selectOption(page, 'termination-cause');
  await typeInto(page, 'termination-notes', 'Finiquito de demostración');

  // Algunas causales exigen documento; el adjunto es inofensivo cuando es opcional.
  await page.locator('input[type="file"]').first().setInputFiles(SAMPLE_DOCUMENT);

  await page.getByTestId('termination-submit').click();
  await expect(page).toHaveURL(/\/terminations$/, { timeout: FORM_REDIRECT_TIMEOUT_MS });
}
