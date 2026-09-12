import { rrhhApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type { ProjectTypeFormPayload, ProjectTypeListRaw, ProjectTypeRaw } from '@/types/projectType'
import type { ProjectTypeQueryParams } from '@/models/projectType/projectType.models'

export async function listProjectTypesApi(
  params: ProjectTypeQueryParams,
): Promise<PageResult<ProjectTypeListRaw>> {
  const response = await rrhhApi.get<ApiListResponse<ProjectTypeListRaw>>('/projectTypes', {
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

export async function getProjectTypeApi(id: number): Promise<ProjectTypeRaw> {
  const response = await rrhhApi.get<ApiResponse<ProjectTypeRaw>>(`/projectTypes/${id}`)
  return unwrap(response)
}

export async function createProjectTypeApi(payload: ProjectTypeFormPayload): Promise<number> {
  const response = await rrhhApi.post<ApiResponse<number>>('/projectTypes', payload)
  return unwrap(response)
}

export async function updateProjectTypeApi(
  id: number,
  payload: ProjectTypeFormPayload,
): Promise<ProjectTypeRaw> {
  const response = await rrhhApi.put<ApiResponse<ProjectTypeRaw>>(`/projectTypes/${id}`, payload)
  return unwrap(response)
}

export async function toggleProjectTypeActiveApi(id: number): Promise<ProjectTypeRaw> {
  const response = await rrhhApi.patch<ApiResponse<ProjectTypeRaw>>(`/projectTypes/${id}/active`)
  return unwrap(response)
}
