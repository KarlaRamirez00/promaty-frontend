import { ApiRequestError } from '@/lib/http'
import type { ApiErrorFields } from '@/types/api'

export interface NormalizedError {
  message: string
  fieldErrors: ApiErrorFields | null
}

const UNEXPECTED_ERROR_MESSAGE = 'Ocurrió un error inesperado al procesar la solicitud.'

function normalizeError(error: unknown): NormalizedError {
  if (error instanceof ApiRequestError) {
    return { message: error.message, fieldErrors: error.errorFields }
  }
  return { message: UNEXPECTED_ERROR_MESSAGE, fieldErrors: null }
}

// Punto único de normalización de errores: todo catch de mutation/query debe pasar por acá
// en vez de resolver el shape del error (instanceof, campos, etc.) de forma ad-hoc.
export function useError() {
  return { normalizeError }
}
