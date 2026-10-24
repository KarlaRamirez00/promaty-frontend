import type { Badge } from '@/types/badge'
import type { SortDirection } from '@/types/sort'

export interface NonRehireReasonListItem {
  id: number
  name: string
  active: boolean
  updatedAt: string
  status: Badge
  actions: string[]
}

export interface NonRehireReason {
  id: number
  name: string
  description: string | null
  active: boolean
  status: Badge
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

export interface NonRehireReasonForm {
  id: number | null
  name: string
  description: string
}

export const createNonRehireReasonForm = (
  overrides: Partial<NonRehireReasonForm> = {},
): NonRehireReasonForm => ({
  id: null,
  name: '',
  description: '',
  ...overrides,
})

export interface NonRehireReasonFilters {
  search: string
  active: boolean | null
}

export const createNonRehireReasonFilters = (
  overrides: Partial<NonRehireReasonFilters> = {},
): NonRehireReasonFilters => ({
  search: '',
  active: null,
  ...overrides,
})

export interface NonRehireReasonSort {
  key: string
  order: SortDirection
}

export const NON_REHIRE_REASON_SORTABLE_KEYS = ['name', 'updatedAt', 'active'] as const

export const DEFAULT_NON_REHIRE_REASON_SORT: NonRehireReasonSort = { key: 'name', order: 'asc' }

export function parseNonRehireReasonSort(raw: unknown): NonRehireReasonSort {
  if (typeof raw !== 'string') return { ...DEFAULT_NON_REHIRE_REASON_SORT }
  const [key, order] = raw.split(',')
  if (!NON_REHIRE_REASON_SORTABLE_KEYS.includes(key as (typeof NON_REHIRE_REASON_SORTABLE_KEYS)[number])) {
    return { ...DEFAULT_NON_REHIRE_REASON_SORT }
  }
  return { key, order: order === 'desc' ? 'desc' : 'asc' }
}

export function formatNonRehireReasonSort(sort: NonRehireReasonSort): string {
  return `${sort.key},${sort.order}`
}

export function isDefaultNonRehireReasonSort(sort: NonRehireReasonSort): boolean {
  return (
    sort.key === DEFAULT_NON_REHIRE_REASON_SORT.key &&
    sort.order === DEFAULT_NON_REHIRE_REASON_SORT.order
  )
}

export interface NonRehireReasonQueryParams extends NonRehireReasonFilters {
  page: number
  size: number
  sort: NonRehireReasonSort
}

const NON_REHIRE_REASON_PAGE_SIZES = [10, 25, 50, 100] as const

export const DEFAULT_NON_REHIRE_REASON_QUERY: NonRehireReasonQueryParams = {
  ...createNonRehireReasonFilters(),
  page: 1,
  size: 10,
  sort: DEFAULT_NON_REHIRE_REASON_SORT,
}

function toPage(raw: unknown): number {
  const n = Number(raw)
  return Number.isInteger(n) && n >= 1 ? n : DEFAULT_NON_REHIRE_REASON_QUERY.page
}

function toPageSize(raw: unknown): number {
  const n = Number(raw)
  return (NON_REHIRE_REASON_PAGE_SIZES as readonly number[]).includes(n)
    ? n
    : DEFAULT_NON_REHIRE_REASON_QUERY.size
}

function toActiveFilter(raw: unknown): boolean | null {
  if (raw === 'true') return true
  if (raw === 'false') return false
  return null
}

export function parseNonRehireReasonQuery(query: Record<string, unknown>): NonRehireReasonQueryParams {
  return {
    search: typeof query.search === 'string' ? query.search : '',
    active: toActiveFilter(query.active),
    page: toPage(query.page),
    size: toPageSize(query.size),
    sort: parseNonRehireReasonSort(query.sort),
  }
}

export function nonRehireReasonQueryToRoute(params: NonRehireReasonQueryParams): Record<string, string> {
  const query: Record<string, string> = {}
  const search = params.search.trim()
  if (search) query.search = search
  if (params.active !== null) query.active = String(params.active)
  if (params.page !== DEFAULT_NON_REHIRE_REASON_QUERY.page) query.page = String(params.page)
  if (params.size !== DEFAULT_NON_REHIRE_REASON_QUERY.size) query.size = String(params.size)
  if (!isDefaultNonRehireReasonSort(params.sort)) query.sort = formatNonRehireReasonSort(params.sort)
  return query
}
