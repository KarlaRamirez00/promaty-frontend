import { mdiDotsHorizontal } from '@mdi/js'
import { adminMenu, mainMenu, type MenuItem } from '@/data/menu'
import type { RolePermissionGroup, RolePermissionOption, RolePermissionSection } from '@/models'

interface MenuSection {
  title: string
  icon: string
  moduleKeys: Set<string>
  leafTitles: Set<string>
}

const OTHER_SECTION = { title: 'Otros', icon: mdiDotsHorizontal }

function toMenuSection(root: MenuItem): MenuSection {
  const leaves = root.submenu ?? [root]
  return {
    title: root.title,
    icon: root.icon,
    moduleKeys: new Set(leaves.flatMap((leaf) => (leaf.module ? [leaf.module] : []))),
    leafTitles: new Set(leaves.map((leaf) => leaf.title)),
  }
}

const MENU_SECTIONS = [...mainMenu, ...adminMenu].map(toMenuSection)

function findMenuSection(group: RolePermissionGroup): MenuSection | undefined {
  const moduleKey = group.permissions[0].name.split('.')[0]
  return (
    MENU_SECTIONS.find((section) => section.moduleKeys.has(moduleKey)) ??
    MENU_SECTIONS.find((section) => section.leafTitles.has(group.subModule.alias))
  )
}

function findSectionByModuleKey(moduleKey: string): { title: string; icon: string } {
  return (
    MENU_SECTIONS.find((section) => section.title.toLowerCase() === moduleKey.toLowerCase()) ??
    OTHER_SECTION
  )
}

export function groupIntoSections(
  groups: RolePermissionGroup[],
  scopePermissions: RolePermissionOption[],
): RolePermissionSection[] {
  const sections = new Map<string, RolePermissionSection>()

  function sectionFor({ title, icon }: { title: string; icon: string }): RolePermissionSection {
    const existing = sections.get(title)
    if (existing) return existing
    const created = { title, icon, groups: [], scopePermissions: [] }
    sections.set(title, created)
    return created
  }

  for (const group of groups) {
    sectionFor(findMenuSection(group) ?? OTHER_SECTION).groups.push(group)
  }
  for (const permission of scopePermissions) {
    sectionFor(findSectionByModuleKey(permission.name.split('.')[0])).scopePermissions.push(permission)
  }
  const order = [...MENU_SECTIONS.map((section) => section.title), OTHER_SECTION.title]
  return order.flatMap((title) => {
    const section = sections.get(title)
    return section ? [section] : []
  })
}
