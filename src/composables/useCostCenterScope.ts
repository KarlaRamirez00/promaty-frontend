import { computed, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getCostCenterOptionsAction } from '@/actions'

// Centro de costo del dashboard. Con dos o más opciones el Home siempre muestra los datos de
// uno solo y arranca con el primero; con una sola opción backend ya limita el alcance.
export function useCostCenterScope() {
  const { data: costCenters, isPending } = useQuery({
    queryKey: ['projects', 'options', 'costCenters'],
    queryFn: getCostCenterOptionsAction,
  })

  const projectId = ref<number | null>(null)
  const showSelector = computed(() => (costCenters.value?.length ?? 0) >= 2)

  watch(
    costCenters,
    (options) => {
      if (options && options.length >= 2 && projectId.value === null) projectId.value = options[0].id
    },
    { immediate: true },
  )

  // Las consultas del Home esperan a tener el centro de costo definido para no pedir datos mezclados.
  const ready = computed(() => !isPending.value && (!showSelector.value || projectId.value !== null))

  return { costCenters, projectId, showSelector, ready }
}
