import type { SortDirection } from '@/types/sort'
import type { AccountType, ClothingSize, IdentificationType } from '@/types/staff'

export const IDENTIFICATION_TYPE_OPTIONS: { title: string; value: IdentificationType }[] = [
  { title: 'RUT', value: 'RUT' },
  { title: 'Pasaporte', value: 'PASSPORT' },
]

export function identificationTypeLabel(type: IdentificationType): string {
  return IDENTIFICATION_TYPE_OPTIONS.find((option) => option.value === type)?.title ?? type
}

// clothingSize y accountType son enums fijos (sin catálogo backend) — opciones hardcodeadas.
export const CLOTHING_SIZE_OPTIONS: ClothingSize[] = ['S', 'M', 'L', 'XL', 'XXL']

export const ACCOUNT_TYPE_OPTIONS: { title: string; value: AccountType }[] = [
  { title: 'Cuenta corriente', value: 'CHECKING' },
  { title: 'Cuenta vista', value: 'SIGHT' },
  { title: 'Cuenta de ahorro', value: 'SAVINGS' },
  { title: 'Cuenta RUT', value: 'RUT' },
]

export function accountTypeLabel(type: AccountType): string {
  return ACCOUNT_TYPE_OPTIONS.find((option) => option.value === type)?.title ?? type
}

// shoeSize: entero 35–46 inclusive (validado igual en backend) — se usa un selector en vez de
// texto libre para no poder ingresar un valor fuera de rango desde la UI.
export const SHOE_SIZE_OPTIONS: number[] = Array.from({ length: 46 - 35 + 1 }, (_, i) => 35 + i)

// Catálogo de solo lectura (AFP, banco, etc.) — code es el identificador semántico estable para
// lógica de negocio en frontend (ej. "Cuenta RUT solo para BancoEstado"); id es la FK real.
export interface StaffCatalogOption {
  id: number
  name: string
  code: string
}

export interface StaffBankOption extends StaffCatalogOption {
  supportsRutAccount: boolean
}

export interface StaffListItem {
  id: number
  identificationType: IdentificationType
  identificationNumber: string
  fullName: string
  actions: string[]
}

export interface Staff {
  id: number
  identificationType: IdentificationType
  identificationNumber: string
  firstName: string
  paternalLastName: string
  maternalLastName: string
  fullName: string
  birthDate: string
  registeredSex: StaffCatalogOption
  maritalStatus: StaffCatalogOption
  nationality: StaffCatalogOption
  phone1: string
  emergencyPhone: string
  emergencyContactName: string
  address: string
  city: string
  hasChildren: boolean
  childrenCount: number | null
  personalEmail: string
  shoeSize: number
  clothingSize: ClothingSize
  educationLevel: StaffCatalogOption
  afp: StaffCatalogOption
  healthSystem: StaffCatalogOption
  bank: StaffCatalogOption
  accountType: AccountType
  accountNumber: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

export interface StaffForm {
  id: number | null
  identificationType: IdentificationType
  identificationNumber: string
  firstName: string
  paternalLastName: string
  maternalLastName: string
  birthDate: string | null
  registeredSexId: number | null
  maritalStatusId: number | null
  nationalityId: number | null
  phone1: string
  emergencyPhone: string
  emergencyContactName: string
  address: string
  city: string
  hasChildren: boolean
  childrenCount: number | null
  personalEmail: string
  shoeSize: number | null
  clothingSize: ClothingSize | null
  educationLevelId: number | null
  afpId: number | null
  healthSystemId: number | null
  bankId: number | null
  accountType: AccountType | null
  accountNumber: string
}

export const createStaffForm = (overrides: Partial<StaffForm> = {}): StaffForm => ({
  id: null,
  identificationType: 'RUT',
  identificationNumber: '',
  firstName: '',
  paternalLastName: '',
  maternalLastName: '',
  birthDate: null,
  registeredSexId: null,
  maritalStatusId: null,
  nationalityId: null,
  phone1: '',
  emergencyPhone: '',
  emergencyContactName: '',
  address: '',
  city: '',
  hasChildren: false,
  childrenCount: null,
  personalEmail: '',
  shoeSize: null,
  clothingSize: null,
  educationLevelId: null,
  afpId: null,
  healthSystemId: null,
  bankId: null,
  accountType: null,
  accountNumber: '',
  ...overrides,
})

export interface StaffFilters {
  search: string
}

export const createStaffFilters = (overrides: Partial<StaffFilters> = {}): StaffFilters => ({
  search: '',
  ...overrides,
})

export interface StaffSort {
  key: string
  order: SortDirection
}

export const STAFF_SORTABLE_KEYS = ['firstName', 'paternalLastName', 'identificationNumber'] as const

export const DEFAULT_STAFF_SORT: StaffSort = { key: 'firstName', order: 'asc' }

export function parseStaffSort(raw: unknown): StaffSort {
  if (typeof raw !== 'string') return { ...DEFAULT_STAFF_SORT }
  const [key, order] = raw.split(',')
  if (!STAFF_SORTABLE_KEYS.includes(key as (typeof STAFF_SORTABLE_KEYS)[number])) {
    return { ...DEFAULT_STAFF_SORT }
  }
  return { key, order: order === 'desc' ? 'desc' : 'asc' }
}

export function formatStaffSort(sort: StaffSort): string {
  return `${sort.key},${sort.order}`
}

export function isDefaultStaffSort(sort: StaffSort): boolean {
  return sort.key === DEFAULT_STAFF_SORT.key && sort.order === DEFAULT_STAFF_SORT.order
}

export interface StaffQueryParams extends StaffFilters {
  page: number
  size: number
  sort: StaffSort
}

const STAFF_PAGE_SIZES = [10, 25, 50, 100] as const

export const DEFAULT_STAFF_QUERY: StaffQueryParams = {
  ...createStaffFilters(),
  page: 1,
  size: 10,
  sort: DEFAULT_STAFF_SORT,
}

function toPage(raw: unknown): number {
  const n = Number(raw)
  return Number.isInteger(n) && n >= 1 ? n : DEFAULT_STAFF_QUERY.page
}

function toPageSize(raw: unknown): number {
  const n = Number(raw)
  return (STAFF_PAGE_SIZES as readonly number[]).includes(n) ? n : DEFAULT_STAFF_QUERY.size
}

export function parseStaffQuery(query: Record<string, unknown>): StaffQueryParams {
  return {
    search: typeof query.search === 'string' ? query.search : '',
    page: toPage(query.page),
    size: toPageSize(query.size),
    sort: parseStaffSort(query.sort),
  }
}

export function staffQueryToRoute(params: StaffQueryParams): Record<string, string> {
  const query: Record<string, string> = {}
  const search = params.search.trim()
  if (search) query.search = search
  if (params.page !== DEFAULT_STAFF_QUERY.page) query.page = String(params.page)
  if (params.size !== DEFAULT_STAFF_QUERY.size) query.size = String(params.size)
  if (!isDefaultStaffSort(params.sort)) query.sort = formatStaffSort(params.sort)
  return query
}
