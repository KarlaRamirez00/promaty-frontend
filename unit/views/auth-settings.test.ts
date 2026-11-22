import { afterEach, describe, expect, it, vi } from 'vitest'
import router from '@/router'
import { $, $$, click, clickText, go, inputByLabel, makeToken, mountApp, settle, text, type, wait, type MountedApp } from '../helpers/app'
import { installBackend, singleOf } from '../helpers/backend'
import * as fx from '../helpers/fixtures'

let app: MountedApp | null = null
afterEach(() => {
  app?.unmount()
  app = null
})

const loginOk = () => singleOf({ token: makeToken() })

async function fillLogin(email = 'ana@promaty.cl', password = 'Secreta.1') {
  await type(inputByLabel('Correo'), email)
  await type(inputByLabel('Contraseña'), password)
}

const submit = () => click($('[data-testid="login-submit"]'))

describe('Inicio de sesión', () => {
  it('muestra el formulario y los datos de prueba en desarrollo', async () => {
    app = await mountApp('/login', { authenticated: false })
    expect(text()).toContain('Iniciar sesión')
    expect(text()).toContain('test@promaty.cl')
    await click($('.dev-credentials'))
    expect(inputByLabel('Correo').value).toBe('test@promaty.cl')
  })

  it('no envía con campos vacíos', async () => {
    app = await mountApp('/login', { authenticated: false })
    await submit()
    expect(app.backend.find('POST', /auth\/login/)).toHaveLength(0)
  })

  it('inicia sesión y entra al inicio', async () => {
    const backend = installBackend()
    backend.on('POST', /auth\/login/, loginOk())
    app = await mountApp('/login', { authenticated: false, backend })
    await fillLogin()
    await submit()
    expect(router.currentRoute.value.path).toBe('/')
    expect(sessionStorage.getItem('promaty.auth.token')).not.toBeNull()
  })

  it('recordar la sesión guarda el token en localStorage', async () => {
    const backend = installBackend()
    backend.on('POST', /auth\/login/, loginOk())
    app = await mountApp('/login', { authenticated: false, backend })
    await click($('[data-testid="login-remember"] input'))
    await fillLogin()
    await submit()
    expect(localStorage.getItem('promaty.auth.token')).not.toBeNull()
  })

  it('vuelve a la ruta pedida antes de iniciar sesión', async () => {
    const backend = installBackend()
    backend.on('POST', /auth\/login/, loginOk())
    app = await mountApp('/clients', { authenticated: false, backend })
    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.redirect).toBe('/clients')
    await fillLogin()
    await submit()
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/clients'))
  })

  it('ignora un destino externo', async () => {
    const backend = installBackend()
    backend.on('POST', /auth\/login/, loginOk())
    app = await mountApp('/login?redirect=//evil.com', { authenticated: false, backend })
    await fillLogin()
    await submit()
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('muestra credenciales incorrectas', async () => {
    const backend = installBackend()
    backend.on('POST', /auth\/login/, { failure: { status: 401, name: 'BAD_CREDENTIALS', message: 'x' } })
    app = await mountApp('/login', { authenticated: false, backend })
    await fillLogin()
    await submit()
    expect(text()).toContain('Correo o contraseña incorrectos.')
  })

  it('muestra otros errores del servidor con su mensaje', async () => {
    const backend = installBackend()
    backend.on('POST', /auth\/login/, { failure: { status: 500, message: 'Servicio caído' } })
    app = await mountApp('/login', { authenticated: false, backend })
    await fillLogin()
    await submit()
    expect(text()).toContain('Servicio caído')
  })

  it('manda a crear la contraseña cuando la clave es temporal (428)', async () => {
    const backend = installBackend()
    backend.on('POST', /auth\/login/, { failure: { status: 428, name: 'PASSWORD_CHANGE_REQUIRED', message: 'Cambia tu clave' } })
    app = await mountApp('/login', { authenticated: false, backend })
    await fillLogin()
    await submit()
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/first-login'))
    await vi.waitFor(() => expect(text()).toContain('Crea tu contraseña'))
    expect(location.search).not.toContain('Secreta')
  })

  it('manda a recuperar la contraseña cuando la clave temporal venció', async () => {
    const backend = installBackend()
    backend.on('POST', /auth\/login/, { failure: { status: 401, name: 'TEMPORARY_PASSWORD_EXPIRED', message: 'Tu clave temporal venció' } })
    app = await mountApp('/login', { authenticated: false, backend })
    await fillLogin()
    await submit()
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/password-recovery'))
    await vi.waitFor(() => expect(text()).toContain('Tu clave temporal venció'))
  })

  it('bloquea el ingreso con cuenta regresiva ante demasiados intentos (429)', async () => {
    const backend = installBackend()
    backend.on('POST', /auth\/login/, { failure: { status: 429, name: 'ACCOUNT_LOCKED', message: 'Bloqueada', meta: { retryAfterSeconds: 2 } } })
    app = await mountApp('/login', { authenticated: false, backend })
    await fillLogin()
    await submit()
    expect(text()).toContain('Demasiados intentos fallidos')
    expect(text()).toContain('0:0')
    expect(($('[data-testid="login-submit"]') as HTMLButtonElement).disabled).toBe(true)
    await submit()
    expect(backend.find('POST', /auth\/login/)).toHaveLength(1)
    await wait(2300)
    await settle()
    expect(($('[data-testid="login-submit"]') as HTMLButtonElement).disabled).toBe(false)
  })

  it('alterna la visibilidad de la contraseña', async () => {
    app = await mountApp('/login', { authenticated: false })
    const input = inputByLabel('Contraseña')
    expect(input.type).toBe('password')
    await click($('[data-testid="login-password"] .v-field__append-inner .v-icon'))
    expect(inputByLabel('Contraseña').type).toBe('text')
  })

  it('un usuario autenticado que visita /login vuelve al inicio', async () => {
    app = await mountApp('/login')
    expect(router.currentRoute.value.path).toBe('/')
  })
})

describe('Acceso y navegación', () => {
  it('muestra la pantalla de bienvenida y el menú', async () => {
    app = await mountApp('/')
    expect(text()).toContain('Te damos la bienvenida a Promaty')
    expect(text()).toContain('Ana Pérez')
  })

  it('sin el permiso del módulo redirige a "sin acceso"', async () => {
    app = await mountApp('/clients', { claims: { permissions: [], isSystemRole: false } })
    expect(router.currentRoute.value.path).toBe('/sin-acceso')
    expect(text()).toMatch(/acceso/i)
  })

  it('una ruta desconocida vuelve al inicio', async () => {
    app = await mountApp('/no-existe')
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('un token vencido obliga a iniciar sesión', async () => {
    app = await mountApp('/clients', { claims: { exp: 1 } })
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('cerrar sesión desde el menú de cuenta vuelve a login', async () => {
    app = await mountApp('/')
    await click($$('button').find((b) => /Ana|AP/.test(b.textContent ?? '')) ?? null)
    const logout = $$('.v-list-item').find((i) => /Cerrar sesión/i.test(i.textContent ?? ''))
    await click(logout ?? null)
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('un 401 en una consulta con sesión cierra la sesión', async () => {
    const backend = installBackend()
    backend.on('GET', /^\/clients$/, { failure: { status: 401 } })
    app = await mountApp('/clients', { backend })
    await settle()
    expect(sessionStorage.getItem('promaty.auth.token')).toBeNull()
  })
})

describe('Recuperación de contraseña', () => {
  it('exige un correo válido para enviar', async () => {
    app = await mountApp('/password-recovery', { authenticated: false })
    const button = $$('button[type="submit"]')[0] as HTMLButtonElement
    expect(button.disabled).toBe(true)
    await type(inputByLabel('Correo'), 'ana@promaty.cl')
    expect(($$('button[type="submit"]')[0] as HTMLButtonElement).disabled).toBe(false)
  })

  it('envía el código y pasa a restablecer', async () => {
    app = await mountApp('/password-recovery', { authenticated: false })
    await type(inputByLabel('Correo'), 'ana@promaty.cl')
    await click($$('button[type="submit"]')[0])
    expect(app.backend.find('POST', /password-recovery/)).toHaveLength(1)
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/reset-password'))
    await vi.waitFor(() => expect(text()).toContain('te enviamos un código'))
  })

  it('muestra errores del servidor', async () => {
    app = await mountApp('/password-recovery', { authenticated: false })
    app.backend.on('POST', /password-recovery/, { failure: { status: 500, message: 'No disponible' } })
    await type(inputByLabel('Correo'), 'ana@promaty.cl')
    await click($$('button[type="submit"]')[0])
    expect(text()).toContain('No disponible')
    app.backend.on('POST', /password-recovery/, { failure: { status: 400, errorFields: { email: 'Correo inválido' } } })
    await click($$('button[type="submit"]')[0])
    expect(text()).toContain('Correo inválido')
  })
})

describe('Restablecer contraseña', () => {
  async function fillReset(password = 'Nueva.2026', confirmation = password) {
    await type(inputByLabel('Correo'), 'ana@promaty.cl')
    await type(inputByLabel('Código de recuperación'), 'ABC123')
    await type(inputByLabel('Nueva contraseña'), password)
    await type(inputByLabel('Confirmar contraseña'), confirmation)
  }
  const submitReset = () => click($$('button[type="submit"]')[0])

  it('valida los requisitos de la contraseña mientras se escribe', async () => {
    app = await mountApp('/reset-password', { authenticated: false })
    await type(inputByLabel('Nueva contraseña'), 'abc')
    expect($$('.text-success')).toHaveLength(1)
    await type(inputByLabel('Nueva contraseña'), 'Nueva.2026')
    expect($$('.text-success')).toHaveLength(5)
    await type(inputByLabel('Confirmar contraseña'), 'otra')
    expect(text()).toContain('Las contraseñas no coinciden.')
    expect(($$('button[type="submit"]')[0] as HTMLButtonElement).disabled).toBe(true)
  })

  it('cambia la contraseña e inicia sesión', async () => {
    app = await mountApp('/reset-password', { authenticated: false })
    app.backend.on('POST', /auth\/login/, loginOk())
    await fillReset()
    await submitReset()
    expect(app.backend.find('POST', /password-reset/)).toHaveLength(1)
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('si el inicio de sesión posterior falla, vuelve a login', async () => {
    app = await mountApp('/reset-password', { authenticated: false })
    app.backend.on('POST', /auth\/login/, { failure: { status: 500 } })
    await fillReset()
    await submitReset()
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('muestra errores del servidor', async () => {
    app = await mountApp('/reset-password', { authenticated: false })
    app.backend.on('POST', /password-reset/, { failure: { status: 400, errorFields: { resetCode: 'Código vencido' } } })
    await fillReset()
    await submitReset()
    expect(text()).toContain('Código vencido')
    app.backend.on('POST', /password-reset/, { failure: { status: 500, message: 'Fallo interno' } })
    await submitReset()
    expect(text()).toContain('Fallo interno')
  })

  it('alterna la visibilidad de los campos de clave y código', async () => {
    app = await mountApp('/reset-password', { authenticated: false })
    const iconOf = (label: string) =>
      $$('.v-input').find((el) => (el.querySelector('.v-label')?.textContent ?? '').trim() === label)?.querySelector<HTMLElement>('.v-field__append-inner .v-icon') ?? null
    await click(iconOf('Código de recuperación'))
    expect(inputByLabel('Código de recuperación').type).toBe('text')
    await click(iconOf('Nueva contraseña'))
    expect(inputByLabel('Nueva contraseña').type).toBe('text')
    expect(inputByLabel('Confirmar contraseña').type).toBe('text')
  })

  it('primer ingreso: usa la clave temporal que viene del login', async () => {
    const backend = installBackend()
    backend.on('POST', /auth\/login/, { failure: { status: 428, name: 'PASSWORD_CHANGE_REQUIRED', message: 'Cambia' } })
    app = await mountApp('/login', { authenticated: false, backend })
    await fillLogin()
    await submit()
    expect(router.currentRoute.value.path).toBe('/first-login')
    backend.on('POST', /auth\/login/, loginOk())
    await type(inputByLabel('Nueva contraseña'), 'Nueva.2026')
    await type(inputByLabel('Confirmar contraseña'), 'Nueva.2026')
    await click($$('button[type="submit"]')[0])
    expect(backend.find('POST', /password-reset/)).toHaveLength(1)
    expect(JSON.parse(backend.find('POST', /password-reset/)[0].data as string)).toMatchObject({ email: 'ana@promaty.cl', resetCode: 'Secreta.1' })
  })
})

describe('Configuración', () => {
  it('muestra los parámetros agrupados', async () => {
    app = await mountApp('/settings')
    expect(text()).toContain('Configuración')
    expect(text()).toContain('Parámetro expiringDays')
    expect(text()).toContain('Grupo contracts')
    expect(text()).toContain('Grupo general')
  })

  it('usa el ícono del grupo de contratos', async () => {
    const backend = installBackend()
    backend.on('GET', /^\/settings$/, { data: [fx.setting('expiringDays', 'INTEGER', 'CONTRACTS')], meta: {} })
    app = await mountApp('/settings', { backend })
    expect(text()).toContain('Parámetro expiringDays')
  })

  it('guarda un valor entero modificado', async () => {
    app = await mountApp('/settings')
    const input = inputByLabel('Valor')
    const save = () => $$('button').find((b) => /Guardar/.test(b.textContent ?? '')) as HTMLButtonElement
    expect(save().disabled).toBe(true)
    await type(input, '12')
    expect(save().disabled).toBe(false)
    await click(save())
    const [put] = app.backend.find('PUT', /^\/settings\/expiringDays$/)
    expect(JSON.parse(put.data as string)).toEqual({ value: '12' })
  })

  it('rechaza valores fuera de rango o vacíos', async () => {
    app = await mountApp('/settings')
    const input = inputByLabel('Valor')
    await type(input, '500')
    await click($$('button').find((b) => /Guardar/.test(b.textContent ?? '')) ?? null)
    expect(text()).toContain('Debe estar entre 1 y 99.')
    await type(input, '')
    await click($$('button').find((b) => /Guardar/.test(b.textContent ?? '')) ?? null)
    expect(app.backend.find('PUT', /settings/)).toHaveLength(0)
  })

  it('guarda con Enter', async () => {
    app = await mountApp('/settings')
    const input = inputByLabel('Valor')
    await type(input, '7')
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await settle()
    expect(app.backend.find('PUT', /settings/)).toHaveLength(1)
  })

  it('cambia un parámetro booleano', async () => {
    app = await mountApp('/settings')
    const switchInput = $$('.v-switch input')[0]
    await click(switchInput)
    await click($$('button').filter((b) => /Guardar/.test(b.textContent ?? '')).at(-1) ?? null)
    expect(app.backend.find('PUT', /settings\/enabled/)).toHaveLength(1)
  })

  it('muestra errores de backend y fallos genéricos', async () => {
    app = await mountApp('/settings')
    app.backend.on('PUT', /settings/, { failure: { status: 400, errorFields: { value: 'Valor no permitido' } } })
    await type(inputByLabel('Valor'), '9')
    await click($$('button').find((b) => /Guardar/.test(b.textContent ?? '')) ?? null)
    expect(text()).toContain('Valor no permitido')
    app.backend.on('PUT', /settings/, { failure: { status: 500 } })
    await click($$('button').find((b) => /Guardar/.test(b.textContent ?? '')) ?? null)
    expect(app.backend.find('PUT', /settings/)).toHaveLength(2)
  })

  it('sin permiso de edición los campos quedan bloqueados', async () => {
    app = await mountApp('/settings', { claims: { permissions: ['setting.read'], isSystemRole: false } })
    expect($$('button').some((b) => /Guardar/.test(b.textContent ?? ''))).toBe(false)
    expect(inputByLabel('Valor').disabled).toBe(true)
  })

  it('muestra un error si la configuración no carga', async () => {
    const backend = installBackend()
    backend.on('GET', /^\/settings$/, { failure: { status: 500 } })
    app = await mountApp('/settings', { backend })
    expect(text()).toContain('No se pudo cargar la configuración.')
    await go('/settings')
    expect(clickText).toBeDefined()
  })
})
