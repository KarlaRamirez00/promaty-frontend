import type { Badge } from '@/types/badge'
import type { SortDirection } from '@/types/sort'

export interface UserRoleSummary {
  id: number
  name: string
}

// Sintético hasta que exista actions[] en el DTO real (T-B553): ActionsMenu espera este campo
// para su doble gate, y acá siempre lo deja pasar — el único gate real hoy es el permiso.
export const USER_ACTIONS_PLACEHOLDER = ['UPDATE', 'ACTIVE'] as const

export interface UserListItem {
  id: number
  firstName: string
  lastName: string
  fullName: string
  email: string
  active: boolean
  status: Badge
  role: UserRoleSummary
  actions: string[]
}

export interface User {
  id: number
  firstName: string
  lastName: string
  fullName: string
  email: string
  phoneNumber: string
  active: boolean
  status: Badge
  role: UserRoleSummary
  projectIds: number[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

export interface UserForm {
  id: number | null
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  roleId: number | null
  projectIds: number[]
  password: string
}

export const createUserForm = (overrides: Partial<UserForm> = {}): UserForm => ({
  id: null,
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  roleId: null,
  projectIds: [],
  password: '',
  ...overrides,
})

export interface UserFilters {
  search: string
  active: boolean | null
  roleId: number | null
}

export const createUserFilters = (overrides: Partial<UserFilters> = {}): UserFilters => ({
  search: '',
  active: null,
  roleId: null,
  ...overrides,
})

export interface UserSort {
  key: string
  order: SortDirection
}

export const USER_SORTABLE_KEYS = ['firstName', 'lastName', 'email'] as const

export const DEFAULT_USER_SORT: UserSort = { key: 'firstName', order: 'asc' }

export function parseUserSort(raw: unknown): UserSort {
  if (typeof raw !== 'string') return { ...DEFAULT_USER_SORT }
  const [key, order] = raw.split(',')
  if (!USER_SORTABLE_KEYS.includes(key as (typeof USER_SORTABLE_KEYS)[number])) {
    return { ...DEFAULT_USER_SORT }
  }
  return { key, order: order === 'desc' ? 'desc' : 'asc' }
}

export function formatUserSort(sort: UserSort): string {
  return `${sort.key},${sort.order}`
}

export function isDefaultUserSort(sort: UserSort): boolean {
  return sort.key === DEFAULT_USER_SORT.key && sort.order === DEFAULT_USER_SORT.order
}

export interface UserQueryParams extends UserFilters {
  page: number
  size: number
  sort: UserSort
}

const USER_PAGE_SIZES = [10, 25, 50, 100] as const

export const DEFAULT_USER_QUERY: UserQueryParams = {
  ...createUserFilters(),
  page: 1,
  size: 10,
  sort: DEFAULT_USER_SORT,
}

function toPage(raw: unknown): number {
  const n = Number(raw)
  return Number.isInteger(n) && n >= 1 ? n : DEFAULT_USER_QUERY.page
}

function toPageSize(raw: unknown): number {
  const n = Number(raw)
  return (USER_PAGE_SIZES as readonly number[]).includes(n) ? n : DEFAULT_USER_QUERY.size
}

function toActiveFilter(raw: unknown): boolean | null {
  if (raw === 'true') return true
  if (raw === 'false') return false
  return null
}

function toRoleIdFilter(raw: unknown): number | null {
  const n = Number(raw)
  return typeof raw === 'string' && Number.isInteger(n) && n > 0 ? n : null
}

export function parseUserQuery(query: Record<string, unknown>): UserQueryParams {
  return {
    search: typeof query.search === 'string' ? query.search : '',
    active: toActiveFilter(query.active),
    roleId: toRoleIdFilter(query.roleId),
    page: toPage(query.page),
    size: toPageSize(query.size),
    sort: parseUserSort(query.sort),
  }
}

export function userQueryToRoute(params: UserQueryParams): Record<string, string> {
  const query: Record<string, string> = {}
  const search = params.search.trim()
  if (search) query.search = search
  if (params.active !== null) query.active = String(params.active)
  if (params.roleId !== null) query.roleId = String(params.roleId)
  if (params.page !== DEFAULT_USER_QUERY.page) query.page = String(params.page)
  if (params.size !== DEFAULT_USER_QUERY.size) query.size = String(params.size)
  if (!isDefaultUserSort(params.sort)) query.sort = formatUserSort(params.sort)
  return query
}
