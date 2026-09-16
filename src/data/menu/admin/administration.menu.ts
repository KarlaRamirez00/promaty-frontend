import { mdiAccountMultipleOutline, mdiShieldAccountOutline, mdiShieldKeyOutline } from '@mdi/js'
import type { MenuItem } from '@/data/menu/menu.types'

// Muy pocos usuarios tendrán acceso a esta sección (roles/permisos del sistema). Usuarios queda
// como placeholder sin `to` hasta que exista su CRUD.
export const administrationMenu: MenuItem = {
  title: 'Administración',
  icon: mdiShieldAccountOutline,
  submenu: [
    { title: 'Roles', icon: mdiShieldKeyOutline, to: '/roles', module: 'role', permission: 'read' },
    { title: 'Usuarios', icon: mdiAccountMultipleOutline },
  ],
}
