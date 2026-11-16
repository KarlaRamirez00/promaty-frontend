import type {
  TerminationAnnulPayload,
  TerminationAttachmentRaw,
  TerminationCatalogOptionRaw,
  TerminationListRaw,
  TerminationRaw,
  TerminationRequestPayload,
  TerminationStaffOptionRaw,
  TerminationUpdatePayload,
} from '@/types/termination'
import type {
  Termination,
  TerminationAnnulForm,
  TerminationAttachment,
  TerminationCauseOption,
  TerminationEditData,
  TerminationForm,
  TerminationListItem,
  TerminationOption,
  TerminationStaffOption,
} from '@/models'
import { createTerminationForm, terminationStatusColor } from '@/models'
import { formatDate, formatDateTime, formatFileSize, NO_DATA } from '@/utils'
import { toDisplayIdentification } from './contract.mapper'

function toYesNo(value: boolean): string {
  return value ? 'Sí' : 'No'
}

export function mapperTerminationList(items: TerminationListRaw[]): TerminationListItem[] {
  return items.map((item) => ({
    id: item.id,
    requestId: item.requestId,
    costCenterCode: item.costCenterCode,
    fullName: item.staff.fullName,
    identificationNumber: toDisplayIdentification(item.staff.identificationNumber),
    legalTerminationCauseName: item.legalTerminationCauseName,
    terminationDate: formatDate(item.terminationDate),
    definitive: item.definitiveTermination,
    statusName: item.statusName,
    statusColor: terminationStatusColor(item.statusCode),
    actions: item.actions,
  }))
}

export function mapperTerminationStaffOptions(
  items: TerminationStaffOptionRaw[],
): TerminationStaffOption[] {
  return items.map((item) => ({
    id: item.id,
    title: `${item.name} — ${toDisplayIdentification(item.identificationNumber)}`,
    minDate: item.minTerminationDate,
    maxDate: item.maxTerminationDate,
  }))
}

export function mapperTerminationCatalogOptions(
  items: TerminationCatalogOptionRaw[],
): TerminationOption[] {
  return items.map((item) => ({ id: item.id, name: item.name }))
}

export function mapperLegalTerminationCauseOptions(
  items: TerminationCatalogOptionRaw[],
): TerminationCauseOption[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    requiresAttachment: item.requiresAttachment ?? false,
    attachmentLabel: item.attachmentLabel ?? '',
  }))
}

function mapTerminationAttachment(raw: TerminationAttachmentRaw): TerminationAttachment {
  return {
    id: raw.id,
    name: raw.name,
    fileType: raw.name.split('.').pop()?.toLowerCase() ?? '',
    fileSizeLabel: formatFileSize(raw.fileSize),
    mediaFileId: raw.mediaFileId,
    updatedAt: formatDateTime(raw.updatedAt),
  }
}

function toUpdatePayload(form: TerminationForm): TerminationUpdatePayload {
  const notes = form.notes.trim()
  return {
    terminationDate: form.terminationDate as string,
    legalTerminationCauseId: form.legalTerminationCauseId as number,
    definitiveTermination: form.definitiveTermination,
    nonRehireReasonId: form.definitiveTermination ? form.nonRehireReasonId : null,
    notes: notes || null,
  }
}

export function mapperTerminationFormToCreatePayload(form: TerminationForm): TerminationRequestPayload {
  return {
    entityType: 'TERMINATION',
    action: 'CREATE',
    terminationData: { staffId: form.staffId as number, ...toUpdatePayload(form) },
  }
}

export function mapperTerminationFormToUpdatePayload(form: TerminationForm): TerminationUpdatePayload {
  return toUpdatePayload(form)
}

export function mapperTerminationEditData(raw: TerminationRaw): TerminationEditData {
  const requirement = raw.attachmentRequirements?.find((item) => item.required)
  return {
    form: createTerminationForm({
      id: raw.id,
      staffId: raw.staff.id,
      staffLabel: `${raw.staff.fullName} — ${toDisplayIdentification(raw.staff.identificationNumber)}`,
      terminationDate: raw.terminationDate,
      legalTerminationCauseId: raw.legalTerminationCause.id,
      definitiveTermination: raw.definitiveTermination,
      nonRehireReasonId: raw.nonRehireReason?.id ?? null,
      notes: raw.notes ?? '',
    }),
    currentCause: {
      ...raw.legalTerminationCause,
      requiresAttachment: requirement !== undefined,
      attachmentLabel: requirement?.label ?? '',
    },
    attachments: (raw.attachments ?? []).map(mapTerminationAttachment),
    currentNonRehireReason: raw.nonRehireReason,
  }
}

export function mapperTerminationAnnulPayload(form: TerminationAnnulForm): TerminationAnnulPayload {
  return { reason: form.reason.trim() }
}

export function mapperTerminationDetail(raw: TerminationRaw): Termination {
  return {
    id: raw.id,
    requestId: raw.requestId,
    fullName: raw.staff.fullName,
    identificationNumber: toDisplayIdentification(raw.staff.identificationNumber),
    costCenterCode: raw.costCenterCode,
    jobTitleName: raw.jobTitleName,
    contractStartDate: formatDate(raw.contractStartDate),
    terminationDate: formatDate(raw.terminationDate),
    legalTerminationCauseName: raw.legalTerminationCause.name,
    definitive: toYesNo(raw.definitiveTermination),
    isDefinitive: raw.definitiveTermination,
    nonRehireReasonName: raw.nonRehireReason?.name ?? NO_DATA,
    notes: raw.notes || NO_DATA,
    rexTerminationNumber: raw.rexTerminationNumber,
    annulmentReason: raw.annulmentReason,
    attachments: (raw.attachments ?? []).map(mapTerminationAttachment),
    attachmentRequirements: raw.attachmentRequirements ?? [],
    status: raw.status,
    statusColor: terminationStatusColor(raw.status.code),
    createdAt: formatDateTime(raw.createdAt),
    updatedAt: formatDateTime(raw.updatedAt),
    createdBy: raw.createdBy,
    updatedBy: raw.updatedBy,
    actions: raw.actions,
  }
}
