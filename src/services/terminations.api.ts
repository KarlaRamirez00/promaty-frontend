import { rrhhApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type {
  TerminationAnnulPayload,
  TerminationCatalogOptionRaw,
  TerminationListRaw,
  TerminationRaw,
  TerminationRequestPayload,
  TerminationStaffOptionRaw,
  TerminationUpdatePayload,
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

const OPTIONS_PARAMS = { size: 200, page: 0 }

export async function listTerminableStaffOptionsApi(): Promise<TerminationStaffOptionRaw[]> {
  const response = await rrhhApi.get<ApiListResponse<TerminationStaffOptionRaw>>(
    '/staff/selector/terminable',
    { params: OPTIONS_PARAMS },
  )
  return response.data.data
}

export async function listLegalTerminationCauseOptionsApi(): Promise<TerminationCatalogOptionRaw[]> {
  const response = await rrhhApi.get<ApiListResponse<TerminationCatalogOptionRaw>>(
    '/legalTerminationCauses',
    { params: OPTIONS_PARAMS },
  )
  return response.data.data
}

export async function listNonRehireReasonOptionsApi(): Promise<TerminationCatalogOptionRaw[]> {
  const response = await rrhhApi.get<ApiListResponse<TerminationCatalogOptionRaw>>(
    '/nonRehireReasons',
    { params: { ...OPTIONS_PARAMS, active: true } },
  )
  return response.data.data
}

export async function createTerminationRequestApi(payload: TerminationRequestPayload): Promise<void> {
  await rrhhApi.post('/requests', payload)
}

export async function updateTerminationApi(
  id: number,
  payload: TerminationUpdatePayload,
): Promise<void> {
  await rrhhApi.put(`/terminations/${id}`, payload)
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
