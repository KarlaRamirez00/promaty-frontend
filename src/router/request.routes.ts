import type { RouteRecordRaw } from 'vue-router'
import { ROUTE } from '@/router/route-names'

export const requestRoutes: RouteRecordRaw[] = [
  {
    path: '/requests',
    name: ROUTE.REQUEST_LIST,
    component: () => import('@/views/RequestsView.vue'),
    meta: {
      module: 'contract',
      permission: 'read',
      breadcrumbs: [
        { title: 'Lista de solicitudes', disabled: true },
      ],
    },
  },
]
