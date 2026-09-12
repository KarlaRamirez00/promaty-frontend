import type { RouteRecordRaw } from 'vue-router'
import { ROUTE } from '@/router/route-names'

export const projectSpecialtyRoutes: RouteRecordRaw[] = [
  {
    path: '/project-specialties',
    name: ROUTE.PROJECT_SPECIALTY_LIST,
    component: () => import('@/views/ProjectSpecialtiesView.vue'),
    meta: {
      module: 'projectSpecialty',
      permission: 'read',
      breadcrumbs: [
        { title: 'Mantenedores' },
        { title: 'Especialidades', disabled: true },
      ],
    },
  },
]
