import type { RouteRecordRaw } from 'vue-router'
import { ROUTE } from '@/router/route-names'

export const projectTypeRoutes: RouteRecordRaw[] = [
  {
    path: '/project-types',
    component: () => import('@/views/projectType/ProjectTypeView.vue'),
    children: [
      {
        path: '',
        name: ROUTE.PROJECT_TYPE_LIST,
        component: () => import('@/views/projectType/children/ProjectTypesListView.vue'),
        meta: {
          module: 'projectType',
          permission: 'read',
          breadcrumbs: [
            { title: 'Mantenedores' },
            { title: 'Tipos de proyecto', disabled: true },
          ],
        },
      },
      {
        path: 'new',
        name: ROUTE.PROJECT_TYPE_NEW,
        component: () => import('@/views/projectType/children/ProjectTypeFormView.vue'),
        meta: {
          module: 'projectType',
          permission: 'create',
          breadcrumbs: [
            { title: 'Mantenedores' },
            { title: 'Tipos de proyecto', to: { name: ROUTE.PROJECT_TYPE_LIST } },
            { title: 'Nuevo tipo de proyecto', disabled: true },
          ],
        },
      },
      {
        path: ':id/edit',
        name: ROUTE.PROJECT_TYPE_EDIT,
        component: () => import('@/views/projectType/children/ProjectTypeFormView.vue'),
        props: true,
        meta: {
          module: 'projectType',
          permission: 'update',
          breadcrumbs: [
            { title: 'Mantenedores' },
            { title: 'Tipos de proyecto', to: { name: ROUTE.PROJECT_TYPE_LIST } },
            { title: 'Editar tipo de proyecto', disabled: true },
          ],
        },
      },
    ],
  },
]
