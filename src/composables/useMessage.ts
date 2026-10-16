import { useSnackbarStore } from '@/stores'

interface ToastText {
  title: string
  message?: string
}

interface SaveMessages {
  toastCreate: ToastText
  toastUpdate: ToastText
}

interface ToggleMessages {
  toastActivate: ToastText
  toastDeactivate: ToastText
}

interface DecisionMessages {
  toastApprove: ToastText
  toastValidate: ToastText
  toastReject: ToastText
}

interface BlockMessages {
  toastBlock: ToastText
  toastUnblock: ToastText
}

interface ErrorMessages {
  toastError: ToastText
}

export function useMessage() {
  const snackbar = useSnackbarStore()

  function toastSaved(id: number | string | null, messages: SaveMessages) {
    snackbar.success(id ? messages.toastUpdate : messages.toastCreate)
  }

  function toastToggled(wasActive: boolean, messages: ToggleMessages) {
    snackbar.success(wasActive ? messages.toastDeactivate : messages.toastActivate)
  }

  function toastDecided(type: 'APPROVE' | 'VALIDATE' | 'REJECT', messages: DecisionMessages) {
    const text = {
      APPROVE: messages.toastApprove,
      VALIDATE: messages.toastValidate,
      REJECT: messages.toastReject,
    }[type]
    snackbar.success(text)
  }

  function toastBlocked(type: 'BLOCK' | 'UNBLOCK', messages: BlockMessages) {
    snackbar.success(type === 'BLOCK' ? messages.toastBlock : messages.toastUnblock)
  }

  function toastFailed(messages: ErrorMessages) {
    snackbar.error(messages.toastError)
  }

  return { toastSaved, toastToggled, toastDecided, toastBlocked, toastFailed }
}
