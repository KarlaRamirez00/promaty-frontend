// Validadores puros y componibles. Cada uno recibe el mensaje a mostrar y devuelve la función
// de validación: (value) => null si es válido, o el mensaje de error si no lo es.
export type Validator = (value: string) => string | null

export const required =
  (message: string): Validator =>
  (value) =>
    value.trim() ? null : message

// Chequeo estructural en vez de una sola regex con cuantificadores encadenados
// (SonarQube: "super-linear-regex" — riesgo de backtracking catastrófico ante input malicioso).
export const email =
  (message: string): Validator =>
  (value) => {
    const [local, domain, ...rest] = value.trim().split('@')
    const isValid =
      rest.length === 0 &&
      !!local &&
      !!domain &&
      domain.includes('.') &&
      !domain.startsWith('.') &&
      !domain.endsWith('.')
    return isValid ? null : message
  }

export const minLength =
  (length: number, message: string): Validator =>
  (value) =>
    value.trim().length >= length ? null : message

export const maxLength =
  (length: number, message: string): Validator =>
  (value) =>
    value.trim().length <= length ? null : message

export const pattern =
  (regex: RegExp, message: string): Validator =>
  (value) =>
    regex.test(value) ? null : message

// Corre las reglas en orden y devuelve el primer mensaje de error, o null si todas pasan.
export function firstError(value: string, rules: Validator[]): string | null {
  for (const rule of rules) {
    const error = rule(value)
    if (error) return error
  }
  return null
}
