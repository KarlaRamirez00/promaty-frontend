import { formatDateTime } from '@/utils'
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

export function mapperRequestList(items: RequestRaw[]): RequestListItem[] {
  return items.map((item) => ({
    id: item.id,
    typeName: item.typeName,
    projectName: item.projectName,
    costCenterCode: item.costCenterCode,
    requesterName: item.requesterName,
    status: item.status,
    statusColor: requestStatusColor(item.status.code),
    createdAt: formatDateTime(item.createdAt),
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
