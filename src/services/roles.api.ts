import { userApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type { RoleActiveUpdateResultRaw, RoleFormPayload, RoleListRaw, RoleRaw } from '@/types/role'
import type { RoleQueryParams } from '@/models'

export async function listRolesApi(params: RoleQueryParams): Promise<PageResult<RoleListRaw>> {
  const response = await userApi.get<ApiListResponse<RoleListRaw>>('/roles', {
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
