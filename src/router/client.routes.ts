import type { RouteRecordRaw } from 'vue-router'
import { ROUTE } from '@/router/route-names'

export const clientRoutes: RouteRecordRaw[] = [
  {
    path: '/clients',
    component: () => import('@/views/client/ClientView.vue'),
    children: [
      {
        path: '',
        name: ROUTE.CLIENT_LIST,
        component: () => import('@/views/client/children/ClientsListView.vue'),
        meta: {
          module: 'client',
          permission: 'read',
          breadcrumbs: [
            { title: 'Mantenedores' },
            { title: 'Mandantes', disabled: true },
          ],
        },
      },
      {
        path: 'new',
        name: ROUTE.CLIENT_NEW,
        component: () => import('@/views/client/children/ClientFormView.vue'),
        meta: {
          module: 'client',
          permission: 'create',
          breadcrumbs: [
            { title: 'Mantenedores' },
            { title: 'Mandantes', to: { name: ROUTE.CLIENT_LIST } },
            { title: 'Nuevo mandante', disabled: true },
          ],
        },
      },
      {
        path: ':id/edit',
        name: ROUTE.CLIENT_EDIT,
        component: () => import('@/views/client/children/ClientFormView.vue'),
        props: true,
        meta: {
          module: 'client',
          permission: 'update',
          breadcrumbs: [
            { title: 'Mantenedores' },
            { title: 'Mandantes', to: { name: ROUTE.CLIENT_LIST } },
            { title: 'Editar mandante', disabled: true },
          ],
        },
      },
    ],
  },
]
