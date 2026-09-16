import {
  createRoleApi,
  getRoleApi,
  listPermissionOptionsApi,
  listRolesApi,
  listRoleOptionsApi,
  toggleRoleActiveApi,
  updateRoleApi,
} from '@/services'
import { mapperRoleDetail, mapperRoleFormToPayload, mapperRoleList } from '@/mappers'
import { useGetDetail, useGetTable, useMutateAction, useMutateForm } from '@/utils'
import type { RoleForm, RoleQueryParams } from '@/models'

export function getRoleListAction(params: RoleQueryParams) {
  return useGetTable(listRolesApi, params, mapperRoleList)
}

export function getRoleDetailAction(id: number) {
  return useGetDetail(getRoleApi, id, mapperRoleDetail)
}

export function createRoleAction(form: RoleForm) {
  return useMutateForm(createRoleApi, form, mapperRoleFormToPayload)
}

export function updateRoleAction(form: RoleForm) {
  return useMutateForm((payload) => updateRoleApi(form.id as number, payload), form, mapperRoleFormToPayload)
}

// newRoleId: rol de reemplazo, solo requerido si el rol a desactivar tiene usuarios asignados.
export function toggleRoleActiveAction(id: number, newRoleId?: number | null) {
  return useMutateAction(
    (payload: { id: number; newRoleId?: number | null }) => toggleRoleActiveApi(payload.id, payload.newRoleId),
    { id, newRoleId },
  )
}

export function getPermissionOptionsAction() {
  return listPermissionOptionsApi()
}

export function getRoleOptionsAction(excludeId?: number) {
  return listRoleOptionsApi(excludeId)
}
