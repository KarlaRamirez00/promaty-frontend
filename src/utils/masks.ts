// Máscaras de input: filtran y formatean mientras el usuario escribe (a diferencia de formats.ts,
// que formatea un valor ya completo solo para mostrarlo en pantalla).

// Whitelist por tipo de dato: todo carácter fuera del conjunto permitido se descarta al escribir o
// pegar, de modo que comillas, <, >, %, &, #, =, ;, :, etc. nunca llegan al modelo.
export type InputMaskType =
  | 'onlyNumbers'
  | 'decimalNumbers'
  | 'onlyLetters'
  | 'lettersAndNumbers'
  | 'freeText'
  | 'rut'
  | 'phone'
  | 'email'
  | 'bankAccount'

const ONLY_DIGITS = (raw: string) => raw.replaceAll(/\D/g, '')

export const INPUT_MASKS: Record<InputMaskType, (raw: string) => string> = {
  onlyNumbers: ONLY_DIGITS,
  decimalNumbers: (raw) => {
    const clean = raw.replaceAll(/[^\d.]/g, '')
    const firstDot = clean.indexOf('.')
    if (firstDot === -1) return clean
    return clean.slice(0, firstDot + 1) + clean.slice(firstDot + 1).replaceAll('.', '')
  },
  onlyLetters: (raw) => raw.replaceAll(/[^\p{L} ]/gu, ''),
  lettersAndNumbers: (raw) => raw.replaceAll(/[^\p{L}\d]/gu, ''),
  freeText: (raw) => raw.replaceAll(/[^\p{L}\d .,_()/$°-]/gu, ''),
  rut: (raw) => maskRut(raw),
  phone: ONLY_DIGITS,
  email: (raw) => raw.replaceAll(/[^A-Za-z\d@._-]/g, ''),
  bankAccount: ONLY_DIGITS,
}

// Deja dígitos y una "K" final, limita el cuerpo a 8 dígitos y agrega puntos y guion al escribir.
export function maskRut(raw: string): string {
  const clean = raw.toUpperCase().replaceAll(/[^0-9K]/g, '')
  if (clean.length <= 1) return clean.replaceAll('K', '')
  const body = clean.slice(0, -1).replaceAll('K', '').slice(0, 8)
  const dv = clean.slice(-1)
  const reversed = body.split('').reverse()
  const formattedBody = reversed.reduce((acc, digit, index) => {
    const withDot = index > 0 && index % 3 === 0 ? `${digit}.` : digit
    return withDot + acc
  }, '')
  return `${formattedBody}-${dv}`
}
