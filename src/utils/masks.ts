// Máscaras de input: filtran y formatean mientras el usuario escribe (a diferencia de formats.ts,
// que formatea un valor ya completo solo para mostrarlo en pantalla).

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
