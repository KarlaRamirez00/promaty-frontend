import { formatDate, formatDateTime, formatRut, NO_DATA } from '@/utils'
import type {
  RequestApprovalRaw,
  RequestDecidePayload,
  RequestDetailRaw,
  RequestRaw,
} from '@/types/request'
import type {
  Request,
  RequestApproval,
  RequestDecisionForm,
  RequestListItem,
} from '@/models'
import { requestStatusColor } from '@/models'

const APPROVAL_LEVEL_LABELS: Record<string, string> = {
  PROJECT_MANAGER: 'Gerente de obra',
  HR: 'RRHH',
}

function toStaffFullName(item: RequestRaw): string {
  const fullName = [item.staffFirstName, item.staffPaternalLastName, item.staffMaternalLastName]
    .filter(Boolean)
    .join(' ')
  return fullName || NO_DATA
}

// El formato con puntos solo aplica a RUT; un pasaporte no tiene estructura fija.
function toStaffIdentification(item: RequestRaw): string {
  const number = item.staffIdentificationNumber
  if (!number) return NO_DATA
  return item.staffIdentificationType === 'RUT' ? formatRut(number) : number
}

export function mapperRequestList(items: RequestRaw[]): RequestListItem[] {
  return items.map((item) => ({
    id: item.id,
    entityType: item.entityType,
    entityId: item.entityId,
    typeName: item.typeName,
    staffFullName: toStaffFullName(item),
    staffIdentificationNumber: toStaffIdentification(item),
    staffPosition: item.staffPosition ?? NO_DATA,
    costCenterCode: item.costCenterCode,
    requesterName: item.requesterName,
    status: item.status,
    statusColor: requestStatusColor(item.status.code),
    createdAt: formatDate(item.createdAt),
    actions: item.actions,
  }))
}

function mapperApproval(raw: RequestApprovalRaw): RequestApproval {
  return {
    id: raw.id,
    levelLabel: APPROVAL_LEVEL_LABELS[raw.level] ?? raw.level,
    approved: raw.decision === 'APPROVED',
    rejectionReasonName: raw.rejectionReasonName,
    comment: raw.comment,
    approverName: raw.approverName,
    createdAt: formatDateTime(raw.createdAt),
  }
}

export function mapperRequestDetail(raw: RequestDetailRaw): Request {
  return {
    id: raw.id,
    typeName: raw.typeName,
    projectId: raw.projectId,
    projectName: raw.projectName,
    costCenterCode: raw.costCenterCode,
    requesterName: raw.requesterName,
    status: raw.status,
    statusColor: requestStatusColor(raw.status.code),
    createdAt: formatDateTime(raw.createdAt),
    updatedAt: formatDateTime(raw.updatedAt),
    approvals: raw.approvals.map(mapperApproval),
    actions: raw.actions,
  }
}

export function mapperRequestApprovePayload(): RequestDecidePayload {
  return { decision: 'APPROVED' }
}

export function mapperRequestRejectPayload(form: RequestDecisionForm): RequestDecidePayload {
  const comment = form.comment.trim()
  return {
    decision: 'REJECTED',
    rejectionReasonId: form.rejectionReasonId as number,
    ...(comment && { comment }),
  }
}
