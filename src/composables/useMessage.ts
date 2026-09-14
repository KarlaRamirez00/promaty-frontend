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

  function toastFailed(messages: ErrorMessages) {
    snackbar.error(messages.toastError)
  }

  return { toastSaved, toastToggled, toastFailed }
}
