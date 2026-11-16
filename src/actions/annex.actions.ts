import {
  createAnnexRequestApi,
  getAnnexApi,
  listAnnexableStaffOptionsApi,
  listAnnexesApi,
  listAnnexStatusOptionsApi,
  listAnnexTypesApi,
  updateAnnexApi,
} from '@/services'
import {
  mapperAnnexDetail,
  mapperAnnexEditData,
  mapperAnnexFormToCreatePayload,
  mapperAnnexFormToUpdatePayload,
  mapperAnnexList,
  mapperAnnexStaffOptions,
  mapperAnnexTypeOptions,
} from '@/mappers'
import { useGetDetail, useGetTable, useMutateForm } from '@/utils'
import type { AnnexForm, AnnexQueryParams, AttachmentSubmitItem } from '@/models'

export function getAnnexListAction(params: AnnexQueryParams) {
  return useGetTable(listAnnexesApi, params, mapperAnnexList)
}

export function getAnnexDetailAction(id: number) {
  return useGetDetail(getAnnexApi, id, mapperAnnexDetail)
}

export function getAnnexEditDataAction(id: number) {
  return useGetDetail(getAnnexApi, id, mapperAnnexEditData)
}

export function getAnnexStatusOptionsAction() {
  return listAnnexStatusOptionsApi()
}

export async function getAnnexTypeOptionsAction() {
  return mapperAnnexTypeOptions(await listAnnexTypesApi())
}

export async function getAnnexableStaffOptionsAction() {
  return mapperAnnexStaffOptions(await listAnnexableStaffOptionsApi())
}

export function createAnnexRequestAction(form: AnnexForm, attachments: AttachmentSubmitItem[]) {
  return useMutateForm(
    (payload) => createAnnexRequestApi(payload, attachments),
    form,
    mapperAnnexFormToCreatePayload,
  )
}

export function updateAnnexAction(form: AnnexForm, attachments: AttachmentSubmitItem[]) {
  return useMutateForm(
    (payload) => updateAnnexApi(form.id as number, payload, attachments),
    form,
    mapperAnnexFormToUpdatePayload,
  )
}
