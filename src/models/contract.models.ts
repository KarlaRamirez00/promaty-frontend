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
  ACTIVE: 'success',
  LATE_REGISTRATION: 'warning',
}

export function contractStatusColor(code: string): string {
  return CONTRACT_STATUS_COLORS[code] ?? 'grey'
}

export interface ContractListItem {
  id: number
  costCenterCode: string
  contractTypeName: string
  identificationNumber: string
  fullName: string
  startDate: string
  endDate: string
  statusName: string
  actions: string[]
}

export interface Contract {
  id: number
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
  contractNumber: string
  status: ContractStatusOption
  statusColor: string
  createdAt: string
  updatedAt: string
  actions: string[]
}

export interface ContractFilters {
  search: string
  statusId: number | null
  projectId: number | null
}

export const createContractFilters = (
  overrides: Partial<ContractFilters> = {},
): ContractFilters => ({
  search: '',
  statusId: null,
  projectId: null,
  ...overrides,
})

export interface ContractQueryParams extends ContractFilters {
  page: number
  size: number
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

export function parseContractQuery(query: Record<string, unknown>): ContractQueryParams {
  const size = Number(query.size)
  return {
    search: typeof query.search === 'string' ? query.search : '',
    statusId: toPositiveInt(query.statusId),
    projectId: toPositiveInt(query.projectId),
    page: toPositiveInt(query.page) ?? DEFAULT_CONTRACT_QUERY.page,
    size: (CONTRACT_PAGE_SIZES as readonly number[]).includes(size)
      ? size
      : DEFAULT_CONTRACT_QUERY.size,
  }
}

export function contractQueryToRoute(params: ContractQueryParams): Record<string, string> {
  const query: Record<string, string> = {}
  const search = params.search.trim()
  if (search) query.search = search
  if (params.statusId !== null) query.statusId = String(params.statusId)
  if (params.projectId !== null) query.projectId = String(params.projectId)
  if (params.page !== DEFAULT_CONTRACT_QUERY.page) query.page = String(params.page)
  if (params.size !== DEFAULT_CONTRACT_QUERY.size) query.size = String(params.size)
  return query
}
