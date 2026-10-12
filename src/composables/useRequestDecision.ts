import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  approveRequestAction,
  getRejectionReasonOptionsAction,
  rejectRequestAction,
} from '@/actions'
import { useBackendFieldErrors } from '@/composables/useBackendFieldErrors'
import { useMessage } from '@/composables/useMessage'
import messages from '@/messages'
import { WORKFLOW_QUERY_KEYS, type RequestDecisionForm } from '@/models'
import ApproveRejectDialog, { type DecisionType } from '@/components/common/ApproveRejectDialog.vue'

interface DecisionVariables {
  type: DecisionType
  id: number
  form: RequestDecisionForm
}

// Aprobar, validar o rechazar una solicitud: compartido por Solicitudes y el detalle de Contrato.
export function useRequestDecision() {
  const queryClient = useQueryClient()
  const { toastDecided, toastFailed } = useMessage()
  const { backendErrorFields, setFromError, clear: clearBackendErrors } = useBackendFieldErrors()

  const dialogRef = ref<InstanceType<typeof ApproveRejectDialog> | null>(null)
  const type = ref<DecisionType>('APPROVE')
  const requestId = ref<number | null>(null)

  const { data: rejectionReasons } = useQuery({
    queryKey: ['requestRejectionReasons', 'selector', 'contracts'],
    queryFn: getRejectionReasonOptionsAction,
    enabled: computed(() => type.value === 'REJECT'),
  })

  const mutation = useMutation({
    mutationFn: ({ type, id, form }: DecisionVariables) =>
      type === 'REJECT' ? rejectRequestAction(id, form) : approveRequestAction(id),
    onSuccess: (_data, { type }) => {
      dialogRef.value?.close()
      toastDecided(type, messages.request)
      return queryClient.invalidateQueries({
        predicate: ({ queryKey }) => WORKFLOW_QUERY_KEYS.has(queryKey[0]),
      })
    },
    onError: (error: unknown) => {
      if (!setFromError(error)) toastFailed(messages.request)
    },
  })

  function askDecision(id: number, decisionType: DecisionType) {
    type.value = decisionType
    requestId.value = id
    clearBackendErrors()
    dialogRef.value?.open()
  }

  function confirmDecision(form: RequestDecisionForm) {
    if (requestId.value === null) return
    clearBackendErrors()
    mutation.mutate({ type: type.value, id: requestId.value, form })
  }

  function setDialogRef(el: unknown) {
    dialogRef.value = el as InstanceType<typeof ApproveRejectDialog> | null
  }

  return {
    setDialogRef,
    type,
    rejectionReasons,
    backendErrorFields,
    isPending: mutation.isPending,
    askDecision,
    confirmDecision,
  }
}
