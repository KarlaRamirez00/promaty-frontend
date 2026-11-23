import type { AttachmentRequirementRaw } from '@/types/attachment'

export interface TerminationStaffRaw {
  id: number
  fullName: string
  identificationNumber: string
}

export interface TerminationNamedRaw {
  id: number
  name: string
}

export interface TerminationStatusRaw {
  id: number
  code: string
  name: string
}

export interface TerminationStaffOptionRaw {
  id: number
  name: string
  identificationNumber: string
  minTerminationDate: string
  maxTerminationDate: string | null
}

export interface TerminationCatalogOptionRaw {
  id: number
  name: string
  requiresAttachment?: boolean
  attachmentLabel?: string
}

export interface TerminationAttachmentRaw {
  id: number
  name: string
  fileSize: number
  mediaFileId: string
  updatedAt: string
}

export interface TerminationUpdatePayload {
  terminationDate: string
  legalTerminationCauseId: number
  definitiveTermination: boolean
  nonRehireReasonId: number | null
  notes: string | null
}

export interface TerminationRequestPayload {
  entityType: 'TERMINATION'
  action: 'CREATE'
  terminationData: TerminationUpdatePayload & { staffId: number }
}

export interface TerminationListRaw {
  id: number
  requestId: number
  staff: TerminationStaffRaw
  costCenterCode: string
  legalTerminationCauseName: string
  terminationDate: string
  definitiveTermination: boolean
  statusCode: string
  statusName: string
  updatedAt: string
  actions: string[]
}

export interface TerminationRaw {
  id: number
  requestId: number
  staff: TerminationStaffRaw
  costCenterCode: string
  jobTitleName: string
  contractStartDate: string
  contractEndDate: string | null
  terminationDate: string
  legalTerminationCause: TerminationNamedRaw
  definitiveTermination: boolean
  nonRehireReason: TerminationNamedRaw | null
  notes: string | null
  status: TerminationStatusRaw
  rexTerminationNumber: string | null
  annulmentReason: string | null
  syncErrorMessage: string | null
  attachments: TerminationAttachmentRaw[]
  attachmentRequirements: AttachmentRequirementRaw[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}
