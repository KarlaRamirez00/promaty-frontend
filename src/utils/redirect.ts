// Solo se aceptan rutas internas: "//host" y "/\host" las interpretan los navegadores como otro origen.
export function safeRedirect(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const isInternalPath = raw.startsWith('/') && !raw.startsWith('//') && !raw.startsWith('/\\')
  return isInternalPath ? raw : null
}
