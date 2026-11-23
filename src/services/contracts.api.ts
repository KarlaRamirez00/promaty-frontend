import { rrhhApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type { AnnulPayload } from '@/types/annul'
import type {
  ContractCatalogOptionRaw,
  ContractCountersRaw,
  ContractListRaw,
  ContractProjectOptionRaw,
  ContractRaw,
  ContractRequestPayload,
  ContractStaffOptionRaw,
  ContractUpdateData,
} from '@/types/contract'
import type { CreatedRequestRaw } from '@/types/request'
import type { AttachmentSubmitItem, ContractQueryParams, ContractStatusOption } from '@/models'
import { buildMultipartBody } from '@/utils/attachments'
import { toSortParam } from '@/utils/sort'
import { createRequestApi } from '@/services/requests.api'

const CONTRACT_SORT_FIELDS: Record<string, string> = {
  fullName: 'staffName',
  identificationNumber: 'staffIdentificationNumber',
}

const OPTIONS_PARAMS = { size: 200, page: 0 }

async function listCatalogOptions(path: string): Promise<ContractCatalogOptionRaw[]> {
  const response = await rrhhApi.get<ApiListResponse<ContractCatalogOptionRaw>>(path, {
    params: OPTIONS_PARAMS,
  })
  return response.data.data
}

export async function listContractProjectOptionsApi(): Promise<ContractProjectOptionRaw[]> {
  const response = await rrhhApi.get<ApiListResponse<ContractProjectOptionRaw>>(
    '/projects/selector',
    { params: OPTIONS_PARAMS },
  )
  return response.data.data
}

export function listCompanyOptionsApi() {
  return listCatalogOptions('/companies')
}

export function listContractTypeOptionsApi() {
  return listCatalogOptions('/contractTypes')
}

export function listJobTitleOptionsApi() {
  return listCatalogOptions('/jobTitles')
}

export function listSiteOptionsApi() {
  return listCatalogOptions('/sites')
}

export function listMealTypeOptionsApi() {
  return listCatalogOptions('/mealTypes')
}

export function listTransportTypeOptionsApi() {
  return listCatalogOptions('/transportTypes')
}

export async function listContractStaffOptionsApi(): Promise<ContractStaffOptionRaw[]> {
  const response = await rrhhApi.get<ApiListResponse<ContractStaffOptionRaw>>('/staff/selector', {
    params: OPTIONS_PARAMS,
  })
  return response.data.data
}

export async function createContractRequestApi(
  payload: ContractRequestPayload,
  attachments: AttachmentSubmitItem[],
): Promise<CreatedRequestRaw> {
  return createRequestApi(payload, attachments)
}

export async function updateContractApi(
  id: number,
  payload: ContractUpdateData,
  attachments: AttachmentSubmitItem[],
): Promise<void> {
  await rrhhApi.put(`/contracts/${id}`, buildMultipartBody(payload, attachments))
}

// Backend responde el detalle actualizado; el cliente lo vuelve a pedir al invalidar la caché.
export async function annulContractApi(id: number, payload: AnnulPayload): Promise<void> {
  await rrhhApi.patch(`/contracts/${id}/annul`, payload)
}

export async function listContractsApi(
  params: ContractQueryParams,
): Promise<PageResult<ContractListRaw, ContractCountersRaw>> {
  const response = await rrhhApi.get<ApiListResponse<ContractListRaw, ContractCountersRaw>>('/contracts', {
    params: {
      search: params.search || undefined,
      statusId: params.statusId ?? undefined,
      projectId: params.projectId ?? undefined,
      contractTypeId: params.contractTypeId ?? undefined,
      expiringSoon: params.expiringSoon || undefined,
      page: params.page - 1,
      size: params.size,
      sort: toSortParam(params.sort, CONTRACT_SORT_FIELDS),
    },
  })
  return unwrapPage(response)
}

export async function getContractApi(id: number): Promise<ContractRaw> {
  const response = await rrhhApi.get<ApiResponse<ContractRaw>>(`/contracts/${id}`)
  return unwrap(response)
}

export async function listContractStatusOptionsApi(): Promise<ContractStatusOption[]> {
  const response = await rrhhApi.get<ApiListResponse<ContractStatusOption>>('/platformStatuses', {
    params: { subModule: 'contract' },
  })
  return response.data.data
}
