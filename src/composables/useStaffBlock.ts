import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { blockStaffAction, getStaffStatusOptionsAction, unblockStaffAction } from '@/actions'
import { useBackendFieldErrors } from '@/composables/useBackendFieldErrors'
import { useMessage } from '@/composables/useMessage'
import messages from '@/messages'
import { STAFF_STATUS_CODE, type StaffBlockForm } from '@/models'
import BlockStaffDialog, { type StaffBlockType } from '@/components/common/BlockStaffDialog.vue'

interface BlockVariables {
  type: StaffBlockType
  id: number
  form: StaffBlockForm
}

const STATUS_OPTIONS_KEY = ['staff', 'statusOptions']

const TARGET_STATUS_CODE: Record<StaffBlockType, string> = {
  BLOCK: STAFF_STATUS_CODE.BLOCKED,
  UNBLOCK: STAFF_STATUS_CODE.ACTIVE,
}

// Bloquear o desbloquear un colaborador: el cambio es inmediato, sin aprobación de terceros.
export function useStaffBlock() {
  const queryClient = useQueryClient()
  const { toastBlocked, toastFailed } = useMessage()
  const { backendErrorFields, setFromError, clear: clearBackendErrors } = useBackendFieldErrors()

  const dialogRef = ref<InstanceType<typeof BlockStaffDialog> | null>(null)
  const type = ref<StaffBlockType>('BLOCK')
  const staffId = ref<number | null>(null)

  const mutation = useMutation({
    mutationFn: async ({ type, id, form }: BlockVariables) => {
      const statuses = await queryClient.ensureQueryData({
        queryKey: STATUS_OPTIONS_KEY,
        queryFn: getStaffStatusOptionsAction,
      })
      const code = TARGET_STATUS_CODE[type]
      const target = statuses.find((status) => status.code === code)
      if (!target) throw new Error(`No se encontró el estado ${code} en el catálogo de colaboradores`)
      return type === 'BLOCK' ? blockStaffAction(id, target.id, form) : unblockStaffAction(id, target.id)
    },
    onSuccess: (_data, { type }) => {
      dialogRef.value?.close()
      toastBlocked(type, messages.staff)
      return queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
    onError: (error: unknown) => {
      if (!setFromError(error)) toastFailed(messages.staff)
    },
  })

  function askChange(id: number, changeType: StaffBlockType) {
    type.value = changeType
    staffId.value = id
    clearBackendErrors()
    dialogRef.value?.open()
  }

  function askBlock(id: number) {
    askChange(id, 'BLOCK')
  }

  function askUnblock(id: number) {
    askChange(id, 'UNBLOCK')
  }

  function confirmChange(form: StaffBlockForm) {
    if (staffId.value === null) return
    clearBackendErrors()
    mutation.mutate({ type: type.value, id: staffId.value, form })
  }

  function setDialogRef(el: unknown) {
    dialogRef.value = el as InstanceType<typeof BlockStaffDialog> | null
  }

  return {
    setDialogRef,
    type,
    backendErrorFields,
    isPending: mutation.isPending,
    askBlock,
    askUnblock,
    confirmChange,
  }
}
