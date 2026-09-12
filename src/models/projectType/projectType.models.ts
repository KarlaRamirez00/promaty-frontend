import type { Badge } from '@/types/badge'

export interface ProjectTypeListItem {
  id: number
  name: string
  active: boolean
  status: Badge
  actions: string[]
}

export interface ProjectType {
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

export interface ProjectTypeForm {
  id: number | null
  name: string
}

export const createProjectTypeForm = (overrides: Partial<ProjectTypeForm> = {}): ProjectTypeForm => ({
  id: null,
  name: '',
  ...overrides,
})

export interface ProjectTypeFilters {
  search: string
  active: boolean | null
}

export const createProjectTypeFilters = (
  overrides: Partial<ProjectTypeFilters> = {},
): ProjectTypeFilters => ({
  search: '',
  active: null,
  ...overrides,
})

export type SortDirection = 'asc' | 'desc'

export interface ProjectTypeSort {
  key: string
  order: SortDirection
}

export const PROJECT_TYPE_SORTABLE_KEYS = ['name', 'active'] as const

export const DEFAULT_PROJECT_TYPE_SORT: ProjectTypeSort = { key: 'name', order: 'asc' }

export function parseProjectTypeSort(raw: unknown): ProjectTypeSort {
  if (typeof raw !== 'string') return { ...DEFAULT_PROJECT_TYPE_SORT }
  const [key, order] = raw.split(',')
  if (!PROJECT_TYPE_SORTABLE_KEYS.includes(key as (typeof PROJECT_TYPE_SORTABLE_KEYS)[number])) {
    return { ...DEFAULT_PROJECT_TYPE_SORT }
  }
  return { key, order: order === 'desc' ? 'desc' : 'asc' }
}

export function formatProjectTypeSort(sort: ProjectTypeSort): string {
  return `${sort.key},${sort.order}`
}

export function isDefaultProjectTypeSort(sort: ProjectTypeSort): boolean {
  return sort.key === DEFAULT_PROJECT_TYPE_SORT.key && sort.order === DEFAULT_PROJECT_TYPE_SORT.order
}

export interface ProjectTypeQueryParams extends ProjectTypeFilters {
  page: number
  size: number
  sort: ProjectTypeSort
}

const PROJECT_TYPE_PAGE_SIZES = [10, 25, 50, 100] as const

export const DEFAULT_PROJECT_TYPE_QUERY: ProjectTypeQueryParams = {
  ...createProjectTypeFilters(),
  page: 1,
  size: 10,
  sort: DEFAULT_PROJECT_TYPE_SORT,
}

function toPage(raw: unknown): number {
  const n = Number(raw)
  return Number.isInteger(n) && n >= 1 ? n : DEFAULT_PROJECT_TYPE_QUERY.page
}

function toPageSize(raw: unknown): number {
  const n = Number(raw)
  return (PROJECT_TYPE_PAGE_SIZES as readonly number[]).includes(n) ? n : DEFAULT_PROJECT_TYPE_QUERY.size
}

function toActiveFilter(raw: unknown): boolean | null {
  if (raw === 'true') return true
  if (raw === 'false') return false
  return null
}

export function parseProjectTypeQuery(query: Record<string, unknown>): ProjectTypeQueryParams {
  return {
    search: typeof query.search === 'string' ? query.search : '',
    active: toActiveFilter(query.active),
    page: toPage(query.page),
    size: toPageSize(query.size),
    sort: parseProjectTypeSort(query.sort),
  }
}

export function projectTypeQueryToRoute(params: ProjectTypeQueryParams): Record<string, string> {
  const query: Record<string, string> = {}
  const search = params.search.trim()
  if (search) query.search = search
  if (params.active !== null) query.active = String(params.active)
  if (params.page !== DEFAULT_PROJECT_TYPE_QUERY.page) query.page = String(params.page)
  if (params.size !== DEFAULT_PROJECT_TYPE_QUERY.size) query.size = String(params.size)
  if (!isDefaultProjectTypeSort(params.sort)) query.sort = formatProjectTypeSort(params.sort)
  return query
}
