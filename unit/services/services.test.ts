import { beforeEach, describe, expect, it } from 'vitest'
import { recordHttp } from '../helpers/http-recorder'
import * as services from '@/services'
import * as auth from '@/services/auth'
import { listClientsApi, createClientApi, toggleClientActiveApi } from '@/services/clients.api'
import { listContractsApi } from '@/services/contracts.api'
import { listRequestsApi, listRequesterOptionsApi, listRejectionReasonOptionsApi } from '@/services/requests.api'
import { listStaffApi, updateStaffApi, createStaffApi } from '@/services/staff.api'
import { downloadFileApi } from '@/services/files.api'

const SORT = { key: 'name', order: 'asc' as const }
const RICH = {
  search: 'ana',
  active: true,
  statusId: 1,
  statusCode: 'ACTIVE',
  costCenterCode: 'CC',
  projectId: 2,
  contractTypeId: 3,
  annexTypeId: 4,
  requesterUserId: 5,
  createdFrom: '2026-01-01',
  createdTo: '2026-02-01',
  expiringSoon: true,
  clientId: 6,
  projectTypeId: 7,
  projectSpecialtyId: 8,
  specialtyId: 9,
  roleId: 10,
  subModule: 'contract',
  page: 3,
  size: 20,
  sort: SORT,
}
const SPARSE = { page: 1, size: 10, sort: SORT }

let calls: ReturnType<typeof recordHttp>

beforeEach(() => {
  calls = recordHttp()
})

const functions = Object.entries(services).filter(([, value]) => typeof value === 'function') as [
  string,
  (...args: unknown[]) => Promise<unknown>,
][]

describe('servicios: cada función emite exactamente una petición', () => {
  it('expone funciones', () => {
    expect(functions.length).toBeGreaterThan(80)
  })

  for (const [name, fn] of functions) {
    if (name === 'login' || name === 'resetPassword' || name === 'requestPasswordRecovery') continue

    it(`${name} con parámetros completos`, async () => {
      await fn(RICH, [], null)
      expect(calls).toHaveLength(1)
      expect(calls[0].url).toMatch(/^\//)
    })

    it(`${name} con parámetros mínimos`, async () => {
      await fn(SPARSE, [{ name: 'x' }], [])
      expect(calls).toHaveLength(1)
    })
  }
})

describe('contratos de red específicos', () => {
  it('listClientsApi traduce la página a base 0 y omite filtros vacíos', async () => {
    await listClientsApi({ ...SPARSE, search: '', active: null } as never)
    expect(calls[0]).toMatchObject({
      method: 'get',
      url: '/clients',
      params: { search: undefined, active: undefined, page: 0, size: 10, sort: 'name,asc' },
    })
  })

  it('crear y alternar estado usan el verbo correcto', async () => {
    await createClientApi({ name: 'A' })
    await toggleClientActiveApi(4)
    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual(['post /clients', 'patch /clients/4/active'])
  })

  it('listContractsApi traduce columnas de orden y filtros', async () => {
    await listContractsApi({ ...SPARSE, sort: { key: 'fullName', order: 'desc' }, expiringSoon: false } as never)
    expect(calls[0].params).toMatchObject({ sort: 'staffName,desc', expiringSoon: undefined })
  })

  it('listRequestsApi usa el orden de solicitudes', async () => {
    await listRequestsApi({ ...SPARSE, sort: { key: 'status', order: 'asc' } } as never)
    expect(calls[0].params).toMatchObject({ sort: 'statusName,asc' })
  })

  it('listStaffApi traduce firstName', async () => {
    await listStaffApi({ ...SPARSE, sort: { key: 'firstName', order: 'asc' } } as never)
    expect(calls[0].params).toMatchObject({ sort: 'staffName,asc' })
  })

  it('staff multipart incluye el archivo cuando existe', async () => {
    const file = new File(['a'], 'a.pdf')
    await createStaffApi({} as never, file)
    await updateStaffApi(1, {} as never, null)
    const [create, update] = calls.map((c) => c.data as FormData)
    expect(create.get('file')).toBeInstanceOf(File)
    expect(update.get('file')).toBeNull()
  })

  it('descarga archivos como blob', async () => {
    await expect(downloadFileApi('abc')).resolves.toBeInstanceOf(Blob)
    expect(calls[0].url).toBe('/files/abc')
  })

  it('mapea nombres de solicitantes y motivos', async () => {
    calls = recordHttp({ data: [{ id: 1, firstName: 'Ana', lastName: 'Paz ', name: 'M' }], meta: {} })
    await expect(listRequesterOptionsApi()).resolves.toEqual([{ id: 1, name: 'Ana Paz' }])
    await expect(listRejectionReasonOptionsApi('contract')).resolves.toEqual([{ id: 1, name: 'M' }])
  })
})

describe('autenticación', () => {
  it('login devuelve el token', async () => {
    recordHttp({ data: { token: 'tok' }, error: null, meta: {} })
    await expect(auth.login({ email: 'a', password: 'b' })).resolves.toBe('tok')
  })

  it('recuperación y reseteo de clave', async () => {
    const recorded = recordHttp()
    await auth.requestPasswordRecovery('a@a.cl')
    await auth.resetPassword({ email: 'a', resetCode: '1', password: 'x' })
    expect(recorded.map((c) => c.url)).toEqual(['/auth/password-recovery', '/auth/password-reset'])
  })
})
