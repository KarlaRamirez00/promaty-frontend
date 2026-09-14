import {
  createProjectTypeApi,
  getProjectTypeApi,
  listProjectTypesApi,
  toggleProjectTypeActiveApi,
  updateProjectTypeApi,
} from '@/services'
import {
  mapperProjectTypeDetail,
  mapperProjectTypeFormToPayload,
  mapperProjectTypeList,
} from '@/mappers'
import { useGetDetail, useGetTable, useMutateAction, useMutateForm } from '@/utils'
import type { ProjectTypeForm, ProjectTypeQueryParams } from '@/models'

export function getProjectTypeListAction(params: ProjectTypeQueryParams) {
  return useGetTable(listProjectTypesApi, params, mapperProjectTypeList)
}

export function getProjectTypeDetailAction(id: number) {
  return useGetDetail(getProjectTypeApi, id, mapperProjectTypeDetail)
}

export function createProjectTypeAction(form: ProjectTypeForm) {
  return useMutateForm(createProjectTypeApi, form, mapperProjectTypeFormToPayload)
}

export function updateProjectTypeAction(form: ProjectTypeForm) {
  return useMutateForm(
    (payload) => updateProjectTypeApi(form.id as number, payload),
    form,
    mapperProjectTypeFormToPayload,
  )
}

export function toggleProjectTypeActiveAction(id: number) {
  return useMutateAction(toggleProjectTypeActiveApi, id)
}
