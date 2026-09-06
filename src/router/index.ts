import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { Breadcrumb } from '@/types/navigation'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    breadcrumbs?: Breadcrumb[]
    public?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  { path: '/', redirect: '/requests' },
  {
    path: '/requests',
    name: 'requests',
    component: () => import('@/views/RequestsView.vue'),
    meta: {
      breadcrumbs: [
        { title: 'Solicitudes de RRHH' },
        { title: 'Lista de solicitudes', disabled: true },
      ],
    },
  },
  {
    path: '/clients',
    name: 'clients',
    component: () => import('@/views/ClientsView.vue'),
    meta: {
      breadcrumbs: [
        { title: 'Mantenedores' },
        { title: 'Mandantes', disabled: true },
      ],
    },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (!to.meta.public && !auth.isAuthenticated) {
    return {
      name: 'login',
      query: to.path === '/' ? {} : { redirect: to.fullPath },
    }
  }

  if (to.meta.public && auth.isAuthenticated) {
    const redirect = to.query.redirect
    return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : { path: '/' }
  }
})

export default router
