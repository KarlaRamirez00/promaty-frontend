import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { annulTerminationAction } from '@/actions'
import { useBackendFieldErrors } from '@/composables/useBackendFieldErrors'
import { useMessage } from '@/composables/useMessage'
import messages from '@/messages'
import { WORKFLOW_QUERY_KEYS, type TerminationAnnulForm } from '@/models'
import AnnulTerminationDialog from '@/components/common/AnnulTerminationDialog.vue'

interface AnnulVariables {
  id: number
  form: TerminationAnnulForm
}

// Anular un finiquito aprobado: el detalle queda abierto y se refresca con el estado nuevo.
export function useTerminationAnnul() {
  const queryClient = useQueryClient()
  const { toastAnnulled, toastFailed } = useMessage()
  const { backendErrorFields, setFromError, clear: clearBackendErrors } = useBackendFieldErrors()

  const dialogRef = ref<InstanceType<typeof AnnulTerminationDialog> | null>(null)
  const terminationId = ref<number | null>(null)

  const mutation = useMutation({
    mutationFn: ({ id, form }: AnnulVariables) => annulTerminationAction(id, form),
    onSuccess: () => {
      dialogRef.value?.close()
      toastAnnulled(messages.termination)
      return queryClient.invalidateQueries({
        predicate: ({ queryKey }) => WORKFLOW_QUERY_KEYS.has(queryKey[0]),
      })
    },
    onError: (error: unknown) => {
      if (!setFromError(error)) toastFailed(messages.termination)
    },
  })

  function askAnnul(id: number) {
    terminationId.value = id
    clearBackendErrors()
    dialogRef.value?.open()
  }

  function confirmAnnul(form: TerminationAnnulForm) {
    if (terminationId.value === null) return
    clearBackendErrors()
    mutation.mutate({ id: terminationId.value, form })
  }

  function setDialogRef(el: unknown) {
    dialogRef.value = el as InstanceType<typeof AnnulTerminationDialog> | null
  }

  return {
    setDialogRef,
    backendErrorFields,
    isPending: mutation.isPending,
    askAnnul,
    confirmAnnul,
  }
}
