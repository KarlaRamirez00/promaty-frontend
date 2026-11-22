import { describe, expect, it } from 'vitest'
import * as mappers from '@/mappers'

const STAMPS = {
  createdAt: '2026-03-05T10:00:00',
  updatedAt: '2026-03-06T11:30:00',
  createdBy: 'ana',
  updatedBy: 'luis',
  actions: ['UPDATE'],
}

const ACTIVE = { label: 'Activo', color: 'success' }
const INACTIVE = { label: 'Inactivo', color: 'grey' }

// Mantenedores simples: mismo contrato lista → detalle → payload, con un Activo/Inactivo.
const CATALOGS = [
  { name: 'Client', list: mappers.mapperClientList, detail: mappers.mapperClientDetail, payload: mappers.mapperClientFormToPayload },
  { name: 'ProjectType', list: mappers.mapperProjectTypeList, detail: mappers.mapperProjectTypeDetail, payload: mappers.mapperProjectTypeFormToPayload },
  { name: 'ProjectSpecialty', list: mappers.mapperProjectSpecialtyList, detail: mappers.mapperProjectSpecialtyDetail, payload: mappers.mapperProjectSpecialtyFormToPayload },
  { name: 'NonRehireReason', list: mappers.mapperNonRehireReasonList, detail: mappers.mapperNonRehireReasonDetail, payload: mappers.mapperNonRehireReasonFormToPayload },
  { name: 'RequestRejectionReason', list: mappers.mapperRequestRejectionReasonList, detail: mappers.mapperRequestRejectionReasonDetail, payload: mappers.mapperRequestRejectionReasonFormToPayload },
] as const

describe.each(CATALOGS)('mapper de $name', ({ list, detail, payload }) => {
  const raw = { id: 1, name: 'Nombre', description: 'Desc', subModule: 'contract', active: true, ...STAMPS }

  it('lista: formatea la fecha y arma el chip de estado', () => {
    const [active, inactive] = (list as (items: unknown[]) => Record<string, unknown>[])([
      raw,
      { ...raw, id: 2, active: false },
    ])
    expect(active).toMatchObject({ id: 1, name: 'Nombre', updatedAt: '06-03-2026', status: ACTIVE, actions: ['UPDATE'] })
    expect(inactive.status).toEqual(INACTIVE)
  })

  it('detalle: formatea fechas con hora y conserva la auditoría', () => {
    const result = (detail as (raw: unknown) => Record<string, unknown>)(raw)
    expect(result).toMatchObject({
      id: 1,
      name: 'Nombre',
      status: ACTIVE,
      createdAt: '05-03-2026, 10:00 h',
      updatedAt: '06-03-2026, 11:30 h',
      createdBy: 'ana',
      updatedBy: 'luis',
    })
  })

  it('payload: recorta espacios', () => {
    const result = (payload as (form: unknown) => Record<string, unknown>)({
      name: '  Nombre  ',
      description: '  Desc ',
      subModule: 'contract',
    })
    expect(result.name).toBe('Nombre')
  })
})

describe('mapper de Project', () => {
  const raw = {
    id: 1,
    name: 'Obra',
    costCenterCode: 'CC1',
    typeName: 'T',
    specialtyName: 'S',
    clientName: 'C',
    statusName: 'En curso',
    statusCode: 'IN_PROGRESS',
    startDate: '2026-01-31',
    endDate: null,
    type: { id: 1, name: 'T' },
    specialty: { id: 2, name: 'S' },
    client: { id: 3, name: 'C' },
    status: { id: 4, code: 'IN_PROGRESS', name: 'En curso' },
    ...STAMPS,
  }

  it('lista y detalle formatean fechas puras sin desfase', () => {
    const [item] = mappers.mapperProjectList([raw] as never)
    expect(item).toMatchObject({ startDate: '31-01-2026', endDate: 'S/F', costCenterCode: 'CC1' })
    const detail = mappers.mapperProjectDetail(raw as never)
    expect(detail).toMatchObject({ startDateRaw: '2026-01-31', endDateRaw: null, startDate: '31-01-2026' })
  })

  it('payload recorta texto y conserva fechas', () => {
    expect(
      mappers.mapperProjectFormToPayload({
        name: ' Obra ',
        costCenterCode: ' CC ',
        typeId: 1,
        specialtyId: 2,
        clientId: 3,
        startDate: '2026-01-01',
        endDate: null,
      } as never),
    ).toEqual({ name: 'Obra', costCenterCode: 'CC', typeId: 1, specialtyId: 2, clientId: 3, startDate: '2026-01-01', endDate: null })
  })
})

