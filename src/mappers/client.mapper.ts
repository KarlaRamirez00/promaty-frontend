import { formatDateTime } from '@/utils'
import type { Badge } from '@/types/badge'
import type { ClientFormPayload, ClientListRaw, ClientRaw } from '@/types/client'
import type { Client, ClientForm, ClientListItem } from '@/models'

function toStatusBadge(active: boolean): Badge {
  return active ? { label: 'Activo', color: 'success' } : { label: 'Inactivo', color: 'grey' }
}

export function mapperClientList(items: ClientListRaw[]): ClientListItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    active: item.active,
    status: toStatusBadge(item.active),
    actions: item.actions,
  }))
}

export function mapperClientDetail(raw: ClientRaw): Client {
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

export function mapperClientFormToPayload(form: ClientForm): ClientFormPayload {
  return { name: form.name.trim() }
}
