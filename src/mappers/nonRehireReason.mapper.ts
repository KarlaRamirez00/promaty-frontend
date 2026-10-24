import { formatDate, formatDateTime } from '@/utils'
import type { Badge } from '@/types/badge'
import type {
  NonRehireReasonFormPayload,
  NonRehireReasonListRaw,
  NonRehireReasonRaw,
} from '@/types/nonRehireReason'
import type { NonRehireReason, NonRehireReasonForm, NonRehireReasonListItem } from '@/models'

function toStatusBadge(active: boolean): Badge {
  return active ? { label: 'Activo', color: 'info' } : { label: 'Inactivo', color: 'grey' }
}

export function mapperNonRehireReasonList(items: NonRehireReasonListRaw[]): NonRehireReasonListItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    active: item.active,
    updatedAt: formatDate(item.updatedAt),
    status: toStatusBadge(item.active),
    actions: item.actions,
  }))
}

export function mapperNonRehireReasonDetail(raw: NonRehireReasonRaw): NonRehireReason {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    active: raw.active,
    status: toStatusBadge(raw.active),
    createdAt: formatDateTime(raw.createdAt),
    updatedAt: formatDateTime(raw.updatedAt),
    createdBy: raw.createdBy,
    updatedBy: raw.updatedBy,
    actions: raw.actions,
  }
}

export function mapperNonRehireReasonFormToPayload(form: NonRehireReasonForm): NonRehireReasonFormPayload {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
  }
}
