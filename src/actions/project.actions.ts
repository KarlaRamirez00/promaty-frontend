import {
  createProjectApi,
  getProjectApi,
  listClientOptionsApi,
  listProjectsApi,
  listProjectSpecialtyOptionsApi,
  listProjectStatusOptionsApi,
  listProjectTypeOptionsApi,
  updateProjectApi,
  updateProjectStatusApi,
} from '@/services'
import { mapperProjectDetail, mapperProjectFormToPayload, mapperProjectList } from '@/mappers'
import { useGetDetail, useGetTable, useMutateAction, useMutateForm } from '@/utils'
import type { ProjectForm, ProjectQueryParams } from '@/models'

export function getProjectListAction(params: ProjectQueryParams) {
  return useGetTable(listProjectsApi, params, mapperProjectList)
}

export function getProjectDetailAction(id: number) {
  return useGetDetail(getProjectApi, id, mapperProjectDetail)
}

export function createProjectAction(form: ProjectForm) {
  return useMutateForm(createProjectApi, form, mapperProjectFormToPayload)
}

export function updateProjectAction(form: ProjectForm) {
  return useMutateForm(
    (payload) => updateProjectApi(form.id as number, payload),
    form,
    mapperProjectFormToPayload,
  )
}

export function updateProjectStatusAction(id: number, statusId: number) {
  return useMutateAction(
    (payload: { id: number; statusId: number }) => updateProjectStatusApi(payload.id, payload.statusId),
    { id, statusId },
  )
}

export function getClientOptionsAction() {
  return listClientOptionsApi()
}

export function getProjectTypeOptionsAction() {
  return listProjectTypeOptionsApi()
}

export function getProjectSpecialtyOptionsAction() {
  return listProjectSpecialtyOptionsApi()
}

export function getProjectStatusOptionsAction() {
  return listProjectStatusOptionsApi()
}
