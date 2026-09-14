import type { Badge } from '@/types/badge'
import type { SortDirection } from '@/types/sort'

export interface ProjectSpecialtyListItem {
  id: number
  name: string
  active: boolean
  status: Badge
  actions: string[]
}

export interface ProjectSpecialty {
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

export interface ProjectSpecialtyForm {
  id: number | null
  name: string
}

export const createProjectSpecialtyForm = (
  overrides: Partial<ProjectSpecialtyForm> = {},
): ProjectSpecialtyForm => ({
  id: null,
  name: '',
  ...overrides,
})

export interface ProjectSpecialtyFilters {
  search: string
  active: boolean | null
}

export const createProjectSpecialtyFilters = (
  overrides: Partial<ProjectSpecialtyFilters> = {},
): ProjectSpecialtyFilters => ({
  search: '',
  active: null,
  ...overrides,
})


export interface ProjectSpecialtySort {
  key: string
  order: SortDirection
}

export const PROJECT_SPECIALTY_SORTABLE_KEYS = ['name', 'active'] as const

export const DEFAULT_PROJECT_SPECIALTY_SORT: ProjectSpecialtySort = { key: 'name', order: 'asc' }

export function parseProjectSpecialtySort(raw: unknown): ProjectSpecialtySort {
  if (typeof raw !== 'string') return { ...DEFAULT_PROJECT_SPECIALTY_SORT }
  const [key, order] = raw.split(',')
  if (
    !PROJECT_SPECIALTY_SORTABLE_KEYS.includes(key as (typeof PROJECT_SPECIALTY_SORTABLE_KEYS)[number])
  ) {
    return { ...DEFAULT_PROJECT_SPECIALTY_SORT }
  }
  return { key, order: order === 'desc' ? 'desc' : 'asc' }
}

export function formatProjectSpecialtySort(sort: ProjectSpecialtySort): string {
  return `${sort.key},${sort.order}`
}

export function isDefaultProjectSpecialtySort(sort: ProjectSpecialtySort): boolean {
  return (
    sort.key === DEFAULT_PROJECT_SPECIALTY_SORT.key &&
    sort.order === DEFAULT_PROJECT_SPECIALTY_SORT.order
  )
}

export interface ProjectSpecialtyQueryParams extends ProjectSpecialtyFilters {
  page: number
  size: number
  sort: ProjectSpecialtySort
}

const PROJECT_SPECIALTY_PAGE_SIZES = [10, 25, 50, 100] as const

export const DEFAULT_PROJECT_SPECIALTY_QUERY: ProjectSpecialtyQueryParams = {
  ...createProjectSpecialtyFilters(),
  page: 1,
  size: 10,
  sort: DEFAULT_PROJECT_SPECIALTY_SORT,
}

function toPage(raw: unknown): number {
  const n = Number(raw)
  return Number.isInteger(n) && n >= 1 ? n : DEFAULT_PROJECT_SPECIALTY_QUERY.page
}

function toPageSize(raw: unknown): number {
  const n = Number(raw)
  return (PROJECT_SPECIALTY_PAGE_SIZES as readonly number[]).includes(n)
    ? n
    : DEFAULT_PROJECT_SPECIALTY_QUERY.size
}

function toActiveFilter(raw: unknown): boolean | null {
  if (raw === 'true') return true
  if (raw === 'false') return false
  return null
}

export function parseProjectSpecialtyQuery(query: Record<string, unknown>): ProjectSpecialtyQueryParams {
  return {
    search: typeof query.search === 'string' ? query.search : '',
    active: toActiveFilter(query.active),
    page: toPage(query.page),
    size: toPageSize(query.size),
    sort: parseProjectSpecialtySort(query.sort),
  }
}

export function projectSpecialtyQueryToRoute(
  params: ProjectSpecialtyQueryParams,
): Record<string, string> {
  const query: Record<string, string> = {}
  const search = params.search.trim()
  if (search) query.search = search
  if (params.active !== null) query.active = String(params.active)
  if (params.page !== DEFAULT_PROJECT_SPECIALTY_QUERY.page) query.page = String(params.page)
  if (params.size !== DEFAULT_PROJECT_SPECIALTY_QUERY.size) query.size = String(params.size)
  if (!isDefaultProjectSpecialtySort(params.sort)) query.sort = formatProjectSpecialtySort(params.sort)
  return query
}
