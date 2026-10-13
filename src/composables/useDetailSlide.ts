import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'

// Slide de detalle de una lista: el id abierto vive en la URL (?detail={id}) y la query de detalle
// se alimenta de él. `resource` es la raíz de la clave de caché (ej. 'clients').
export function useDetailSlide<T>(resource: string, fetchDetail: (id: number) => Promise<T>) {
  const route = useRoute()
  const router = useRouter()

  // Sobrevive a un refresh y es compartible por link.
  const detailId = computed(() => {
    const raw = route.query.detail
    const n = Number(raw)
    return typeof raw === 'string' && Number.isInteger(n) && n > 0 ? n : null
  })

  // Las listas lo conservan al reescribir sus filtros en la URL.
  const detailQueryParam = computed(() => (detailId.value ? { detail: String(detailId.value) } : {}))

  const isOpen = computed<boolean>({
    get: () => detailId.value !== null,
    set: (value) => {
      if (!value) close()
    },
  })

  function open(id: number) {
    router.push({ query: { ...route.query, detail: String(id) } })
  }

  function close() {
    const rest = { ...route.query }
    delete rest.detail
    router.push({ query: rest })
  }

  // Último id abierto: la query lo conserva al cerrar el slide para que no quede en blanco mientras se anima.
  const selectedId = ref<number | null>(detailId.value)
  watch(detailId, (id) => {
    if (id !== null) selectedId.value = id
  })

  const { data: record, isLoading } = useQuery({
    queryKey: computed(() => [resource, 'detail', selectedId.value]),
    queryFn: () => {
      const id = selectedId.value
      if (id === null) throw new Error('Falta el id para cargar los datos')
      return fetchDetail(id)
    },
    enabled: computed(() => selectedId.value !== null),
  })

  return { detailId, detailQueryParam, isOpen, open, close, record, isLoading }
}
