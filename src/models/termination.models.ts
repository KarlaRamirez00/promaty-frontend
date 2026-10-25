const TERMINATION_STATUS_COLORS: Record<string, string> = {
  PENDING_APPROVAL: 'warning',
  PENDING_VALIDATION: 'warning',
  APPROVED: 'success',
  REJECTED: 'primary',
  SYNC_ERROR: 'secondary',
  ANNULLED: 'grey',
}

export function terminationStatusColor(code: string): string {
  return TERMINATION_STATUS_COLORS[code] ?? 'grey'
}

export interface TerminationStatusOption {
  id: number
  code: string
  name: string
}

export interface TerminationListItem {
  id: number
  requestId: number
  costCenterCode: string
  fullName: string
  identificationNumber: string
  legalTerminationCauseName: string
  terminationDate: string
  definitive: boolean
  statusName: string
  statusColor: string
  actions: string[]
}

export interface Termination {
  id: number
  requestId: number
  fullName: string
  identificationNumber: string
  costCenterCode: string
  jobTitleName: string
  contractStartDate: string
  contractEndDate: string
  terminationDate: string
  legalTerminationCauseName: string
  definitive: string
  nonRehireReasonName: string
  notes: string
  rexTerminationNumber: string | null
  annulmentReason: string | null
  status: TerminationStatusOption
  statusColor: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

export interface TerminationAnnulForm {
  reason: string
}

export const createTerminationAnnulForm = (): TerminationAnnulForm => ({ reason: '' })

export interface TerminationFilters {
  search: string
  statusId: number | null
  projectId: number | null
  terminationDateFrom: string | null
  terminationDateTo: string | null
}

export const createTerminationFilters = (
  overrides: Partial<TerminationFilters> = {},
): TerminationFilters => ({
  search: '',
  statusId: null,
  projectId: null,
  terminationDateFrom: null,
  terminationDateTo: null,
  ...overrides,
})

export interface TerminationQueryParams extends TerminationFilters {
  page: number
  size: number
}

const TERMINATION_PAGE_SIZES = [10, 25, 50, 100] as const

export const DEFAULT_TERMINATION_QUERY: TerminationQueryParams = {
  ...createTerminationFilters(),
  page: 1,
  size: 10,
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function toPositiveInt(raw: unknown): number | null {
  const n = Number(raw)
  return typeof raw === 'string' && Number.isInteger(n) && n > 0 ? n : null
}

function toIsoDate(raw: unknown): string | null {
  return typeof raw === 'string' && ISO_DATE_PATTERN.test(raw) ? raw : null
}

export function parseTerminationQuery(query: Record<string, unknown>): TerminationQueryParams {
  const size = Number(query.size)
  return {
    search: typeof query.search === 'string' ? query.search : '',
    statusId: toPositiveInt(query.statusId),
    projectId: toPositiveInt(query.projectId),
    terminationDateFrom: toIsoDate(query.terminationDateFrom),
    terminationDateTo: toIsoDate(query.terminationDateTo),
    page: toPositiveInt(query.page) ?? DEFAULT_TERMINATION_QUERY.page,
    size: (TERMINATION_PAGE_SIZES as readonly number[]).includes(size)
      ? size
      : DEFAULT_TERMINATION_QUERY.size,
  }
}

export function terminationQueryToRoute(params: TerminationQueryParams): Record<string, string> {
  const query: Record<string, string> = {}
  const search = params.search.trim()
  if (search) query.search = search
  if (params.statusId !== null) query.statusId = String(params.statusId)
  if (params.projectId !== null) query.projectId = String(params.projectId)
  if (params.terminationDateFrom) query.terminationDateFrom = params.terminationDateFrom
  if (params.terminationDateTo) query.terminationDateTo = params.terminationDateTo
  if (params.page !== DEFAULT_TERMINATION_QUERY.page) query.page = String(params.page)
  if (params.size !== DEFAULT_TERMINATION_QUERY.size) query.size = String(params.size)
  return query
}
