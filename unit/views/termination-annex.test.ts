import { afterEach, describe, expect, it } from 'vitest'
import router from '@/router'
import TerminationFormView from '@/views/termination/TerminationFormView.vue'
import AnnexFormView from '@/views/annex/AnnexFormView.vue'
import { $, $$, click, clickText, mountApp, settle, text, type, type MountedApp } from '../helpers/app'
import { installBackend } from '../helpers/backend'
import * as fx from '../helpers/fixtures'

let app: MountedApp | null = null
afterEach(() => {
  app?.unmount()
  app = null
})

const lastMenu = () => $$('[data-testid="row-actions"]').at(-1) ?? null
const tab = (name: string) => clickText('.v-tab', name)

describe('Finiquitos: detalle', () => {
  it('muestra las pestañas con sus datos', async () => {
    app = await mountApp('/terminations?detail=1')
    expect(text()).toContain('Detalle de finiquito')
    expect(text()).toContain('Necesidades de la empresa')
    for (const name of ['Adjuntos', 'Documentos', 'Trazabilidad', 'Historial']) {
      const el = $$('.v-tab').find((t) => (t.textContent ?? '').includes(name))
      if (el) await click(el)
    }
    expect(app.backend.find('GET', /^\/terminations\/1$/)).toHaveLength(1)
  })

  it('un finiquito no definitivo oculta el motivo de no recontratación', async () => {
    const backend = installBackend()
    backend.on('GET', /^\/terminations\/1$/, { data: { ...fx.termination(1), definitiveTermination: false, nonRehireReason: null, notes: null }, error: null, meta: {} })
    app = await mountApp('/terminations?detail=1', { backend })
    expect(text()).not.toContain('Mal desempeño')
  })

  it('anula un finiquito exigiendo un motivo', async () => {
    app = await mountApp('/terminations?detail=1')
    await click(lastMenu())
    await click($('[data-testid="action-annul"]'))
    expect(text()).toContain('Anular')
    await click($('[data-testid="annul-confirm"]'))
    expect(app.backend.find('PATCH', /annul$/)).toHaveLength(0)
    await type($('[data-testid="annul-reason"] textarea, [data-testid="annul-reason"] input') as HTMLInputElement, 'Error de digitación')
    await click($('[data-testid="annul-confirm"]'))
    const [patch] = app.backend.find('PATCH', /^\/terminations\/1\/annul$/)
    expect(JSON.parse(patch.data as string)).toEqual({ reason: 'Error de digitación' })
  })

  it('muestra errores de backend al anular', async () => {
    app = await mountApp('/terminations?detail=1')
    app.backend.on('PATCH', /annul$/, { failure: { status: 400, errorFields: { reason: 'Motivo inválido' } } })
    await click(lastMenu())
    await click($('[data-testid="action-annul"]'))
    await type($('[data-testid="annul-reason"] textarea, [data-testid="annul-reason"] input') as HTMLInputElement, 'x')
    await click($('[data-testid="annul-confirm"]'))
    expect(text()).toContain('Motivo inválido')
  })

  it('avisa si anular falla sin detalle', async () => {
    app = await mountApp('/terminations?detail=1')
    app.backend.on('PATCH', /annul$/, { failure: { status: 500 } })
    await click(lastMenu())
    await click($('[data-testid="action-annul"]'))
    await type($('[data-testid="annul-reason"] textarea, [data-testid="annul-reason"] input') as HTMLInputElement, 'x')
    await click($('[data-testid="annul-confirm"]'))
    expect(app.backend.find('PATCH', /annul$/)).toHaveLength(1)
  })

  it('el detalle permite aprobar y editar', async () => {
    app = await mountApp('/terminations?detail=1')
    await click(lastMenu())
    await click($('[data-testid="action-approve"]'))
    await click($('[data-testid="decision-confirm"]'))
    expect(app.backend.find('PATCH', /decide$/)).toHaveLength(1)
    await click(lastMenu())
    await clickText('.v-list-item', 'Editar')
    expect(router.currentRoute.value.path).toBe('/terminations/1/edit')
  })

  it('"Nuevo" abre el formulario de solicitud', async () => {
    app = await mountApp('/terminations')
    await click($('[data-testid="list-new"]'))
    expect(router.currentRoute.value.path).toBe('/terminations/new')
  })
})

