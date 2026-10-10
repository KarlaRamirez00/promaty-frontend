import {
  decideRequestApi,
  getRequestApi,
  listRejectionReasonOptionsApi,
  listRequesterOptionsApi,
  listRequestsApi,
  listRequestStatusOptionsApi,
} from '@/services'
import {
  mapperRequestApprovePayload,
  mapperRequestDetail,
  mapperRequestList,
  mapperRequestRejectPayload,
} from '@/mappers'
import { useGetDetail, useGetTable, useMutateAction, useMutateForm } from '@/utils'
import type { RequestDecisionForm, RequestQueryParams } from '@/models'

const CONTRACT_REJECTION_SUBMODULE = 'contracts'

export function getRequestListAction(params: RequestQueryParams) {
  return useGetTable(listRequestsApi, params, mapperRequestList)
}

export function getRequestDetailAction(id: number) {
  return useGetDetail(getRequestApi, id, mapperRequestDetail)
}

export function approveRequestAction(id: number) {
  return useMutateAction(
    (payload) => decideRequestApi(id, payload),
    mapperRequestApprovePayload(),
  )
}

export function rejectRequestAction(id: number, form: RequestDecisionForm) {
  return useMutateForm(
    (payload) => decideRequestApi(id, payload),
    form,
    mapperRequestRejectPayload,
  )
}

export function getRequestStatusOptionsAction() {
  return listRequestStatusOptionsApi()
}

export function getRejectionReasonOptionsAction() {
  return listRejectionReasonOptionsApi(CONTRACT_REJECTION_SUBMODULE)
}

export function getRequesterOptionsAction() {
  return listRequesterOptionsApi()
}
