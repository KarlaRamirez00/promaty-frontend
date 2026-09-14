import { mdiDomain, mdiOfficeBuildingCogOutline, mdiShapeOutline, mdiToolboxOutline } from '@mdi/js'
import type { MenuItem } from '@/data/menu/menu.types'

export const maintainersMenu: MenuItem = {
  title: 'Mantenedores',
  icon: mdiOfficeBuildingCogOutline,
  submenu: [
    { title: 'Mandantes', icon: mdiDomain, to: '/clients', module: 'client', permission: 'read' },
    {
      title: 'Tipos de proyecto',
      icon: mdiShapeOutline,
      to: '/project-types',
      module: 'projectType',
      permission: 'read',
    },
    {
      title: 'Especialidades',
      icon: mdiToolboxOutline,
      to: '/project-specialties',
      module: 'projectSpecialty',
      permission: 'read',
    },
  ],
}
