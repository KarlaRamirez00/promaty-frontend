import { mdiBriefcaseVariantOutline } from '@mdi/js'
import type { MenuItem } from '@/data/menu/menu.types'

// Ítem plano de primer nivel, no agrupado bajo RRHH ni Mantenedores.
export const projectsMenu: MenuItem = {
  title: 'Proyectos',
  icon: mdiBriefcaseVariantOutline,
  to: '/projects',
  module: 'project',
  permission: 'read',
}
