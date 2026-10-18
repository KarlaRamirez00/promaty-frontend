import {
  createRequestRejectionReasonApi,
  getRequestRejectionReasonApi,
  listRequestRejectionReasonSubModulesApi,
  listRequestRejectionReasonsApi,
  toggleRequestRejectionReasonActiveApi,
  updateRequestRejectionReasonApi,
} from '@/services'
import {
  mapperRequestRejectionReasonDetail,
  mapperRequestRejectionReasonFormToPayload,
  mapperRequestRejectionReasonList,
} from '@/mappers'
import { useGetDetail, useGetTable, useMutateAction, useMutateForm } from '@/utils'
import type { RequestRejectionReasonForm, RequestRejectionReasonQueryParams } from '@/models'

export function getRequestRejectionReasonListAction(params: RequestRejectionReasonQueryParams) {
  return useGetTable(listRequestRejectionReasonsApi, params, mapperRequestRejectionReasonList)
}

export function getRequestRejectionReasonSubModuleOptionsAction() {
  return listRequestRejectionReasonSubModulesApi()
}

export function getRequestRejectionReasonDetailAction(id: number) {
  return useGetDetail(getRequestRejectionReasonApi, id, mapperRequestRejectionReasonDetail)
}

export function createRequestRejectionReasonAction(form: RequestRejectionReasonForm) {
  return useMutateForm(
    createRequestRejectionReasonApi,
    form,
    mapperRequestRejectionReasonFormToPayload,
  )
}

export function updateRequestRejectionReasonAction(form: RequestRejectionReasonForm) {
  return useMutateForm(
    (payload) => updateRequestRejectionReasonApi(form.id as number, payload),
    form,
    mapperRequestRejectionReasonFormToPayload,
  )
}

export function toggleRequestRejectionReasonActiveAction(id: number) {
  return useMutateAction(toggleRequestRejectionReasonActiveApi, id)
}
