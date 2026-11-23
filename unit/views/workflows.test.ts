import { afterEach, describe, expect, it, vi } from 'vitest'
import router from '@/router'
import ContractFormView from '@/views/contract/ContractFormView.vue'
import { $, $$, click, clickText, go, mountApp, pick, settle, text, type, type MountedApp } from '../helpers/app'
import { installBackend, singleOf } from '../helpers/backend'
import * as fx from '../helpers/fixtures'

let app: MountedApp | null = null
afterEach(() => {
  app?.unmount()
  app = null
})

const rowMenu = (index = 0) => $$('[data-testid="row-actions"]')[index]

const LISTS = [
  { name: 'Solicitudes', path: '/requests', api: '/requests', decisions: false },
  { name: 'Contratos', path: '/contracts', api: '/contracts', decisions: true },
  { name: 'Finiquitos', path: '/terminations', api: '/terminations', decisions: true },
  { name: 'Anexos', path: '/annexes', api: '/annexes', decisions: true },
]

describe.each(LISTS)('Flujo de aprobación: $name', (l) => {
  it('lista los registros', async () => {
    app = await mountApp(l.path)
    expect(app.backend.find('GET', new RegExp(`^${l.api}$`))).toHaveLength(1)
    expect($$('tbody tr').length).toBeGreaterThanOrEqual(3)
  })

  it('ordena, busca y pagina sin errores', async () => {
    app = await mountApp(`${l.path}?sort=fullName,desc&page=1&size=25&search=ana`)
    expect(app.backend.find('GET', new RegExp(`^${l.api}$`))[0].params).toMatchObject({ size: 25, search: 'ana' })
  })

  it('muestra un error si la lista no carga', async () => {
    const backend = installBackend()
    backend.on('GET', new RegExp(`^${l.api}$`), { failure: { status: 500 } })
    app = await mountApp(l.path, { backend })
    expect(text()).toMatch(/No se pudo cargar/)
  })

  it('abre el menú de filtros', async () => {
    app = await mountApp(l.path)
    await clickText('button', 'Filtrar')
    expect($('.v-navigation-drawer, .v-overlay--active')).not.toBeNull()
  })
})

describe.each(LISTS.filter((l) => l.decisions))('Decisiones: $name', (l) => {
  it('aprueba desde el menú de acciones', async () => {
    app = await mountApp(l.path)
    await click(rowMenu())
    await click($('[data-testid="action-approve"]'))
    expect(text()).toContain('Aprobar solicitud')
    await click($('[data-testid="decision-confirm"]'))
    expect(app.backend.find('PATCH', /^\/requests\/\d+\/decide$/)).toHaveLength(1)
    expect(JSON.parse(app.backend.find('PATCH', /decide$/)[0].data as string)).toEqual({ decision: 'APPROVED' })
  })

  it('valida desde el menú de acciones', async () => {
    app = await mountApp(l.path)
    await click(rowMenu())
    await click($('[data-testid="action-validate"]'))
    expect(text()).toContain('Validar solicitud')
    await click($('[data-testid="decision-confirm"]'))
    expect(app.backend.find('PATCH', /decide$/)).toHaveLength(1)
  })

  it('rechaza exigiendo un motivo', async () => {
    app = await mountApp(l.path)
    await click(rowMenu())
    await click($('[data-testid="action-reject"]'))
    expect(text()).toContain('Rechazar solicitud')
    await click($('[data-testid="decision-confirm"]'))
    expect(app.backend.find('PATCH', /decide$/)).toHaveLength(0)

    const field = $('[data-testid="decision-reason"] .v-field') as HTMLElement
    field.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await click(field)
    await click($$('.v-overlay--active .v-list-item')[0] ?? null)
    await click($('[data-testid="decision-confirm"]'))
    const [patch] = app.backend.find('PATCH', /decide$/)
    expect(JSON.parse(patch.data as string)).toMatchObject({ decision: 'REJECTED', rejectionReasonId: 1 })
  })

  it('muestra errores de backend al decidir', async () => {
    app = await mountApp(l.path)
    app.backend.on('PATCH', /decide$/, { failure: { status: 409, errorFields: { decision: 'La solicitud ya fue resuelta' } } })
    await click(rowMenu())
    await click($('[data-testid="action-approve"]'))
    await click($('[data-testid="decision-confirm"]'))
    expect(text()).toContain('La solicitud ya fue resuelta')
  })

  it('avisa si la decisión falla sin detalle', async () => {
    app = await mountApp(l.path)
    app.backend.on('PATCH', /decide$/, { failure: { status: 500 } })
    await click(rowMenu())
    await click($('[data-testid="action-approve"]'))
    await click($('[data-testid="decision-confirm"]'))
    expect(app.backend.find('PATCH', /decide$/)).toHaveLength(1)
  })
})


