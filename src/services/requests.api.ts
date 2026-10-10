import { rrhhApi, userApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type {
  RequestCountersRaw,
  RequestDecidePayload,
  RequestDetailRaw,
  RequestRaw,
} from '@/types/request'
import type { RequestQueryParams, RequestRelationOption, RequestStatusOption } from '@/models'

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
    },
  })
  return unwrapPage(response)
}

export async function getRequestApi(id: number): Promise<RequestDetailRaw> {
  const response = await rrhhApi.get<ApiResponse<RequestDetailRaw>>(`/requests/${id}`)
  return unwrap(response)
}

export async function decideRequestApi(id: number, payload: RequestDecidePayload): Promise<void> {
  await rrhhApi.patch(`/requests/${id}/decide`, payload)
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
  firstName: string
  lastName: string
}

export async function listRequesterOptionsApi(): Promise<RequestRelationOption[]> {
  const response = await userApi.get<ApiListResponse<RequesterRaw>>('/users', {
    params: { size: 200, sort: 'firstName,asc', page: 0 },
  })
  return response.data.data.map((item) => ({
    id: item.id,
    name: `${item.firstName} ${item.lastName}`.trim(),
  }))
}
