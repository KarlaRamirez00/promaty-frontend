import { formatDateTime } from '@/utils'
import type { Badge } from '@/types/badge'
import type {
  RequestRejectionReasonFormPayload,
  RequestRejectionReasonListRaw,
  RequestRejectionReasonRaw,
} from '@/types/requestRejectionReason'
import type {
  RequestRejectionReason,
  RequestRejectionReasonForm,
  RequestRejectionReasonListItem,
} from '@/models'

function toStatusBadge(active: boolean): Badge {
  return active ? { label: 'Activo', color: 'info' } : { label: 'Inactivo', color: 'grey' }
}

export function mapperRequestRejectionReasonList(
  items: RequestRejectionReasonListRaw[],
): RequestRejectionReasonListItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    subModule: item.subModule,
    active: item.active,
    status: toStatusBadge(item.active),
    actions: item.actions,
  }))
}

export function mapperRequestRejectionReasonDetail(raw: RequestRejectionReasonRaw): RequestRejectionReason {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    subModule: raw.subModule,
    active: raw.active,
    status: toStatusBadge(raw.active),
    createdAt: formatDateTime(raw.createdAt),
    updatedAt: formatDateTime(raw.updatedAt),
    createdBy: raw.createdBy,
    updatedBy: raw.updatedBy,
    actions: raw.actions,
  }
}

export function mapperRequestRejectionReasonFormToPayload(
  form: RequestRejectionReasonForm,
): RequestRejectionReasonFormPayload {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    subModule: form.subModule as string,
  }
}
