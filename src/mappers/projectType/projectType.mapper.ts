import { formatDateTime } from '@/utils/formatDate'
import type { Badge } from '@/types/badge'
import type { ProjectTypeFormPayload, ProjectTypeListRaw, ProjectTypeRaw } from '@/types/projectType'
import type { ProjectType, ProjectTypeForm, ProjectTypeListItem } from '@/models/projectType/projectType.models'

function toStatusBadge(active: boolean): Badge {
  return active ? { label: 'Activo', color: 'success' } : { label: 'Inactivo', color: 'grey' }
}

export function mapperProjectTypeList(items: ProjectTypeListRaw[]): ProjectTypeListItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    active: item.active,
    status: toStatusBadge(item.active),
    actions: item.actions,
  }))
}

export function mapperProjectTypeDetail(raw: ProjectTypeRaw): ProjectType {
  return {
    id: raw.id,
    name: raw.name,
    active: raw.active,
    status: toStatusBadge(raw.active),
    createdAt: formatDateTime(raw.createdAt),
    updatedAt: formatDateTime(raw.updatedAt),
    createdBy: raw.createdBy,
    updatedBy: raw.updatedBy,
    actions: raw.actions,
  }
}

export function mapperProjectTypeFormToPayload(form: ProjectTypeForm): ProjectTypeFormPayload {
  return { name: form.name.trim() }
}
