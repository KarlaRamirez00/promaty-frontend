import type {
  TerminationAnnulPayload,
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
  TerminationEditData,
  TerminationForm,
  TerminationListItem,
  TerminationOption,
  TerminationStaffOption,
} from '@/models'
import { createTerminationForm, terminationStatusColor } from '@/models'
import { formatDate, formatDateTime, NO_DATA } from '@/utils'
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
    currentCause: raw.legalTerminationCause,
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
    status: raw.status,
    statusColor: terminationStatusColor(raw.status.code),
    createdAt: formatDateTime(raw.createdAt),
    updatedAt: formatDateTime(raw.updatedAt),
    createdBy: raw.createdBy,
    updatedBy: raw.updatedBy,
    actions: raw.actions,
  }
}
