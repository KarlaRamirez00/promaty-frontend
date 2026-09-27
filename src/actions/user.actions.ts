import {
  createUserApi,
  getUserApi,
  listUsersApi,
  toggleUserActiveApi,
  updateUserApi,
} from '@/services'
import {
  mapperUserDetail,
  mapperUserFormToCreatePayload,
  mapperUserFormToPayload,
  mapperUserList,
} from '@/mappers'
import { useGetDetail, useGetTable, useMutateAction, useMutateForm } from '@/utils'
import type { UserForm, UserQueryParams } from '@/models'

export function getUserListAction(params: UserQueryParams) {
  return useGetTable(listUsersApi, params, mapperUserList)
}

export function getUserDetailAction(id: number) {
  return useGetDetail(getUserApi, id, mapperUserDetail)
}

export function createUserAction(form: UserForm) {
  return useMutateForm(createUserApi, form, mapperUserFormToCreatePayload)
}

export function updateUserAction(form: UserForm) {
  return useMutateForm(
    (payload) => updateUserApi(form.id as number, payload),
    form,
    mapperUserFormToPayload,
  )
}

export function toggleUserActiveAction(id: number) {
  return useMutateAction(toggleUserActiveApi, id)
}
