import { rrhhApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type { AnnulPayload } from '@/types/annul'
import type {
  TerminationCatalogOptionRaw,
  TerminationListRaw,
  TerminationRaw,
  TerminationRequestPayload,
  TerminationStaffOptionRaw,
  TerminationUpdatePayload,
} from '@/types/termination'
import type { CreatedRequestRaw } from '@/types/request'
import type {
  AttachmentSubmitItem,
  TerminationQueryParams,
  TerminationStatusOption,
} from '@/models'
import { buildMultipartBody } from '@/utils/attachments'
import { toSortParam } from '@/utils/sort'
import { createRequestApi } from '@/services/requests.api'

const TERMINATION_SORT_FIELDS: Record<string, string> = {
  fullName: 'staffName',
  identificationNumber: 'staffIdentificationNumber',
  definitive: 'definitiveTermination',
}

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
      sort: toSortParam(params.sort, TERMINATION_SORT_FIELDS),
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

// Selector de backend: solo motivos activos y sin exigir el permiso del mantenedor de motivos.
export async function listNonRehireReasonOptionsApi(): Promise<TerminationCatalogOptionRaw[]> {
  const response = await rrhhApi.get<ApiListResponse<TerminationCatalogOptionRaw>>('/nonRehireReasons/selector')
  return response.data.data
}

export async function createTerminationRequestApi(
  payload: TerminationRequestPayload,
  attachments: AttachmentSubmitItem[],
): Promise<CreatedRequestRaw> {
  return createRequestApi(payload, attachments)
}

export async function updateTerminationApi(
  id: number,
  payload: TerminationUpdatePayload,
  attachments: AttachmentSubmitItem[] | null,
): Promise<void> {
  await rrhhApi.put(`/terminations/${id}`, buildMultipartBody(payload, attachments))
}

export async function annulTerminationApi(id: number, payload: AnnulPayload): Promise<void> {
  await rrhhApi.patch(`/terminations/${id}/annul`, payload)
}

export async function listTerminationStatusOptionsApi(): Promise<TerminationStatusOption[]> {
  const response = await rrhhApi.get<ApiListResponse<TerminationStatusOption>>('/platformStatuses', {
    params: { subModule: 'termination' },
  })
  return response.data.data
}