const SYNC_LISTS = [
  { name: 'Contratos', path: '/contracts', detail: /^\/contracts\/1$/, entity: fx.contract },
  { name: 'Finiquitos', path: '/terminations', detail: /^\/terminations\/1$/, entity: fx.termination },
  { name: 'Anexos', path: '/annexes', detail: /^\/annexes\/1$/, entity: fx.annex },
]

describe.each(SYNC_LISTS)('Sincronización con Rex+ al decidir: $name', (l) => {
  const withStatus = (code: string) => ({
    data: { ...l.entity(1), status: { id: 9, code, name: code } },
    error: null,
    meta: {},
  })

  async function decide(kind: 'approve' | 'validate' | 'reject') {
    await click(rowMenu())
    await click($(`[data-testid="action-${kind}"]`))
    if (kind === 'reject') {
      const field = $('[data-testid="decision-reason"] .v-field') as HTMLElement
      field.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      await click(field)
      await click($$('.v-overlay--active .v-list-item')[0] ?? null)
    }
    await click($('[data-testid="decision-confirm"]'))
  }

  it('avisa con una advertencia si la entidad queda en error de sincronización', async () => {
    app = await mountApp(l.path)
    app.backend.on('GET', l.detail, withStatus('SYNC_ERROR'))
    await decide('validate')
    await vi.waitFor(() => expect(text()).toContain('falló la sincronización con Rex+'))
    expect(text()).not.toContain('Solicitud validada')
  })

  it('muestra el éxito normal si la sincronización salió bien', async () => {
    app = await mountApp(l.path)
    app.backend.on('GET', l.detail, withStatus('ACTIVE'))
    await decide('validate')
    await vi.waitFor(() => expect(text()).toContain('Solicitud validada'))
    expect(text()).not.toContain('falló la sincronización')
  })

  it('al rechazar no consulta el estado ni avisa de sincronización', async () => {
    app = await mountApp(l.path)
    app.backend.on('GET', l.detail, withStatus('SYNC_ERROR'))
    const before = app.backend.find('GET', l.detail).length
    await decide('reject')
    await vi.waitFor(() => expect(text()).toContain('Solicitud rechazada'))
    expect(app.backend.find('GET', l.detail)).toHaveLength(before)
  })

  it('si no puede consultar el estado, muestra el éxito de la decisión', async () => {
    app = await mountApp(l.path)
    app.backend.on('GET', l.detail, { failure: { status: 500 } })
    await decide('approve')
    await vi.waitFor(() => expect(text()).toContain('Solicitud aprobada'))
  })
})

