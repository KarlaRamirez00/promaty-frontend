import type { AttachmentRequirement } from './attachment.models'

export const ANNEX_TYPE_CODE = {
  EXTENSION: 'CONTRACT_EXTENSION',
  CONVERSION: 'CONVERSION_TO_INDEFINITE',
  SALARY: 'SALARY_INCREASE',
  JOB_TITLE: 'JOB_TITLE_CHANGE',
  SCHEDULE_OR_SITE: 'SCHEDULE_OR_SITE_CHANGE',
} as const

export const CONTRACT_TYPE_INDEFINITE_CODE = 'I'

export type AnnexChangeField =
  | 'newEndDate'
  | 'newBaseSalary'
  | 'newJobTitleId'
  | 'newWeeklyWorkHours'
  | 'newWorkDays'
  | 'newSiteId'

export const ANNEX_FIELDS_BY_TYPE: Record<string, AnnexChangeField[]> = {
  [ANNEX_TYPE_CODE.EXTENSION]: ['newEndDate'],
  [ANNEX_TYPE_CODE.CONVERSION]: [],
  [ANNEX_TYPE_CODE.SALARY]: ['newBaseSalary'],
  [ANNEX_TYPE_CODE.JOB_TITLE]: ['newJobTitleId'],
  [ANNEX_TYPE_CODE.SCHEDULE_OR_SITE]: ['newWeeklyWorkHours', 'newWorkDays', 'newSiteId'],
}

const ANNEX_STATUS_COLORS: Record<string, string> = {
  PENDING_APPROVAL: 'warning',
  PENDING_VALIDATION: 'info',
  APPROVED: 'success',
  REJECTED: 'primary',
  SYNC_ERROR: 'secondary',
}

export function annexStatusColor(code: string): string {
  return ANNEX_STATUS_COLORS[code] ?? 'grey'
}

export interface AnnexStatusOption {
  id: number
  code: string
  name: string
}

export interface AnnexTypeOption {
  id: number
  name: string
  code: string
}

export interface AnnexNamedOption {
  id: number
  name: string
}

// Resumen del contrato vigente del colaborador, tal como lo muestra la tarjeta informativa.
export interface AnnexContractSummary {
  contractTypeCode: string
  contractTypeName: string
  startDate: string
  endDate: string
  endDateIso: string | null
  baseSalary: string
  baseSalaryValue: number
  jobTitle: AnnexNamedOption
  weeklyWorkHours: number
  workDays: number
  site: AnnexNamedOption
  projectName: string
}

export interface AnnexStaffOption {
  id: number
  title: string
  name: string
  identification: string
  contract: AnnexContractSummary
}

export interface AnnexForm {
  id: number | null
  staffId: number | null
  staffLabel: string
  annexTypeId: number | null
  effectiveDate: string | null
  description: string
  newEndDate: string | null
  newBaseSalary: string
  newJobTitleId: number | null
  newWeeklyWorkHours: number | null
  newWorkDays: number | null
  newSiteId: number | null
}

export const createAnnexForm = (overrides: Partial<AnnexForm> = {}): AnnexForm => ({
  id: null,
  staffId: null,
  staffLabel: '',
  annexTypeId: null,
  effectiveDate: null,
  description: '',
  newEndDate: null,
  newBaseSalary: '',
  newJobTitleId: null,
  newWeeklyWorkHours: null,
  newWorkDays: null,
  newSiteId: null,
  ...overrides,
})

export interface AnnexAttachment {
  id: number
  name: string
  fileType: string
  fileSizeLabel: string
  mediaFileId: string
  updatedAt: string
}

export interface AnnexEditData {
  form: AnnexForm
  attachments: AnnexAttachment[]
  staffName: string
  staffIdentification: string
  contract: AnnexContractSummary | null
  currentType: AnnexTypeOption
}

export interface AnnexListItem {
  id: number
  requestId: number
  costCenterCode: string
  fullName: string
  identificationNumber: string
  annexTypeName: string
  change: string
  effectiveDate: string
  statusName: string
  statusColor: string
  actions: string[]
}

export interface AnnexChange {
  key: string
  label: string
  before: string
  after: string
}

export interface Annex {
  id: number
  requestId: number
  fullName: string
  identificationNumber: string
  projectName: string
  costCenterCode: string
  annexTypeName: string
  effectiveDate: string
  description: string
  changes: AnnexChange[]
  rexAnnexNumber: string | null
  attachments: AnnexAttachment[]
  attachmentRequirements: AttachmentRequirement[]
  status: AnnexStatusOption
  statusColor: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

export interface AnnexFilters {
  search: string
  statusId: number | null
  projectId: number | null
  annexTypeId: number | null
}

export const createAnnexFilters = (overrides: Partial<AnnexFilters> = {}): AnnexFilters => ({
  search: '',
  statusId: null,
  projectId: null,
  annexTypeId: null,
  ...overrides,
})

export interface AnnexQueryParams extends AnnexFilters {
  page: number
  size: number
  sort?: { key: string; order: 'asc' | 'desc' }
}

const ANNEX_PAGE_SIZES = [10, 25, 50, 100] as const

export const DEFAULT_ANNEX_QUERY: AnnexQueryParams = {
  ...createAnnexFilters(),
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

export function parseAnnexQuery(query: Record<string, unknown>): AnnexQueryParams {
  const size = Number(query.size)
  return {
    search: typeof query.search === 'string' ? query.search : '',
    statusId: toPositiveInt(query.statusId),
    projectId: toPositiveInt(query.projectId),
    annexTypeId: toPositiveInt(query.annexTypeId),
    page: toPositiveInt(query.page) ?? DEFAULT_ANNEX_QUERY.page,
    size: (ANNEX_PAGE_SIZES as readonly number[]).includes(size) ? size : DEFAULT_ANNEX_QUERY.size,
    sort: toSort(query.sort),
  }
}

export function annexQueryToRoute(params: AnnexQueryParams): Record<string, string> {
  const query: Record<string, string> = {}
  const search = params.search.trim()
  if (search) query.search = search
  if (params.statusId !== null) query.statusId = String(params.statusId)
  if (params.projectId !== null) query.projectId = String(params.projectId)
  if (params.annexTypeId !== null) query.annexTypeId = String(params.annexTypeId)
  if (params.page !== DEFAULT_ANNEX_QUERY.page) query.page = String(params.page)
  if (params.size !== DEFAULT_ANNEX_QUERY.size) query.size = String(params.size)
  if (params.sort) query.sort = `${params.sort.key},${params.sort.order}`
  return query
}
