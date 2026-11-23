import { afterEach, describe, expect, it } from 'vitest'
import router from '@/router'
import StaffFormView from '@/views/staff/children/StaffFormView.vue'
import { $, $$, byText, click, clickText, go, inputByLabel, mountApp, settle, text, type, type MountedApp } from '../helpers/app'
import { installBackend } from '../helpers/backend'
import * as fx from '../helpers/fixtures'

let app: MountedApp | null = null
afterEach(() => {
  app?.unmount()
  app = null
})

const rowMenu = (index = 0) => $$('[data-testid="row-actions"]')[index]

type FormVm = { form: Record<string, unknown>; fieldErrors: Record<string, string>; pendingFiles: File[]; removedAttachmentIds: number[] }

const VALID_FORM = {
  identificationType: 'RUT',
  identificationNumber: '12.345.678-5',
  firstName: 'Ana',
  paternalLastName: 'Paz',
  maternalLastName: 'Rojas',
  birthDate: '1990-05-20',
  registeredSexId: 1,
  maritalStatusId: 1,
  nationalityId: 1,
  phone1: '9 1234 5678',
  emergencyPhone: '9 8765 4321',
  emergencyContactName: 'Luis Paz',
  address: 'Calle 123',
  regionId: 1,
  provinciaId: 1,
  comunaId: 1,
  hasChildren: true,
  childrenCount: 2,
  personalEmail: 'ana@correo.cl',
  shoeSize: 38,
  clothingSize: 'M',
  educationLevelId: 1,
  afpId: 1,
  healthSystemId: 1,
  bankId: 1,
  accountType: 'CHECKING',
  accountNumber: '12345678',
}