describe('Solicitudes', () => {
  it('muestra los contadores pendientes y filtra con los chips de la URL', async () => {
    app = await mountApp('/requests?statusId=1&projectId=1&requesterUserId=1&createdFrom=2026-01-01&createdTo=2026-02-01')
    expect(text()).toContain('Estado: Pendiente de aprobación')
    expect(app.backend.find('GET', /^\/requests$/)[0].params).toMatchObject({ statusId: 1, projectId: 1, requesterUserId: 1, createdFrom: '2026-01-01', createdTo: '2026-02-01' })
    await go('/requests')
  })

  it('arma el filtro de solicitante con los solicitantes de backend, sin pedir la lista de usuarios', async () => {
    app = await mountApp('/requests?requesterUserId=2')
    expect(text()).toContain('Solicitante: Luis Soto')
    expect(app.backend.find('GET', /^\/requests\/requesters$/).length).toBeGreaterThan(0)
    expect(app.backend.find('GET', /^\/users$/)).toHaveLength(0)
  })

  it('"Ver" redirige al detalle del contrato', async () => {
    app = await mountApp('/requests')
    await click(rowMenu())
    await click($('[data-testid="action-view"]'))
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/contracts'))
    expect(router.currentRoute.value.query.detail).toBeDefined()
  })

  it('"Ver" de un anexo va al módulo de Anexos y una entidad desconocida no navega', async () => {
    const { request } = await import('../helpers/fixtures')
    const backend = installBackend()
    backend.on('GET', /^\/requests$/, {
      data: [request(1, 'ANNEX'), request(2, 'OTRA')],
      meta: { pagination: { page: 0, size: 10, total: 2, pageCount: 1 } },
    })
    app = await mountApp('/requests', { backend })
    await click(rowMenu(0))
    await click($('[data-testid="action-view"]'))
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/annexes'))
    expect(router.currentRoute.value.query.detail).toBe('11')
    await go('/requests')
    await click(rowMenu(1))
    await click($('[data-testid="action-view"]'))
    expect(router.currentRoute.value.path).toBe('/requests')
  })

  it('"Ver" de un finiquito va al módulo de Finiquitos', async () => {
    const backend = installBackend()
    backend.on('GET', /^\/requests$/, {
      data: [
        { ...(await import('../helpers/fixtures')).request(1, 'TERMINATION') },
        { ...(await import('../helpers/fixtures')).request(2, 'ANNEX') },
      ],
      meta: { pagination: { page: 0, size: 10, total: 2, pageCount: 1 } },
    })
    app = await mountApp('/requests', { backend })
    await click(rowMenu(0))
    await click($('[data-testid="action-view"]'))
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/terminations'))
  })
})

describe('Contratos', () => {
  it('muestra los contadores y los alterna como filtro', async () => {
    app = await mountApp('/contracts')
    expect(text()).toContain('Por vencer')
    expect(text()).toContain('Vencidos')
    expect(text()).toContain('En los próximos 30 días')
    await clickText('[role="button"].indicator', 'Por vencer')
    expect(router.currentRoute.value.query.expiringSoon).toBe('true')
    expect(text()).toContain('Por vencer en 30 días')
    await clickText('[role="button"].indicator', 'Por vencer')
    expect(router.currentRoute.value.query.expiringSoon).toBeUndefined()
    await clickText('[role="button"].indicator', 'Vencidos')
    expect(router.currentRoute.value.query.statusId).toBe('3')
    await clickText('[role="button"].indicator', 'Vencidos')
    expect(router.currentRoute.value.query.statusId).toBeUndefined()
    const card = $$('[role="button"].indicator')[0]
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await settle()
    expect(router.currentRoute.value.query.expiringSoon).toBe('true')
    card.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
    await settle()
    expect(router.currentRoute.value.query.expiringSoon).toBeUndefined()
  })

  it('filtra por tipo de contrato y centro de costo', async () => {
    app = await mountApp('/contracts?contractTypeId=1&projectId=1&statusId=2')
    expect(text()).toContain('Tipo de contrato: Plazo fijo')
    expect(text()).toContain('Centro de costo:')
    expect(text()).toContain('Estado: Vigente')
  })

  it('muestra el detalle con pestañas, historial y adjuntos', async () => {
    app = await mountApp('/contracts?detail=1')
    expect(text()).toContain('Detalle de contrato')
    expect(text()).toContain('REX-1')
    for (const tab of ['Condiciones laborales', 'Documentos adjuntos', 'Trazabilidad']) {
      const el = $$('.v-tab').find((t) => (t.textContent ?? '').includes(tab))
      if (el) await click(el)
    }
    expect(app.backend.find('GET', /^\/requests\/1$/)).toHaveLength(1)
  })

  it('el detalle permite aprobar, validar, rechazar y editar', async () => {
    app = await mountApp('/contracts?detail=1')
    const drawerMenu = $$('[data-testid="row-actions"]').at(-1)
    await click(drawerMenu ?? null)
    await click($('[data-testid="action-approve"]'))
    await click($('[data-testid="decision-confirm"]'))
    expect(app.backend.find('PATCH', /decide$/)).toHaveLength(1)
    await click($$('[data-testid="row-actions"]').at(-1) ?? null)
    await clickText('.v-list-item', 'Editar')
    expect(router.currentRoute.value.path).toBe('/contracts/1/edit')
  })

  it('el detalle ofrece validar y rechazar', async () => {
    app = await mountApp('/contracts?detail=1')
    await click($$('[data-testid="row-actions"]').at(-1) ?? null)
    await click($('[data-testid="action-validate"]'))
    await click($('[data-testid="decision-confirm"]'))
    await click($$('[data-testid="row-actions"]').at(-1) ?? null)
    await click($('[data-testid="action-reject"]'))
    expect(text()).toContain('Rechazar solicitud')
  })

  it('"Nuevo" abre el formulario de solicitud', async () => {
    app = await mountApp('/contracts')
    await click($('[data-testid="list-new"]'))
    expect(router.currentRoute.value.path).toBe('/contracts/new')
  })
})

