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
  createdBy: string
  updatedBy: string
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

export type SortDirection = 'asc' | 'desc'

export interface ClientSort {
  key: string
  order: SortDirection
}

export const CLIENT_SORTABLE_KEYS = ['name', 'active'] as const

export const DEFAULT_CLIENT_SORT: ClientSort = { key: 'name', order: 'asc' }

export function parseClientSort(raw: unknown): ClientSort {
  if (typeof raw !== 'string') return { ...DEFAULT_CLIENT_SORT }
  const [key, order] = raw.split(',')
  if (!CLIENT_SORTABLE_KEYS.includes(key as (typeof CLIENT_SORTABLE_KEYS)[number])) {
    return { ...DEFAULT_CLIENT_SORT }
  }
  return { key, order: order === 'desc' ? 'desc' : 'asc' }
}

export function formatClientSort(sort: ClientSort): string {
  return `${sort.key},${sort.order}`
}

export function isDefaultClientSort(sort: ClientSort): boolean {
  return sort.key === DEFAULT_CLIENT_SORT.key && sort.order === DEFAULT_CLIENT_SORT.order
}

export interface ClientQueryParams extends ClientFilters {
  page: number
  size: number
  sort: ClientSort
}

const CLIENT_PAGE_SIZES = [10, 25, 50, 100] as const

export const DEFAULT_CLIENT_QUERY: ClientQueryParams = {
  ...createClientFilters(),
  page: 1,
  size: 10,
  sort: DEFAULT_CLIENT_SORT,
}

function toPage(raw: unknown): number {
  const n = Number(raw)
  return Number.isInteger(n) && n >= 1 ? n : DEFAULT_CLIENT_QUERY.page
}

function toPageSize(raw: unknown): number {
  const n = Number(raw)
  return (CLIENT_PAGE_SIZES as readonly number[]).includes(n) ? n : DEFAULT_CLIENT_QUERY.size
}

function toActiveFilter(raw: unknown): boolean | null {
  if (raw === 'true') return true
  if (raw === 'false') return false
  return null
}

export function parseClientQuery(query: Record<string, unknown>): ClientQueryParams {
  return {
    search: typeof query.search === 'string' ? query.search : '',
    active: toActiveFilter(query.active),
    page: toPage(query.page),
    size: toPageSize(query.size),
    sort: parseClientSort(query.sort),
  }
}

export function clientQueryToRoute(params: ClientQueryParams): Record<string, string> {
  const query: Record<string, string> = {}
  const search = params.search.trim()
  if (search) query.search = search
  if (params.active !== null) query.active = String(params.active)
  if (params.page !== DEFAULT_CLIENT_QUERY.page) query.page = String(params.page)
  if (params.size !== DEFAULT_CLIENT_QUERY.size) query.size = String(params.size)
  if (!isDefaultClientSort(params.sort)) query.sort = formatClientSort(params.sort)
  return query
}
