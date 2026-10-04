import { userApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type { RoleActiveUpdateResultRaw, RoleFormPayload, RoleListRaw, RoleRaw } from '@/types/role'
import type { RolePermissionOption, RoleQueryParams, RoleRelationOption } from '@/models'

export async function listRolesApi(params: RoleQueryParams): Promise<PageResult<RoleListRaw>> {
  const response = await userApi.get<ApiListResponse<RoleListRaw>>('/roles', {
    params: {
      search: params.search || undefined,
      active: params.active ?? undefined,
      subModuleId: params.subModuleId ?? undefined,
      page: params.page - 1,
      size: params.size,
      sort: `${params.sort.key},${params.sort.order}`,
    },
  })
  return unwrapPage(response)
}

export async function getRoleApi(id: number): Promise<RoleRaw> {
  const response = await userApi.get<ApiResponse<RoleRaw>>(`/roles/${id}`)
  return unwrap(response)
}

export async function createRoleApi(payload: RoleFormPayload): Promise<number> {
  const response = await userApi.post<ApiResponse<number>>('/roles', payload)
  return unwrap(response)
}

export async function updateRoleApi(id: number, payload: RoleFormPayload): Promise<RoleRaw> {
  const response = await userApi.put<ApiResponse<RoleRaw>>(`/roles/${id}`, payload)
  return unwrap(response)
}

// newRoleId solo es obligatorio si el rol tiene usuarios asignados y se está desactivando —
// backend responde con fieldErrors.newRoleId si falta en ese caso (ver RoleServiceImpl).
export async function toggleRoleActiveApi(
  id: number,
  newRoleId?: number | null,
): Promise<RoleActiveUpdateResultRaw> {
  const response = await userApi.patch<ApiResponse<RoleActiveUpdateResultRaw>>(
    `/roles/${id}/active`,
    newRoleId ? { newRoleId } : undefined,
  )
  return unwrap(response)
}

// ==========================================
// Endpoints de Selectores
// ==========================================

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
