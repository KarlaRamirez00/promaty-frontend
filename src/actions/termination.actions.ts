import {
  annulTerminationApi,
  createTerminationRequestApi,
  deleteTerminationAttachmentApi,
  getTerminationApi,
  listLegalTerminationCauseOptionsApi,
  listNonRehireReasonOptionsApi,
  listTerminableStaffOptionsApi,
  listTerminationsApi,
  listTerminationStatusOptionsApi,
  updateTerminationApi,
  uploadTerminationAttachmentApi,
} from '@/services'
import {
  mapperLegalTerminationCauseOptions,
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
  return mapperLegalTerminationCauseOptions(await listLegalTerminationCauseOptionsApi())
}

export async function getNonRehireReasonOptionsAction() {
  return mapperTerminationCatalogOptions(await listNonRehireReasonOptionsApi())
}

export async function createTerminationRequestAction(form: TerminationForm): Promise<number> {
  const payload = mapperTerminationFormToCreatePayload(form)
  const result = await createTerminationRequestApi(payload)
  return result.id
}

export async function uploadTerminationAttachmentAction(id: number, file: File): Promise<void> {
  return uploadTerminationAttachmentApi(id, file)
}

export async function deleteTerminationAttachmentAction(
  id: number,
  attachmentId: number,
): Promise<void> {
  return deleteTerminationAttachmentApi(id, attachmentId)
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
