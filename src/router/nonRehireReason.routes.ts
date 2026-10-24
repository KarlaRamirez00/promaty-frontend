import type { RouteRecordRaw } from 'vue-router'
import { ROUTE } from '@/router/route-names'

export const nonRehireReasonRoutes: RouteRecordRaw[] = [
  {
    path: '/non-rehire-reasons',
    component: () => import('@/views/nonRehireReason/NonRehireReasonView.vue'),
    children: [
      {
        path: '',
        name: ROUTE.NON_REHIRE_REASON_LIST,
        component: () => import('@/views/nonRehireReason/children/NonRehireReasonsListView.vue'),
        meta: {
          module: 'nonRehireReason',
          permission: 'read',
          breadcrumbs: [{ title: 'Motivos de no recontratación', disabled: true }],
        },
      },
      {
        path: 'new',
        name: ROUTE.NON_REHIRE_REASON_NEW,
        component: () => import('@/views/nonRehireReason/children/NonRehireReasonFormView.vue'),
        meta: {
          module: 'nonRehireReason',
          permission: 'create',
          breadcrumbs: [
            { title: 'Motivos de no recontratación', to: { name: ROUTE.NON_REHIRE_REASON_LIST } },
            { title: 'Nuevo motivo de no recontratación', disabled: true },
          ],
        },
      },
      {
        path: ':id/edit',
        name: ROUTE.NON_REHIRE_REASON_EDIT,
        component: () => import('@/views/nonRehireReason/children/NonRehireReasonFormView.vue'),
        props: true,
        meta: {
          module: 'nonRehireReason',
          permission: 'update',
          breadcrumbs: [
            { title: 'Motivos de no recontratación', to: { name: ROUTE.NON_REHIRE_REASON_LIST } },
            { title: 'Editar motivo de no recontratación', disabled: true },
          ],
        },
      },
    ],
  },
]
