import type { SortDirection } from '@/types/sort'

// Convierte el orden de la tabla al parámetro `sort` del backend, traduciendo la clave de columna
// al campo de entidad cuando difieren (ej. 'statusName' → 'status.name').
export function toSortParam(
  sort: { key: string; order: SortDirection } | undefined,
  fieldMap: Record<string, string> = {},
): string | undefined {
  if (!sort) return undefined
  return `${fieldMap[sort.key] ?? sort.key},${sort.order}`
}
