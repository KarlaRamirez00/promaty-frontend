import { ApiRequestError } from '@/lib/http'
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
import { useClientsStore } from '@/stores/clients'

function reportError(store: ReturnType<typeof useClientsStore>, error: unknown) {
  store.errorBack = error instanceof ApiRequestError ? error : null
}

export function getClientListAction(params: ClientQueryParams) {
  const store = useClientsStore()
  return useGetTable(listClientsApi, params, mapperClientList, undefined, (error) =>
    reportError(store, error),
  )
}

export function getClientDetailAction(id: number) {
  const store = useClientsStore()
  return useGetDetail(getClientApi, id, mapperClientDetail, (error) => reportError(store, error))
}

export function createClientAction(form: ClientForm) {
  const store = useClientsStore()
  return useMutateForm(createClientApi, form, mapperClientFormToPayload, (error) =>
    reportError(store, error),
  )
}

export function updateClientAction(form: ClientForm) {
  const store = useClientsStore()
  return useMutateForm(
    (payload) => updateClientApi(form.id as number, payload),
    form,
    mapperClientFormToPayload,
    (error) => reportError(store, error),
  )
}

export function toggleClientActiveAction(id: number) {
  const store = useClientsStore()
  return useMutateAction(toggleClientActiveApi, id, (error) => reportError(store, error))
}
