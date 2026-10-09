import { formatDateTime } from '@/utils'
import type { Badge } from '@/types/badge'
import type { UserCreatePayload, UserDetailRaw, UserFormPayload, UserRaw } from '@/types/user'
import type { User, UserForm, UserListItem } from '@/models'
import { USER_ACTIONS_PLACEHOLDER } from '@/models'

function toStatusBadge(active: boolean): Badge {
  return active ? { label: 'Activo', color: 'success' } : { label: 'Inactivo', color: 'grey' }
}

function toFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim()
}

export function mapperUserList(items: UserRaw[]): UserListItem[] {
  return items.map((item) => ({
    id: item.id,
    firstName: item.firstName,
    lastName: item.lastName,
    fullName: toFullName(item.firstName, item.lastName),
    email: item.email,
    active: item.active,
    status: toStatusBadge(item.active),
    role: item.role,
    actions: [...USER_ACTIONS_PLACEHOLDER],
  }))
}

export function mapperUserDetail(raw: UserDetailRaw): User {
  return {
    id: raw.id,
    firstName: raw.firstName,
    lastName: raw.lastName,
    fullName: toFullName(raw.firstName, raw.lastName),
    email: raw.email,
    phoneNumber: raw.phoneNumber,
    active: raw.active,
    status: toStatusBadge(raw.active),
    role: raw.role,
    projectIds: raw.projectIds,
    createdAt: formatDateTime(raw.createdAt),
    updatedAt: formatDateTime(raw.updatedAt),
    createdBy: raw.createdBy,
    updatedBy: raw.updatedBy,
    actions: [...USER_ACTIONS_PLACEHOLDER],
  }
}

export function mapperUserFormToPayload(form: UserForm): UserFormPayload {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    phoneNumber: form.phoneNumber.replaceAll(' ', ''),
    roleId: form.roleId as number,
    projectIds: form.projectIds,
  }
}

export function mapperUserFormToCreatePayload(form: UserForm): UserCreatePayload {
  return {
    ...mapperUserFormToPayload(form),
    password: form.password,
  }
}
