import { ref } from 'vue'
import { useError } from '@/utils'
import type { ApiErrorFields } from '@/types/api'

export function useBackendFieldErrors() {
  const { normalizeError } = useError()
  const backendErrorFields = ref<ApiErrorFields | null>(null)

  function setFromError(error: unknown): boolean {
    backendErrorFields.value = normalizeError(error).fieldErrors
    return backendErrorFields.value !== null
  }

  function clear() {
    backendErrorFields.value = null
  }

  function hasBackendError(field: string): boolean {
    return !!backendErrorFields.value?.[field]
  }

  return { backendErrorFields, setFromError, clear, hasBackendError }
}