type TerminationVm = {
  form: Record<string, unknown>
  fieldErrors: Record<string, string>
  pendingFile: File[]
  attachmentRequired: boolean
  attachmentLabel: string
  onAttachmentChange(files: File[]): void
  removeSavedAttachment(a: { id: number }): void
  causeItems: { id: number; props?: object }[]
  nonRehireReasonItems: { id: number; props?: object }[]
}

describe('Finiquitos: formulario', () => {
  it('muestra los errores al enviar vacío', async () => {
    app = await mountApp('/terminations/new')
    await click($('[data-testid="termination-submit"]'))
    const vm = app.vm<TerminationVm>(TerminationFormView)
    expect(Object.keys(vm.fieldErrors)).toEqual(['staffId', 'terminationDate', 'legalTerminationCauseId'])
    vm.form.definitiveTermination = true
    await click($('[data-testid="termination-submit"]'))
    expect(vm.fieldErrors.nonRehireReasonId).toBeTruthy()
    expect(app.backend.find('POST', /^\/requests$/)).toHaveLength(0)
  })

  it('exige adjunto si la causa lo requiere y lo acepta al elegirlo', async () => {
    app = await mountApp('/terminations/new')
    const vm = app.vm<TerminationVm>(TerminationFormView)
    Object.assign(vm.form, { staffId: 1, terminationDate: '2026-06-30', legalTerminationCauseId: 2, definitiveTermination: false })
    await settle()
    expect(vm.attachmentRequired).toBe(true)
    expect(vm.attachmentLabel).toBe('Carta de renuncia')
    await click($('[data-testid="termination-submit"]'))
    expect(vm.fieldErrors.attachment).toBeTruthy()
    vm.onAttachmentChange([new File(['x'], 'carta.pdf')])
    await settle()
    expect(vm.fieldErrors.attachment).toBeUndefined()
    vm.form.legalTerminationCauseId = 1
    await settle()
    expect(vm.attachmentLabel).toBe('Documento adjunto (opcional)')
  })

  it('limpia el motivo de no recontratación si deja de ser definitivo', async () => {
    app = await mountApp('/terminations/new')
    const vm = app.vm<TerminationVm>(TerminationFormView)
    Object.assign(vm.form, { definitiveTermination: true, nonRehireReasonId: 1 })
    await settle()
    vm.form.definitiveTermination = false
    await settle()
    expect(vm.form.nonRehireReasonId).toBeNull()
  })

  it('descarta una fecha fuera del rango que permite el colaborador elegido', async () => {
    app = await mountApp('/terminations/new')
    const vm = app.vm<TerminationVm>(TerminationFormView)
    vm.form.terminationDate = '2030-01-01'
    await settle()
    vm.form.staffId = 1
    await settle()
    expect(vm.form.terminationDate).toBeNull()
    vm.form.terminationDate = '2026-06-30'
    vm.form.staffId = null
    await settle()
    expect(vm.form.terminationDate).toBe('2026-06-30')
  })

  it('crea la solicitud y vuelve a Finiquitos', async () => {
    app = await mountApp('/terminations/new')
    const vm = app.vm<TerminationVm>(TerminationFormView)
    Object.assign(vm.form, { staffId: 1, terminationDate: '2026-06-30', legalTerminationCauseId: 1, definitiveTermination: true, nonRehireReasonId: 1, notes: 'Notas' })
    await settle()
    await click($('[data-testid="termination-submit"]'))
    expect(vm.fieldErrors).toEqual({})
    expect(app.backend.find('POST', /^\/requests$/)).toHaveLength(1)
    expect(router.currentRoute.value.path).toBe('/terminations')
  })

  it('muestra errores de backend y fallos genéricos', async () => {
    app = await mountApp('/terminations/new')
    const vm = app.vm<TerminationVm>(TerminationFormView)
    Object.assign(vm.form, { staffId: 1, terminationDate: '2026-06-30', legalTerminationCauseId: 1, definitiveTermination: false })
    await settle()
    app.backend.on('POST', /^\/requests$/, { failure: { status: 409, errorFields: { staffId: 'Ya tiene un finiquito' } } })
    await click($('[data-testid="termination-submit"]'))
    expect(text()).toContain('Ya tiene un finiquito')
    app.backend.on('POST', /^\/requests$/, { failure: { status: 500 } })
    await click($('[data-testid="termination-submit"]'))
    expect(router.currentRoute.value.path).toBe('/terminations/new')
  })

  it('edita conservando causa y motivo inactivos como opciones deshabilitadas', async () => {
    const backend = installBackend()
    backend.on('GET', /^\/legalTerminationCauses$/, { data: [{ id: 7, name: 'Otra', code: 'O' }], meta: {} })
    backend.on('GET', /^\/nonRehireReasons\/selector$/, { data: [{ id: 8, name: 'Otro motivo', code: 'OTRO' }], meta: {} })
    app = await mountApp('/terminations/1/edit', { backend })
    const vm = app.vm<TerminationVm>(TerminationFormView)
    expect(text()).toContain('Editar finiquito')
    expect(vm.form).toMatchObject({ id: 1, legalTerminationCauseId: 1, nonRehireReasonId: 1 })
    expect(vm.causeItems.find((c) => c.id === 1)?.props).toEqual({ disabled: true })
    expect(vm.nonRehireReasonItems.find((c) => c.id === 1)?.props).toEqual({ disabled: true })
    vm.removeSavedAttachment({ id: 1 })
    await click($('[data-testid="termination-submit"]'))
    expect(vm.fieldErrors.attachment).toBeTruthy()
    vm.onAttachmentChange([new File(['x'], 'carta.pdf')])
    await click($('[data-testid="termination-submit"]'))
    expect(app.backend.find('PUT', /^\/terminations\/1$/)).toHaveLength(1)
    expect(router.currentRoute.value.path).toBe('/terminations')
  })

  it('cancelar vuelve a la lista', async () => {
    app = await mountApp('/terminations/new')
    await clickText('button', 'Cancelar')
    expect(router.currentRoute.value.path).toBe('/terminations')
  })
})

