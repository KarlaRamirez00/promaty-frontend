export type ThemeName = 'light' | 'dark'

const THEME_STORAGE_KEY = 'theme'

export function getStoredTheme(): ThemeName {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function storeTheme(theme: ThemeName) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Sin almacenamiento disponible el tema solo dura la sesión actual.
  }
}
