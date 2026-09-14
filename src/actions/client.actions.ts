import {
  createClientApi,
  getClientApi,
  listClientsApi,
  toggleClientActiveApi,
  updateClientApi,
} from '@/services'
import {
  mapperClientDetail,
  mapperClientFormToPayload,
  mapperClientList,
} from '@/mappers'
import { useGetDetail, useGetTable, useMutateAction, useMutateForm } from '@/utils'
import type { ClientForm, ClientQueryParams } from '@/models'

export function getClientListAction(params: ClientQueryParams) {
  return useGetTable(listClientsApi, params, mapperClientList)
}

export function getClientDetailAction(id: number) {
  return useGetDetail(getClientApi, id, mapperClientDetail)
}

export function createClientAction(form: ClientForm) {
  return useMutateForm(createClientApi, form, mapperClientFormToPayload)
}

export function updateClientAction(form: ClientForm) {
  return useMutateForm((payload) => updateClientApi(form.id as number, payload), form, mapperClientFormToPayload)
}

export function toggleClientActiveAction(id: number) {
  return useMutateAction(toggleClientActiveApi, id)
}
