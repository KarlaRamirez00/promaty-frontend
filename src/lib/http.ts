import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from 'axios'
import type {
  ApiError,
  ApiErrorFields,
  ApiErrorResponse,
  ApiListResponse,
  ApiResponse,
  PageResult,
} from '@/types/api'
import { clearToken, getToken } from '@/lib/authToken'

export class ApiRequestError extends Error {
  readonly status: number
  readonly apiName: string
  readonly errorFields: ApiErrorFields | null

  constructor(error: ApiError) {
    super(error.message)
    this.name = 'ApiRequestError'
    this.status = error.status
    this.apiName = error.name
    this.errorFields = error.errorFields ?? null
  }
}

function normalizeError(error: AxiosError<ApiErrorResponse>): ApiRequestError {
  const apiError = error.response?.data?.error
  if (apiError) {
    return new ApiRequestError(apiError)
  }

  const offline = error.code === 'ERR_NETWORK' || !error.response
  return new ApiRequestError({
    status: error.response?.status ?? 0,
    name: offline ? 'NetworkError' : 'UnexpectedError',
    message: offline
      ? 'No se pudo conectar con el servidor.'
      : 'Ocurrió un error inesperado al procesar la solicitud.',
    errorFields: null,
  })
}

// 401 = el token dejó de servir (venció, secreto cambió, etc.): cierra la sesión y manda a login.
// 403 (permiso insuficiente estando autenticado) nunca pasa por acá — ese caso ya lo resuelve el guard de rutas.
function redirectToLoginOnSessionExpired(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {
      if (error.response?.status === 401 && window.location.pathname !== '/login') {
        clearToken()
        window.location.href = '/login'
      }
      return Promise.reject(error)
    },
  )
}

function createClient(baseURL: string, options: { sessionAware?: boolean } = {}): AxiosInstance {
  const client = axios.create({ baseURL, timeout: 15000 })

  client.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }
    return config
  })

  // sessionAware queda fuera de authApi: un 401 ahí es "credenciales inválidas" en el propio
  // login, no una sesión vencida, y no debe gatillar el redirect.
  if (options.sessionAware) {
    redirectToLoginOnSessionExpired(client)
  }

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => Promise.reject(normalizeError(error)),
  )

  return client
}

// Punto único donde se compone la base URL de cada servicio: hoy un puerto por servicio, el día
// que exista gateway-server se cambia acá a `${VITE_API_URL}/api/<servicio>` sin tocar las llamadas.
const API_BASE_URL = {
  auth: import.meta.env.VITE_AUTH_API_URL,
  user: import.meta.env.VITE_USER_API_URL,
  rrhh: import.meta.env.VITE_RRHH_API_URL,
}

export const authApi = createClient(API_BASE_URL.auth)
export const userApi = createClient(API_BASE_URL.user, { sessionAware: true })
export const rrhhApi = createClient(API_BASE_URL.rrhh, { sessionAware: true })

export function unwrap<T>(response: AxiosResponse<ApiResponse<T>>): T {
  return response.data.data
}

export function unwrapPage<T>(response: AxiosResponse<ApiListResponse<T>>): PageResult<T> {
  const { data, meta } = response.data
  return {
    items: data,
    pagination: meta.pagination ?? {
      page: 1,
      size: data.length,
      total: data.length,
      pageCount: 1,
    },
  }
}
