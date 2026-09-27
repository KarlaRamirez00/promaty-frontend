import type { RouteRecordRaw } from 'vue-router'
import { ROUTE } from '@/router/route-names'

export const userRoutes: RouteRecordRaw[] = [
  {
    path: '/users',
    component: () => import('@/views/user/UserView.vue'),
    children: [
      {
        path: '',
        name: ROUTE.USER_LIST,
        component: () => import('@/views/user/children/UsersListView.vue'),
        meta: {
          module: 'user',
          permission: 'read',
          breadcrumbs: [
            { title: 'Usuarios', disabled: true },
          ],
        },
      },
      {
        path: 'new',
        name: ROUTE.USER_NEW,
        component: () => import('@/views/user/children/UserFormView.vue'),
        meta: {
          module: 'user',
          permission: 'create',
          breadcrumbs: [
            { title: 'Usuarios', to: { name: ROUTE.USER_LIST } },
            { title: 'Nuevo usuario', disabled: true },
          ],
        },
      },
      {
        path: ':id/edit',
        name: ROUTE.USER_EDIT,
        component: () => import('@/views/user/children/UserFormView.vue'),
        props: true,
        meta: {
          module: 'user',
          permission: 'update',
          breadcrumbs: [
            { title: 'Usuarios', to: { name: ROUTE.USER_LIST } },
            { title: 'Editar usuario', disabled: true },
          ],
        },
      },
    ],
  },
]
