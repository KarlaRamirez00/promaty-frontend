import { rrhhApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type {
  ContractCatalogOptionRaw,
  ContractCountersRaw,
  ContractListRaw,
  ContractProjectOptionRaw,
  ContractRaw,
  ContractRequestPayload,
  ContractRequestResponse,
  ContractStaffOptionRaw,
} from '@/types/contract'
import type { ContractQueryParams, ContractStatusOption } from '@/models'
import { toSortParam } from '@/utils/sort'

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
): Promise<ContractRequestResponse> {
  const response = await rrhhApi.post<ApiResponse<ContractRequestResponse>>('/requests', payload)
  return unwrap(response)
}

export async function uploadContractAttachmentApi(
  id: number,
  type: string,
  file: File,
): Promise<void> {
  const formData = new FormData()
  formData.append('file', file)
  await rrhhApi.post(`/contracts/${id}/attachments`, formData, {
    params: { type },
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function deleteContractAttachmentApi(
  id: number,
  attachmentId: number,
): Promise<void> {
  await rrhhApi.delete(`/contracts/${id}/attachments/${attachmentId}`)
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
