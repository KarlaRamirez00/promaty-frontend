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

export function formatDate(value: string | null | undefined, fallback = 'Sin fecha'): string {
  if (!value) return fallback
  const date = new Date(value)
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
