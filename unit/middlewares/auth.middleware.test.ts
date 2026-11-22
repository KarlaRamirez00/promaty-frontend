import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'

vi.mock('@/services', () => ({ login: vi.fn() }))

import { login } from '@/services'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { useAuthStore } from '@/stores'
import { ROUTE } from '@/router/route-names'

function route(partial: Partial<RouteLocationNormalized>): RouteLocationNormalized {
  return { path: '/x', fullPath: '/x', query: {}, meta: {}, ...partial } as RouteLocationNormalized
}

const run = (to: RouteLocationNormalized) =>
  (authMiddleware as unknown as (to: RouteLocationNormalized) => unknown)(to)

async function authenticate(permissions: string[]) {
  const exp = Math.floor(Date.now() / 1000) + 3600
  vi.mocked(login).mockResolvedValue(`h.${btoa(JSON.stringify({ exp, permissions }))}.s`)
  await useAuthStore().login({ email: 'a', password: 'b' })
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  setActivePinia(createPinia())
})

describe('authMiddleware', () => {
  it('manda a login a quien no tiene sesión, recordando el destino', () => {
    expect(run(route({ path: '/contracts', fullPath: '/contracts?a=1' }))).toEqual({
      name: ROUTE.LOGIN,
      query: { redirect: '/contracts?a=1' },
    })
    expect(run(route({ path: '/', fullPath: '/' }))).toEqual({ name: ROUTE.LOGIN, query: {} })
  })

  it('deja pasar las rutas públicas sin sesión', () => {
    expect(run(route({ meta: { public: true } }))).toBeUndefined()
  })

  it('con sesión, una ruta pública redirige al destino seguro o al inicio', async () => {
    await authenticate([])
    expect(run(route({ meta: { public: true }, query: { redirect: '/staff' } }))).toBe('/staff')
    expect(run(route({ meta: { public: true }, query: { redirect: '//evil.com' } }))).toEqual({ path: '/' })
  })

  it('exige el permiso del módulo', async () => {
    await authenticate(['staff.read'])
    const meta = { module: 'staff', permission: 'read' }
    expect(run(route({ meta }))).toBeUndefined()
    expect(run(route({ meta: { module: 'staff', permission: 'create' } }))).toEqual({ name: ROUTE.FORBIDDEN })
    expect(run(route({ meta: { module: 'staff' } }))).toBeUndefined()
  })
})
