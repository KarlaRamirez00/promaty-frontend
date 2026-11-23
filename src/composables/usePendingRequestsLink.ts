import type { Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { getRequestStatusOptionsAction } from '@/actions'
import { ROUTE } from '@/router/route-names'

// Lleva a Solicitudes filtrada por un estado pendiente (y, si se indica, por centro de costo).
// Comparte la caché de estados con la lista de Solicitudes.
export function usePendingRequestsLink(projectId?: Ref<number | null>) {
  const router = useRouter()
  const { data: statuses } = useQuery({
    queryKey: ['requests', 'options', 'statuses'],
    queryFn: getRequestStatusOptionsAction,
  })

  function goToRequests(statusCode: string) {
    const query: Record<string, string> = {}
    if (projectId?.value) query.projectId = String(projectId.value)
    const statusId = statuses.value?.find((option) => option.code === statusCode)?.id
    if (statusId) query.statusId = String(statusId)
    void router.push({ name: ROUTE.REQUEST_LIST, query })
  }

  return { goToRequests }
}
