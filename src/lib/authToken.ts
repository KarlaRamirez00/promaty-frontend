const STORAGE_KEY = 'promaty.auth.token'

let cachedToken: string | null = readFromStorage()

function readFromStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function getToken(): string | null {
  return cachedToken
}

// Recordar la sesión la guarda en localStorage; sin recordarla, vive solo mientras dure la pestaña.
export function setToken(token: string, remember = false): void {
  cachedToken = token
  try {
    const [target, other] = remember ? [localStorage, sessionStorage] : [sessionStorage, localStorage]
    target.setItem(STORAGE_KEY, token)
    other.removeItem(STORAGE_KEY)
  } catch {
    // El almacenamiento puede no estar disponible (modo privado); la sesión sigue en memoria.
  }
}

// `storage` solo se dispara en las demás pestañas, nunca en la que escribió el token.
export function onTokenChangedByAnotherTab(handler: () => void): void {
  globalThis.addEventListener('storage', (event) => {
    if (event.storageArea !== localStorage) return
    if (event.key !== null && event.key !== STORAGE_KEY) return
    cachedToken = readFromStorage()
    handler()
  })
}

export function clearToken(): void {
  cachedToken = null
  try {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {}
}
