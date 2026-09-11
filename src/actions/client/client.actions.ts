import {
  createClientApi,
  getClientApi,
  listClientsApi,
  toggleClientActiveApi,
  updateClientApi,
} from '@/services/clients.api'
import {
  mapperClientDetail,
  mapperClientFormToPayload,
  mapperClientList,
} from '@/mappers/client/client.mapper'
import { useGetDetail, useGetTable } from '@/utils/useGet'
import { useMutateAction, useMutateForm } from '@/utils/useMutation'
import type { ClientForm, ClientQueryParams } from '@/models/client/client.models'

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
