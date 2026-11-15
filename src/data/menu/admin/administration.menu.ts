import { mdiAccountMultipleOutline, mdiCogOutline, mdiShieldAccountOutline, mdiShieldKeyOutline } from '@mdi/js'
import type { MenuItem } from '@/data/menu/menu.types'

export const administrationMenu: MenuItem = {
  title: 'Administración',
  icon: mdiShieldAccountOutline,
  submenu: [
    { title: 'Usuarios', icon: mdiAccountMultipleOutline, to: '/users', module: 'user', permission: 'read' },
    { title: 'Roles', icon: mdiShieldKeyOutline, to: '/roles', module: 'role', permission: 'read' },
    { title: 'Configuración', icon: mdiCogOutline, to: '/settings', module: 'setting', permission: 'read', hidden: true },
  ],
}
