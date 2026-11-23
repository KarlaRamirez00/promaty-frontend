import type { AttachmentRequirementRaw } from '@/types/attachment'

export interface AnnexNamedRaw {
  id: number
  name: string
}

export interface AnnexTypeRaw extends AnnexNamedRaw {
  code: string
}

export interface AnnexStaffRaw {
  id: number
  fullName: string
  identificationNumber: string
}

export interface AnnexStatusRaw {
  id: number
  code: string
  name: string
}

export interface AnnexContractSummaryRaw {
  contractId: number
  contractType: AnnexTypeRaw
  startDate: string
  endDate: string | null
  baseSalary: number
  jobTitle: AnnexNamedRaw
  weeklyWorkHours: number
  workDays: number
  site: AnnexNamedRaw
  project: AnnexNamedRaw
}

export interface AnnexStaffOptionRaw {
  id: number
  name: string
  identificationNumber: string
  activeContract: AnnexContractSummaryRaw
}

export interface AnnexListRaw {
  id: number
  requestId: number
  staff: AnnexStaffRaw
  costCenterCode: string
  annexType: AnnexTypeRaw
  newJobTitleName: string | null
  newBaseSalary: number | null
  newEndDate: string | null
  effectiveDate: string
  statusCode: string
  statusName: string
  actions: string[]
}

export interface AnnexAttachmentRaw {
  id: number
  name: string
  fileSize: number
  mediaFileId: string
  updatedAt: string
}

export interface AnnexRaw {
  id: number
  requestId: number
  staff: AnnexStaffRaw
  contractId: number
  costCenterCode: string
  project: AnnexNamedRaw
  currentContract: AnnexContractSummaryRaw | null
  annexType: AnnexTypeRaw
  effectiveDate: string
  description: string
  newEndDate: string | null
  newBaseSalary: number | null
  newJobTitle: AnnexNamedRaw | null
  newWeeklyWorkHours: number | null
  newWorkDays: number | null
  newSite: AnnexNamedRaw | null
  previousContractType: AnnexNamedRaw | null
  previousEndDate: string | null
  previousBaseSalary: number | null
  previousJobTitle: AnnexNamedRaw | null
  previousWeeklyWorkHours: number | null
  previousWorkDays: number | null
  previousSite: AnnexNamedRaw | null
  status: AnnexStatusRaw
  rexAnnexNumber: string | null
  syncErrorMessage: string | null
  attachments: AnnexAttachmentRaw[]
  attachmentRequirements: AttachmentRequirementRaw[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

export interface AnnexUpdatePayload {
  annexTypeId: number
  effectiveDate: string
  description: string
  newEndDate?: string
  newBaseSalary?: number
  newJobTitleId?: number
  newWeeklyWorkHours?: number
  newWorkDays?: number
  newSiteId?: number
}

export interface AnnexRequestPayload {
  entityType: 'ANNEX'
  action: 'CREATE'
  annexData: AnnexUpdatePayload & { staffId: number }
}
