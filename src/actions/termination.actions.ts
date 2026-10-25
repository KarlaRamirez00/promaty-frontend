import {
  annulTerminationApi,
  createTerminationRequestApi,
  getTerminationApi,
  listLegalTerminationCauseOptionsApi,
  listNonRehireReasonOptionsApi,
  listTerminableStaffOptionsApi,
  listTerminationsApi,
  listTerminationStatusOptionsApi,
  updateTerminationApi,
} from '@/services'
import {
  mapperTerminationAnnulPayload,
  mapperTerminationCatalogOptions,
  mapperTerminationDetail,
  mapperTerminationEditData,
  mapperTerminationFormToCreatePayload,
  mapperTerminationFormToUpdatePayload,
  mapperTerminationList,
  mapperTerminationStaffOptions,
} from '@/mappers'
import { useGetDetail, useGetTable, useMutateForm } from '@/utils'
import type { TerminationAnnulForm, TerminationForm, TerminationQueryParams } from '@/models'

export function getTerminationListAction(params: TerminationQueryParams) {
  return useGetTable(listTerminationsApi, params, mapperTerminationList)
}

export function getTerminationDetailAction(id: number) {
  return useGetDetail(getTerminationApi, id, mapperTerminationDetail)
}

export function getTerminationEditDataAction(id: number) {
  return useGetDetail(getTerminationApi, id, mapperTerminationEditData)
}

export async function getTerminableStaffOptionsAction() {
  return mapperTerminationStaffOptions(await listTerminableStaffOptionsApi())
}

export async function getLegalTerminationCauseOptionsAction() {
  return mapperTerminationCatalogOptions(await listLegalTerminationCauseOptionsApi())
}

export async function getNonRehireReasonOptionsAction() {
  return mapperTerminationCatalogOptions(await listNonRehireReasonOptionsApi())
}

export function createTerminationRequestAction(form: TerminationForm) {
  return useMutateForm(createTerminationRequestApi, form, mapperTerminationFormToCreatePayload)
}

export function updateTerminationAction(form: TerminationForm) {
  return useMutateForm(
    (payload) => updateTerminationApi(form.id as number, payload),
    form,
    mapperTerminationFormToUpdatePayload,
  )
}

export function annulTerminationAction(id: number, form: TerminationAnnulForm) {
  return useMutateForm(
    (payload) => annulTerminationApi(id, payload),
    form,
    mapperTerminationAnnulPayload,
  )
}

export function getTerminationStatusOptionsAction() {
  return listTerminationStatusOptionsApi()
}
