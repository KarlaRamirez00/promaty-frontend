import { rrhhApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type {
  AnnexListRaw,
  AnnexRaw,
  AnnexRequestPayload,
  AnnexStaffOptionRaw,
  AnnexTypeRaw,
  AnnexUpdatePayload,
} from '@/types/annex'
import type { CreatedRequestRaw } from '@/types/request'
import type { AnnexQueryParams, AnnexStatusOption, AttachmentSubmitItem } from '@/models'
import { buildMultipartBody } from '@/utils/attachments'
import { toSortParam } from '@/utils/sort'
import { createRequestApi } from '@/services/requests.api'

const ANNEX_SORT_FIELDS: Record<string, string> = {
  fullName: 'staffName',
  identificationNumber: 'staffIdentificationNumber',
}

const OPTIONS_PARAMS = { size: 200, page: 0 }

export async function listAnnexesApi(params: AnnexQueryParams): Promise<PageResult<AnnexListRaw>> {
  const response = await rrhhApi.get<ApiListResponse<AnnexListRaw>>('/annexes', {
    params: {
      search: params.search || undefined,
      statusId: params.statusId ?? undefined,
      projectId: params.projectId ?? undefined,
      annexTypeId: params.annexTypeId ?? undefined,
      page: params.page - 1,
      size: params.size,
      sort: toSortParam(params.sort, ANNEX_SORT_FIELDS),
    },
  })
  return unwrapPage(response)
}

export async function getAnnexApi(id: number): Promise<AnnexRaw> {
  const response = await rrhhApi.get<ApiResponse<AnnexRaw>>(`/annexes/${id}`)
  return unwrap(response)
}

export async function listAnnexTypesApi(): Promise<AnnexTypeRaw[]> {
  const response = await rrhhApi.get<ApiListResponse<AnnexTypeRaw>>('/annexTypes', {
    params: OPTIONS_PARAMS,
  })
  return response.data.data
}

export async function listAnnexableStaffOptionsApi(): Promise<AnnexStaffOptionRaw[]> {
  const response = await rrhhApi.get<ApiListResponse<AnnexStaffOptionRaw>>(
    '/staff/selector/annexable',
    { params: OPTIONS_PARAMS },
  )
  return response.data.data
}

export async function createAnnexRequestApi(
  payload: AnnexRequestPayload,
  attachments: AttachmentSubmitItem[],
): Promise<CreatedRequestRaw> {
  return createRequestApi(payload, attachments)
}

export async function updateAnnexApi(
  id: number,
  payload: AnnexUpdatePayload,
  attachments: AttachmentSubmitItem[],
): Promise<void> {
  await rrhhApi.put(`/annexes/${id}`, buildMultipartBody(payload, attachments))
}

export async function listAnnexStatusOptionsApi(): Promise<AnnexStatusOption[]> {
  const response = await rrhhApi.get<ApiListResponse<AnnexStatusOption>>('/platformStatuses', {
    params: { subModule: 'annex' },
  })
  return response.data.data
}
