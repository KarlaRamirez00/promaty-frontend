import type { RouteRecordRaw } from 'vue-router'
import { ROUTE } from '@/router/route-names'

export const staffRoutes: RouteRecordRaw[] = [
  {
    path: '/staff',
    component: () => import('@/views/staff/StaffView.vue'),
    children: [
      {
        path: '',
        name: ROUTE.STAFF_LIST,
        component: () => import('@/views/staff/children/StaffListView.vue'),
        meta: {
          module: 'staff',
          permission: 'read',
          breadcrumbs: [
            { title: 'Colaboradores', disabled: true },
          ],
        },
      },
      {
        path: 'new',
        name: ROUTE.STAFF_NEW,
        component: () => import('@/views/staff/children/StaffFormView.vue'),
        meta: {
          module: 'staff',
          permission: 'create',
          breadcrumbs: [
            { title: 'Colaboradores', to: { name: ROUTE.STAFF_LIST } },
            { title: 'Nuevo colaborador', disabled: true },
          ],
        },
      },
      {
        path: ':id/edit',
        name: ROUTE.STAFF_EDIT,
        component: () => import('@/views/staff/children/StaffFormView.vue'),
        props: true,
        meta: {
          module: 'staff',
          permission: 'update',
          breadcrumbs: [
            { title: 'Colaboradores', to: { name: ROUTE.STAFF_LIST } },
            { title: 'Editar colaborador', disabled: true },
          ],
        },
      },
    ],
  },
]