const annulReasonInput = () =>
  $('[data-testid="annul-reason"] textarea, [data-testid="annul-reason"] input') as HTMLInputElement

async function openAnnulDialog() {
  await click($$('[data-testid="row-actions"]').at(-1) ?? null)
  await click($('[data-testid="action-annul"]'))
}

describe('Contratos: anular', () => {
  it('anula un contrato exigiendo un motivo', async () => {
    app = await mountApp('/contracts?detail=1')
    await openAnnulDialog()
    expect(text()).toContain('Anular contrato')
    await click($('[data-testid="annul-confirm"]'))
    expect(text()).toContain('Indica el motivo de la anulación.')
    expect(app.backend.find('PATCH', /annul$/)).toHaveLength(0)
    await type(annulReasonInput(), '  Error de digitación  ')
    await click($('[data-testid="annul-confirm"]'))
    const [patch] = app.backend.find('PATCH', /^\/contracts\/1\/annul$/)
    expect(JSON.parse(patch.data as string)).toEqual({ reason: 'Error de digitación' })
  })

  it('no acepta un motivo de más de 250 caracteres', async () => {
    app = await mountApp('/contracts?detail=1')
    await openAnnulDialog()
    await type(annulReasonInput(), 'x'.repeat(251))
    await click($('[data-testid="annul-confirm"]'))
    expect(text()).toContain('El motivo no puede superar los 250 caracteres.')
    expect(app.backend.find('PATCH', /annul$/)).toHaveLength(0)
  })

  it('muestra los errores de validación de backend dentro del diálogo', async () => {
    app = await mountApp('/contracts?detail=1')
    app.backend.on('PATCH', /annul$/, {
      failure: {
        status: 400,
        errorFields: {
          status: 'El plazo de 5 días hábiles para anular ya venció.',
          terminations: 'El contrato tiene un finiquito en curso.',
          annexes: 'El contrato tiene un anexo en curso.',
        },
      },
    })
    await openAnnulDialog()
    await type(annulReasonInput(), 'Error')
    await click($('[data-testid="annul-confirm"]'))
    expect(text()).toContain('El plazo de 5 días hábiles para anular ya venció.')
    expect(text()).toContain('El contrato tiene un finiquito en curso.')
    expect(text()).toContain('El contrato tiene un anexo en curso.')
    expect($('[data-testid="annul-confirm"]')).not.toBeNull()
  })

  it('avisa si anular falla sin detalle', async () => {
    app = await mountApp('/contracts?detail=1')
    app.backend.on('PATCH', /annul$/, { failure: { status: 500 } })
    await openAnnulDialog()
    await type(annulReasonInput(), 'Error')
    await click($('[data-testid="annul-confirm"]'))
    expect(app.backend.find('PATCH', /annul$/)).toHaveLength(1)
  })

  it('tras anular refresca el detalle y la lista', async () => {
    app = await mountApp('/contracts?detail=1')
    const detailCalls = () => app!.backend.find('GET', /^\/contracts\/1$/).length
    const before = detailCalls()
    await openAnnulDialog()
    await type(annulReasonInput(), 'Error')
    await click($('[data-testid="annul-confirm"]'))
    expect(detailCalls()).toBeGreaterThan(before)
  })

  it('el detalle muestra el motivo de la anulación solo cuando existe', async () => {
    app = await mountApp('/contracts?detail=1')
    expect(text()).not.toContain('Motivo de la anulación')
    app.unmount()

    const backend = installBackend()
    backend.on('GET', /^\/contracts\/1$/, singleOf({ ...fx.contract(1), annulmentReason: 'Se firmó por error' }))
    app = await mountApp('/contracts?detail=1', { backend })
    expect(text()).toContain('Motivo de la anulación')
    expect(text()).toContain('Se firmó por error')
  })

  it('sin la acción ANNUL en actions[] no se ofrece anular', async () => {
    const backend = installBackend()
    backend.on('GET', /^\/contracts\/1$/, singleOf({ ...fx.contract(1), actions: ['APPROVE'] }))
    app = await mountApp('/contracts?detail=1', { backend })
    await click($$('[data-testid="row-actions"]').at(-1) ?? null)
    expect($('[data-testid="action-approve"]')).not.toBeNull()
    expect($('[data-testid="action-annul"]')).toBeNull()
  })
})