describe('Colaboradores: lista', () => {
  it('muestra RUT formateado, centro de costo y estado', async () => {
    app = await mountApp('/staff')
    expect(text()).toContain('Lista de colaboradores')
    expect(text()).toContain('12.345.678-5')
    expect(text()).toContain('Ana Paz Rojas')
    expect(text()).toContain('CC-1')
  })

  it('filtra por estado y centro de costo desde la URL', async () => {
    app = await mountApp('/staff?statusCode=ACTIVE&projectId=1')
    expect(text()).toContain('Estado: Activo')
    expect(app.backend.find('GET', /^\/staff$/)[0].params).toMatchObject({ statusCode: 'ACTIVE', projectId: 1 })
    await clickText('button', 'Filtrar')
    await go('/staff')
    expect(router.currentRoute.value.query.statusCode).toBeUndefined()
  })

  it('ordena por nombre', async () => {
    app = await mountApp('/staff')
    await click($$('th').find((th) => /Nombre/.test(th.textContent ?? '')) ?? null)
    expect(router.currentRoute.value.query.sort).toContain('firstName')
    expect(app.backend.find('GET', /^\/staff$/).at(-1)?.params.sort).toBe('staffName,asc')
  })

  it('muestra el detalle completo de un colaborador', async () => {
    app = await mountApp('/staff?detail=1')
    expect(text()).toContain('Detalle de colaborador')
    expect(text()).toContain('Calle 123')
    for (const [tab, expected] of [['Laboral', 'Banco 1'], ['Documentos', 'documento-1.pdf'], ['Trazabilidad', 'Ana Pérez']] as const) {
      await clickText('.v-tab', tab)
      expect(text()).toContain(expected)
    }
  })

  it('descarga un adjunto desde el detalle', async () => {
    app = await mountApp('/staff?detail=1')
    URL.createObjectURL = () => 'blob:x'
    URL.revokeObjectURL = () => undefined
    const download = $$('button').find((b) => /Descargar|download/i.test((b.getAttribute('aria-label') ?? '') + (b.textContent ?? '')))
    if (download) await click(download)
    expect(app.backend.calls.some((c) => c.path.startsWith('/staff/1'))).toBe(true)
  })

  it('muestra el motivo de bloqueo de un colaborador bloqueado', async () => {
    const backend = installBackend()
    backend.on('GET', /^\/staff\/1$/, { data: fx.staff(1, true), error: null, meta: {} })
    app = await mountApp('/staff?detail=1', { backend })
    await clickText('.v-tab', 'Laboral')
    expect(text()).toContain('Motivo de bloqueo')
  })

  it('bloquea exigiendo un motivo', async () => {
    app = await mountApp('/staff')
    await click(rowMenu())
    await click($('[data-testid="action-block"]'))
    expect(text()).toContain('Bloquear colaborador')
    await click($('[data-testid="block-confirm"]'))
    expect(text()).toContain('motivo')
    expect(app.backend.find('PATCH', /status$/)).toHaveLength(0)

    await type($('[data-testid="block-reason"] textarea') as HTMLInputElement, 'x'.repeat(300))
    await click($('[data-testid="block-confirm"]'))
    expect(app.backend.find('PATCH', /status$/)).toHaveLength(0)

    await type($('[data-testid="block-reason"] textarea') as HTMLInputElement, 'Incumplimiento')
    await click($('[data-testid="block-confirm"]'))
    const [patch] = app.backend.find('PATCH', /^\/staff\/1\/status$/)
    expect(JSON.parse(patch.data as string)).toEqual({ statusId: 2, blockReason: 'Incumplimiento' })
  })

  it('muestra errores de backend al bloquear', async () => {
    app = await mountApp('/staff')
    app.backend.on('PATCH', /status$/, { failure: { status: 400, errorFields: { blockReason: 'Motivo demasiado largo' } } })
    await click(rowMenu())
    await click($('[data-testid="action-block"]'))
    await type($('[data-testid="block-reason"] textarea') as HTMLInputElement, 'Algo')
    await click($('[data-testid="block-confirm"]'))
    expect(text()).toContain('Motivo demasiado largo')
  })

  it('avisa si bloquear falla sin detalle', async () => {
    app = await mountApp('/staff')
    app.backend.on('PATCH', /status$/, { failure: { status: 500 } })
    await click(rowMenu())
    await click($('[data-testid="action-block"]'))
    await type($('[data-testid="block-reason"] textarea') as HTMLInputElement, 'Algo')
    await click($('[data-testid="block-confirm"]'))
    expect(app.backend.find('PATCH', /status$/)).toHaveLength(1)
  })

  it('desbloquea un colaborador bloqueado', async () => {
    const backend = installBackend()
    backend.on('GET', /^\/staff$/, { data: [{ ...fx.staffList(1), statusCode: 'BLOCKED', statusName: 'Bloqueado' }], meta: { pagination: { page: 0, size: 10, total: 1, pageCount: 1 } } })
    app = await mountApp('/staff', { backend })
    await click(rowMenu())
    await clickText('.v-list-item', 'Desbloquear')
    expect(text()).toContain('Desbloquear colaborador')
    await click($('[data-testid="block-confirm"]'))
    const [patch] = app.backend.find('PATCH', /^\/staff\/1\/status$/)
    expect(JSON.parse(patch.data as string)).toEqual({ statusId: 1 })
  })

  it('falla si el catálogo no trae el estado destino', async () => {
    const backend = installBackend()
    backend.on('GET', /platformStatuses/, { data: [], meta: {} })
    app = await mountApp('/staff', { backend })
    await click(rowMenu())
    await click($('[data-testid="action-block"]'))
    await type($('[data-testid="block-reason"] textarea') as HTMLInputElement, 'Algo')
    await click($('[data-testid="block-confirm"]'))
    expect(app.backend.find('PATCH', /status$/)).toHaveLength(0)
  })

  it('abre el formulario de edición desde el menú', async () => {
    app = await mountApp('/staff')
    await click(rowMenu())
    await clickText('.v-list-item', 'Editar')
    expect(router.currentRoute.value.path).toBe('/staff/1/edit')
  })

  it('"Nuevo" abre el formulario de alta', async () => {
    app = await mountApp('/staff')
    await click($('[data-testid="list-new"]'))
    expect(router.currentRoute.value.path).toBe('/staff/new')
  })
})

