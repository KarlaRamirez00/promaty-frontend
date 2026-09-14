import type { RouteRecordRaw } from 'vue-router'
import { ROUTE } from '@/router/route-names'

export const projectSpecialtyRoutes: RouteRecordRaw[] = [
  {
    path: '/project-specialties',
    component: () => import('@/views/projectSpecialty/ProjectSpecialtyView.vue'),
    children: [
      {
        path: '',
        name: ROUTE.PROJECT_SPECIALTY_LIST,
        component: () => import('@/views/projectSpecialty/children/ProjectSpecialtiesListView.vue'),
        meta: {
          module: 'projectSpecialty',
          permission: 'read',
          breadcrumbs: [
            { title: 'Mantenedores' },
            { title: 'Especialidades', disabled: true },
          ],
        },
      },
      {
        path: 'new',
        name: ROUTE.PROJECT_SPECIALTY_NEW,
        component: () => import('@/views/projectSpecialty/children/ProjectSpecialtyFormView.vue'),
        meta: {
          module: 'projectSpecialty',
          permission: 'create',
          breadcrumbs: [
            { title: 'Mantenedores' },
            { title: 'Especialidades', to: { name: ROUTE.PROJECT_SPECIALTY_LIST } },
            { title: 'Nueva especialidad', disabled: true },
          ],
        },
      },
      {
        path: ':id/edit',
        name: ROUTE.PROJECT_SPECIALTY_EDIT,
        component: () => import('@/views/projectSpecialty/children/ProjectSpecialtyFormView.vue'),
        props: true,
        meta: {
          module: 'projectSpecialty',
          permission: 'update',
          breadcrumbs: [
            { title: 'Mantenedores' },
            { title: 'Especialidades', to: { name: ROUTE.PROJECT_SPECIALTY_LIST } },
            { title: 'Editar especialidad', disabled: true },
          ],
        },
      },
    ],
  },
]
