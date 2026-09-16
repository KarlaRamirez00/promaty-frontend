import { formatDateTime } from '@/utils'
import type { Badge } from '@/types/badge'
import type { RoleFormPayload, RoleListRaw, RoleRaw } from '@/types/role'
import type { Role, RoleForm, RoleListItem } from '@/models'

function toStatusBadge(active: boolean): Badge {
  return active ? { label: 'Activo', color: 'success' } : { label: 'Inactivo', color: 'grey' }
}

export function mapperRoleList(items: RoleListRaw[]): RoleListItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    active: item.active,
    status: toStatusBadge(item.active),
    totalUsers: item.totalUsers,
    actions: item.actions,
  }))
}

export function mapperRoleDetail(raw: RoleRaw): Role {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    active: raw.active,
    status: toStatusBadge(raw.active),
    totalUsers: raw.totalUsers,
    permissions: raw.permissions,
    subModules: raw.subModules,
    createdAt: formatDateTime(raw.createdAt),
    updatedAt: formatDateTime(raw.updatedAt),
    createdBy: raw.createdBy,
    updatedBy: raw.updatedBy,
    actions: raw.actions,
  }
}

export function mapperRoleFormToPayload(form: RoleForm): RoleFormPayload {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    permissionIds: form.permissionIds,
    subModuleIds: form.subModuleIds,
  }
}
