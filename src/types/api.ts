export interface Pagination {
  page: number
  size: number
  total: number
  pageCount: number
}

export interface ApiMeta<TOtherData = undefined> {
  pagination?: Pagination
  otherData?: TOtherData
}

export type ApiErrorFields = Record<string, string>

export interface ApiError {
  status: number
  name: string
  message: string
  errorFields?: ApiErrorFields | null
}

export interface ApiResponse<T> {
  data: T
  error: null
  meta: ApiMeta
}

// Las respuestas de lista (BaseListData en el backend) no llevan campo "error".
export interface ApiListResponse<T, TOtherData = undefined> {
  data: T[]
  meta: ApiMeta<TOtherData>
}

export interface ApiErrorResponse {
  data: null
  error: ApiError
  meta: ApiMeta
}

export interface PageResult<T, TOtherData = undefined> {
  items: T[]
  pagination: Pagination
  otherData?: TOtherData
}

export interface PageQuery {
  page?: number
  size?: number
}
