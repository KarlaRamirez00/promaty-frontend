import { formatDateTime } from '@/utils/formatDate'
import type { Badge } from '@/types/badge'
import type {
  ProjectSpecialtyFormPayload,
  ProjectSpecialtyListRaw,
  ProjectSpecialtyRaw,
} from '@/types/projectSpecialty'
import type {
  ProjectSpecialty,
  ProjectSpecialtyForm,
  ProjectSpecialtyListItem,
} from '@/models/projectSpecialty/projectSpecialty.models'

function toStatusBadge(active: boolean): Badge {
  return active ? { label: 'Activo', color: 'success' } : { label: 'Inactivo', color: 'grey' }
}

export function mapperProjectSpecialtyList(items: ProjectSpecialtyListRaw[]): ProjectSpecialtyListItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    active: item.active,
    status: toStatusBadge(item.active),
    actions: item.actions,
  }))
}

export function mapperProjectSpecialtyDetail(raw: ProjectSpecialtyRaw): ProjectSpecialty {
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

export function mapperProjectSpecialtyFormToPayload(
  form: ProjectSpecialtyForm,
): ProjectSpecialtyFormPayload {
  return { name: form.name.trim() }
}
