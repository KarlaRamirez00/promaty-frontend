import {
  annulTerminationApi,
  getTerminationApi,
  listTerminationsApi,
  listTerminationStatusOptionsApi,
} from '@/services'
import {
  mapperTerminationAnnulPayload,
  mapperTerminationDetail,
  mapperTerminationList,
} from '@/mappers'
import { useGetDetail, useGetTable, useMutateForm } from '@/utils'
import type { TerminationAnnulForm, TerminationQueryParams } from '@/models'

export function getTerminationListAction(params: TerminationQueryParams) {
  return useGetTable(listTerminationsApi, params, mapperTerminationList)
}

export function getTerminationDetailAction(id: number) {
  return useGetDetail(getTerminationApi, id, mapperTerminationDetail)
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
