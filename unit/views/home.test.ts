import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import router from '@/router'
import { $, click, mountApp, pick, text, type MountedApp } from '../helpers/app'
import { installBackend, pageOf, singleOf } from '../helpers/backend'
import * as fx from '../helpers/fixtures'

let app: MountedApp | null = null

// Fecha fija: domingo 22 de noviembre de 2026, 15:00. Solo se simula Date para no frenar los timers.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 10, 22, 15))
})
afterEach(() => {
  app?.unmount()
  app = null
  vi.useRealTimers()
})

const SUMMARY = /^\/dashboard\/summary$/
const BIRTHDAYS = /^\/dashboard\/birthdays$/
const LIMITED = { permissions: [], isSystemRole: false }

const attention = (name: string) => $(`[data-testid="attention-${name}"]`)
const waitForPath = (path: string) => vi.waitFor(() => expect(router.currentRoute.value.path).toBe(path))

describe('Home: dashboard completo', () => {
  it('muestra el saludo según la hora, los cumpleaños y el panel de atención', async () => {
    app = await mountApp('/')
    expect(text()).toContain('Buenas tardes, Ana Pérez')
    expect(text()).toContain('Cumpleaños del mes')
    expect(text()).toContain('Requiere tu atención')
    expect(text()).toContain('Este mes')
    expect(text()).not.toContain('Te damos la bienvenida a Promaty')
  })

  it('separa por aprobar y por validar, y muestra los contratos por vencer con su plazo', async () => {
    app = await mountApp('/')
    expect(attention('toApprove')?.textContent).toContain('Por aprobar')
    expect(attention('toApprove')?.textContent).toContain('2')
    expect(attention('toValidate')?.textContent).toContain('Por validar')
    expect(attention('toValidate')?.textContent).toContain('2')
    expect(attention('expiring')?.textContent).toContain('Contratos por vencer')
    expect(attention('expiring')?.textContent).toContain('En los próximos 30 días')
    expect(attention('expiring')?.textContent).toContain('3')
  })

  it('muestra las cifras de "Este mes"', async () => {
    app = await mountApp('/')
    for (const label of ['Ingresos este mes', 'Ingresos el próximo mes', 'Finiquitos este mes', 'Colaboradores activos', 'Colaboradores bloqueados']) {
      expect(text()).toContain(label)
    }
  })

  it('"Por aprobar" lleva a Solicitudes filtrada por ese estado y por el centro de costo', async () => {
    app = await mountApp('/')
    await click(attention('toApprove'))
    await waitForPath('/requests')
    expect(router.currentRoute.value.query).toMatchObject({ projectId: '1', statusId: '1' })
  })

  it('"Por validar" lleva a Solicitudes filtrada por el estado pendiente de validación', async () => {
    app = await mountApp('/')
    await click(attention('toValidate'))
    await waitForPath('/requests')
    expect(router.currentRoute.value.query).toMatchObject({ projectId: '1', statusId: '2' })
  })

  it('un usuario que solo aprueba ve solo "Por aprobar"', async () => {
    const backend = installBackend()
    backend.on('GET', SUMMARY, singleOf(fx.dashboardSummary({
      pendingRequests: { contract: 2, termination: null, annex: null, toApprove: { contract: 2, termination: null, annex: null }, toValidate: null },
    })))
    app = await mountApp('/', { backend })
    expect(attention('toApprove')).not.toBeNull()
    expect(attention('toValidate')).toBeNull()
  })

  it('un usuario que solo valida ve solo "Por validar"', async () => {
    const backend = installBackend()
    backend.on('GET', SUMMARY, singleOf(fx.dashboardSummary({
      pendingRequests: { contract: 1, termination: null, annex: null, toApprove: null, toValidate: { contract: 1, termination: null, annex: null } },
    })))
    app = await mountApp('/', { backend })
    expect(attention('toApprove')).toBeNull()
    expect(attention('toValidate')).not.toBeNull()
  })

  it('con niveles en cero oculta las filas aunque el usuario pueda decidir', async () => {
    const backend = installBackend()
    backend.on('GET', SUMMARY, singleOf(fx.dashboardSummary({
      pendingRequests: { contract: 0, termination: 0, annex: 0, toApprove: { contract: 0, termination: 0, annex: 0 }, toValidate: { contract: 0, termination: 0, annex: 0 } },
    })))
    app = await mountApp('/', { backend })
    expect(attention('toApprove')).toBeNull()
    expect(attention('toValidate')).toBeNull()
  })

  it('"Contratos por vencer" lleva a Contratos con el filtro Por vencer', async () => {
    app = await mountApp('/')
    await click(attention('expiring'))
    await waitForPath('/contracts')
    expect(router.currentRoute.value.query.expiringSoon).toBe('true')
  })

  it('"Todo al día" cuando no hay nada pendiente ni por vencer', async () => {
    const backend = installBackend()
    backend.on('GET', SUMMARY, singleOf(fx.dashboardSummary({
      pendingRequests: { contract: 0, termination: 0, annex: 0, toApprove: { contract: 0, termination: 0, annex: 0 }, toValidate: null },
      expiringContracts: 0,
    })))
    app = await mountApp('/', { backend })
    expect($('[data-testid="attention-clear"]')?.textContent).toContain('Todo al día')
    expect(attention('toApprove')).toBeNull()
    expect(attention('expiring')).toBeNull()
  })

  it('oculta la fila de un indicador sin permiso y conserva la otra', async () => {
    const backend = installBackend()
    backend.on('GET', SUMMARY, singleOf(fx.dashboardSummary({ pendingRequests: null })))
    app = await mountApp('/', { backend })
    expect(attention('toApprove')).toBeNull()
    expect(attention('toValidate')).toBeNull()
    expect(attention('expiring')).not.toBeNull()
  })

  it('muestra un aviso cuando el resumen no carga', async () => {
    const backend = installBackend()
    backend.on('GET', SUMMARY, { failure: { status: 500 } })
    app = await mountApp('/', { backend })
    expect(text()).toContain('No se pudo cargar el resumen.')
  })
})

