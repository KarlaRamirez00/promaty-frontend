import {
  createNonRehireReasonApi,
  getNonRehireReasonApi,
  listNonRehireReasonsApi,
  toggleNonRehireReasonActiveApi,
  updateNonRehireReasonApi,
} from '@/services'
import {
  mapperNonRehireReasonDetail,
  mapperNonRehireReasonFormToPayload,
  mapperNonRehireReasonList,
} from '@/mappers'
import { useGetDetail, useGetTable, useMutateAction, useMutateForm } from '@/utils'
import type { NonRehireReasonForm, NonRehireReasonQueryParams } from '@/models'

export function getNonRehireReasonListAction(params: NonRehireReasonQueryParams) {
  return useGetTable(listNonRehireReasonsApi, params, mapperNonRehireReasonList)
}

export function getNonRehireReasonDetailAction(id: number) {
  return useGetDetail(getNonRehireReasonApi, id, mapperNonRehireReasonDetail)
}

export function createNonRehireReasonAction(form: NonRehireReasonForm) {
  return useMutateForm(createNonRehireReasonApi, form, mapperNonRehireReasonFormToPayload)
}

export function updateNonRehireReasonAction(form: NonRehireReasonForm) {
  return useMutateForm(
    (payload) => updateNonRehireReasonApi(form.id as number, payload),
    form,
    mapperNonRehireReasonFormToPayload,
  )
}

export function toggleNonRehireReasonActiveAction(id: number) {
  return useMutateAction(toggleNonRehireReasonActiveApi, id)
}
