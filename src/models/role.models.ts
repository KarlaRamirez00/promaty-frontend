import type { Badge } from '@/types/badge'
import type { SortDirection } from '@/types/sort'

export interface RolePermissionSummary {
  id: number
  name: string
}

export interface RoleSubModuleSummary {
  id: number
  name: string
  alias: string
}

// Catálogo completo para el picker del form (GET /permissions) — cada permiso trae su subModule
// anidado; no hay endpoint separado de submodules, se derivan agrupando este listado.
export interface RolePermissionOption {
  id: number
  name: string
  alias: string
  description: string | null
  subModule: RoleSubModuleSummary
}

export interface RoleRelationOption {
  id: number
  name: string
}

export interface RoleListItem {
  id: number
  name: string
  description: string | null
  active: boolean
  status: Badge
  totalUsers: number
  actions: string[]
}

export interface Role {
  id: number
  name: string
  description: string | null
  active: boolean
  status: Badge
  totalUsers: number
  permissions: RolePermissionSummary[]
  subModules: RoleSubModuleSummary[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

export interface RoleForm {
  id: number | null
  name: string
  description: string
  permissionIds: number[]
  subModuleIds: number[]
}

export const createRoleForm = (overrides: Partial<RoleForm> = {}): RoleForm => ({
  id: null,
  name: '',
  description: '',
  permissionIds: [],
  subModuleIds: [],
  ...overrides,
})

export interface RoleFilters {
  search: string
  active: boolean | null
}

export const createRoleFilters = (overrides: Partial<RoleFilters> = {}): RoleFilters => ({
  search: '',
  active: null,
  ...overrides,
})

export interface RoleSort {
  key: string
  order: SortDirection
}

export const ROLE_SORTABLE_KEYS = ['name', 'totalUsers'] as const

export const DEFAULT_ROLE_SORT: RoleSort = { key: 'name', order: 'asc' }

export function parseRoleSort(raw: unknown): RoleSort {
  if (typeof raw !== 'string') return { ...DEFAULT_ROLE_SORT }
  const [key, order] = raw.split(',')
  if (!ROLE_SORTABLE_KEYS.includes(key as (typeof ROLE_SORTABLE_KEYS)[number])) {
    return { ...DEFAULT_ROLE_SORT }
  }
  return { key, order: order === 'desc' ? 'desc' : 'asc' }
}

export function formatRoleSort(sort: RoleSort): string {
  return `${sort.key},${sort.order}`
}

export function isDefaultRoleSort(sort: RoleSort): boolean {
  return sort.key === DEFAULT_ROLE_SORT.key && sort.order === DEFAULT_ROLE_SORT.order
}

export interface RoleQueryParams extends RoleFilters {
  page: number
  size: number
  sort: RoleSort
}

const ROLE_PAGE_SIZES = [10, 25, 50, 100] as const

export const DEFAULT_ROLE_QUERY: RoleQueryParams = {
  ...createRoleFilters(),
  page: 1,
  size: 10,
  sort: DEFAULT_ROLE_SORT,
}

function toPage(raw: unknown): number {
  const n = Number(raw)
  return Number.isInteger(n) && n >= 1 ? n : DEFAULT_ROLE_QUERY.page
}

function toPageSize(raw: unknown): number {
  const n = Number(raw)
  return (ROLE_PAGE_SIZES as readonly number[]).includes(n) ? n : DEFAULT_ROLE_QUERY.size
}

function toActiveFilter(raw: unknown): boolean | null {
  if (raw === 'true') return true
  if (raw === 'false') return false
  return null
}

export function parseRoleQuery(query: Record<string, unknown>): RoleQueryParams {
  return {
    search: typeof query.search === 'string' ? query.search : '',
    active: toActiveFilter(query.active),
    page: toPage(query.page),
    size: toPageSize(query.size),
    sort: parseRoleSort(query.sort),
  }
}

export function roleQueryToRoute(params: RoleQueryParams): Record<string, string> {
  const query: Record<string, string> = {}
  const search = params.search.trim()
  if (search) query.search = search
  if (params.active !== null) query.active = String(params.active)
  if (params.page !== DEFAULT_ROLE_QUERY.page) query.page = String(params.page)
  if (params.size !== DEFAULT_ROLE_QUERY.size) query.size = String(params.size)
  if (!isDefaultRoleSort(params.sort)) query.sort = formatRoleSort(params.sort)
  return query
}