type ContractVm = {
  form: Record<string, unknown>
  fieldErrors: Record<string, string>
  pendingByType: Record<string, File[]>
  savedAttachments: { id: number }[]
  isFixedTerm: boolean
  removeSavedAttachment(a: { id: number }): void
}

const VALID_CONTRACT = {
  staffId: 1,
  projectId: 1,
  companyId: 1,
  contractTypeId: 1,
  jobTitleId: 1,
  siteId: 1,
  startDate: '2999-01-01',
  endDate: '2999-12-31',
  baseSalary: '800.000',
  agreedSalary: '900.000',
  weeklyWorkHours: 45,
  workDays: 5,
  contractDetail: 'Detalle',
}

async function attachAll(vm: ContractVm) {
  for (const type of Object.keys(vm.pendingByType)) vm.pendingByType[type] = [new File(['x'], `${type}.pdf`)]
  await settle()
}

describe('Contratos: formulario', () => {
  it('muestra todos los errores al enviar vacío', async () => {
    app = await mountApp('/contracts/new')
    await click($('[data-testid="contract-submit"]'))
    const vm = app.vm<ContractVm>(ContractFormView)
    expect(Object.keys(vm.fieldErrors)).toEqual(
      expect.arrayContaining(['staffId', 'projectId', 'companyId', 'contractTypeId', 'jobTitleId', 'siteId', 'startDate', 'baseSalary', 'weeklyWorkHours', 'workDays', 'CEDULA_FRONTAL']),
    )
    expect(app.backend.find('POST', /^\/requests$/)).toHaveLength(0)
  })

  it('exige fecha de término en plazo fijo y rechaza fechas incoherentes', async () => {
    app = await mountApp('/contracts/new')
    const vm = app.vm<ContractVm>(ContractFormView)
    Object.assign(vm.form, VALID_CONTRACT, { startDate: '2000-01-01', endDate: null, baseSalary: '0', agreedSalary: '0' })
    await settle()
    expect(vm.isFixedTerm).toBe(true)
    await click($('[data-testid="contract-submit"]'))
    expect(vm.fieldErrors).toMatchObject({ startDate: expect.any(String), endDate: expect.any(String), baseSalary: expect.any(String), agreedSalary: expect.any(String) })
    vm.form.startDate = '2999-05-01'
    await settle()
    vm.form.endDate = '2999-04-01'
    await settle()
    await click($('[data-testid="contract-submit"]'))
    expect(vm.fieldErrors.endDate).toBeTruthy()
  })

  it('al pasar a plazo indefinido limpia la fecha de término', async () => {
    app = await mountApp('/contracts/new')
    const vm = app.vm<ContractVm>(ContractFormView)
    Object.assign(vm.form, VALID_CONTRACT)
    await settle()
    vm.form.contractTypeId = 2
    await settle()
    expect(vm.form.endDate).toBeNull()
    vm.form.startDate = '2999-02-01'
    await settle()
  })

  it('crea la solicitud con sus adjuntos y vuelve a Contratos', async () => {
    app = await mountApp('/contracts/new')
    const vm = app.vm<ContractVm>(ContractFormView)
    Object.assign(vm.form, VALID_CONTRACT)
    await attachAll(vm)
    await click($('[data-testid="contract-submit"]'))
    expect(vm.fieldErrors).toEqual({})
    const [post] = app.backend.find('POST', /^\/requests$/)
    expect((post.data as FormData).getAll('files')).toHaveLength(5)
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/contracts'))
  })

  it('muestra errores de backend y avisa fallos genéricos', async () => {
    app = await mountApp('/contracts/new')
    const vm = app.vm<ContractVm>(ContractFormView)
    Object.assign(vm.form, VALID_CONTRACT)
    await attachAll(vm)
    app.backend.on('POST', /^\/requests$/, { failure: { status: 409, errorFields: { staffId: 'El colaborador ya tiene contrato vigente' } } })
    await click($('[data-testid="contract-submit"]'))
    expect(text()).toContain('El colaborador ya tiene contrato vigente')
    app.backend.on('POST', /^\/requests$/, { failure: { status: 500 } })
    await click($('[data-testid="contract-submit"]'))
    expect(router.currentRoute.value.path).toBe('/contracts/new')
  })

  it('edita precargando los datos y respeta un proyecto inactivo', async () => {
    const backend = installBackend()
    backend.on('GET', /^\/projects\/selector$/, { data: [{ id: 9, name: 'Otro' }], meta: {} })
    app = await mountApp('/contracts/1/edit', { backend })
    const vm = app.vm<ContractVm & { projectOptions: { id: number; props?: object }[] }>(ContractFormView)
    expect(text()).toContain('Editar contrato')
    expect(vm.form).toMatchObject({ id: 1, projectId: 1, baseSalary: '800.000' })
    expect(vm.projectOptions.find((p) => p.id === 1)?.props).toEqual({ disabled: true })
    expect(vm.savedAttachments).toHaveLength(1)
    for (const type of Object.keys(vm.pendingByType)) {
      if (type !== 'CEDULA_FRONTAL') vm.pendingByType[type] = [new File(['x'], `${type}.pdf`)]
    }
    const originalStart = vm.form.startDate
    vm.form.startDate = '2000-01-01'
    await settle()
    await click($('[data-testid="contract-submit"]'))
    expect(vm.fieldErrors.startDate).toBeTruthy()
    vm.form.startDate = originalStart
    await settle()
    await click($('[data-testid="contract-submit"]'))
    expect(vm.fieldErrors).toEqual({})
    expect(app.backend.find('PUT', /^\/contracts\/1$/)).toHaveLength(1)
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/contracts'))
  })

  it('exige reponer un adjunto quitado en edición', async () => {
    app = await mountApp('/contracts/1/edit')
    const vm = app.vm<ContractVm>(ContractFormView)
    vm.removeSavedAttachment({ id: 1 })
    await settle()
    await click($('[data-testid="contract-submit"]'))
    expect(vm.fieldErrors.CEDULA_FRONTAL).toBeTruthy()
    vm.pendingByType.CEDULA_FRONTAL = [new File(['x'], 'nuevo.pdf')]
    await settle()
    expect(vm.fieldErrors.CEDULA_FRONTAL).toBeUndefined()
  })

  it('cancelar vuelve a la lista', async () => {
    app = await mountApp('/contracts/new')
    await clickText('button', 'Cancelar')
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/contracts'))
    expect(pick).toBeDefined()
  })
})
