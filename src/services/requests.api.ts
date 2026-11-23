import { rrhhApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type {
  CreatedRequestRaw,
  RequestCountersRaw,
  RequestDecidePayload,
  RequestDetailRaw,
  RequestRaw,
  RetrySyncResultRaw,
} from '@/types/request'
import type {
  AttachmentSubmitItem,
  RequestQueryParams,
  RequestRelationOption,
  RequestStatusOption,
} from '@/models'
import { buildMultipartBody } from '@/utils/attachments'
import { toSortParam } from '@/utils/sort'

const REQUEST_SORT_FIELDS: Record<string, string> = {
  staffFullName: 'staffName',
  status: 'statusName',
}

export async function listRequestsApi(
  params: RequestQueryParams,
): Promise<PageResult<RequestRaw, RequestCountersRaw>> {
  const response = await rrhhApi.get<ApiListResponse<RequestRaw, RequestCountersRaw>>('/requests', {
    params: {
      search: params.search || undefined,
      statusId: params.statusId ?? undefined,
      projectId: params.projectId ?? undefined,
      requesterUserId: params.requesterUserId ?? undefined,
      createdFrom: params.createdFrom ?? undefined,
      createdTo: params.createdTo ?? undefined,
      page: params.page - 1,
      size: params.size,
      sort: toSortParam(params.sort, REQUEST_SORT_FIELDS),
    },
  })
  return unwrapPage(response)
}

export async function getRequestApi(id: number): Promise<RequestDetailRaw> {
  const response = await rrhhApi.get<ApiResponse<RequestDetailRaw>>(`/requests/${id}`)
  return unwrap(response)
}

export async function createRequestApi(
  payload: object,
  attachments: AttachmentSubmitItem[],
): Promise<CreatedRequestRaw> {
  const response = await rrhhApi.post<ApiResponse<CreatedRequestRaw>>(
    '/requests',
    buildMultipartBody(payload, attachments),
  )
  return unwrap(response)
}

export async function decideRequestApi(id: number, payload: RequestDecidePayload): Promise<void> {
  await rrhhApi.patch(`/requests/${id}/decide`, payload)
}

// Sin body. Responde 200 aunque la sincronización siga fallando: el resultado dice qué pasó.
export async function retryRequestSyncApi(requestId: number): Promise<RetrySyncResultRaw> {
  const response = await rrhhApi.patch<ApiResponse<RetrySyncResultRaw>>(`/requests/${requestId}/retrySync`)
  return unwrap(response)
}

export async function listRequestStatusOptionsApi(): Promise<RequestStatusOption[]> {
  const response = await rrhhApi.get<ApiListResponse<RequestStatusOption>>('/platformStatuses', {
    params: { subModule: 'request' },
  })
  return response.data.data
}

export async function listRejectionReasonOptionsApi(
  subModule: string,
): Promise<RequestRelationOption[]> {
  const response = await rrhhApi.get<ApiListResponse<RequestRelationOption>>(
    '/requestRejectionReasons/selector',
    { params: { subModule } },
  )
  return response.data.data.map((item) => ({ id: item.id, name: item.name }))
}

interface RequesterRaw {
  id: number
  name: string
}

// Solo quienes crearon solicitudes visibles para el usuario, sin exigir el permiso de leer usuarios.
export async function listRequesterOptionsApi(): Promise<RequestRelationOption[]> {
  const response = await rrhhApi.get<ApiListResponse<RequesterRaw>>('/requests/requesters')
  return response.data.data.map((item) => ({ id: item.id, name: item.name }))
}
