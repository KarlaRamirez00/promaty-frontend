import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface ToastContent {
  title: string
  message?: string
  code?: string
}

interface Toast extends ToastContent {
  variant: ToastVariant
}

export const useSnackbarStore = defineStore('snackbar', () => {
  const current = ref<Toast | null>(null)
  const visible = ref(false)
  const queue: Toast[] = []

  function showNext() {
    if (visible.value || queue.length === 0) return
    current.value = queue.shift() ?? null
    visible.value = true
  }

  function push(variant: ToastVariant, content: ToastContent) {
    queue.push({ variant, ...content })
    showNext()
  }

  function dismiss() {
    visible.value = false
    setTimeout(() => {
      current.value = null
      showNext()
    }, 150)
  }

  return {
    current,
    visible,
    dismiss,
    success: (content: ToastContent) => push('success', content),
    error: (content: ToastContent) => push('error', content),
    warning: (content: ToastContent) => push('warning', content),
    info: (content: ToastContent) => push('info', content),
  }
})
