import { maintainersMenu } from '@/data/menu/admin/maintainers.menu'
import { administrationMenu } from '@/data/menu/admin/administration.menu'
import type { MenuItem } from '@/data/menu/menu.types'

export const adminMenu: MenuItem[] = [maintainersMenu, administrationMenu]