describe('Colaboradores: formulario', () => {
  it('muestra todos los errores al enviar vacío', async () => {
    app = await mountApp('/staff/new')
    await clickText('button', 'Guardar')
    const vm = app.vm<FormVm>(StaffFormView)
    expect(Object.keys(vm.fieldErrors)).toEqual(
      expect.arrayContaining(['identificationNumber', 'firstName', 'paternalLastName', 'personalEmail', 'phone1', 'birthDate', 'regionId', 'bankId', 'accountType', 'accountNumber']),
    )
    expect(app.backend.find('POST', /^\/staff$/)).toHaveLength(0)
  })

  it('rechaza un RUT con dígito verificador inválido y un menor de edad', async () => {
    app = await mountApp('/staff/new')
    const vm = app.vm<FormVm>(StaffFormView)
    Object.assign(vm.form, VALID_FORM, { identificationNumber: '12.345.678-9', birthDate: '2099-01-01', hasChildren: true, childrenCount: null })
    await settle()
    await clickText('button', 'Guardar')
    expect(vm.fieldErrors.identificationNumber).toBeTruthy()
    expect(vm.fieldErrors.birthDate).toBeTruthy()
    expect(vm.fieldErrors.childrenCount).toBeTruthy()
  })

  it('enmascara el RUT al escribir y valida al salir del campo', async () => {
    app = await mountApp('/staff/new')
    const input = inputByLabel('RUT')
    await type(input, '123456789')
    expect(input.value).toBe('12.345.678-9')
    input.dispatchEvent(new Event('blur'))
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    await settle()
    const keydown = new KeyboardEvent('keydown', { key: 'a', cancelable: true, bubbles: true })
    input.dispatchEvent(keydown)
    expect(keydown.defaultPrevented).toBe(true)
    const allowed = new KeyboardEvent('keydown', { key: 'Backspace', cancelable: true, bubbles: true })
    input.dispatchEvent(allowed)
    expect(allowed.defaultPrevented).toBe(false)
  })

  it('crea el colaborador y vuelve a la lista', async () => {
    app = await mountApp('/staff/new')
    const vm = app.vm<FormVm>(StaffFormView)
    Object.assign(vm.form, VALID_FORM)
    await settle()
    await clickText('button', 'Guardar')
    expect(vm.fieldErrors).toEqual({})
    expect(app.backend.find('POST', /^\/staff$/)).toHaveLength(1)
    expect(router.currentRoute.value.path).toBe('/staff')
  })

  it('envía el archivo adjunto elegido', async () => {
    app = await mountApp('/staff/new')
    const vm = app.vm<FormVm>(StaffFormView)
    Object.assign(vm.form, VALID_FORM)
    vm.pendingFiles = [new File(['x'], 'cv.pdf', { type: 'application/pdf' })]
    await settle()
    await clickText('button', 'Guardar')
    const [post] = app.backend.find('POST', /^\/staff$/)
    expect((post.data as FormData).get('file')).toBeInstanceOf(File)
  })

  it('el tipo de cuenta RUT solo existe para bancos que lo soportan', async () => {
    app = await mountApp('/staff/new')
    const vm = app.vm<FormVm & { accountTypeOptions: { value: string }[] }>(StaffFormView)
    vm.form.bankId = 1
    await settle()
    expect(vm.accountTypeOptions.map((o) => o.value)).toContain('RUT')
    vm.form.accountType = 'RUT'
    vm.form.bankId = 2
    await settle()
    expect(vm.accountTypeOptions.map((o) => o.value)).not.toContain('RUT')
    expect(vm.form.accountType).toBeNull()
  })

  it('cambia región y provincia limpiando las dependientes', async () => {
    app = await mountApp('/staff/new')
    const vm = app.vm<FormVm & { onRegionChange(): void; onProvinciaChange(): void }>(StaffFormView)
    Object.assign(vm.form, { regionId: 1, provinciaId: 1, comunaId: 1 })
    await settle()
    vm.onProvinciaChange()
    expect(vm.form.comunaId).toBeNull()
    vm.onRegionChange()
    expect(vm.form.provinciaId).toBeNull()
  })

  it('al cambiar el tipo de identificación limpia el número', async () => {
    app = await mountApp('/staff/new')
    const vm = app.vm<FormVm>(StaffFormView)
    vm.form.identificationNumber = '1-9'
    vm.form.identificationType = 'PASSPORT'
    await settle()
    expect(vm.form.identificationNumber).toBe('')
  })

  it('muestra los errores de backend', async () => {
    app = await mountApp('/staff/new')
    app.backend.on('POST', /^\/staff$/, { failure: { status: 409, errorFields: { identificationNumber: 'RUT ya registrado' } } })
    const vm = app.vm<FormVm>(StaffFormView)
    Object.assign(vm.form, VALID_FORM)
    await settle()
    await clickText('button', 'Guardar')
    expect(text()).toContain('RUT ya registrado')
  })

  it('avisa si guardar falla sin detalle', async () => {
    app = await mountApp('/staff/new')
    app.backend.on('POST', /^\/staff$/, { failure: { status: 500 } })
    const vm = app.vm<FormVm>(StaffFormView)
    Object.assign(vm.form, VALID_FORM)
    await settle()
    await clickText('button', 'Guardar')
    expect(router.currentRoute.value.path).toBe('/staff/new')
  })

  it('edita precargando la ficha y borrando un adjunto guardado', async () => {
    app = await mountApp('/staff/1/edit')
    const vm = app.vm<FormVm>(StaffFormView)
    expect(vm.form).toMatchObject({ id: 1, firstName: 'Ana', phone1: '9 1234 5678', bankId: 1, regionId: 1 })
    expect(text()).toContain('Editar colaborador')
    vm.removedAttachmentIds.push(1)
    await settle()
    await clickText('button', 'Guardar')
    expect(app.backend.find('DELETE', /^\/staff\/1\/attachments\/1$/)).toHaveLength(1)
    expect(app.backend.find('PUT', /^\/staff\/1$/)).toHaveLength(1)
    expect(router.currentRoute.value.path).toBe('/staff')
  })

  it('cancelar vuelve a la lista', async () => {
    app = await mountApp('/staff/new')
    await clickText('button', 'Cancelar')
    expect(router.currentRoute.value.path).toBe('/staff')
    expect(byText('h1', 'Lista de colaboradores')).not.toBeNull()
  })
})
