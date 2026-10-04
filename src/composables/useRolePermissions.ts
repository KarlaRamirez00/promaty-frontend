import { computed, ref, type Ref } from 'vue'
import { groupIntoSections } from '@/utils'
import type { RolePermissionGroup, RolePermissionOption, RolePermissionSection } from '@/models'

// El alias es texto traducible; la clave estable del permiso "Ver" es el sufijo de su name.
const READ_SUFFIX = '.read'
const SCOPE_SUFFIX = '.AllowedAll'

function isReadPermission(permission: RolePermissionOption): boolean {
  return permission.name.endsWith(READ_SUFFIX)
}

function isScopePermission(permission: RolePermissionOption): boolean {
  return permission.name.endsWith(SCOPE_SUFFIX)
}

function normalizeText(value: string): string {
  return value.toLowerCase().normalize('NFD').replaceAll(/[̀-ͯ]/g, '')
}

function groupByModule(options: RolePermissionOption[]): RolePermissionGroup[] {
  const byModule = new Map<number, RolePermissionGroup>()
  for (const permission of options) {
    const group = byModule.get(permission.subModule.id)
    if (group) {
      group.permissions.push(permission)
    } else {
      byModule.set(permission.subModule.id, {
        subModule: permission.subModule,
        permissions: [permission],
        readPermission: null,
      })
    }
  }
  for (const group of byModule.values()) {
    group.permissions.sort((a, b) => Number(isReadPermission(b)) - Number(isReadPermission(a)))
    group.readPermission = group.permissions.find(isReadPermission) ?? null
  }
  return [...byModule.values()]
}

export function useRolePermissions(
  options: Ref<RolePermissionOption[] | undefined>,
  selectedIds: Ref<number[]>,
) {
  const subModuleSearch = ref('')
  const selected = computed(() => new Set(selectedIds.value))

  const scopePermissions = computed(() => (options.value ?? []).filter(isScopePermission))
  const groups = computed(() =>
    groupByModule((options.value ?? []).filter((permission) => !isScopePermission(permission))),
  )

  const visibleGroups = computed(() => {
    const query = normalizeText(subModuleSearch.value.trim())
    if (!query) return groups.value
    return groups.value.filter((group) =>
      normalizeText(group.subModule.alias || group.subModule.name).includes(query),
    )
  })

  const sections = computed(() =>
    groupIntoSections(visibleGroups.value, subModuleSearch.value.trim() ? [] : scopePermissions.value),
  )

  const totalAvailable = computed(() => options.value?.length ?? 0)
  const totalSelected = computed(
    () => (options.value ?? []).filter((permission) => selected.value.has(permission.id)).length,
  )

  function isSelected(permission: RolePermissionOption): boolean {
    return selected.value.has(permission.id)
  }

  function selectedCount(group: RolePermissionGroup): number {
    return group.permissions.filter(isSelected).length
  }

  function sectionSelectedCount(section: RolePermissionSection): number {
    const scopeSelected = section.scopePermissions.filter(isSelected).length
    return section.groups.reduce((total, group) => total + selectedCount(group), scopeSelected)
  }

  function sectionTotal(section: RolePermissionSection): number {
    return section.groups.reduce(
      (total, group) => total + group.permissions.length,
      section.scopePermissions.length,
    )
  }

  function isAllSelected(group: RolePermissionGroup): boolean {
    return group.permissions.every(isSelected)
  }

  function isDisabled(group: RolePermissionGroup, permission: RolePermissionOption): boolean {
    const read = group.readPermission
    return read !== null && permission !== read && !selected.value.has(read.id)
  }

  function addIds(ids: number[]) {
    selectedIds.value = [...new Set([...selectedIds.value, ...ids])]
  }

  function removeIds(ids: number[]) {
    const toRemove = new Set(ids)
    selectedIds.value = selectedIds.value.filter((id) => !toRemove.has(id))
  }

  function toggleScopePermission(permission: RolePermissionOption, checked: boolean) {
    if (checked) addIds([permission.id])
    else removeIds([permission.id])
  }

  function toggleAll(group: RolePermissionGroup, checked: boolean) {
    const ids = group.permissions.map((permission) => permission.id)
    if (checked) addIds(ids)
    else removeIds(ids)
  }

  function togglePermission(group: RolePermissionGroup, permission: RolePermissionOption, checked: boolean) {
    if (checked) {
      addIds(group.readPermission ? [group.readPermission.id, permission.id] : [permission.id])
    } else if (permission === group.readPermission) {
      removeIds(group.permissions.map((item) => item.id))
    } else {
      removeIds([permission.id])
    }
  }

  return {
    subModuleSearch,
    sections,
    totalAvailable,
    totalSelected,
    isSelected,
    selectedCount,
    sectionSelectedCount,
    sectionTotal,
    isAllSelected,
    isDisabled,
    toggleAll,
    togglePermission,
    toggleScopePermission,
  }
}
