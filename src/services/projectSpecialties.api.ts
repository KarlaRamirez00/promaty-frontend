import { rrhhApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type {
  ProjectSpecialtyFormPayload,
  ProjectSpecialtyListRaw,
  ProjectSpecialtyRaw,
} from '@/types/projectSpecialty'
import type { ProjectSpecialtyQueryParams } from '@/models/projectSpecialty/projectSpecialty.models'

export async function listProjectSpecialtiesApi(
  params: ProjectSpecialtyQueryParams,
): Promise<PageResult<ProjectSpecialtyListRaw>> {
  const response = await rrhhApi.get<ApiListResponse<ProjectSpecialtyListRaw>>('/projectSpecialties', {
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

export async function getProjectSpecialtyApi(id: number): Promise<ProjectSpecialtyRaw> {
  const response = await rrhhApi.get<ApiResponse<ProjectSpecialtyRaw>>(`/projectSpecialties/${id}`)
  return unwrap(response)
}

export async function createProjectSpecialtyApi(payload: ProjectSpecialtyFormPayload): Promise<number> {
  const response = await rrhhApi.post<ApiResponse<number>>('/projectSpecialties', payload)
  return unwrap(response)
}

export async function updateProjectSpecialtyApi(
  id: number,
  payload: ProjectSpecialtyFormPayload,
): Promise<ProjectSpecialtyRaw> {
  const response = await rrhhApi.put<ApiResponse<ProjectSpecialtyRaw>>(
    `/projectSpecialties/${id}`,
    payload,
  )
  return unwrap(response)
}

export async function toggleProjectSpecialtyActiveApi(id: number): Promise<ProjectSpecialtyRaw> {
  const response = await rrhhApi.patch<ApiResponse<ProjectSpecialtyRaw>>(
    `/projectSpecialties/${id}/active`,
  )
  return unwrap(response)
}
