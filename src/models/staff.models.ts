import type { FileAttachment } from './attachment.models'
import type { AccountType, ClothingSize, IdentificationType } from '@/types/staff'

export const IDENTIFICATION_TYPE_OPTIONS: { title: string; value: IdentificationType }[] = [
  { title: 'RUT', value: 'RUT' },
  { title: 'Pasaporte', value: 'PASSPORT' },
]

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

const STAFF_STATUS_COLORS: Record<string, string> = {
  PENDING_CONTRACT: 'warning',
  ACTIVE: 'success',
  UNLINKED: 'grey',
  BLOCKED: 'error',
}

export function staffStatusColor(code: string): string {
  return STAFF_STATUS_COLORS[code] ?? 'grey'
}

export interface StaffListItem {
  id: number
  identificationType: IdentificationType
  identificationNumber: string
  fullName: string
  costCenterCode: string
  hireDate: string
  statusCode: string
  statusName: string
  statusColor: string
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
  region: StaffCatalogOption
  provincia: StaffCatalogOption
  comuna: StaffCatalogOption
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
  hireDate: string | null
  status: StaffCatalogOption
  blockReason: string | null
  attachments: FileAttachment[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

// Códigos de platformStatuses?subModule=staff; la lógica compara contra code, nunca contra id.
export const STAFF_STATUS_CODE = {
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED',
} as const

export interface StaffBlockForm {
  reason: string
}

export const createStaffBlockForm = (): StaffBlockForm => ({ reason: '' })

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
  regionId: number | null
  provinciaId: number | null
  comunaId: number | null
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
  regionId: null,
  provinciaId: null,
  comunaId: null,
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
  statusCode: string | null
  projectId: number | null
}

export const createStaffFilters = (overrides: Partial<StaffFilters> = {}): StaffFilters => ({
  search: '',
  statusCode: null,
  projectId: null,
  ...overrides,
})

export interface StaffQueryParams extends StaffFilters {
  page: number
  size: number
  sort?: { key: string; order: 'asc' | 'desc' }
}

const STAFF_PAGE_SIZES = [10, 25, 50, 100] as const

export const DEFAULT_STAFF_QUERY: StaffQueryParams = {
  ...createStaffFilters(),
  page: 1,
  size: 10,
}

const FILTER_CODE_PATTERN = /^[\w-]{1,30}$/

function toFilterCode(raw: unknown): string | null {
  return typeof raw === 'string' && FILTER_CODE_PATTERN.test(raw) ? raw : null
}

function toPositiveInt(raw: unknown): number | null {
  const n = Number(raw)
  return typeof raw === 'string' && Number.isInteger(n) && n > 0 ? n : null
}

function toPage(raw: unknown): number {
  const n = Number(raw)
  return Number.isInteger(n) && n >= 1 ? n : DEFAULT_STAFF_QUERY.page
}

function toPageSize(raw: unknown): number {
  const n = Number(raw)
  return (STAFF_PAGE_SIZES as readonly number[]).includes(n) ? n : DEFAULT_STAFF_QUERY.size
}

function toSort(raw: unknown): { key: string; order: 'asc' | 'desc' } | undefined {
  if (typeof raw !== 'string') return undefined
  const [key, order] = raw.split(',')
  if (!key) return undefined
  return { key, order: order === 'desc' ? 'desc' : 'asc' }
}

export function parseStaffQuery(query: Record<string, unknown>): StaffQueryParams {
  return {
    search: typeof query.search === 'string' ? query.search : '',
    statusCode: toFilterCode(query.statusCode),
    projectId: toPositiveInt(query.projectId),
    page: toPage(query.page),
    size: toPageSize(query.size),
    sort: toSort(query.sort),
  }
}

export function staffQueryToRoute(params: StaffQueryParams): Record<string, string> {
  const query: Record<string, string> = {}
  const search = params.search.trim()
  if (search) query.search = search
  if (params.statusCode) query.statusCode = params.statusCode
  if (params.projectId !== null) query.projectId = String(params.projectId)
  if (params.page !== DEFAULT_STAFF_QUERY.page) query.page = String(params.page)
  if (params.size !== DEFAULT_STAFF_QUERY.size) query.size = String(params.size)
  if (params.sort) query.sort = `${params.sort.key},${params.sort.order}`
  return query
}
