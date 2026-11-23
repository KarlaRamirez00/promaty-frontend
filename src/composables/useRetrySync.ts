import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { retryRequestSyncAction } from '@/actions'
import { useMessage } from '@/composables/useMessage'
import messages from '@/messages'
import { WORKFLOW_QUERY_KEYS } from '@/models'

// Reintenta la sincronización con Rex+ de un contrato, finiquito o anexo en Error de sincronización.
// En ambos resultados (sincronizó o no) se refresca el detalle para mostrar el estado y el motivo vigentes.
export function useRetrySync() {
  const queryClient = useQueryClient()
  const { toastRetried, toastFailed } = useMessage()

  const mutation = useMutation({
    mutationFn: (requestId: number) => retryRequestSyncAction(requestId),
    onSuccess: (result) => {
      toastRetried(result.synced, messages.request, result.syncErrorMessage)
      return queryClient.invalidateQueries({
        predicate: ({ queryKey }) => WORKFLOW_QUERY_KEYS.has(queryKey[0]),
      })
    },
    onError: () => toastFailed(messages.request),
  })

  return {
    isPending: mutation.isPending,
    retrySync: (requestId: number) => mutation.mutate(requestId),
  }
}
