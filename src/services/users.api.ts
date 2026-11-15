import { userApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type { UserDetailRaw, UserFormPayload, UserRaw } from '@/types/user'
import type { UserQueryParams } from '@/models'
import { toSortParam } from '@/utils/sort'

const USER_SORT_FIELDS: Record<string, string> = {
  role: 'roleName',
}

export async function listUsersApi(params: UserQueryParams): Promise<PageResult<UserRaw>> {
  const response = await userApi.get<ApiListResponse<UserRaw>>('/users', {
    params: {
      search: params.search || undefined,
      active: params.active ?? undefined,
      roleId: params.roleId ?? undefined,
      page: params.page - 1,
      size: params.size,
      sort: toSortParam(params.sort, USER_SORT_FIELDS),
    },
  })
  return unwrapPage(response)
}

export async function getUserApi(id: number): Promise<UserDetailRaw> {
  const response = await userApi.get<ApiResponse<UserDetailRaw>>(`/users/${id}`)
  return unwrap(response)
}

export async function createUserApi(payload: UserFormPayload): Promise<number> {
  const response = await userApi.post<ApiResponse<number>>('/users', payload)
  return unwrap(response)
}

export async function updateUserApi(id: number, payload: UserFormPayload): Promise<UserRaw> {
  const response = await userApi.put<ApiResponse<UserRaw>>(`/users/${id}`, payload)
  return unwrap(response)
}

export async function toggleUserActiveApi(id: number): Promise<UserRaw> {
  const response = await userApi.patch<ApiResponse<UserRaw>>(`/users/${id}/active`)
  return unwrap(response)
}