describe('Home: permisos limitados', () => {
  it('sin permiso de colaboradores no muestra la columna de cumpleaños', async () => {
    app = await mountApp('/', { claims: LIMITED })
    expect($('[data-testid="birthday-list"]')).toBeNull()
    expect(text()).toContain('Requiere tu atención')
    expect(app.backend.find('GET', BIRTHDAYS)).toHaveLength(0)
  })

  it('solo con cifras del mes, sin acciones ni cumpleaños, vuelve a la bienvenida', async () => {
    const backend = installBackend()
    backend.on('GET', SUMMARY, singleOf({ ...fx.EMPTY_DASHBOARD_SUMMARY, terminationsThisMonth: 0 }))
    app = await mountApp('/', { backend, claims: LIMITED })
    expect(text()).toContain('Te damos la bienvenida a Promaty')
    expect($('[data-testid="home-greeting"]')).toBeNull()
  })

  it('con cumpleaños pero sin indicadores de atención muestra el dashboard', async () => {
    const backend = installBackend()
    backend.on('GET', SUMMARY, singleOf({ ...fx.EMPTY_DASHBOARD_SUMMARY, activeStaff: 6, blockedStaff: 1 }))
    app = await mountApp('/', { backend })
    expect(text()).toContain('Cumpleaños del mes')
    expect(text()).not.toContain('Requiere tu atención')
    expect(text()).toContain('Colaboradores activos')
  })
})

describe('Home: cumpleaños', () => {
  it('lista a las personas del mes en curso y resalta el día de hoy', async () => {
    app = await mountApp('/')
    const list = $('[data-testid="birthday-list"]')?.textContent ?? ''
    expect(list).toContain('noviembre')
    expect(list).toContain('Valentina Rojas Rojas')
    expect(list).toMatch(/sábado 07/i)
    expect(list).toContain('Camila Contreras Contreras')
    expect(list).toContain('Hoy')
    expect(list).not.toContain('Pedro Soto Soto')
  })

  it('las flechas piden otro mes a backend y recorren el año en círculo', async () => {
    app = await mountApp('/')
    await click($('[data-testid="birthday-next"]'))
    expect($('[data-testid="birthday-list"]')?.textContent).toContain('diciembre')
    expect($('[data-testid="birthday-list"]')?.textContent).toContain('Pedro Soto Soto')
    expect(app.backend.find('GET', BIRTHDAYS).at(-1)?.params).toMatchObject({ month: 12 })

    await click($('[data-testid="birthday-next"]'))
    expect($('[data-testid="birthday-list"]')?.textContent).toContain('enero')
    await click($('[data-testid="birthday-prev"]'))
    await click($('[data-testid="birthday-prev"]'))
    expect($('[data-testid="birthday-list"]')?.textContent).toContain('noviembre')
  })

  it('un mes sin cumpleaños muestra el mensaje vacío', async () => {
    app = await mountApp('/')
    await click($('[data-testid="birthday-prev"]'))
    expect($('[data-testid="birthday-list"]')?.textContent).toContain('Sin cumpleaños este mes')
  })

  it('no muestra personas de otro mes aunque la respuesta las traiga', async () => {
    const backend = installBackend()
    backend.on('GET', BIRTHDAYS, pageOf(fx.BIRTHDAYS.filter((item) => item.month === 11)))
    app = await mountApp('/', { backend })
    await click($('[data-testid="birthday-next"]'))
    expect($('[data-testid="birthday-list"]')?.textContent).toContain('Sin cumpleaños este mes')
  })

  it('muestra un aviso cuando la lista no carga', async () => {
    const backend = installBackend()
    backend.on('GET', BIRTHDAYS, { failure: { status: 500 } })
    app = await mountApp('/', { backend })
    expect(text()).toContain('No se pudieron cargar los cumpleaños.')
  })
})

