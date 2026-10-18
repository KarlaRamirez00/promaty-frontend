import { shallowRef } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useMessage, type ErrorMessages, type ToggleMessages } from '@/composables/useMessage'
import ConfirmStatusDialog from '@/components/common/ConfirmStatusDialog.vue'

export interface ToggleRecord {
  id: number
  name: string
  active: boolean
}

interface ToggleActiveOptions<TRecord extends ToggleRecord> {
  // Raíz de la clave de caché del listado que se invalida al terminar.
  resource: string
  toggle: (record: TRecord) => Promise<unknown>
  messages: ToggleMessages & ErrorMessages
  closeDetail: () => void
}

// Diálogo de confirmación, mutación y toast de activar o desactivar un registro.
export function useToggleActive<TRecord extends ToggleRecord>(options: ToggleActiveOptions<TRecord>) {
  const queryClient = useQueryClient()
  const { toastToggled, toastFailed } = useMessage()

  const dialogRef = shallowRef<InstanceType<typeof ConfirmStatusDialog> | null>(null)
  const record = shallowRef<TRecord | null>(null)

  const mutation = useMutation({
    mutationFn: (target: TRecord) => options.toggle(target),
    onSuccess: (_data, target) => {
      options.closeDetail()
      dialogRef.value?.close()
      toastToggled(target.active, options.messages)
      return queryClient.invalidateQueries({ queryKey: [options.resource] })
    },
    onError: () => {
      toastFailed(options.messages)
    },
  })

  function ask(item: TRecord) {
    record.value = item
    dialogRef.value?.open()
  }

  function confirm() {
    if (record.value) mutation.mutate(record.value)
  }

  function setDialogRef(el: unknown) {
    dialogRef.value = el as InstanceType<typeof ConfirmStatusDialog> | null
  }

  return { setDialogRef, record, isPending: mutation.isPending, ask, confirm }
}
