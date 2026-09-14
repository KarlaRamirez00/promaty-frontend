import { rrhhApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type { ProjectFormPayload, ProjectListRaw, ProjectRaw } from '@/types/project'
import type { ProjectQueryParams } from '@/models'

export async function listProjectsApi(
  params: ProjectQueryParams,
): Promise<PageResult<ProjectListRaw>> {
  const response = await rrhhApi.get<ApiListResponse<ProjectListRaw>>('/projects', {
    params: {
      search: params.search || undefined,
      typeId: params.typeId ?? undefined,
      specialtyId: params.specialtyId ?? undefined,
      clientId: params.clientId ?? undefined,
      statusId: params.statusId ?? undefined,
      page: params.page - 1,
      size: params.size,
      sort: `${params.sort.key},${params.sort.order}`,
    },
  })
  return unwrapPage(response)
}

export async function getProjectApi(id: number): Promise<ProjectRaw> {
  const response = await rrhhApi.get<ApiResponse<ProjectRaw>>(`/projects/${id}`)
  return unwrap(response)
}

export async function createProjectApi(payload: ProjectFormPayload): Promise<number> {
  const response = await rrhhApi.post<ApiResponse<number>>('/projects', payload)
  return unwrap(response)
}

export async function updateProjectApi(
  id: number,
  payload: ProjectFormPayload,
): Promise<ProjectRaw> {
  const response = await rrhhApi.put<ApiResponse<ProjectRaw>>(`/projects/${id}`, payload)
  return unwrap(response)
}

// Contrato confirmado por backend (2026-09-12), aún no desplegado — no conectar a un botón real
// hasta que Karla avise que está arriba y probado (ver memoria project-status-out-of-form).
export async function updateProjectStatusApi(id: number, statusId: number): Promise<ProjectRaw> {
  const response = await rrhhApi.patch<ApiResponse<ProjectRaw>>(`/projects/${id}/status`, { statusId })
  return unwrap(response)
}
