import type { Badge } from '@/types/badge'

export interface ClientListItem {
  id: number
  name: string
  active: boolean
  status: Badge
  actions: string[]
}

export interface Client {
  id: number
  name: string
  active: boolean
  status: Badge
  createdAt: string
  updatedAt: string
  actions: string[]
}

export interface ClientForm {
  id: number | null
  name: string
}

export const createClientForm = (overrides: Partial<ClientForm> = {}): ClientForm => ({
  id: null,
  name: '',
  ...overrides,
})

export interface ClientFilters {
  search: string
  active: boolean | null
}

export const createClientFilters = (overrides: Partial<ClientFilters> = {}): ClientFilters => ({
  search: '',
  active: null,
  ...overrides,
})

export interface ClientQueryParams extends ClientFilters {
  page: number
  size: number
}

export const createClientQueryParams = (
  overrides: Partial<ClientQueryParams> = {},
): ClientQueryParams => ({
  ...createClientFilters(),
  page: 1,
  size: 10,
  ...overrides,
})