describe('Home: selector de centro de costo', () => {
  it('aparece con dos o más centros de costo', async () => {
    app = await mountApp('/')
    expect($('[data-testid="home-project-select"]')).not.toBeNull()
  })

  it('arranca con el primer centro de costo y nunca pide datos mezclados', async () => {
    app = await mountApp('/')
    expect($('[data-testid="home-project-select"]')?.textContent).toContain('CC-1 — Proyecto 1')
    expect(text()).not.toContain('Todos los centros de costo')
    for (const call of app.backend.find('GET', BIRTHDAYS)) expect(call.params.projectId).toBe(1)
    // La campana del navbar hace su propia consulta sin centro de costo; el resto del Home siempre con uno.
    const summaryCalls = app.backend.find('GET', SUMMARY)
    expect(summaryCalls.some((call) => call.params.projectId === 1)).toBe(true)
    expect(summaryCalls.filter((call) => call.params.projectId === undefined)).toHaveLength(1)
  })

  it('al cambiar de centro de costo pide el resumen y los cumpleaños de ese centro', async () => {
    app = await mountApp('/')
    await pick('Centro de costo', 1)
    expect(app.backend.find('GET', SUMMARY).at(-1)?.params).toMatchObject({ projectId: 2 })
    expect(app.backend.find('GET', BIRTHDAYS).at(-1)?.params).toMatchObject({ projectId: 2 })
    expect($('[data-testid="home-project-select"]')?.textContent).toContain('CC-2 — Proyecto 2')
  })

  it('no aparece con un solo centro de costo y backend ya limita el alcance', async () => {
    const backend = installBackend()
    backend.on('GET', /^\/projects\/options$/, pageOf([{ id: 1, name: 'Proyecto 1', code: 'CC-1' }]))
    app = await mountApp('/', { backend })
    expect($('[data-testid="home-project-select"]')).toBeNull()
    expect(text()).toContain('Requiere tu atención')
    expect(app.backend.find('GET', SUMMARY)[0].params.projectId).toBeUndefined()
  })

  it('si las opciones no cargan, el Home funciona sin selector', async () => {
    const backend = installBackend()
    backend.on('GET', /^\/projects\/options$/, { failure: { status: 403 } })
    app = await mountApp('/', { backend })
    expect($('[data-testid="home-project-select"]')).toBeNull()
    expect(text()).toContain('Requiere tu atención')
  })

  it('los links de atención llegan a las listas filtrados por el centro de costo elegido', async () => {
    app = await mountApp('/')
    await click(attention('expiring'))
    await waitForPath('/contracts')
    expect(router.currentRoute.value.query).toMatchObject({ projectId: '1', expiringSoon: 'true' })
  })

  it('el link de solicitudes lleva el centro de costo que se cambió', async () => {
    app = await mountApp('/')
    await pick('Centro de costo', 1)
    await click(attention('toApprove'))
    await waitForPath('/requests')
    expect(router.currentRoute.value.query.projectId).toBe('2')
  })

  it('si el resumen falla no vuelve a la bienvenida y conserva el selector', async () => {
    const backend = installBackend()
    backend.on('GET', SUMMARY, { failure: { status: 500 } })
    app = await mountApp('/', { backend, claims: LIMITED })
    expect($('[data-testid="home-project-select"]')).not.toBeNull()
    expect(text()).toContain('No se pudo cargar el resumen.')
    expect(text()).not.toContain('Te damos la bienvenida a Promaty')
  })

  it('el banner muestra la fecha completa', async () => {
    app = await mountApp('/')
    expect($('[data-testid="home-greeting"]')?.textContent).toMatch(/domingo, 22 de noviembre de 2026/i)
  })
})
