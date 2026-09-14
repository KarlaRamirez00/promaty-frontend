import { rrhhApi } from '@/lib/http'
import type { ApiListResponse } from '@/types/api'
import type { ProjectRelationOption, ProjectStatusOption } from '@/models'

interface RelationRaw {
  id: number
  name: string
}

async function listRelationOptions(path: string): Promise<ProjectRelationOption[]> {
  const response = await rrhhApi.get<ApiListResponse<RelationRaw>>(path, {
    params: { active: true, size: 200, sort: 'name,asc', page: 0 },
  })
  return response.data.data.map((item) => ({ id: item.id, name: item.name }))
}

export function listClientOptionsApi(): Promise<ProjectRelationOption[]> {
  return listRelationOptions('/clients')
}

export function listProjectTypeOptionsApi(): Promise<ProjectRelationOption[]> {
  return listRelationOptions('/projectTypes')
}

export function listProjectSpecialtyOptionsApi(): Promise<ProjectRelationOption[]> {
  return listRelationOptions('/projectSpecialties')
}

export async function listProjectStatusOptionsApi(): Promise<ProjectStatusOption[]> {
  const response = await rrhhApi.get<ApiListResponse<ProjectStatusOption>>('/platformStatuses', {
    params: { subModule: 'project' },
  })
  return response.data.data
}
