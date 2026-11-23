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
  mapperAnnulPayload,
  mapperLegalTerminationCauseOptions,
  mapperTerminationCatalogOptions,
  mapperTerminationDetail,
  mapperTerminationEditData,
  mapperTerminationFormToCreatePayload,
  mapperTerminationFormToUpdatePayload,
  mapperTerminationList,
  mapperTerminationStaffOptions,
} from '@/mappers'
import { useGetDetail, useGetTable, useMutateForm } from '@/utils'
import type {
  AnnulForm,
  AttachmentSubmitItem,
  TerminationForm,
  TerminationQueryParams,
} from '@/models'

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
  return mapperLegalTerminationCauseOptions(await listLegalTerminationCauseOptionsApi())
}

export async function getNonRehireReasonOptionsAction() {
  return mapperTerminationCatalogOptions(await listNonRehireReasonOptionsApi())
}

export function createTerminationRequestAction(
  form: TerminationForm,
  attachments: AttachmentSubmitItem[],
) {
  return useMutateForm(
    (payload) => createTerminationRequestApi(payload, attachments),
    form,
    mapperTerminationFormToCreatePayload,
  )
}

export function updateTerminationAction(
  form: TerminationForm,
  attachments: AttachmentSubmitItem[] | null,
) {
  return useMutateForm(
    (payload) => updateTerminationApi(form.id as number, payload, attachments),
    form,
    mapperTerminationFormToUpdatePayload,
  )
}

export function annulTerminationAction(id: number, form: AnnulForm) {
  return useMutateForm((payload) => annulTerminationApi(id, payload), form, mapperAnnulPayload)
}

export function getTerminationStatusOptionsAction() {
  return listTerminationStatusOptionsApi()
}
