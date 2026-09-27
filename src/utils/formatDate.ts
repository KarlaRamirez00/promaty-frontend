const formatter = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function toTwoDigits(value: number): string {
  return String(value).padStart(2, '0')
}

// "yyyy-MM-dd" (sin hora) lo manda el backend para fechas puras (ej. Project.startDate). new Date()
// interpreta ese formato como UTC medianoche: en un huso horario detrás de UTC (ej. Chile) cae en
// el día anterior al convertirlo a hora local — se arma con sus componentes para evitarlo.
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function parseDate(value: string): Date {
  if (DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  return new Date(value)
}

export function formatDate(value: string | null | undefined, fallback = 'Sin fecha'): string {
  if (!value) return fallback
  const date = parseDate(value)
  if (Number.isNaN(date.getTime())) return fallback
  return formatter.format(date)
}

export function formatDateTime(value: string | null | undefined, fallback = 'Sin fecha'): string {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  const time = `${toTwoDigits(date.getHours())}:${toTwoDigits(date.getMinutes())} h`
  return `${dateTimeFormatter.format(date)}, ${time}`
}
