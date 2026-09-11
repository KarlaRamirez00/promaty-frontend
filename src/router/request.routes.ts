import type { RouteRecordRaw } from 'vue-router'
import { ROUTE } from '@/router/route-names'

export const requestRoutes: RouteRecordRaw[] = [
  {
    path: '/requests',
    name: ROUTE.REQUEST_LIST,
    component: () => import('@/views/RequestsView.vue'),
    meta: {
      breadcrumbs: [
        { title: 'Solicitudes de RRHH' },
        { title: 'Lista de solicitudes', disabled: true },
      ],
    },
  },
]
