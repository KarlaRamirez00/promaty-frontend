import type { RouteLocationRaw } from 'vue-router'

export interface Breadcrumb {
  title: string
  // Sin `to`: es una etiqueta de agrupación (ej. "Mantenedores"), no una vista real — nunca clickeable.
  to?: RouteLocationRaw
  disabled?: boolean
}
