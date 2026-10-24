import { rrhhApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type {
  NonRehireReasonFormPayload,
  NonRehireReasonListRaw,
  NonRehireReasonRaw,
} from '@/types/nonRehireReason'
import type { NonRehireReasonQueryParams } from '@/models'

export async function listNonRehireReasonsApi(
  params: NonRehireReasonQueryParams,
): Promise<PageResult<NonRehireReasonListRaw>> {
  const response = await rrhhApi.get<ApiListResponse<NonRehireReasonListRaw>>('/nonRehireReasons', {
    params: {
      search: params.search || undefined,
      active: params.active ?? undefined,
      page: params.page - 1,
      size: params.size,
      sort: `${params.sort.key},${params.sort.order}`,
    },
  })
  return unwrapPage(response)
}

export async function getNonRehireReasonApi(id: number): Promise<NonRehireReasonRaw> {
  const response = await rrhhApi.get<ApiResponse<NonRehireReasonRaw>>(`/nonRehireReasons/${id}`)
  return unwrap(response)
}

export async function createNonRehireReasonApi(payload: NonRehireReasonFormPayload): Promise<number> {
  const response = await rrhhApi.post<ApiResponse<number>>('/nonRehireReasons', payload)
  return unwrap(response)
}

export async function updateNonRehireReasonApi(
  id: number,
  payload: NonRehireReasonFormPayload,
): Promise<NonRehireReasonRaw> {
  const response = await rrhhApi.put<ApiResponse<NonRehireReasonRaw>>(`/nonRehireReasons/${id}`, payload)
  return unwrap(response)
}

export async function toggleNonRehireReasonActiveApi(id: number): Promise<NonRehireReasonRaw> {
  const response = await rrhhApi.patch<ApiResponse<NonRehireReasonRaw>>(`/nonRehireReasons/${id}/active`)
  return unwrap(response)
}
