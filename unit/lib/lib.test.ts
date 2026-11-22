import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ApiRequestError, authApi, rrhhApi, unwrap, unwrapPage } from '@/lib/http'
import { clearToken, getToken, onTokenChangedByAnotherTab, setToken } from '@/lib/authToken'
import { decodeJwt } from '@/lib/jwt'

function fail(status: number | null, data?: unknown, code?: string): AxiosAdapter {
  return (config) => {
    const response =
      status === null ? undefined : ({ status, data, config, headers: {}, statusText: '' } as AxiosResponse)
    return Promise.reject(new AxiosError('fail', code, config as InternalAxiosRequestConfig, null, response))
  }
}

describe('ApiRequestError', () => {
  it('toma los campos del error y la meta', () => {
    const error = new ApiRequestError({ status: 429, name: 'ACCOUNT_LOCKED', message: 'm' }, { retryAfterSeconds: 30 })
    expect(error).toMatchObject({ status: 429, apiName: 'ACCOUNT_LOCKED', errorFields: null, retryAfterSeconds: 30 })
    expect(new ApiRequestError({ status: 400, name: 'x', message: 'm' }).retryAfterSeconds).toBeNull()
  })
})

describe('unwrap', () => {
  it('extrae data y arma la paginación', () => {
    expect(unwrap({ data: { data: 7 } } as never)).toBe(7)
    expect(unwrapPage({ data: { data: [1, 2], meta: {} } } as never)).toEqual({
      items: [1, 2],
      pagination: { page: 1, size: 2, total: 2, pageCount: 1 },
      otherData: undefined,
    })
    const pagination = { page: 0, size: 10, total: 30, pageCount: 3 }
    expect(unwrapPage({ data: { data: [], meta: { pagination, otherData: 'o' } } } as never)).toEqual({
      items: [],
      pagination,
      otherData: 'o',
    })
  })
})

describe('clientes http', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('agrega el token a la petición', async () => {
    setToken('tok')
    let header: unknown
    rrhhApi.defaults.adapter = (config) => {
      header = config.headers.get('Authorization')
      return Promise.resolve({ status: 200, data: {}, config, headers: {}, statusText: '' } as AxiosResponse)
    }
    await rrhhApi.get('/x')
    expect(header).toBe('Bearer tok')
    clearToken()
    await rrhhApi.get('/x')
    expect(header).toBeUndefined()
  })

  it('normaliza el error del backend', async () => {
    authApi.defaults.adapter = fail(400, { error: { status: 400, name: 'BAD', message: 'Malo' }, meta: {} })
    await expect(authApi.get('/x')).rejects.toMatchObject({ name: 'ApiRequestError', message: 'Malo', apiName: 'BAD' })
  })

  it('normaliza errores de red y desconocidos', async () => {
    authApi.defaults.adapter = fail(null, undefined, 'ERR_NETWORK')
    await expect(authApi.get('/x')).rejects.toMatchObject({ apiName: 'NetworkError', status: 0 })
    authApi.defaults.adapter = fail(500, {})
    await expect(authApi.get('/x')).rejects.toMatchObject({ apiName: 'UnexpectedError', status: 500 })
  })

  it('un 401 en un cliente con sesión cierra sesión y redirige', async () => {
    setToken('tok')
    const location = { pathname: '/contracts', search: '?a=1', href: '' }
    vi.stubGlobal('location', location)
    Object.defineProperty(window, 'location', { value: location, configurable: true })
    rrhhApi.defaults.adapter = fail(401, { error: { status: 401, name: 'U', message: 'm' }, meta: {} })

    await expect(rrhhApi.get('/x')).rejects.toBeInstanceOf(ApiRequestError)
    expect(getToken()).toBeNull()
    expect(location.href).toBe('/login?redirect=%2Fcontracts%3Fa%3D1')

    location.pathname = '/'
    await expect(rrhhApi.get('/x')).rejects.toBeInstanceOf(ApiRequestError)
    expect(location.href).toBe('/login')

    location.href = 'intacto'
    location.pathname = '/login'
    await expect(rrhhApi.get('/x')).rejects.toBeInstanceOf(ApiRequestError)
    expect(location.href).toBe('intacto')
    vi.unstubAllGlobals()
  })
})

describe('authToken', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('recordar guarda en localStorage y no recordar en sessionStorage', () => {
    setToken('a', true)
    expect(localStorage.getItem('promaty.auth.token')).toBe('a')
    expect(sessionStorage.getItem('promaty.auth.token')).toBeNull()
    setToken('b')
    expect(sessionStorage.getItem('promaty.auth.token')).toBe('b')
    expect(localStorage.getItem('promaty.auth.token')).toBeNull()
    expect(getToken()).toBe('b')
    clearToken()
    expect(getToken()).toBeNull()
  })

  it('tolera un almacenamiento bloqueado', () => {
    const blocked = () => {
      throw new Error('blocked')
    }
    vi.stubGlobal('localStorage', { getItem: blocked, setItem: blocked, removeItem: blocked })
    expect(() => setToken('x')).not.toThrow()
    expect(getToken()).toBe('x')
    expect(() => clearToken()).not.toThrow()
    vi.unstubAllGlobals()
  })

  it('reacciona a cambios de otra pestaña', () => {
    const handler = vi.fn()
    onTokenChangedByAnotherTab(handler)
    const fire = (init: StorageEventInit) => window.dispatchEvent(new StorageEvent('storage', init))

    fire({ storageArea: sessionStorage, key: 'promaty.auth.token' })
    fire({ storageArea: localStorage, key: 'otra' })
    expect(handler).not.toHaveBeenCalled()

    localStorage.setItem('promaty.auth.token', 'nuevo')
    fire({ storageArea: localStorage, key: 'promaty.auth.token' })
    expect(getToken()).toBe('nuevo')
    fire({ storageArea: localStorage, key: null })
    expect(handler).toHaveBeenCalledTimes(2)
  })
})

describe('decodeJwt', () => {
  it('decodifica un token válido y rechaza uno corrupto', () => {
    const payload = btoa(JSON.stringify({ sub: '1', exp: 1 }))
    expect(decodeJwt(`h.${payload}.s`)).toMatchObject({ sub: '1' })
    expect(decodeJwt('basura')).toBeNull()
  })
})
