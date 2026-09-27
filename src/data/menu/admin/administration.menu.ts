import { mdiAccountMultipleOutline, mdiShieldAccountOutline, mdiShieldKeyOutline } from '@mdi/js'
import type { MenuItem } from '@/data/menu/menu.types'

export const administrationMenu: MenuItem = {
  title: 'Administración',
  icon: mdiShieldAccountOutline,
  submenu: [
    { title: 'Roles', icon: mdiShieldKeyOutline, to: '/roles', module: 'role', permission: 'read' },
    { title: 'Usuarios', icon: mdiAccountMultipleOutline, to: '/users', module: 'user', permission: 'read' },
  ],
}