describe('mapper de Role', () => {
  const raw = {
    id: 1,
    name: 'Admin',
    description: 'd',
    active: false,
    totalUsers: 3,
    permissions: [{ id: 1 }],
    subModules: [],
    ...STAMPS,
  }

  it('lista y detalle', () => {
    expect(mappers.mapperRoleList([raw] as never)[0]).toMatchObject({ status: INACTIVE, totalUsers: 3 })
    expect(mappers.mapperRoleDetail(raw as never)).toMatchObject({ permissions: [{ id: 1 }], createdAt: '05-03-2026, 10:00 h' })
  })

  it('payload manda null si la descripción queda vacía', () => {
    expect(mappers.mapperRoleFormToPayload({ name: ' A ', description: '  ', permissionIds: [1] } as never)).toEqual({
      name: 'A',
      description: null,
      permissionIds: [1],
    })
    expect(mappers.mapperRoleFormToPayload({ name: 'A', description: ' d ', permissionIds: [] } as never).description).toBe('d')
  })
})

describe('mapper de User', () => {
  const raw = {
    id: 1,
    firstName: 'Ana',
    lastName: 'Paz',
    email: 'a@a.cl',
    phoneNumber: null,
    active: true,
    role: { id: 1, name: 'R' },
    projectIds: [1],
    ...STAMPS,
  }

  it('lista arma el nombre completo', () => {
    expect(mappers.mapperUserList([raw, { ...raw, lastName: '' }] as never).map((u) => u.fullName)).toEqual(['Ana Paz', 'Ana'])
  })

  it('detalle normaliza el teléfono nulo', () => {
    expect(mappers.mapperUserDetail(raw as never).phoneNumber).toBe('')
    expect(mappers.mapperUserDetail({ ...raw, phoneNumber: '912345678' } as never).phoneNumber).toBe('912345678')
  })

  it('payload quita espacios del teléfono', () => {
    expect(
      mappers.mapperUserFormToPayload({
        firstName: ' Ana ',
        lastName: ' Paz ',
        email: ' a@a.cl ',
        phoneNumber: '9 1234 5678',
        roleId: 1,
        projectIds: [2],
      } as never),
    ).toEqual({ firstName: 'Ana', lastName: 'Paz', email: 'a@a.cl', phoneNumber: '912345678', roleId: 1, projectIds: [2] })
  })
})

describe('mapper de Setting', () => {
  const base = { type: 'INTEGER', value: '5', defaultValue: '5', min: 1, max: 9, updatedAt: '2026-03-06T11:30:00' }

  it('agrupa parámetros por grupo conservando el orden', () => {
    const groups = mappers.mapperSettingGroups([
      { ...base, key: 'a', label: 'A', group: 'g1', groupLabel: 'Grupo 1', updatedBy: 'ana' },
      { ...base, key: 'b', label: 'B', group: 'g2', groupLabel: 'Grupo 2', updatedBy: null },
      { ...base, key: 'c', label: 'C', group: 'g1', groupLabel: 'Grupo 1', updatedBy: null },
    ] as never)
    expect(groups.map((g) => [g.key, g.settings.length])).toEqual([['g1', 2], ['g2', 1]])
    expect(groups[0].settings[0].updatedBy).toBe('ana')
    expect(groups[0].settings[1].updatedBy).toBe('S/D')
    expect(groups[0].settings[0].updatedAt).toBe('06-03-2026, 11:30 h')
  })

  it('payload recorta el valor', () => {
    expect(mappers.mapperSettingFormToPayload({ value: ' 7 ' } as never)).toEqual({ value: '7' })
  })
})

describe('mapper de adjuntos', () => {
  it('maneja lista ausente y formatea tamaño y fecha', () => {
    expect(mappers.mapperAttachments(null)).toEqual([])
    expect(mappers.mapperAttachments(undefined)).toEqual([])
    expect(
      mappers.mapperAttachments([
        { id: 1, name: 'a.pdf', fileType: 'pdf', fileSize: 2048, mediaFileId: 'm', updatedAt: '2026-03-06T11:30:00' },
      ] as never),
    ).toEqual([
      { id: 1, name: 'a.pdf', fileType: 'pdf', fileSizeLabel: '2 KB', mediaFileId: 'm', updatedAt: '06-03-2026, 11:30 h' },
    ])
  })
})
