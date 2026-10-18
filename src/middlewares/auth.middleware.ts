import type { NavigationGuardWithThis } from 'vue-router'
import { useAuthStore } from '@/stores'
import { ROUTE } from '@/router/route-names'
import { safeRedirect } from '@/utils'

export const authMiddleware: NavigationGuardWithThis<undefined> = (to) => {
  const auth = useAuthStore()
  auth.validateSession()

  if (!to.meta.public && !auth.isAuthenticated) {
    return {
      name: ROUTE.LOGIN,
      query: to.path === '/' ? {} : { redirect: to.fullPath },
    }
  }

  if (to.meta.public && auth.isAuthenticated) {
    return safeRedirect(to.query.redirect) ?? { path: '/' }
  }

  if (to.meta.module && to.meta.permission) {
    const required = `${to.meta.module}.${to.meta.permission}`
    if (!auth.permissions.includes(required)) {
      return { name: ROUTE.FORBIDDEN }
    }
  }
}
