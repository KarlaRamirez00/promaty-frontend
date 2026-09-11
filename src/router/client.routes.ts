import type { RouteRecordRaw } from 'vue-router'
import { ROUTE } from '@/router/route-names'

export const clientRoutes: RouteRecordRaw[] = [
  {
    path: '/clients',
    name: ROUTE.CLIENT_LIST,
    component: () => import('@/views/ClientsView.vue'),
    meta: {
      module: 'client',
      permission: 'read',
      breadcrumbs: [
        { title: 'Mantenedores' },
        { title: 'Mandantes', disabled: true },
      ],
    },
  },
]
