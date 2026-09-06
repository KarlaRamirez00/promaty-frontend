import type { PageResult } from '@/types/api'

type QueryErrorHandler = (error: unknown) => void

export interface TablePage<TData> {
  data: TData[]
  meta: {
    total: number
    pageCount: number
    currentPage: number
  }
}

// Detalle simple (una sola entidad, sin paginación)
export async function useGetDetail<TParams, TRaw, TData>(
  apiFn: (params: TParams) => Promise<TRaw>,
  params: TParams,
  mapper: (data: TRaw) => TData,
  onError?: QueryErrorHandler,
): Promise<TData> {
  try {
    const raw = await apiFn(params)
    return mapper(raw)
  } catch (error) {
    onError?.(error)
    throw error
  }
}

// Tabla paginada
export async function useGetTable<TParams, TRaw, TData>(
  apiFn: (params: TParams) => Promise<PageResult<TRaw>>,
  params: TParams,
  mapper: (data: TRaw[]) => TData[],
  onSuccess?: (data: TData[]) => void,
  onError?: QueryErrorHandler,
): Promise<TablePage<TData>> {
  try {
    const result = await apiFn(params)
    const data = mapper(result.items)
    if (data.length > 0) onSuccess?.(data)
    return {
      data,
      meta: {
        total: result.pagination.total,
        pageCount: result.pagination.pageCount,
        currentPage: result.pagination.page + 1,
      },
    }
  } catch (error) {
    onError?.(error)
    throw error
  }
}
