import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useBackendFieldErrors } from '@/composables/useBackendFieldErrors'
import { useMessage, type ErrorMessages } from '@/composables/useMessage'
import { WORKFLOW_QUERY_KEYS, type AnnulForm } from '@/models'
import AnnulDialog from '@/components/common/AnnulDialog.vue'

interface AnnulVariables {
  id: number
  form: AnnulForm
}

interface AnnulToastMessages extends ErrorMessages {
  toastAnnul: { title: string; message?: string }
}

// Anular un registro aprobado (finiquito o contrato): el detalle queda abierto y se refresca con el
// estado nuevo. Los errores de validación de backend se muestran dentro del diálogo.
export function useAnnul(
  annulAction: (id: number, form: AnnulForm) => Promise<unknown>,
  entityMessages: AnnulToastMessages,
) {
  const queryClient = useQueryClient()
  const { toastAnnulled, toastFailed } = useMessage()
  const { backendErrorFields, setFromError, clear: clearBackendErrors } = useBackendFieldErrors()

  const dialogRef = ref<InstanceType<typeof AnnulDialog> | null>(null)
  const recordId = ref<number | null>(null)

  const mutation = useMutation({
    mutationFn: ({ id, form }: AnnulVariables) => annulAction(id, form),
    onSuccess: () => {
      dialogRef.value?.close()
      toastAnnulled(entityMessages)
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => WORKFLOW_QUERY_KEYS.has(queryKey[0]),
      })
    },
    onError: (error: unknown) => {
      if (!setFromError(error)) toastFailed(entityMessages)
    },
  })

  function askAnnul(id: number) {
    recordId.value = id
    clearBackendErrors()
    dialogRef.value?.open()
  }

  function confirmAnnul(form: AnnulForm) {
    if (recordId.value === null) return
    clearBackendErrors()
    mutation.mutate({ id: recordId.value, form })
  }

  function setDialogRef(el: unknown) {
    dialogRef.value = el as InstanceType<typeof AnnulDialog> | null
  }

  return {
    setDialogRef,
    backendErrorFields,
    isPending: mutation.isPending,
    askAnnul,
    confirmAnnul,
  }
}
