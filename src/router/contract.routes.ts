import type { RouteRecordRaw } from 'vue-router'
import { ROUTE } from '@/router/route-names'

export const contractRoutes: RouteRecordRaw[] = [
  {
    path: '/contracts',
    name: ROUTE.CONTRACT_LIST,
    component: () => import('@/views/contract/ContractsView.vue'),
    meta: {
      module: 'contract',
      permission: 'read',
      breadcrumbs: [
        { title: 'Contratos', disabled: true },
        { title: 'Lista de contratos', disabled: true },
      ],
    },
  },
  {
    path: '/contracts/new',
    name: ROUTE.CONTRACT_NEW,
    component: () => import('@/views/contract/ContractFormView.vue'),
    meta: {
      module: 'contract',
      permission: 'create',
      breadcrumbs: [
        { title: 'Contratos', to: { name: ROUTE.CONTRACT_LIST } },
        { title: 'Nuevo contrato', disabled: true },
      ],
    },
  },
  {
    path: '/contracts/:id/edit',
    name: ROUTE.CONTRACT_EDIT,
    component: () => import('@/views/contract/ContractFormView.vue'),
    props: true,
    meta: {
      module: 'contract',
      permission: 'update',
      breadcrumbs: [
        { title: 'Contratos', to: { name: ROUTE.CONTRACT_LIST } },
        { title: 'Editar contrato', disabled: true },
      ],
    },
  },
]