describe('Anexos: detalle', () => {
  it('muestra el antes y después del cambio', async () => {
    app = await mountApp('/annexes?detail=1')
    expect(text()).toContain('Detalle de anexo')
    await tab('Cambio')
    expect(text()).toContain('Fecha de término')
    expect(text()).toContain('31-12-2026 → 30-06-2027')
    await tab('Documentos')
    await tab('Trazabilidad')
    expect(text()).toContain('Ana Pérez')
  })

  it.each(['CONVERSION_TO_INDEFINITE', 'SALARY_INCREASE', 'JOB_TITLE_CHANGE', 'SCHEDULE_OR_SITE_CHANGE'])('muestra el cambio de tipo %s', async (code) => {
    const backend = installBackend()
    backend.on('GET', /^\/annexes\/1$/, { data: fx.annex(1, code), error: null, meta: {} })
    app = await mountApp('/annexes?detail=1', { backend })
    expect(text()).toContain('Detalle de anexo')
  })

  it('el detalle permite aprobar y editar', async () => {
    app = await mountApp('/annexes?detail=1')
    await click(lastMenu())
    await click($('[data-testid="action-approve"]'))
    await click($('[data-testid="decision-confirm"]'))
    expect(app.backend.find('PATCH', /decide$/)).toHaveLength(1)
    await click(lastMenu())
    await clickText('.v-list-item', 'Editar')
    expect(router.currentRoute.value.path).toBe('/annexes/1/edit')
  })

  it('"Nuevo" abre el formulario', async () => {
    app = await mountApp('/annexes')
    await click($('[data-testid="list-new"]'))
    expect(router.currentRoute.value.path).toBe('/annexes/new')
  })

  it('filtra por tipo y estado desde la URL', async () => {
    app = await mountApp('/annexes?annexTypeId=1&statusId=1&projectId=1')
    expect(app.backend.find('GET', /^\/annexes$/)[0].params).toMatchObject({ annexTypeId: 1, statusId: 1, projectId: 1 })
  })
})

