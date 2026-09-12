import type { RouteRecordRaw } from 'vue-router'
import { ROUTE } from '@/router/route-names'

export const projectTypeRoutes: RouteRecordRaw[] = [
  {
    path: '/project-types',
    name: ROUTE.PROJECT_TYPE_LIST,
    component: () => import('@/views/ProjectTypesView.vue'),
    meta: {
      module: 'projectType',
      permission: 'read',
      breadcrumbs: [
        { title: 'Mantenedores' },
        { title: 'Tipos de proyecto', disabled: true },
      ],
    },
  },
]
