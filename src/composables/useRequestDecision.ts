import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  approveRequestAction,
  CONTRACT_REJECTION_SUBMODULE,
  getRejectionReasonOptionsAction,
  rejectRequestAction,
} from '@/actions'
import { useBackendFieldErrors } from '@/composables/useBackendFieldErrors'
import { useMessage } from '@/composables/useMessage'
import messages from '@/messages'
import { WORKFLOW_QUERY_KEYS, type RequestDecisionForm } from '@/models'
import ApproveRejectDialog, { type DecisionType } from '@/components/common/ApproveRejectDialog.vue'

const SYNC_ERROR_STATUS = 'SYNC_ERROR'

interface DecisionVariables {
  type: DecisionType
  id: number
  form: RequestDecisionForm
}

// Aprobar, validar o rechazar una solicitud: compartido por Solicitudes, Contratos y Finiquitos.
// El submódulo define de qué catálogo salen los motivos de rechazo. `fetchStatusCode` consulta el
// estado actual de la entidad (contrato, finiquito o anexo): el PATCH solo confirma que la decisión
// quedó guardada, y si la sincronización con Rex+ falla la entidad queda en SYNC_ERROR.
export function useRequestDecision(
  rejectionSubModule: string = CONTRACT_REJECTION_SUBMODULE,
  fetchStatusCode?: (entityId: number) => Promise<string>,
) {
  const queryClient = useQueryClient()
  const { toastDecided, toastSyncError, toastFailed } = useMessage()
  const { backendErrorFields, setFromError, clear: clearBackendErrors } = useBackendFieldErrors()

  const dialogRef = ref<InstanceType<typeof ApproveRejectDialog> | null>(null)
  const type = ref<DecisionType>('APPROVE')
  const requestId = ref<number | null>(null)
  const entityId = ref<number | null>(null)

  const { data: rejectionReasons } = useQuery({
    queryKey: ['requestRejectionReasons', 'selector', rejectionSubModule],
    queryFn: () => getRejectionReasonOptionsAction(rejectionSubModule),
    enabled: computed(() => type.value === 'REJECT'),
  })

  const mutation = useMutation({
    mutationFn: ({ type, id, form }: DecisionVariables) =>
      type === 'REJECT' ? rejectRequestAction(id, form) : approveRequestAction(id),
    onSuccess: async (_data, { type }) => {
      dialogRef.value?.close()
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => WORKFLOW_QUERY_KEYS.has(queryKey[0]),
      })
      if (type !== 'REJECT' && (await hasSyncError())) {
        toastSyncError(messages.request)
        return
      }
      toastDecided(type, messages.request)
    },
    onError: (error: unknown) => {
      if (!setFromError(error)) toastFailed(messages.request)
    },
  })

  // Si la consulta falla no se asume un error de sincronización: la decisión sí quedó guardada.
  async function hasSyncError(): Promise<boolean> {
    if (!fetchStatusCode || entityId.value === null) return false
    try {
      return (await fetchStatusCode(entityId.value)) === SYNC_ERROR_STATUS
    } catch {
      return false
    }
  }

  function askDecision(id: number, decisionType: DecisionType, targetEntityId: number | null = null) {
    type.value = decisionType
    requestId.value = id
    entityId.value = targetEntityId
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
