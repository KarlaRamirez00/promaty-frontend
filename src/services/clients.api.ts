import { rrhhApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type { ClientFormPayload, ClientListRaw, ClientRaw } from '@/types/client'
import type { ClientQueryParams } from '@/models/client/client.models'

export async function listClientsApi(params: ClientQueryParams): Promise<PageResult<ClientListRaw>> {
  const response = await rrhhApi.get<ApiListResponse<ClientListRaw>>('/clients', {
    params: {
      search: params.search || undefined,
      active: params.active ?? undefined,
      page: params.page - 1,
      size: params.size,
      sort: `${params.sort.key},${params.sort.order}`,
    },
  })
  return unwrapPage(response)
}

export async function getClientApi(id: number): Promise<ClientRaw> {
  const response = await rrhhApi.get<ApiResponse<ClientRaw>>(`/clients/${id}`)
  return unwrap(response)
}

export async function createClientApi(payload: ClientFormPayload): Promise<number> {
  const response = await rrhhApi.post<ApiResponse<number>>('/clients', payload)
  return unwrap(response)
}

export async function updateClientApi(id: number, payload: ClientFormPayload): Promise<ClientRaw> {
  const response = await rrhhApi.put<ApiResponse<ClientRaw>>(`/clients/${id}`, payload)
  return unwrap(response)
}

export async function toggleClientActiveApi(id: number): Promise<ClientRaw> {
  const response = await rrhhApi.patch<ApiResponse<ClientRaw>>(`/clients/${id}/active`)
  return unwrap(response)
}
