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
  {
    path: '/terminations/new',
    name: ROUTE.TERMINATION_NEW,
    component: () => import('@/views/termination/TerminationFormView.vue'),
    meta: {
      module: 'termination',
      permission: 'create',
      breadcrumbs: [
        { title: 'Finiquitos', to: { name: ROUTE.TERMINATION_LIST } },
        { title: 'Nuevo finiquito', disabled: true },
      ],
    },
  },
  {
    path: '/terminations/:id/edit',
    name: ROUTE.TERMINATION_EDIT,
    component: () => import('@/views/termination/TerminationFormView.vue'),
    props: true,
    meta: {
      module: 'termination',
      permission: 'update',
      breadcrumbs: [
        { title: 'Finiquitos', to: { name: ROUTE.TERMINATION_LIST } },
        { title: 'Editar finiquito', disabled: true },
      ],
    },
  },
]
