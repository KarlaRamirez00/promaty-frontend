type MutationErrorHandler = (error: unknown) => void

// Mutación con formulario (crear/editar) — necesita mapper form → payload
export async function useMutateForm<TForm, TPayload, TResult>(
  apiFn: (payload: TPayload) => Promise<TResult>,
  form: TForm,
  mapper: (form: TForm) => TPayload,
  onError?: MutationErrorHandler,
): Promise<TResult> {
  try {
    const payload = mapper(form)
    return await apiFn(payload)
  } catch (error) {
    onError?.(error)
    throw error
  }
}

// Mutación sin formulario (activar/desactivar, aprobar, rechazar) — payload ya listo
export async function useMutateAction<TPayload, TResult>(
  apiFn: (payload: TPayload) => Promise<TResult>,
  payload: TPayload,
  onError?: MutationErrorHandler,
): Promise<TResult> {
  try {
    return await apiFn(payload)
  } catch (error) {
    onError?.(error)
    throw error
  }
}
