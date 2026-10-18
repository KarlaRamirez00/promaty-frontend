import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import type { SortDirection } from '@/types/sort'
import type { TablePage } from '@/utils'

const SEARCH_DEBOUNCE_MS = 350

interface ListQueryBase {
  search: string
  page: number
  size: number
  sort?: { key: string; order: SortDirection }
}

interface ListQueryOptions<TQuery extends ListQueryBase, TItem, TOtherData> {
  // Raíz de la clave de caché del listado (ej. 'clients'); las mutaciones la invalidan.
  resource: string
  parse: (routeQuery: Record<string, unknown>) => TQuery
  toRoute: (query: TQuery) => Record<string, string>
  fetch: (query: TQuery) => Promise<TablePage<TItem, TOtherData>>
  // Parámetros de la URL que deben sobrevivir a la reescritura de filtros (ej. ?detail=).
  extraRouteQuery?: () => Record<string, string | undefined>
}

// Listado cuyo estado (búsqueda, filtros, orden y paginación) vive en la URL.
export function useListQuery<TQuery extends ListQueryBase, TItem, TOtherData = undefined>(
  options: ListQueryOptions<TQuery, TItem, TOtherData>,
) {
  const route = useRoute()
  const router = useRouter()

  const query = computed<TQuery>(() => options.parse(route.query))

  // Encadena patches del mismo tick sobre el último estado pedido, no sobre la ruta aún sin propagar.
  let pendingQuery: TQuery | null = null

  function patchQuery(patch: Partial<TQuery>) {
    const next: TQuery = { ...(pendingQuery ?? query.value), ...patch }
    if (!('page' in patch)) next.page = 1
    pendingQuery = next
    void router
      .replace({ query: { ...options.toRoute(next), ...options.extraRouteQuery?.() } })
      .finally(() => {
        pendingQuery = null
      })
  }

  const searchInput = ref(query.value.search)
  let debounceTimer: ReturnType<typeof setTimeout>
  watch(searchInput, (value) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => patchQuery({ search: value } as Partial<TQuery>), SEARCH_DEBOUNCE_MS)
  })
  watch(
    () => query.value.search,
    (value) => {
      if (value !== searchInput.value.trim()) searchInput.value = value
    },
  )
  onBeforeUnmount(() => clearTimeout(debounceTimer))

  const sortBy = computed(() => {
    const sort = query.value.sort
    return sort ? [{ key: sort.key, order: sort.order }] : []
  })

  function changeSort(value: readonly { key: string; order?: boolean | 'asc' | 'desc' }[]) {
    const entry = value[0]
    if (!entry) return
    patchQuery({
      sort: { key: entry.key, order: entry.order === 'desc' ? 'desc' : 'asc' },
    } as Partial<TQuery>)
  }

  const pageModel = computed<number>({
    get: () => query.value.page,
    set: (value) => patchQuery({ page: value } as Partial<TQuery>),
  })

  const sizeModel = computed<number>({
    get: () => query.value.size,
    set: (value) => patchQuery({ size: value } as Partial<TQuery>),
  })

  const {
    data: listResult,
    isPending,
    isError,
  } = useQuery({
    queryKey: computed(() => [options.resource, { ...query.value }]),
    queryFn: () => options.fetch({ ...query.value }),
    placeholderData: keepPreviousData,
  })

  const items = computed<TItem[]>(() => listResult.value?.data ?? [])
  const totalItems = computed(() => listResult.value?.meta.total ?? 0)
  const pageCount = computed(() => listResult.value?.meta.pageCount ?? 1)

  // Vigila el resultado y no solo pageCount: si el total de páginas vale 1 (el valor por defecto), pageCount
  // no cambia al cargar y una página fuera de rango nunca se corregiría.
  watch(listResult, (result) => {
    const count = result?.meta.pageCount
    if (count !== undefined && count >= 1 && query.value.page > count) {
      patchQuery({ page: count } as Partial<TQuery>)
    }
  })

  return {
    query,
    patchQuery,
    searchInput,
    sortBy,
    changeSort,
    pageModel,
    sizeModel,
    listResult,
    items,
    totalItems,
    pageCount,
    isPending,
    isError,
  }
}
