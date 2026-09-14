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

// Contrato confirmado por backend (2026-09-12), aún no desplegado — no invocar desde un botón
// real hasta que Karla avise que el endpoint está arriba (ver memoria project-status-out-of-form).
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
