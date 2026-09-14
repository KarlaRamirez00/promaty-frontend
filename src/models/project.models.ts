import type { SortDirection } from '@/types/sort'

export interface ProjectRelationOption {
  id: number
  name: string
}

export interface ProjectStatusOption {
  id: number
  code: string
  name: string
}

export interface ProjectListItem {
  id: number
  name: string
  costCenterCode: string
  typeName: string
  specialtyName: string
  clientName: string
  statusName: string
  startDate: string
  endDate: string
  actions: string[]
}

export interface Project {
  id: number
  name: string
  costCenterCode: string
  type: ProjectRelationOption
  specialty: ProjectRelationOption
  client: ProjectRelationOption
  status: ProjectStatusOption
  startDate: string
  endDate: string
  startDateRaw: string
  endDateRaw: string | null
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

export interface ProjectForm {
  id: number | null
  name: string
  costCenterCode: string
  typeId: number | null
  specialtyId: number | null
  clientId: number | null
  startDate: string | null
  endDate: string | null
}

export const createProjectForm = (overrides: Partial<ProjectForm> = {}): ProjectForm => ({
  id: null,
  name: '',
  costCenterCode: '',
  typeId: null,
  specialtyId: null,
  clientId: null,
  startDate: null,
  endDate: null,
  ...overrides,
})

export interface ProjectFilters {
  search: string
  typeId: number | null
  specialtyId: number | null
  clientId: number | null
  statusId: number | null
}

export const createProjectFilters = (overrides: Partial<ProjectFilters> = {}): ProjectFilters => ({
  search: '',
  typeId: null,
  specialtyId: null,
  clientId: null,
  statusId: null,
  ...overrides,
})


export interface ProjectSort {
  key: string
  order: SortDirection
}

export const PROJECT_SORTABLE_KEYS = ['name', 'startDate'] as const

export const DEFAULT_PROJECT_SORT: ProjectSort = { key: 'name', order: 'asc' }

export function parseProjectSort(raw: unknown): ProjectSort {
  if (typeof raw !== 'string') return { ...DEFAULT_PROJECT_SORT }
  const [key, order] = raw.split(',')
  if (!PROJECT_SORTABLE_KEYS.includes(key as (typeof PROJECT_SORTABLE_KEYS)[number])) {
    return { ...DEFAULT_PROJECT_SORT }
  }
  return { key, order: order === 'desc' ? 'desc' : 'asc' }
}

export function formatProjectSort(sort: ProjectSort): string {
  return `${sort.key},${sort.order}`
}

export function isDefaultProjectSort(sort: ProjectSort): boolean {
  return sort.key === DEFAULT_PROJECT_SORT.key && sort.order === DEFAULT_PROJECT_SORT.order
}

export interface ProjectQueryParams extends ProjectFilters {
  page: number
  size: number
  sort: ProjectSort
}

const PROJECT_PAGE_SIZES = [10, 25, 50, 100] as const

export const DEFAULT_PROJECT_QUERY: ProjectQueryParams = {
  ...createProjectFilters(),
  page: 1,
  size: 10,
  sort: DEFAULT_PROJECT_SORT,
}

function toPage(raw: unknown): number {
  const n = Number(raw)
  return Number.isInteger(n) && n >= 1 ? n : DEFAULT_PROJECT_QUERY.page
}

function toPageSize(raw: unknown): number {
  const n = Number(raw)
  return (PROJECT_PAGE_SIZES as readonly number[]).includes(n) ? n : DEFAULT_PROJECT_QUERY.size
}

function toIdFilter(raw: unknown): number | null {
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? n : null
}

export function parseProjectQuery(query: Record<string, unknown>): ProjectQueryParams {
  return {
    search: typeof query.search === 'string' ? query.search : '',
    typeId: toIdFilter(query.typeId),
    specialtyId: toIdFilter(query.specialtyId),
    clientId: toIdFilter(query.clientId),
    statusId: toIdFilter(query.statusId),
    page: toPage(query.page),
    size: toPageSize(query.size),
    sort: parseProjectSort(query.sort),
  }
}

export function projectQueryToRoute(params: ProjectQueryParams): Record<string, string> {
  const query: Record<string, string> = {}
  const search = params.search.trim()
  if (search) query.search = search
  if (params.typeId !== null) query.typeId = String(params.typeId)
  if (params.specialtyId !== null) query.specialtyId = String(params.specialtyId)
  if (params.clientId !== null) query.clientId = String(params.clientId)
  if (params.statusId !== null) query.statusId = String(params.statusId)
  if (params.page !== DEFAULT_PROJECT_QUERY.page) query.page = String(params.page)
  if (params.size !== DEFAULT_PROJECT_QUERY.size) query.size = String(params.size)
  if (!isDefaultProjectSort(params.sort)) query.sort = formatProjectSort(params.sort)
  return query
}
