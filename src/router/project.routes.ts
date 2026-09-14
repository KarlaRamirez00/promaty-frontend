import type { RouteRecordRaw } from 'vue-router'
import { ROUTE } from '@/router/route-names'

export const projectRoutes: RouteRecordRaw[] = [
  {
    path: '/projects',
    component: () => import('@/views/project/ProjectView.vue'),
    children: [
      {
        path: '',
        name: ROUTE.PROJECT_LIST,
        component: () => import('@/views/project/children/ProjectsListView.vue'),
        meta: {
          module: 'project',
          permission: 'read',
          breadcrumbs: [{ title: 'Proyectos', disabled: true }],
        },
      },
      {
        path: 'new',
        name: ROUTE.PROJECT_NEW,
        component: () => import('@/views/project/children/ProjectFormView.vue'),
        meta: {
          module: 'project',
          permission: 'create',
          breadcrumbs: [
            { title: 'Proyectos', to: { name: ROUTE.PROJECT_LIST } },
            { title: 'Nuevo proyecto', disabled: true },
          ],
        },
      },
      {
        path: ':id/edit',
        name: ROUTE.PROJECT_EDIT,
        component: () => import('@/views/project/children/ProjectFormView.vue'),
        props: true,
        meta: {
          module: 'project',
          permission: 'update',
          breadcrumbs: [
            { title: 'Proyectos', to: { name: ROUTE.PROJECT_LIST } },
            { title: 'Editar proyecto', disabled: true },
          ],
        },
      },
    ],
  },
]
