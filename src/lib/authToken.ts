const STORAGE_KEY = 'promaty.auth.token'

let cachedToken: string | null = readFromStorage()

function readFromStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function getToken(): string | null {
  return cachedToken
}

export function setToken(token: string): void {
  cachedToken = token
  try {
    localStorage.setItem(STORAGE_KEY, token)
  } catch {
    // El almacenamiento puede no estar disponible (modo privado); la sesión sigue en memoria.
  }
}

// `storage` solo se dispara en las demás pestañas, nunca en la que escribió el token.
export function onTokenChangedByAnotherTab(handler: () => void): void {
  globalThis.addEventListener('storage', (event) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return
    cachedToken = readFromStorage()
    handler()
  })
}

export function clearToken(): void {
  cachedToken = null
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
