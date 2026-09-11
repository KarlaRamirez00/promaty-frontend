import type { NavigationGuardWithThis } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROUTE } from '@/router/route-names'

export const authMiddleware: NavigationGuardWithThis<undefined> = (to) => {
  const auth = useAuthStore()

  if (!to.meta.public && !auth.isAuthenticated) {
    return {
      name: ROUTE.LOGIN,
      query: to.path === '/' ? {} : { redirect: to.fullPath },
    }
  }

  if (to.meta.public && auth.isAuthenticated) {
    const redirect = to.query.redirect
    return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : { path: '/' }
  }

  if (to.meta.module && to.meta.permission) {
    const required = `${to.meta.module}.${to.meta.permission}`
    if (!auth.permissions.includes(required)) {
      return { name: ROUTE.FORBIDDEN }
    }
  }
}
