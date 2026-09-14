import {
  createProjectSpecialtyApi,
  getProjectSpecialtyApi,
  listProjectSpecialtiesApi,
  toggleProjectSpecialtyActiveApi,
  updateProjectSpecialtyApi,
} from '@/services'
import {
  mapperProjectSpecialtyDetail,
  mapperProjectSpecialtyFormToPayload,
  mapperProjectSpecialtyList,
} from '@/mappers'
import { useGetDetail, useGetTable, useMutateAction, useMutateForm } from '@/utils'
import type {
  ProjectSpecialtyForm,
  ProjectSpecialtyQueryParams,
} from '@/models'

export function getProjectSpecialtyListAction(params: ProjectSpecialtyQueryParams) {
  return useGetTable(listProjectSpecialtiesApi, params, mapperProjectSpecialtyList)
}

export function getProjectSpecialtyDetailAction(id: number) {
  return useGetDetail(getProjectSpecialtyApi, id, mapperProjectSpecialtyDetail)
}

export function createProjectSpecialtyAction(form: ProjectSpecialtyForm) {
  return useMutateForm(createProjectSpecialtyApi, form, mapperProjectSpecialtyFormToPayload)
}

export function updateProjectSpecialtyAction(form: ProjectSpecialtyForm) {
  return useMutateForm(
    (payload) => updateProjectSpecialtyApi(form.id as number, payload),
    form,
    mapperProjectSpecialtyFormToPayload,
  )
}

export function toggleProjectSpecialtyActiveAction(id: number) {
  return useMutateAction(toggleProjectSpecialtyActiveApi, id)
}
