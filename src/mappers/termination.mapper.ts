import type {
  TerminationAnnulPayload,
  TerminationListRaw,
  TerminationRaw,
} from '@/types/termination'
import type { Termination, TerminationAnnulForm, TerminationListItem } from '@/models'
import { terminationStatusColor } from '@/models'
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
    contractEndDate: formatDate(raw.contractEndDate),
    terminationDate: formatDate(raw.terminationDate),
    legalTerminationCauseName: raw.legalTerminationCause.name,
    definitive: toYesNo(raw.definitiveTermination),
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
