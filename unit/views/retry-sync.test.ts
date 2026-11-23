import { afterEach, describe, expect, it, vi } from 'vitest'
import { $, $$, click, mountApp, text, type MountedApp } from '../helpers/app'
import { installBackend, singleOf } from '../helpers/backend'
import * as fx from '../helpers/fixtures'

let app: MountedApp | null = null
afterEach(() => {
  app?.unmount()
  app = null
})

const RETRY = /^\/requests\/1\/retrySync$/
const MESSAGE = 'Rex+ rechazó el RUT del colaborador.'
const SYNC_ERROR = { id: 9, code: 'SYNC_ERROR', name: 'Error de sincronización' }

const ENTITIES = [
  { name: 'Contrato', path: '/contracts?detail=1', detail: /^\/contracts\/1$/, make: fx.contract },
  { name: 'Finiquito', path: '/terminations?detail=1', detail: /^\/terminations\/1$/, make: fx.termination },
  { name: 'Anexo', path: '/annexes?detail=1', detail: /^\/annexes\/1$/, make: fx.annex },
] as const

type Overrides = { actions?: string[]; syncErrorMessage?: string | null; failing?: boolean }

async function mountDetail(entity: (typeof ENTITIES)[number], overrides: Overrides = {}) {
  const { actions = ['RETRY_SYNC'], syncErrorMessage = MESSAGE, failing = true } = overrides
  const backend = installBackend()
  const state = failing
    ? { status: SYNC_ERROR, statusCode: 'SYNC_ERROR', statusName: SYNC_ERROR.name }
    : {}
  backend.on('GET', entity.detail, singleOf({ ...entity.make(1), ...state, syncErrorMessage, actions }))
  return { backend, app: await mountApp(entity.path, { backend }) }
}

const drawerMenu = () => $$('[data-testid="row-actions"]').at(-1) ?? null
const alertText = () => $('[data-testid="sync-error-alert"]')?.textContent ?? ''

describe.each(ENTITIES)('Reintentar sincronización: $name', (entity) => {
  it('muestra el motivo del error cuando el estado es Error de sincronización', async () => {
    const mounted = await mountDetail(entity)
    app = mounted.app
    expect(alertText()).toContain('Error de sincronización con Rex+')
    expect(alertText()).toContain(MESSAGE)
  })

  it('no muestra el aviso si el estado no es Error de sincronización', async () => {
    const mounted = await mountDetail(entity, { failing: false })
    app = mounted.app
    expect($('[data-testid="sync-error-alert"]')).toBeNull()
  })

  it('no muestra el aviso si backend no entrega un motivo', async () => {
    const mounted = await mountDetail(entity, { syncErrorMessage: null })
    app = mounted.app
    expect($('[data-testid="sync-error-alert"]')).toBeNull()
  })

  it('muestra el motivo como texto y nunca como HTML', async () => {
    const mounted = await mountDetail(entity, { syncErrorMessage: '<img src=x onerror=alert(1)> Falló' })
    app = mounted.app
    expect(alertText()).toContain('<img src=x onerror=alert(1)> Falló')
    expect($('[data-testid="sync-error-alert"] img')).toBeNull()
  })

  it('ofrece Reintentar solo cuando actions[] trae RETRY_SYNC', async () => {
    const mounted = await mountDetail(entity, { actions: ['RETRY_SYNC'] })
    app = mounted.app
    await click(drawerMenu())
    expect($('[data-testid="action-retry-sync"]')).not.toBeNull()
    app.unmount()

    const without = await mountDetail(entity, { actions: ['APPROVE'] })
    app = without.app
    await click(drawerMenu())
    expect($('[data-testid="action-approve"]')).not.toBeNull()
    expect($('[data-testid="action-retry-sync"]')).toBeNull()
  })

  it('reintenta sin cuerpo, avisa el éxito y refresca el detalle', async () => {
    const mounted = await mountDetail(entity)
    app = mounted.app
    const detailCalls = () => mounted.backend.find('GET', entity.detail).length
    const before = detailCalls()
    await click(drawerMenu())
    await click($('[data-testid="action-retry-sync"]'))
    const [patch] = mounted.backend.find('PATCH', RETRY)
    expect(patch.data).toBeUndefined()
    await vi.waitFor(() => expect(text()).toContain('Sincronización exitosa'))
    expect(detailCalls()).toBeGreaterThan(before)
  })

  it('si sigue fallando (200 con synced en false) avisa con el motivo nuevo y refresca', async () => {
    const mounted = await mountDetail(entity)
    app = mounted.app
    mounted.backend.on('PATCH', RETRY, singleOf({ synced: false, syncErrorMessage: 'Rex+ sigue sin responder.' }))
    const before = mounted.backend.find('GET', entity.detail).length
    await click(drawerMenu())
    await click($('[data-testid="action-retry-sync"]'))
    await vi.waitFor(() => expect(text()).toContain('La sincronización sigue fallando'))
    expect(text()).toContain('Rex+ sigue sin responder.')
    expect(mounted.backend.find('GET', entity.detail).length).toBeGreaterThan(before)
  })

  it('si sigue fallando sin motivo usa el texto genérico', async () => {
    const mounted = await mountDetail(entity)
    app = mounted.app
    mounted.backend.on('PATCH', RETRY, singleOf({ synced: false, syncErrorMessage: null }))
    await click(drawerMenu())
    await click($('[data-testid="action-retry-sync"]'))
    await vi.waitFor(() => expect(text()).toContain('Rex+ no aceptó el registro.'))
  })

  it('avisa un error cuando el reintento se rechaza (403)', async () => {
    const mounted = await mountDetail(entity)
    app = mounted.app
    mounted.backend.on('PATCH', RETRY, { failure: { status: 403 } })
    await click(drawerMenu())
    await click($('[data-testid="action-retry-sync"]'))
    await vi.waitFor(() => expect(text()).toContain('Hubo un error'))
    expect(text()).not.toContain('Sincronización exitosa')
  })
})
