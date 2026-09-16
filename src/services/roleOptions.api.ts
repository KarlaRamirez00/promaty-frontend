import { userApi } from '@/lib/http'
import type { ApiListResponse } from '@/types/api'
import type { RolePermissionOption, RoleRelationOption } from '@/models'

export async function listPermissionOptionsApi(): Promise<RolePermissionOption[]> {
  const response = await userApi.get<ApiListResponse<RolePermissionOption>>('/permissions')
  return response.data.data
}

interface RoleRelationRaw {
  id: number
  name: string
}

// Reutiliza el listado paginado de roles (mismo patrón que las opciones de relación de Project),
// filtrando client-side el rol actual ya que backend no tiene un filtro "exclude".
export async function listRoleOptionsApi(excludeId?: number): Promise<RoleRelationOption[]> {
  const response = await userApi.get<ApiListResponse<RoleRelationRaw>>('/roles', {
    params: { active: true, size: 200, sort: 'name,asc', page: 0 },
  })
  return response.data.data
    .filter((item) => item.id !== excludeId)
    .map((item) => ({ id: item.id, name: item.name }))
}
