import { computed } from 'vue'

export interface ActiveFilterChip<TQuery> {
  key: string
  label: string
  // Campos que se limpian al quitar el chip; por defecto, el campo que lleva su misma clave.
  reset?: Partial<TQuery>
}

interface ActiveFiltersOptions<TQuery> {
  patchQuery: (patch: Partial<TQuery>) => void
  // Todos los campos de filtro, para "quitar todos".
  resetAll: Partial<TQuery>
  // Solo los chips que están aplicados; cada módulo arma sus etiquetas.
  chips: () => ActiveFilterChip<TQuery>[]
}

// Chips de filtros activos y su limpieza, uno a uno o todos juntos.
export function useActiveFilters<TQuery>(options: ActiveFiltersOptions<TQuery>) {
  const activeFilters = computed(() => options.chips().map(({ key, label }) => ({ key, label })))

  function clearFilter(key: string) {
    const chip = options.chips().find((item) => item.key === key)
    options.patchQuery(chip?.reset ?? ({ [key]: null } as Partial<TQuery>))
  }

  function clearAllFilters() {
    options.patchQuery(options.resetAll)
  }

  return { activeFilters, clearFilter, clearAllFilters }
}
