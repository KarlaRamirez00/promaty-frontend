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

export function clearToken(): void {
  cachedToken = null
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
