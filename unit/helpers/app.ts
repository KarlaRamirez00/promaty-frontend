import { nextTick, type Component } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { vi } from 'vitest'
import App from '@/App.vue'
import router from '@/router'
import { vuetify } from '@/plugins/vuetify'
import { vInputMask } from '@/directives/input-mask'
import { clearToken, setToken } from '@/lib/authToken'
import { installBackend, type Backend } from './backend'

export interface MountedApp {
  wrapper: VueWrapper
  // Estado interno (setup) de la primera instancia del componente indicado.
  vm<T = Record<string, unknown>>(component: Component): T
  backend: Backend
  root: HTMLElement
  queryClient: QueryClient
  unmount(): void
}

// Permisos de todos los módulos con ruta real, más los extra que pida el test.
export function allPermissions(extra: string[] = []): string[] {
  const names = new Set<string>(extra)
  for (const route of router.getRoutes()) {
    const { module, permission } = route.meta
    if (module && permission) names.add(`${module}.${permission}`)
  }
  for (const module of ['client', 'staff', 'contract', 'request', 'termination', 'annex', 'setting']) {
    for (const permission of ['read', 'create', 'update', 'active', 'status', 'approve', 'validate', 'scope']) {
      names.add(`${module}.${permission}`)
    }
  }
  return [...names]
}

export function makeToken(claims: Record<string, unknown> = {}): string {
  const payload = {
    sub: '1',
    role: 'Administrador',
    name: 'Ana Pérez',
    permissions: allPermissions(),
    isSystemRole: true,
    allowedAllProjects: true,
    projectIds: [],
    iat: 1,
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...claims,
  }
  return `h.${btoa(JSON.stringify(payload))}.s`
}

export interface MountOptions {
  authenticated?: boolean
  claims?: Record<string, unknown>
  backend?: Backend
}

// Monta la aplicación completa (router, pinia, vue-query, vuetify) contra el backend falso y
// navega a `path`. Es el camino más cercano al uso real: cada vista corre con sus composables,
// acciones, mapeadores y servicios verdaderos.
export async function mountApp(path: string, options: MountOptions = {}): Promise<MountedApp> {
  const { authenticated = true, claims, backend = installBackend() } = options
  localStorage.clear()
  sessionStorage.clear()
  if (authenticated) setToken(makeToken(claims))
  else clearToken()

  const pinia = createPinia()
  setActivePinia(pinia)
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } } })

  await router.replace('/__reset__').catch(() => undefined)
  await router.push(path).catch(() => undefined)
  const wrapper = mount(App, {
    attachTo: document.body,
    global: {
      plugins: [pinia, router, [VueQueryPlugin, { queryClient }], vuetify],
      directives: { 'input-mask': vInputMask },
    },
  })
  await settle()

  return {
    wrapper,
    vm(component) {
      const found = wrapper.findComponent(component)
      if (!found.exists()) throw new Error('El componente no está montado')
      return found.vm as never
    },
    backend,
    root: document.body,
    queryClient,
    unmount() {
      wrapper.unmount()
      document.body.querySelectorAll('.v-overlay-container, .v-overlay').forEach((el) => el.remove())
    },
  }
}

// Espera a que terminen las consultas pendientes, los timers cortos y el render siguiente.
export async function settle(times = 4): Promise<void> {
  for (let i = 0; i < times; i++) {
    await flushPromises()
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}

export async function go(path: string): Promise<void> {
  await router.push(path).catch(() => undefined)
  await settle()
}

export const body = () => document.body

export function text(): string {
  return document.body.textContent ?? ''
}

export function $(selector: string, scope: ParentNode = document.body): HTMLElement | null {
  return scope.querySelector<HTMLElement>(selector)
}

export function $$(selector: string, scope: ParentNode = document.body): HTMLElement[] {
  return [...scope.querySelectorAll<HTMLElement>(selector)]
}

export function byText(selector: string, content: string | RegExp, scope: ParentNode = document.body): HTMLElement | null {
  return (
    $$(selector, scope).find((el) =>
      typeof content === 'string' ? (el.textContent ?? '').includes(content) : content.test(el.textContent ?? ''),
    ) ?? null
  )
}

export async function click(el: HTMLElement | null, message = 'elemento no encontrado'): Promise<void> {
  if (!el) throw new Error(message)
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  await settle()
}

export async function clickText(selector: string, content: string | RegExp): Promise<void> {
  await click(byText(selector, content), `No se encontró ${selector} con "${String(content)}"`)
}

export async function type(input: HTMLInputElement | HTMLTextAreaElement | null, value: string): Promise<void> {
  if (!input) throw new Error('input no encontrado')
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
  await settle(2)
}

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Cambia el ancho de la ventana y avisa a Vuetify para que recalcule sus breakpoints.
export async function setViewport(width: number, height = 900): Promise<void> {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: height, configurable: true })
  window.dispatchEvent(new Event('resize'))
  await wait(120)
  await settle()
}

// Input o textarea de un campo según el texto exacto de su etiqueta.
export function inputByLabel(label: string | RegExp): HTMLInputElement {
  const field = $$('.v-input').find((el) => {
    const content = (el.querySelector('.v-label')?.textContent ?? '').trim()
    return typeof label === 'string' ? content === label : label.test(content)
  })
  const input = field?.querySelector<HTMLInputElement>('input:not([type="hidden"]), textarea')
  if (!input) throw new Error(`No hay campo con etiqueta ${String(label)}`)
  return input
}

// Abre un v-select/v-autocomplete por su etiqueta y elige una opción del menú desplegable.
export async function pick(label: string | RegExp, optionIndex = 0): Promise<void> {
  const input = $$('.v-input').find((el) => {
    const content = el.querySelector('.v-label')?.textContent ?? ''
    return typeof label === 'string' ? content.includes(label) : label.test(content)
  })
  if (!input) throw new Error(`No hay campo con etiqueta ${String(label)}`)
  const field = input.querySelector<HTMLElement>('.v-field') as HTMLElement
  field.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
  field.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await settle()
  const options = $$('.v-overlay--active .v-list-item')
  if (!options[optionIndex]) throw new Error(`No hay opción ${optionIndex} en ${String(label)}`)
  await click(options[optionIndex])
}

export function spyReload() {
  return vi.spyOn(console, 'warn').mockImplementation(() => undefined)
}
