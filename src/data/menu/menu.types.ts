// Sin module/permission, el ítem siempre se muestra (grupos contenedores, o módulos sin RBAC aún).
export interface MenuItem {
  title: string
  icon: string
  to?: string
  module?: string
  permission?: string
  submenu?: MenuItem[]
}
