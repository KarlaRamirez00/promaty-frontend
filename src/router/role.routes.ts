import type { RouteRecordRaw } from 'vue-router'
import { ROUTE } from '@/router/route-names'

export const roleRoutes: RouteRecordRaw[] = [
  {
    path: '/roles',
    component: () => import('@/views/role/RoleView.vue'),
    children: [
      {
        path: '',
        name: ROUTE.ROLE_LIST,
        component: () => import('@/views/role/children/RolesListView.vue'),
        meta: {
          module: 'role',
          permission: 'read',
          breadcrumbs: [
            { title: 'Administración' },
            { title: 'Roles', disabled: true },
          ],
        },
      },
      {
        path: 'new',
        name: ROUTE.ROLE_NEW,
        component: () => import('@/views/role/children/RoleFormView.vue'),
        meta: {
          module: 'role',
          permission: 'create',
          breadcrumbs: [
            { title: 'Administración' },
            { title: 'Roles', to: { name: ROUTE.ROLE_LIST } },
            { title: 'Nuevo rol', disabled: true },
          ],
        },
      },
      {
        path: ':id/edit',
        name: ROUTE.ROLE_EDIT,
        component: () => import('@/views/role/children/RoleFormView.vue'),
        props: true,
        meta: {
          module: 'role',
          permission: 'update',
          breadcrumbs: [
            { title: 'Administración' },
            { title: 'Roles', to: { name: ROUTE.ROLE_LIST } },
            { title: 'Editar rol', disabled: true },
          ],
        },
      },
    ],
  },
]
