import { rrhhApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type {
  RequestRejectionReasonFormPayload,
  RequestRejectionReasonListRaw,
  RequestRejectionReasonRaw,
  RequestRejectionReasonSubModuleRaw,
} from '@/types/requestRejectionReason'
import type { RequestRejectionReasonQueryParams } from '@/models'

export async function listRequestRejectionReasonsApi(
  params: RequestRejectionReasonQueryParams,
): Promise<PageResult<RequestRejectionReasonListRaw>> {
  const response = await rrhhApi.get<ApiListResponse<RequestRejectionReasonListRaw>>(
    '/requestRejectionReasons',
    {
      params: {
        search: params.search || undefined,
        active: params.active ?? undefined,
        subModule: params.subModule ?? undefined,
        page: params.page - 1,
        size: params.size,
        sort: `${params.sort.key},${params.sort.order}`,
      },
    },
  )
  return unwrapPage(response)
}

export async function listRequestRejectionReasonSubModulesApi(): Promise<
  RequestRejectionReasonSubModuleRaw[]
> {
  const response = await rrhhApi.get<ApiListResponse<RequestRejectionReasonSubModuleRaw>>(
    '/requestRejectionReasons/subModules',
  )
  return response.data.data
}

export async function getRequestRejectionReasonApi(id: number): Promise<RequestRejectionReasonRaw> {
  const response = await rrhhApi.get<ApiResponse<RequestRejectionReasonRaw>>(
    `/requestRejectionReasons/${id}`,
  )
  return unwrap(response)
}

export async function createRequestRejectionReasonApi(
  payload: RequestRejectionReasonFormPayload,
): Promise<number> {
  const response = await rrhhApi.post<ApiResponse<number>>('/requestRejectionReasons', payload)
  return unwrap(response)
}

export async function updateRequestRejectionReasonApi(
  id: number,
  payload: RequestRejectionReasonFormPayload,
): Promise<RequestRejectionReasonRaw> {
  const response = await rrhhApi.put<ApiResponse<RequestRejectionReasonRaw>>(
    `/requestRejectionReasons/${id}`,
    payload,
  )
  return unwrap(response)
}

export async function toggleRequestRejectionReasonActiveApi(
  id: number,
): Promise<RequestRejectionReasonRaw> {
  const response = await rrhhApi.patch<ApiResponse<RequestRejectionReasonRaw>>(
    `/requestRejectionReasons/${id}/active`,
  )
  return unwrap(response)
}
