import { rrhhApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type {
  TerminationAnnulPayload,
  TerminationListRaw,
  TerminationRaw,
} from '@/types/termination'
import type { TerminationQueryParams, TerminationStatusOption } from '@/models'

export async function listTerminationsApi(
  params: TerminationQueryParams,
): Promise<PageResult<TerminationListRaw>> {
  const response = await rrhhApi.get<ApiListResponse<TerminationListRaw>>('/terminations', {
    params: {
      search: params.search || undefined,
      statusId: params.statusId ?? undefined,
      projectId: params.projectId ?? undefined,
      terminationDateFrom: params.terminationDateFrom ?? undefined,
      terminationDateTo: params.terminationDateTo ?? undefined,
      page: params.page - 1,
      size: params.size,
    },
  })
  return unwrapPage(response)
}

export async function getTerminationApi(id: number): Promise<TerminationRaw> {
  const response = await rrhhApi.get<ApiResponse<TerminationRaw>>(`/terminations/${id}`)
  return unwrap(response)
}

export async function annulTerminationApi(id: number, payload: TerminationAnnulPayload): Promise<void> {
  await rrhhApi.patch(`/terminations/${id}/annul`, payload)
}

export async function listTerminationStatusOptionsApi(): Promise<TerminationStatusOption[]> {
  const response = await rrhhApi.get<ApiListResponse<TerminationStatusOption>>('/platformStatuses', {
    params: { subModule: 'termination' },
  })
  return response.data.data
}
