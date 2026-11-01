import type { RouteRecordRaw } from 'vue-router'
import { ROUTE } from '@/router/route-names'

export const settingRoutes: RouteRecordRaw[] = [
  {
    path: '/settings',
    name: ROUTE.SETTING_LIST,
    component: () => import('@/views/setting/SettingsView.vue'),
    meta: {
      module: 'setting',
      permission: 'read',
      breadcrumbs: [{ title: 'Configuración', disabled: true }],
    },
  },
]
