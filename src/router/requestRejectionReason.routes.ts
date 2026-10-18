import type { RouteRecordRaw } from 'vue-router'
import { ROUTE } from '@/router/route-names'

export const requestRejectionReasonRoutes: RouteRecordRaw[] = [
  {
    path: '/rejection-reasons',
    component: () => import('@/views/requestRejectionReason/RequestRejectionReasonView.vue'),
    children: [
      {
        path: '',
        name: ROUTE.REJECTION_REASON_LIST,
        component: () =>
          import('@/views/requestRejectionReason/children/RequestRejectionReasonsListView.vue'),
        meta: {
          module: 'requestRejectionReason',
          permission: 'read',
          breadcrumbs: [{ title: 'Motivos de rechazo', disabled: true }],
        },
      },
      {
        path: 'new',
        name: ROUTE.REJECTION_REASON_NEW,
        component: () =>
          import('@/views/requestRejectionReason/children/RequestRejectionReasonFormView.vue'),
        meta: {
          module: 'requestRejectionReason',
          permission: 'create',
          breadcrumbs: [
            { title: 'Motivos de rechazo', to: { name: ROUTE.REJECTION_REASON_LIST } },
            { title: 'Nuevo motivo de rechazo', disabled: true },
          ],
        },
      },
      {
        path: ':id/edit',
        name: ROUTE.REJECTION_REASON_EDIT,
        component: () =>
          import('@/views/requestRejectionReason/children/RequestRejectionReasonFormView.vue'),
        props: true,
        meta: {
          module: 'requestRejectionReason',
          permission: 'update',
          breadcrumbs: [
            { title: 'Motivos de rechazo', to: { name: ROUTE.REJECTION_REASON_LIST } },
            { title: 'Editar motivo de rechazo', disabled: true },
          ],
        },
      },
    ],
  },
]
