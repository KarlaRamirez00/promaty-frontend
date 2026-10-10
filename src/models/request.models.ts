export interface RequestStatusOption {
  id: number
  code: string
  name: string
}

export interface RequestCounters {
  pendingApproval: number
  pendingValidation: number
}

export interface RequestRelationOption {
  id: number
  name: string
}

export const REQUEST_STATUS_COLORS: Record<string, string> = {
  PENDING_APPROVAL: 'warning',
  PENDING_VALIDATION: 'info',
  APPROVED: 'success',
  REJECTED: 'error',
}

export function requestStatusColor(code: string): string {
  return REQUEST_STATUS_COLORS[code] ?? 'grey'
}

export interface RequestListItem {
  id: number
  typeName: string
  projectName: string
  costCenterCode: string
  requesterName: string
  status: RequestStatusOption
  statusColor: string
  createdAt: string
  actions: string[]
}

export interface RequestApproval {
  id: number
  levelLabel: string
  approved: boolean
  rejectionReasonName: string | null
  comment: string | null
  approverName: string
  createdAt: string
}

export interface Request {
  id: number
  typeName: string
  projectId: number
  projectName: string
  costCenterCode: string
  requesterName: string
  status: RequestStatusOption
  statusColor: string
  createdAt: string
  updatedAt: string
  approvals: RequestApproval[]
  actions: string[]
}

export interface RequestDecisionForm {
  rejectionReasonId: number | null
  comment: string
}

export const createRequestDecisionForm = (): RequestDecisionForm => ({
  rejectionReasonId: null,
  comment: '',
})

export interface RequestFilters {
  search: string
  statusId: number | null
  projectId: number | null
  requesterUserId: number | null
  createdFrom: string | null
  createdTo: string | null
}

export const createRequestFilters = (overrides: Partial<RequestFilters> = {}): RequestFilters => ({
  search: '',
  statusId: null,
  projectId: null,
  requesterUserId: null,
  createdFrom: null,
  createdTo: null,
  ...overrides,
})

export interface RequestQueryParams extends RequestFilters {
  page: number
  size: number
}

const REQUEST_PAGE_SIZES = [10, 25, 50, 100] as const

export const DEFAULT_REQUEST_QUERY: RequestQueryParams = {
  ...createRequestFilters(),
  page: 1,
  size: 10,
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function toPositiveInt(raw: unknown): number | null {
  const n = Number(raw)
  return typeof raw === 'string' && Number.isInteger(n) && n > 0 ? n : null
}

function toPage(raw: unknown): number {
  return toPositiveInt(raw) ?? DEFAULT_REQUEST_QUERY.page
}

function toPageSize(raw: unknown): number {
  const n = Number(raw)
  return (REQUEST_PAGE_SIZES as readonly number[]).includes(n) ? n : DEFAULT_REQUEST_QUERY.size
}

function toIsoDate(raw: unknown): string | null {
  return typeof raw === 'string' && ISO_DATE_PATTERN.test(raw) ? raw : null
}

export function parseRequestQuery(query: Record<string, unknown>): RequestQueryParams {
  return {
    search: typeof query.search === 'string' ? query.search : '',
    statusId: toPositiveInt(query.statusId),
    projectId: toPositiveInt(query.projectId),
    requesterUserId: toPositiveInt(query.requesterUserId),
    createdFrom: toIsoDate(query.createdFrom),
    createdTo: toIsoDate(query.createdTo),
    page: toPage(query.page),
    size: toPageSize(query.size),
  }
}

export function requestQueryToRoute(params: RequestQueryParams): Record<string, string> {
  const query: Record<string, string> = {}
  const search = params.search.trim()
  if (search) query.search = search
  if (params.statusId !== null) query.statusId = String(params.statusId)
  if (params.projectId !== null) query.projectId = String(params.projectId)
  if (params.requesterUserId !== null) query.requesterUserId = String(params.requesterUserId)
  if (params.createdFrom) query.createdFrom = params.createdFrom
  if (params.createdTo) query.createdTo = params.createdTo
  if (params.page !== DEFAULT_REQUEST_QUERY.page) query.page = String(params.page)
  if (params.size !== DEFAULT_REQUEST_QUERY.size) query.size = String(params.size)
  return query
}
