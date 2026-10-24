import type { Badge } from '@/types/badge'
import type { SortDirection } from '@/types/sort'

export interface RequestRejectionReasonListItem {
  id: number
  name: string
  subModule: string
  active: boolean
  updatedAt: string
  status: Badge
  actions: string[]
}

export interface RequestRejectionReason {
  id: number
  name: string
  description: string | null
  subModule: string
  active: boolean
  status: Badge
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

export interface RequestRejectionReasonForm {
  id: number | null
  name: string
  description: string
  subModule: string | null
}

export const createRequestRejectionReasonForm = (
  overrides: Partial<RequestRejectionReasonForm> = {},
): RequestRejectionReasonForm => ({
  id: null,
  name: '',
  description: '',
  subModule: null,
  ...overrides,
})

export interface RequestRejectionReasonFilters {
  search: string
  active: boolean | null
  subModule: string | null
}

export const createRequestRejectionReasonFilters = (
  overrides: Partial<RequestRejectionReasonFilters> = {},
): RequestRejectionReasonFilters => ({
  search: '',
  active: null,
  subModule: null,
  ...overrides,
})

export interface RequestRejectionReasonSort {
  key: string
  order: SortDirection
}

export const REQUEST_REJECTION_REASON_SORTABLE_KEYS = ['name', 'subModule', 'updatedAt', 'active'] as const

export const DEFAULT_REQUEST_REJECTION_REASON_SORT: RequestRejectionReasonSort = {
  key: 'name',
  order: 'asc',
}

export function parseRequestRejectionReasonSort(raw: unknown): RequestRejectionReasonSort {
  if (typeof raw !== 'string') return { ...DEFAULT_REQUEST_REJECTION_REASON_SORT }
  const [key, order] = raw.split(',')
  if (
    !REQUEST_REJECTION_REASON_SORTABLE_KEYS.includes(
      key as (typeof REQUEST_REJECTION_REASON_SORTABLE_KEYS)[number],
    )
  ) {
    return { ...DEFAULT_REQUEST_REJECTION_REASON_SORT }
  }
  return { key, order: order === 'desc' ? 'desc' : 'asc' }
}

export function formatRequestRejectionReasonSort(sort: RequestRejectionReasonSort): string {
  return `${sort.key},${sort.order}`
}

export function isDefaultRequestRejectionReasonSort(sort: RequestRejectionReasonSort): boolean {
  return (
    sort.key === DEFAULT_REQUEST_REJECTION_REASON_SORT.key &&
    sort.order === DEFAULT_REQUEST_REJECTION_REASON_SORT.order
  )
}

export interface RequestRejectionReasonQueryParams extends RequestRejectionReasonFilters {
  page: number
  size: number
  sort: RequestRejectionReasonSort
}

const REQUEST_REJECTION_REASON_PAGE_SIZES = [10, 25, 50, 100] as const

export const DEFAULT_REQUEST_REJECTION_REASON_QUERY: RequestRejectionReasonQueryParams = {
  ...createRequestRejectionReasonFilters(),
  page: 1,
  size: 10,
  sort: DEFAULT_REQUEST_REJECTION_REASON_SORT,
}

function toPage(raw: unknown): number {
  const n = Number(raw)
  return Number.isInteger(n) && n >= 1 ? n : DEFAULT_REQUEST_REJECTION_REASON_QUERY.page
}

function toPageSize(raw: unknown): number {
  const n = Number(raw)
  return (REQUEST_REJECTION_REASON_PAGE_SIZES as readonly number[]).includes(n)
    ? n
    : DEFAULT_REQUEST_REJECTION_REASON_QUERY.size
}

const SUBMODULE_FILTER_PATTERN = /^[\w-]{1,50}$/

function toSubModuleFilter(raw: unknown): string | null {
  return typeof raw === 'string' && SUBMODULE_FILTER_PATTERN.test(raw) ? raw : null
}

function toActiveFilter(raw: unknown): boolean | null {
  if (raw === 'true') return true
  if (raw === 'false') return false
  return null
}

export function parseRequestRejectionReasonQuery(
  query: Record<string, unknown>,
): RequestRejectionReasonQueryParams {
  return {
    search: typeof query.search === 'string' ? query.search : '',
    active: toActiveFilter(query.active),
    subModule: toSubModuleFilter(query.subModule),
    page: toPage(query.page),
    size: toPageSize(query.size),
    sort: parseRequestRejectionReasonSort(query.sort),
  }
}

export function requestRejectionReasonQueryToRoute(
  params: RequestRejectionReasonQueryParams,
): Record<string, string> {
  const query: Record<string, string> = {}
  const search = params.search.trim()
  if (search) query.search = search
  if (params.active !== null) query.active = String(params.active)
  if (params.subModule) query.subModule = params.subModule
  if (params.page !== DEFAULT_REQUEST_REJECTION_REASON_QUERY.page) query.page = String(params.page)
  if (params.size !== DEFAULT_REQUEST_REJECTION_REASON_QUERY.size) query.size = String(params.size)
  if (!isDefaultRequestRejectionReasonSort(params.sort)) {
    query.sort = formatRequestRejectionReasonSort(params.sort)
  }
  return query
}
