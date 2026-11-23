import { afterEach, describe, expect, it, vi } from 'vitest'
import router from '@/router'
import { $, $$, click, clickText, mountApp, setViewport, settle, text, type MountedApp } from '../helpers/app'

let app: MountedApp | null = null
afterEach(async () => {
  app?.unmount()
  app = null
  localStorage.clear()
  await setViewport(1600)
})

const byLabel = (label: string | RegExp) =>
  $$('a, button').find((b) => {
    const value = b.getAttribute('aria-label') ?? ''
    return typeof label === 'string' ? value === label : label.test(value)
  }) ?? null

describe('Barra superior en escritorio', () => {
  it('muestra el migas de pan, la cuenta y las acciones', async () => {
    await setViewport(1600)
    app = await mountApp('/clients/new')
    expect($$('.v-breadcrumbs-item').map((i) => i.textContent?.trim()).join('|')).toContain('Mandantes')
    expect(text()).toContain('Nuevo mandante')
    expect(byLabel(/^Notificaciones/)).not.toBeNull()
    expect(byLabel('Cuenta')).not.toBeNull()
  })

  it('colapsa y expande el menú lateral', async () => {
    await setViewport(1600)
    app = await mountApp('/')
    await click(byLabel('Colapsar menú lateral'))
    expect(byLabel('Expandir menú lateral')).not.toBeNull()
    expect($('.v-navigation-drawer--rail')).not.toBeNull()
    await click(byLabel('Expandir menú lateral'))
    expect($('.v-navigation-drawer--rail')).toBeNull()
  })

  it('en modo compacto el ítem de un grupo expande el menú', async () => {
    await setViewport(1600)
    app = await mountApp('/')
    await click(byLabel('Colapsar menú lateral'))
    const first = $$('.v-navigation-drawer .v-list-item')[0]
    await click(first)
    expect($('.v-navigation-drawer--rail')).toBeNull()
  })

  it('cambia entre tema claro y oscuro y recuerda la elección', async () => {
    await setViewport(1600)
    app = await mountApp('/')
    await click(byLabel('Cambiar a tema oscuro'))
    expect(localStorage.getItem('theme')).toBe('dark')
    await click(byLabel('Cambiar a tema claro'))
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('el engranaje lleva a Configuración solo con permiso', async () => {
    await setViewport(1600)
    app = await mountApp('/')
    await click(byLabel('Configuración'))
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/settings'))
    app.unmount()
    app = await mountApp('/', { claims: { permissions: ['client.read'], isSystemRole: false } })
    expect(byLabel('Configuración')).toBeNull()
  })

  it('cierra la sesión desde el menú de la cuenta', async () => {
    await setViewport(1600)
    app = await mountApp('/')
    await click(byLabel('Cuenta'))
    await clickText('.v-list-item', 'Cerrar sesión')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('el menú de la cuenta ofrece cambiar de tema', async () => {
    await setViewport(1600)
    app = await mountApp('/')
    await click(byLabel('Cuenta'))
    const theme = $$('.v-list-item').find((i) => /tema/i.test(i.textContent ?? ''))
    if (theme) await click(theme)
    expect(text()).toContain('Ana Pérez')
  })
})

describe('Menú lateral', () => {
  it('lista los módulos y navega al elegir uno', async () => {
    await setViewport(1600)
    app = await mountApp('/')
    expect(text()).toContain('Colaboradores')
    expect(text()).toContain('Mandantes')
    await clickText('.v-navigation-drawer .v-list-item', 'Colaboradores')
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/staff'))
    await clickText('.v-navigation-drawer .v-list-item', 'Mandantes')
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/clients'))
  })

  it('despliega y pliega un grupo', async () => {
    await setViewport(1600)
    app = await mountApp('/')
    await clickText('.v-navigation-drawer .v-list-group__header, .v-navigation-drawer .v-list-item', 'Administración')
    expect(text()).toContain('Usuarios')
  })

  it('un usuario sin rol de sistema solo ve los módulos permitidos', async () => {
    await setViewport(1600)
    app = await mountApp('/', { claims: { permissions: ['client.read'], isSystemRole: false } })
    const menu = $('.v-navigation-drawer')?.textContent ?? ''
    expect(menu).toContain('Mandantes')
    expect(menu).not.toContain('Colaboradores')
    expect(menu).not.toContain('Licencias')
  })

  it('un usuario sin permisos no ve ningún módulo', async () => {
    await setViewport(1600)
    app = await mountApp('/', { claims: { permissions: [], isSystemRole: false } })
    expect($('.v-navigation-drawer')?.textContent ?? '').not.toContain('Mandantes')
  })

  it('en modo compacto los grupos se abren como menús al pasar el cursor', async () => {
    await setViewport(1600)
    app = await mountApp('/')
    await click(byLabel('Colapsar menú lateral'))
    const items = $$('.v-navigation-drawer .v-list-item')
    expect(items.length).toBeGreaterThan(2)
    items[1].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await settle()
  })
})

describe('Vista móvil', () => {
  it('el botón de menú abre y cierra el panel lateral', async () => {
    await setViewport(500)
    app = await mountApp('/')
    const toggle = byLabel(/menú lateral/)
    expect(toggle).not.toBeNull()
    await click(toggle)
    await click(byLabel(/menú lateral/))
    expect(byLabel('Ir al inicio')).not.toBeNull()
  })

  it('muestra el título de la página y el menú de la cuenta', async () => {
    await setViewport(500)
    app = await mountApp('/clients/new')
    expect(text()).toContain('Nuevo mandante')
    await click(byLabel('Cuenta y opciones'))
    expect(text()).toContain('Cerrar sesión')
    await clickText('.v-list-item', 'Cerrar sesión')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('al elegir un módulo cierra el panel', async () => {
    await setViewport(500)
    app = await mountApp('/')
    await click(byLabel(/menú lateral/))
    await clickText('.v-navigation-drawer .v-list-item', 'Colaboradores')
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/staff'))
  })

  it('al pasar de móvil a escritorio el panel vuelve a mostrarse', async () => {
    await setViewport(500)
    app = await mountApp('/')
    await setViewport(1600)
    expect($('.v-navigation-drawer')).not.toBeNull()
  })
})
