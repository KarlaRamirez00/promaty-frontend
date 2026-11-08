import type { RouteRecordRaw } from 'vue-router'
import { ROUTE } from '@/router/route-names'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/first-login',
    name: ROUTE.FIRST_LOGIN,
    component: () => import('@/views/FirstLoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/password-recovery',
    name: ROUTE.RECOVERY,
    component: () => import('@/views/RecoveryView.vue'),
    meta: { public: true },
  },
  {
    path: '/reset-password',
    name: ROUTE.RESET_CREDENTIALS,
    component: () => import('@/views/ResetPasswordView.vue'),
    meta: { public: true },
  },
]
