import type { RouteRecordRaw } from 'vue-router'
import { ROUTE } from '@/router/route-names'

export const annexRoutes: RouteRecordRaw[] = [
  {
    path: '/annexes',
    name: ROUTE.ANNEX_LIST,
    component: () => import('@/views/annex/AnnexesView.vue'),
    meta: {
      module: 'annex',
      permission: 'read',
      breadcrumbs: [
        { title: 'Anexos', disabled: true },
        { title: 'Lista de anexos', disabled: true },
      ],
    },
  },
  {
    path: '/annexes/new',
    name: ROUTE.ANNEX_NEW,
    component: () => import('@/views/annex/AnnexFormView.vue'),
    meta: {
      module: 'annex',
      permission: 'create',
      breadcrumbs: [
        { title: 'Anexos', to: { name: ROUTE.ANNEX_LIST } },
        { title: 'Nuevo anexo', disabled: true },
      ],
    },
  },
  {
    path: '/annexes/:id/edit',
    name: ROUTE.ANNEX_EDIT,
    component: () => import('@/views/annex/AnnexFormView.vue'),
    props: true,
    meta: {
      module: 'annex',
      permission: 'update',
      breadcrumbs: [
        { title: 'Anexos', to: { name: ROUTE.ANNEX_LIST } },
        { title: 'Editar anexo', disabled: true },
      ],
    },
  },
]
