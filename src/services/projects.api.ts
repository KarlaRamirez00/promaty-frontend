import { rrhhApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type { ProjectFormPayload, ProjectListRaw, ProjectRaw } from '@/types/project'
import type {
  CostCenterOption,
  ProjectQueryParams,
  ProjectRelationOption,
  ProjectStatusOption,
} from '@/models'

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

export async function updateProjectStatusApi(id: number, statusId: number): Promise<ProjectRaw> {
  const response = await rrhhApi.patch<ApiResponse<ProjectRaw>>(`/projects/${id}/status`, { statusId })
  return unwrap(response)
}

// ==========================================
// Endpoints de Selectores
// ==========================================

interface RelationRaw {
  id: number
  name: string
}

// Los selectores de backend entregan solo registros activos y no exigen el permiso de leer ese módulo.
async function listRelationOptions(path: string): Promise<ProjectRelationOption[]> {
  const response = await rrhhApi.get<ApiListResponse<RelationRaw>>(path)
  return response.data.data.map((item) => ({ id: item.id, name: item.name }))
}

export function listClientOptionsApi(): Promise<ProjectRelationOption[]> {
  return listRelationOptions('/clients/selector')
}

export function listProjectTypeOptionsApi(): Promise<ProjectRelationOption[]> {
  return listRelationOptions('/projectTypes/selector')
}

export function listProjectSpecialtyOptionsApi(): Promise<ProjectRelationOption[]> {
  return listRelationOptions('/projectSpecialties/selector')
}

interface CostCenterOptionRaw {
  id: number
  name: string
  code: string
}

// Opciones limitadas a los centros de costo del usuario y sin exigir project.read.
export async function listCostCenterOptionsApi(): Promise<CostCenterOption[]> {
  const response = await rrhhApi.get<ApiListResponse<CostCenterOptionRaw>>('/projects/options')
  return response.data.data.map((item) => ({
    id: item.id,
    code: item.code,
    title: `${item.code} — ${item.name}`,
  }))
}

export async function listProjectStatusOptionsApi(): Promise<ProjectStatusOption[]> {
  const response = await rrhhApi.get<ApiListResponse<ProjectStatusOption>>('/platformStatuses', {
    params: { subModule: 'project' },
  })
  return response.data.data
}
