import type { RouteRecordRaw } from 'vue-router'
import { ROUTE } from '@/router/route-names'

export const terminationRoutes: RouteRecordRaw[] = [
  {
    path: '/terminations',
    name: ROUTE.TERMINATION_LIST,
    component: () => import('@/views/termination/TerminationsView.vue'),
    meta: {
      module: 'termination',
      permission: 'read',
      breadcrumbs: [
        { title: 'Finiquitos', disabled: true },
        { title: 'Lista de finiquitos', disabled: true },
      ],
    },
  },
]
