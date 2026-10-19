// Sin module/permission (módulo por construir), el ítem solo lo ve el Superadmin; un grupo se muestra si algún submódulo es visible.
export interface MenuItem {
  title: string
  icon: string
  to?: string
  module?: string
  permission?: string
  submenu?: MenuItem[]
}
