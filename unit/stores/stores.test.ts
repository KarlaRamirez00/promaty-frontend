import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/services', () => ({ login: vi.fn() }))

import { login } from '@/services'
import { useAuthStore } from '@/stores/auth.store'
import { usePasswordFlowStore } from '@/stores/passwordFlow.store'
import { useSnackbarStore } from '@/stores/snackbar.store'

function makeToken(claims: Record<string, unknown>): string {
  return `h.${btoa(JSON.stringify(claims))}.s`
}

const future = Math.floor(Date.now() / 1000) + 3600
const past = Math.floor(Date.now() / 1000) - 3600

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.resetModules()
  setActivePinia(createPinia())
})

async function freshAuthStore() {
  const { useAuthStore: fresh } = await import('@/stores/auth.store')
  return fresh()
}

describe('auth store', () => {
  it('arranca sin sesión', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.role).toBeNull()
    expect(auth.userName).toBeNull()
    expect(auth.permissions).toEqual([])
    expect(auth.projectIds).toEqual([])
    expect(auth.allowedAllProjects).toBe(false)
    expect(auth.isSystemRole).toBe(false)
    expect(auth.validateSession()).toBe(false)
  })

  it('login guarda el token y expone sus claims', async () => {
    const token = makeToken({
      role: 'Admin',
      name: 'Ana',
      permissions: ['a.read'],
      isSystemRole: true,
      allowedAllProjects: true,
      projectIds: [1],
      exp: future,
    })
    vi.mocked(login).mockResolvedValue(token)
    const auth = useAuthStore()
    await auth.login({ email: 'a@a.cl', password: 'x' }, true)
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.role).toBe('Admin')
    expect(auth.userName).toBe('Ana')
    expect(auth.permissions).toEqual(['a.read'])
    expect(auth.isSystemRole).toBe(true)
    expect(auth.allowedAllProjects).toBe(true)
    expect(auth.projectIds).toEqual([1])
    expect(localStorage.getItem('promaty.auth.token')).toBe(token)
    expect(auth.validateSession()).toBe(true)
    auth.logout()
    expect(auth.isAuthenticated).toBe(false)
  })

  it('validateSession cierra una sesión vencida', async () => {
    vi.mocked(login).mockResolvedValue(makeToken({ exp: past }))
    const auth = useAuthStore()
    await auth.login({ email: 'a', password: 'b' })
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.validateSession()).toBe(false)
    expect(auth.token).toBeNull()
  })

  it('al arrancar restaura un token vigente y descarta uno vencido', async () => {
    sessionStorage.setItem('promaty.auth.token', makeToken({ role: 'R', exp: future }))
    vi.resetModules()
    expect((await freshAuthStore()).isAuthenticated).toBe(true)

    sessionStorage.setItem('promaty.auth.token', makeToken({ role: 'R', exp: past }))
    vi.resetModules()
    setActivePinia(createPinia())
    expect((await freshAuthStore()).isAuthenticated).toBe(false)
    expect(sessionStorage.getItem('promaty.auth.token')).toBeNull()
  })
})

describe('passwordFlow store', () => {
  it('inicia y limpia el flujo', () => {
    const store = usePasswordFlowStore()
    store.start({ email: 'a@a.cl', temporaryPassword: 't', notice: 'n' })
    expect([store.email, store.temporaryPassword, store.notice]).toEqual(['a@a.cl', 't', 'n'])
    store.clear()
    expect([store.email, store.temporaryPassword, store.notice]).toEqual(['', '', ''])
  })
})

describe('snackbar store', () => {
  it('muestra los avisos en cola uno tras otro', () => {
    vi.useFakeTimers()
    const store = useSnackbarStore()
    store.success({ title: 'uno' })
    store.error({ title: 'dos' })
    store.warning({ title: 'tres' })
    store.info({ title: 'cuatro' })
    expect(store.visible).toBe(true)
    expect(store.current).toMatchObject({ variant: 'success', title: 'uno' })

    store.dismiss()
    expect(store.visible).toBe(false)
    vi.advanceTimersByTime(150)
    expect(store.current).toMatchObject({ variant: 'error', title: 'dos' })
    expect(store.visible).toBe(true)

    for (let remaining = 3; remaining > 0; remaining--) {
      store.dismiss()
      vi.advanceTimersByTime(150)
    }
    expect(store.current).toBeNull()
    vi.useRealTimers()
  })
})