type AnnexVm = {
  form: Record<string, unknown>
  fieldErrors: Record<string, string>
  pendingFile: File[]
  typeItems: { id: number; code: string; props?: object }[]
  activeFields: string[]
  staffInfo: { items: unknown[] } | null
  jobTitleItems: { id: number; props: { disabled: boolean } }[]
  siteItems: { id: number; props: { disabled: boolean } }[]
  removeSavedAttachment(a: { id: number }): void
}

async function annexReady(path = '/annexes/new') {
  app = await mountApp(path)
  const vm = app.vm<AnnexVm>(AnnexFormView)
  return vm
}

describe('Anexos: formulario', () => {
  it('muestra los errores al enviar vacío', async () => {
    const vm = await annexReady()
    await click($('[data-testid="annex-submit"]'))
    expect(Object.keys(vm.fieldErrors)).toEqual(expect.arrayContaining(['staffId', 'annexTypeId', 'effectiveDate', 'description']))
    expect(app?.backend.find('POST', /^\/requests$/)).toHaveLength(0)
  })

  it('ofrece los tipos según el contrato vigente y muestra su tarjeta', async () => {
    const vm = await annexReady()
    vm.form.staffId = 1
    await settle()
    expect(vm.staffInfo?.items).toHaveLength(7)
    expect(vm.typeItems.map((t) => t.code)).toEqual(expect.arrayContaining(['CONTRACT_EXTENSION', 'CONVERSION_TO_INDEFINITE', 'SALARY_INCREASE']))
    expect(vm.jobTitleItems.find((j) => j.id === 1)?.props.disabled).toBe(true)
    expect(vm.siteItems.find((s) => s.id === 1)?.props.disabled).toBe(true)
  })

  it('con contrato indefinido no ofrece prórroga ni conversión', async () => {
    const backend = installBackend()
    backend.on('GET', /^\/staff\/selector\/annexable$/, {
      data: [{ ...fx.annexableStaff(1), activeContract: { ...fx.annexableStaff(1).activeContract, contractType: { id: 2, code: 'I', name: 'Indefinido' } } }],
      meta: {},
    })
    app = await mountApp('/annexes/new', { backend })
    const vm = app.vm<AnnexVm>(AnnexFormView)
    vm.form.staffId = 1
    await settle()
    expect(vm.typeItems.map((t) => t.code)).not.toContain('CONTRACT_EXTENSION')
    expect(vm.typeItems.map((t) => t.code)).not.toContain('CONVERSION_TO_INDEFINITE')
  })

  it('valida los campos de cada tipo de anexo', async () => {
    const vm = await annexReady()
    vm.form.staffId = 1
    await settle()
    const base = { effectiveDate: '2026-07-01', description: 'Descripción' }

    Object.assign(vm.form, base, { annexTypeId: 1, newEndDate: '2026-06-01' })
    await settle()
    expect(vm.activeFields).toEqual(['newEndDate'])
    await click($('[data-testid="annex-submit"]'))
    expect(vm.fieldErrors.newEndDate).toBeTruthy()
    vm.form.newEndDate = null
    await click($('[data-testid="annex-submit"]'))
    expect(vm.fieldErrors.newEndDate).toBeTruthy()

    vm.form.annexTypeId = 3
    await settle()
    await click($('[data-testid="annex-submit"]'))
    expect(vm.fieldErrors.newBaseSalary).toBeTruthy()
    vm.form.newBaseSalary = '700.000'
    await click($('[data-testid="annex-submit"]'))
    expect(vm.fieldErrors.newBaseSalary).toBeTruthy()

    vm.form.annexTypeId = 4
    await settle()
    await click($('[data-testid="annex-submit"]'))
    expect(vm.fieldErrors.newJobTitleId).toBeTruthy()

    vm.form.annexTypeId = 5
    await settle()
    await click($('[data-testid="annex-submit"]'))
    expect(vm.fieldErrors.schedule).toBeTruthy()
  })

  it('crea un anexo de aumento de sueldo', async () => {
    const vm = await annexReady()
    vm.form.staffId = 1
    await settle()
    Object.assign(vm.form, { annexTypeId: 3, effectiveDate: '2026-07-01', description: 'Aumento', newBaseSalary: '900.000' })
    await settle()
    await click($('[data-testid="annex-submit"]'))
    expect(vm.fieldErrors).toEqual({})
    expect(app?.backend.find('POST', /^\/requests$/)).toHaveLength(1)
    expect(router.currentRoute.value.path).toBe('/annexes')
  })

  it('crea un anexo de horario y sucursal, y de prórroga', async () => {
    const vm = await annexReady()
    vm.form.staffId = 1
    await settle()
    Object.assign(vm.form, { annexTypeId: 5, effectiveDate: '2026-07-01', description: 'Cambio', newSiteId: 2 })
    await settle()
    await click($('[data-testid="annex-submit"]'))
    expect(app?.backend.find('POST', /^\/requests$/)).toHaveLength(1)
  })

  it('al cambiar de colaborador reinicia el tipo y al cambiar de tipo limpia los campos ajenos', async () => {
    const vm = await annexReady()
    vm.form.staffId = 1
    await settle()
    Object.assign(vm.form, { annexTypeId: 3, newBaseSalary: '900.000' })
    await settle()
    vm.form.annexTypeId = 4
    await settle()
    expect(vm.form.newBaseSalary).toBe('')
    vm.form.staffId = 2
    await settle()
    expect(vm.form.annexTypeId).toBeNull()
  })

  it('muestra errores de backend y fallos genéricos', async () => {
    const vm = await annexReady()
    vm.form.staffId = 1
    await settle()
    Object.assign(vm.form, { annexTypeId: 3, effectiveDate: '2026-07-01', description: 'Aumento', newBaseSalary: '900.000' })
    await settle()
    app?.backend.on('POST', /^\/requests$/, { failure: { status: 409, errorFields: { staffId: 'Ya tiene un anexo pendiente' } } })
    await click($('[data-testid="annex-submit"]'))
    expect(text()).toContain('Ya tiene un anexo pendiente')
    app?.backend.on('POST', /^\/requests$/, { failure: { status: 500 } })
    await click($('[data-testid="annex-submit"]'))
    expect(router.currentRoute.value.path).toBe('/annexes/new')
  })

  it('edita precargando los datos y guarda', async () => {
    const vm = await annexReady('/annexes/1/edit')
    expect(text()).toContain('Editar anexo')
    expect(vm.form).toMatchObject({ id: 1, annexTypeId: 1, description: 'Descripción del anexo' })
    expect(vm.staffInfo?.items).toHaveLength(7)
    expect(tab).toBeDefined()
    vm.removeSavedAttachment({ id: 1 })
    await click($('[data-testid="annex-submit"]'))
    expect(app?.backend.find('PUT', /^\/annexes\/1$/)).toHaveLength(1)
    expect(router.currentRoute.value.path).toBe('/annexes')
  })

  it('cancelar vuelve a la lista', async () => {
    await annexReady()
    await clickText('button', 'Cancelar')
    expect(router.currentRoute.value.path).toBe('/annexes')
  })
})
