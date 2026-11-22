import type { AxiosAdapter, AxiosResponse } from 'axios'
import { authApi, rrhhApi, userApi } from '@/lib/http'

export interface RecordedRequest {
  method: string
  url: string
  params?: Record<string, unknown>
  data?: unknown
}

// Reemplaza el adaptador de los tres clientes: registra cada petición y responde con un sobre
// genérico (data vacío), suficiente para que unwrap/unwrapPage y los `.map` de los servicios corran.
export function recordHttp(body: unknown = { data: [], error: null, meta: {} }) {
  const calls: RecordedRequest[] = []
  const adapter: AxiosAdapter = (config) => {
    calls.push({
      method: String(config.method).toLowerCase(),
      url: String(config.url),
      params: config.params,
      data: config.data,
    })
    const data = config.responseType === 'blob' ? new Blob(['x']) : body
    return Promise.resolve({ status: 200, statusText: 'OK', headers: {}, config, data } as AxiosResponse)
  }
  for (const client of [authApi, rrhhApi, userApi]) client.defaults.adapter = adapter
  return calls
}
