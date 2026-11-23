import { afterEach, describe, expect, it, vi } from 'vitest'
import router from '@/router'
import { $, click, mountApp, setViewport, text, type MountedApp } from '../helpers/app'
import { installBackend, singleOf } from '../helpers/backend'
import * as fx from '../helpers/fixtures'

let app: MountedApp | null = null
afterEach(async () => {
  app?.unmount()
  app = null
  await setViewport(1600)
})

const SUMMARY = /^\/dashboard\/summary$/
const bell = () => $('[data-testid="notification-bell"]')
const badge = () => $('[data-testid="notification-badge"] .v-badge__badge')
// Vuetify deja el badge en el DOM y lo oculta con display: none cuando no hay nada que contar.
const badgeVisible = () => {
  const element = badge()
  return element !== null && element.style.display !== 'none'
}

const none = { contract: 0, termination: 0, annex: 0 }
const summaryWith = (pendingRequests: unknown) => {
  const backend = installBackend()
  backend.on('GET', SUMMARY, singleOf(fx.dashboardSummary({ pendingRequests })))
  return backend
}

describe('Campana de notificaciones', () => {
  it('muestra la suma de por aprobar y por validar como número', async () => {
    await setViewport(1600)
    app = await mountApp('/clients')
    expect(bell()).not.toBeNull()
    expect(badge()?.textContent).toContain('4')
    expect(bell()?.getAttribute('aria-label')).toBe('Notificaciones: 4 pendientes')
  })

  it('cuenta los pendientes de todos los centros de costo, no solo del elegido en el Home', async () => {
    app = await mountApp('/clients')
    const calls = app.backend.find('GET', SUMMARY)
    expect(calls.length).toBeGreaterThan(0)
    expect(calls.every((call) => call.params.projectId === undefined)).toBe(true)
  })

  it('el menú lista por aprobar y por validar con sus cifras', async () => {
    app = await mountApp('/clients')
    await click(bell())
    expect($('[data-testid="notification-toApprove"]')?.textContent).toContain('Por aprobar')
    expect($('[data-testid="notification-toApprove"]')?.textContent).toContain('2')
    expect($('[data-testid="notification-toValidate"]')?.textContent).toContain('Por validar')
  })

  it('"Por aprobar" lleva a Solicitudes filtrada por ese estado', async () => {
    app = await mountApp('/clients')
    await click(bell())
    await click($('[data-testid="notification-toApprove"]'))
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/requests'))
    expect(router.currentRoute.value.query).toMatchObject({ statusId: '1' })
    expect(router.currentRoute.value.query.projectId).toBeUndefined()
  })

  it('"Por validar" lleva a Solicitudes filtrada por el estado pendiente de validación', async () => {
    app = await mountApp('/clients')
    await click(bell())
    await click($('[data-testid="notification-toValidate"]'))
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/requests'))
    expect(router.currentRoute.value.query).toMatchObject({ statusId: '2' })
  })

  it('quien solo aprueba ve únicamente "Por aprobar"', async () => {
    app = await mountApp('/clients', {
      backend: summaryWith({ ...none, contract: 3, toApprove: { ...none, contract: 3 }, toValidate: null }),
    })
    await click(bell())
    expect($('[data-testid="notification-toApprove"]')).not.toBeNull()
    expect($('[data-testid="notification-toValidate"]')).toBeNull()
  })

  it('sin pendientes no muestra número y el menú dice "Todo al día"', async () => {
    app = await mountApp('/clients', { backend: summaryWith({ ...none, toApprove: none, toValidate: none }) })
    expect(bell()).not.toBeNull()
    expect(badgeVisible()).toBe(false)
    await click(bell())
    expect($('[data-testid="notification-clear"]')?.textContent).toContain('Todo al día')
  })

  it('para quien no puede aprobar ni validar no hay campana', async () => {
    app = await mountApp('/clients', { backend: summaryWith({ ...none, toApprove: null, toValidate: null }) })
    expect(bell()).toBeNull()
  })

  it('sin permisos sobre solicitudes (resumen en null) no hay campana', async () => {
    app = await mountApp('/clients', { backend: summaryWith(null) })
    expect(bell()).toBeNull()
  })

  it('si el resumen falla no muestra la campana ni rompe la barra', async () => {
    const backend = installBackend()
    backend.on('GET', SUMMARY, { failure: { status: 500 } })
    app = await mountApp('/clients', { backend })
    expect(bell()).toBeNull()
    expect(text()).toContain('Mandantes')
  })

  it('un número mayor a 99 se muestra como 99+', async () => {
    app = await mountApp('/clients', {
      backend: summaryWith({ ...none, toApprove: { ...none, contract: 120 }, toValidate: null }),
    })
    expect(badge()?.textContent).toContain('99+')
  })

  it('también está disponible en pantallas pequeñas', async () => {
    await setViewport(500)
    app = await mountApp('/clients')
    expect(bell()).not.toBeNull()
    expect(badge()?.textContent).toContain('4')
  })
})
