import { describe, expect, it, vi } from 'vitest'
import { buildMultipartBody } from '@/utils/attachments'
import { safeRedirect } from '@/utils/redirect'
import { toSortParam } from '@/utils/sort'
import { getStoredTheme, storeTheme } from '@/utils/theme'
import { useError } from '@/utils/useError'
import { useGetDetail, useGetTable } from '@/utils/useGet'
import { useMutateAction, useMutateForm } from '@/utils/useMutation'
import { ApiRequestError } from '@/lib/http'

describe('safeRedirect', () => {
  it('acepta solo rutas internas', () => {
    expect(safeRedirect('/contracts?x=1')).toBe('/contracts?x=1')
    expect(safeRedirect('//evil.com')).toBeNull()
    expect(safeRedirect('/\\evil.com')).toBeNull()
    expect(safeRedirect('https://evil.com')).toBeNull()
    expect(safeRedirect(undefined)).toBeNull()
    expect(safeRedirect(['/a'])).toBeNull()
  })
})

describe('toSortParam', () => {
  it('traduce la clave de columna', () => {
    expect(toSortParam(undefined)).toBeUndefined()
    expect(toSortParam({ key: 'name', order: 'asc' })).toBe('name,asc')
    expect(toSortParam({ key: 'statusName', order: 'desc' }, { statusName: 'status.name' })).toBe(
      'status.name,desc',
    )
  })
})

describe('theme', () => {
  it('guarda y recupera el tema', () => {
    localStorage.clear()
    expect(getStoredTheme()).toBe('light')
    storeTheme('dark')
    expect(getStoredTheme()).toBe('dark')
  })

  it('tolera un almacenamiento no disponible', () => {
    const blocked = () => {
      throw new Error('blocked')
    }
    vi.stubGlobal('localStorage', { getItem: blocked, setItem: blocked })
    expect(getStoredTheme()).toBe('light')
    expect(() => storeTheme('dark')).not.toThrow()
    vi.unstubAllGlobals()
  })
})

describe('useError', () => {
  it('normaliza errores de la API y desconocidos', () => {
    const { normalizeError } = useError()
    const apiError = new ApiRequestError({
      status: 400,
      name: 'Bad',
      message: 'Dato inválido',
      errorFields: { a: 'x' },
    })
    expect(normalizeError(apiError)).toEqual({ message: 'Dato inválido', fieldErrors: { a: 'x' } })
    expect(normalizeError(new Error('boom'))).toEqual({
      message: 'Ocurrió un error inesperado al procesar la solicitud.',
      fieldErrors: null,
    })
  })
})

describe('useGetDetail', () => {
  it('mapea el resultado', async () => {
    await expect(useGetDetail(async (id: number) => id * 2, 2, (n) => `v${n}`)).resolves.toBe('v4')
  })

  it('notifica y relanza el error', async () => {
    const onError = vi.fn()
    const error = new Error('x')
    await expect(useGetDetail(() => Promise.reject(error), 1, (n) => n, onError)).rejects.toBe(error)
    expect(onError).toHaveBeenCalledWith(error)
    await expect(useGetDetail(() => Promise.reject(error), 1, (n) => n)).rejects.toBe(error)
  })
})

describe('useGetTable', () => {
  const page = {
    items: [1, 2],
    pagination: { page: 0, size: 2, total: 2, pageCount: 1 },
    otherData: { c: 1 },
  }

  it('arma la página y avisa éxito si hay datos', async () => {
    const onSuccess = vi.fn()
    const result = await useGetTable(async () => page, {}, (items) => items.map(String), onSuccess)
    expect(result).toEqual({
      data: ['1', '2'],
      meta: { total: 2, pageCount: 1, currentPage: 1, otherData: { c: 1 } },
    })
    expect(onSuccess).toHaveBeenCalledWith(['1', '2'])
  })

  it('no avisa éxito sin datos y funciona sin callbacks', async () => {
    const onSuccess = vi.fn()
    await useGetTable(async () => ({ ...page, items: [] }), {}, (i) => i, onSuccess)
    expect(onSuccess).not.toHaveBeenCalled()
    await useGetTable(async () => page, {}, (i) => i)
  })

  it('relanza errores', async () => {
    const onError = vi.fn()
    const error = new Error('x')
    await expect(useGetTable(() => Promise.reject(error), {}, (i) => i, undefined, onError)).rejects.toBe(error)
    expect(onError).toHaveBeenCalledWith(error)
    await expect(useGetTable(() => Promise.reject(error), {}, (i) => i)).rejects.toBe(error)
  })
})

describe('mutaciones', () => {
  it('useMutateForm mapea el formulario y llama a la API', async () => {
    const api = vi.fn(async (p: { n: number }) => p.n)
    await expect(useMutateForm(api, { v: '3' }, (f) => ({ n: Number(f.v) }))).resolves.toBe(3)
  })

  it('useMutateForm y useMutateAction notifican errores', async () => {
    const error = new Error('x')
    const onError = vi.fn()
    await expect(useMutateForm(() => Promise.reject(error), {}, () => ({}), onError)).rejects.toBe(error)
    await expect(useMutateAction(() => Promise.reject(error), 1, onError)).rejects.toBe(error)
    expect(onError).toHaveBeenCalledTimes(2)
    await expect(useMutateForm(() => Promise.reject(error), {}, () => ({}))).rejects.toBe(error)
    await expect(useMutateAction(() => Promise.reject(error), 1)).rejects.toBe(error)
  })

  it('useMutateAction devuelve el resultado', async () => {
    await expect(useMutateAction(async (n: number) => n + 1, 1)).resolves.toBe(2)
  })
})

describe('buildMultipartBody', () => {
  it('arma data y archivos nuevos', async () => {
    const file = new File(['abc'], 'a.pdf')
    const body = buildMultipartBody({ x: 1 }, [
      { id: 5, name: 'viejo' },
      { file, type: 'CONTRACT' },
      { file, name: 'otro', type: 'CONTRACT' },
    ] as never)
    expect(body.getAll('files')).toHaveLength(2)
    const data = JSON.parse(await (body.get('data') as Blob).text())
    expect(data.attachments).toEqual([
      { id: 5, name: 'viejo' },
      { fileIndex: 0, name: 'a.pdf', type: 'CONTRACT' },
      { fileIndex: 1, name: 'otro', type: 'CONTRACT' },
    ])
  })

  it('con items null no envía attachments', async () => {
    const body = buildMultipartBody({ x: 1 }, null)
    expect(JSON.parse(await (body.get('data') as Blob).text())).toEqual({ x: 1 })
  })
})
