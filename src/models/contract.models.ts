export interface ContractCatalogOption {
  id: number
  name: string
  code: string
}

export interface ContractStaffOption {
  id: number
  title: string
}

export const CONTRACT_TYPE_FIXED_TERM_CODE = 'F'

export const WORK_DAYS_OPTIONS: { title: string; value: number }[] = [
  { title: '5 días', value: 5 },
  { title: '6 días', value: 6 },
]

export const WEEKLY_WORK_HOURS_OPTIONS: { title: string; value: number }[] = [
  { title: '40 horas', value: 40 },
  { title: '42 horas', value: 42 },
  { title: '45 horas', value: 45 },
]

export interface ContractForm {
  projectId: number | null
  staffId: number | null
  companyId: number | null
  contractTypeId: number | null
  jobTitleId: number | null
  siteId: number | null
  startDate: string | null
  endDate: string | null
  baseSalary: string
  agreedSalary: string
  weeklyWorkHours: number | null
  workDays: number | null
  contractDetail: string
  mealTypeId: number | null
  transportTypeId: number | null
}

export const createContractForm = (overrides: Partial<ContractForm> = {}): ContractForm => ({
  projectId: null,
  staffId: null,
  companyId: null,
  contractTypeId: null,
  jobTitleId: null,
  siteId: null,
  startDate: null,
  endDate: null,
  baseSalary: '',
  agreedSalary: '',
  weeklyWorkHours: null,
  workDays: null,
  contractDetail: '',
  mealTypeId: null,
  transportTypeId: null,
  ...overrides,
})

export interface ContractStatusOption {
  id: number
  code: string
  name: string
}

const CONTRACT_STATUS_COLORS: Record<string, string> = {
  PENDING_APPROVAL: 'warning',
  PENDING_VALIDATION: 'warning',
  ACTIVE: 'info',
  REJECTED: 'primary',
  SYNC_ERROR: 'secondary',
  LATE_REGISTRATION: 'grey',
}

export function contractStatusColor(code: string): string {
  return CONTRACT_STATUS_COLORS[code] ?? 'grey'
}

export interface ContractListItem {
  id: number
  requestId: number
  costCenterCode: string
  contractTypeName: string
  jobTitleName: string
  identificationNumber: string
  fullName: string
  startDate: string
  endDate: string
  agreedSalary: string
  statusName: string
  statusColor: string
  actions: string[]
}

export type ContractAttachmentType =
  | 'CEDULA_FRONTAL'
  | 'CEDULA_REVERSO'
  | 'CERT_AFP'
  | 'CERT_SALUD'
  | 'CERT_ANTECEDENTES'

export const CONTRACT_ATTACHMENT_TYPES: ContractAttachmentType[] = [
  'CEDULA_FRONTAL',
  'CEDULA_REVERSO',
  'CERT_AFP',
  'CERT_SALUD',
  'CERT_ANTECEDENTES',
]

export const CONTRACT_ATTACHMENT_TYPE_LABELS: Record<ContractAttachmentType, string> = {
  CEDULA_FRONTAL: 'Cédula de identidad (frente)',
  CEDULA_REVERSO: 'Cédula de identidad (reverso)',
  CERT_AFP: 'Certificado AFP',
  CERT_SALUD: 'Certificado de salud',
  CERT_ANTECEDENTES: 'Certificado de antecedentes',
}

export interface ContractAttachment {
  id: number
  attachmentType: ContractAttachmentType
  name: string
  fileType: string
  fileSizeLabel: string
  mediaFileId: string
  updatedAt: string
}

export interface Contract {
  id: number
  requestId: number
  fullName: string
  identificationNumber: string
  companyName: string
  contractTypeName: string
  jobTitleName: string
  siteName: string
  costCenterCode: string
  startDate: string
  endDate: string
  baseSalary: string
  agreedSalary: string
  weeklyWorkHours: number
  workDays: number
  contractDetail: string
  mealTypeName: string
  transportTypeName: string
  rexContractNumber: string | null
  attachments: ContractAttachment[]
  missingAttachmentTypes: ContractAttachmentType[]
  status: ContractStatusOption
  statusColor: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

export interface ContractFilters {
  search: string
  statusId: number | null
  projectId: number | null
  contractTypeId: number | null
  expiringSoon: boolean
}

export const createContractFilters = (
  overrides: Partial<ContractFilters> = {},
): ContractFilters => ({
  search: '',
  statusId: null,
  projectId: null,
  contractTypeId: null,
  expiringSoon: false,
  ...overrides,
})

export interface ContractQueryParams extends ContractFilters {
  page: number
  size: number
  sort?: { key: string; order: 'asc' | 'desc' }
}

const CONTRACT_PAGE_SIZES = [10, 25, 50, 100] as const

export const DEFAULT_CONTRACT_QUERY: ContractQueryParams = {
  ...createContractFilters(),
  page: 1,
  size: 10,
}

function toPositiveInt(raw: unknown): number | null {
  const n = Number(raw)
  return typeof raw === 'string' && Number.isInteger(n) && n > 0 ? n : null
}

function toSort(raw: unknown): { key: string; order: 'asc' | 'desc' } | undefined {
  if (typeof raw !== 'string') return undefined
  const [key, order] = raw.split(',')
  if (!key) return undefined
  return { key, order: order === 'desc' ? 'desc' : 'asc' }
}

export function parseContractQuery(query: Record<string, unknown>): ContractQueryParams {
  const size = Number(query.size)
  return {
    search: typeof query.search === 'string' ? query.search : '',
    statusId: toPositiveInt(query.statusId),
    projectId: toPositiveInt(query.projectId),
    contractTypeId: toPositiveInt(query.contractTypeId),
    expiringSoon: query.expiringSoon === 'true',
    page: toPositiveInt(query.page) ?? DEFAULT_CONTRACT_QUERY.page,
    size: (CONTRACT_PAGE_SIZES as readonly number[]).includes(size)
      ? size
      : DEFAULT_CONTRACT_QUERY.size,
    sort: toSort(query.sort),
  }
}

export function contractQueryToRoute(params: ContractQueryParams): Record<string, string> {
  const query: Record<string, string> = {}
  const search = params.search.trim()
  if (search) query.search = search
  if (params.statusId !== null) query.statusId = String(params.statusId)
  if (params.projectId !== null) query.projectId = String(params.projectId)
  if (params.contractTypeId !== null) query.contractTypeId = String(params.contractTypeId)
  if (params.expiringSoon) query.expiringSoon = 'true'
  if (params.page !== DEFAULT_CONTRACT_QUERY.page) query.page = String(params.page)
  if (params.size !== DEFAULT_CONTRACT_QUERY.size) query.size = String(params.size)
  if (params.sort) query.sort = `${params.sort.key},${params.sort.order}`
  return query
}
