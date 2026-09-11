import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { Breadcrumb } from '@/types/navigation'
import { ROUTE } from '@/router/route-names'
import { clientRoutes } from '@/router/client.routes'
import { requestRoutes } from '@/router/request.routes'
import { authMiddleware } from '@/middlewares/auth.middleware'

declare module 'vue-router' {
  interface RouteMeta {
    breadcrumbs?: Breadcrumb[]
    public?: boolean
    module?: string
    permission?: string
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: ROUTE.LOGIN,
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/sin-acceso',
    name: ROUTE.FORBIDDEN,
    component: () => import('@/views/ForbiddenView.vue'),
  },
  { path: '/', redirect: '/requests' },
  ...requestRoutes,
  ...clientRoutes,
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(authMiddleware)

export default router
