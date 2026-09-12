import {
  createProjectTypeApi,
  getProjectTypeApi,
  listProjectTypesApi,
  toggleProjectTypeActiveApi,
  updateProjectTypeApi,
} from '@/services/projectTypes.api'
import {
  mapperProjectTypeDetail,
  mapperProjectTypeFormToPayload,
  mapperProjectTypeList,
} from '@/mappers/projectType/projectType.mapper'
import { useGetDetail, useGetTable } from '@/utils/useGet'
import { useMutateAction, useMutateForm } from '@/utils/useMutation'
import type { ProjectTypeForm, ProjectTypeQueryParams } from '@/models/projectType/projectType.models'

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
