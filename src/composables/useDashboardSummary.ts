import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getDashboardSummaryAction } from '@/actions'

// Una sola consulta compartida: el Home y el panel usan la misma clave de caché.
export function useDashboardSummary(projectId: Ref<number | null>, enabled?: Ref<boolean>) {
  return useQuery({
    queryKey: computed(() => ['dashboard', 'summary', projectId.value]),
    queryFn: () => getDashboardSummaryAction({ projectId: projectId.value }),
    enabled,
  })
}
