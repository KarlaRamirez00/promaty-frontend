import { describe, expect, it } from 'vitest'
import * as models from '@/models'

type Fn = (...args: unknown[]) => unknown
const exportsList = Object.entries(models) as [string, unknown][]
const norm = (text: string) => text.replaceAll(/[^a-z\d]/gi, '').toLowerCase()

const functions = exportsList.filter(([, v]) => typeof v === 'function') as [string, Fn][]
const constants = Object.fromEntries(exportsList.filter(([, v]) => typeof v !== 'function'))

const RICH_QUERY = {
  search: 'ana',
  active: 'true',
  statusId: '3',
  statusCode: 'ACTIVE',
  costCenterCode: 'CC-1',
  projectId: '4',
  contractTypeId: '5',
  annexTypeId: '6',
  requesterUserId: '7',
  roleId: '8',
  subModule: 'contract',
  clientId: '9',
  typeId: '10',
  specialtyId: '11',
  createdFrom: '2026-01-01',
  createdTo: '2026-02-01',
  expiringSoon: 'true',
  expired: 'true',
  definitive: 'true',
  page: '2',
  size: '25',
  sort: 'name,desc',
}

const GARBAGE_QUERY = {
  search: 5,
  active: 'quizás',
  statusId: '-1',
  statusCode: '<script>',
  costCenterCode: 'x'.repeat(50),
  projectId: 'abc',
  createdFrom: '01/01/2026',
  page: '0',
  size: '7',
  sort: ',',
  expiringSoon: 'no',
}

const queryParsers = functions.filter(([name]) => /^parse\w+Query$/.test(name))
const routeBuilders = functions.filter(([name]) => /^\w+QueryToRoute$/.test(name))
const defaultsOf = (base: string) =>
  Object.entries(constants).find(([name]) => /^DEFAULT_.*_QUERY$/.test(name) && norm(name) === `default${base}query`)?.[1]

describe('consultas de listas (parse / toRoute)', () => {
  it('hay un parser, un constructor de ruta y un valor por defecto por módulo', () => {
    expect(queryParsers.length).toBeGreaterThanOrEqual(12)
    expect(routeBuilders).toHaveLength(queryParsers.length)
  })

  for (const [parserName, parse] of queryParsers) {
    const base = norm(parserName.slice('parse'.length, -'Query'.length))
    const builder = routeBuilders.find(([name]) => norm(name) === `${base}querytoroute`)?.[1] as Fn

    describe(parserName, () => {
      it('sin parámetros devuelve los valores por defecto y su ruta queda vacía', () => {
        const defaults = defaultsOf(base)
        expect(defaults).toBeDefined()
        expect(parse({})).toEqual(defaults)
        expect(builder(defaults)).toEqual({})
      })

      it('descarta valores inválidos', () => {
        const parsed = parse(GARBAGE_QUERY) as Record<string, unknown>
        expect(parsed.page).toBe(1)
        expect(parsed.size).toBe(10)
        expect(parsed.search).toBe('')
      })

      it('ida y vuelta: parsear → ruta → parsear conserva los filtros', () => {
        const once = parse(RICH_QUERY) as Record<string, unknown>
        const route = builder(once) as Record<string, string>
        expect(route.page).toBe('2')
        expect(route.size).toBe('25')
        expect(parse(route)).toEqual(once)
      })
    })
  }
})

const sortParsers = functions.filter(([name]) => /^parse\w+Sort$/.test(name))

describe('orden de listas', () => {
  it('hay un parser por mantenedor', () => {
    expect(sortParsers.length).toBeGreaterThanOrEqual(7)
  })

  for (const [name, parse] of sortParsers) {
    const base = norm(name.slice('parse'.length, -'Sort'.length))
    const format = functions.find(([n]) => norm(n) === `format${base}sort`)?.[1] as Fn
    const isDefault = functions.find(([n]) => norm(n) === `isdefault${base}sort`)?.[1] as Fn
    const keys = Object.entries(constants).find(([n]) => norm(n) === `${base}sortablekeys`)?.[1] as readonly string[]
    const defaults = Object.entries(constants).find(([n]) => norm(n) === `default${base}sort`)?.[1] as {
      key: string
      order: string
    }

    it(`${name} acepta claves válidas y cae al orden por defecto con basura`, () => {
      expect(parse(undefined)).toEqual(defaults)
      expect(parse('desconocida,asc')).toEqual(defaults)
      expect(parse(`${keys[0]},desc`)).toEqual({ key: keys[0], order: 'desc' })
      expect(parse(`${keys[0]},otra`)).toEqual({ key: keys[0], order: 'asc' })
      expect(format(parse(`${keys[0]},desc`))).toBe(`${keys[0]},desc`)
      expect(isDefault(defaults)).toBe(true)
      expect(isDefault({ key: defaults.key, order: defaults.order === 'asc' ? 'desc' : 'asc' })).toBe(false)
      expect(isDefault({ key: 'otra', order: defaults.order })).toBe(false)
    })
  }
})

describe('formularios y filtros', () => {
  const factories = functions.filter(([name]) => /^create\w*(Form|Filters)$/.test(name))

  it('hay fábricas registradas', () => {
    expect(factories.length).toBeGreaterThanOrEqual(25)
  })

  for (const [name, factory] of factories) {
    it(`${name} entrega un objeto nuevo y respeta los overrides`, () => {
      const first = factory() as Record<string, unknown>
      const second = factory() as Record<string, unknown>
      expect(first).toEqual(second)
      expect(first).not.toBe(second)
      const [key] = Object.keys(first)
      if (key && name !== 'createStaffBlockForm' && name !== 'createRequestDecisionForm' && name !== 'createAnnulForm') {
        expect((factory({ [key]: 'override' }) as Record<string, unknown>)[key]).toBe('override')
      }
    })
  }
})

describe('colores de estado', () => {
  const colorFns = functions.filter(([name]) => /StatusColor$/.test(name))

  it('hay una función por flujo', () => {
    expect(colorFns.length).toBeGreaterThanOrEqual(6)
  })

  for (const [name, colorOf] of colorFns) {
    it(`${name} devuelve un color y gris para códigos desconocidos`, () => {
      expect(colorOf('CODIGO_INEXISTENTE')).toBe('grey')
      for (const code of ['PENDING_APPROVAL', 'PENDING_VALIDATION', 'APPROVED', 'ACTIVE', 'REJECTED', 'BLOCKED', 'ANNULLED', 'SYNC_ERROR', 'LATE_REGISTRATION']) {
        expect(typeof colorOf(code)).toBe('string')
      }
    })
  }

  it('los códigos conocidos de solicitudes tienen color propio', () => {
    expect(models.requestStatusColor('APPROVED')).toBe('success')
    expect(models.requestStatusColor('PENDING_APPROVAL')).toBe('warning')
  })
})

describe('utilidades de modelos', () => {
  it('accountTypeLabel traduce el tipo de cuenta', () => {
    for (const option of models.ACCOUNT_TYPE_OPTIONS) {
      expect(models.accountTypeLabel(option.value)).toBe(option.title)
    }
  })

  it('las opciones constantes están pobladas', () => {
    expect(models.SHOE_SIZE_OPTIONS[0]).toBe(35)
    expect(models.SHOE_SIZE_OPTIONS.at(-1)).toBe(46)
    expect(models.CLOTHING_SIZE_OPTIONS).toContain('XL')
    expect(models.WORK_DAYS_OPTIONS.length).toBeGreaterThan(0)
    expect(models.WEEKLY_WORK_HOURS_OPTIONS.length).toBeGreaterThan(0)
    expect(models.IDENTIFICATION_TYPE_OPTIONS.map((o) => o.value)).toContain('RUT')
    expect(Object.keys(models.CONTRACT_ATTACHMENT_TYPE_LABELS)).toEqual(expect.arrayContaining(models.CONTRACT_ATTACHMENT_TYPES))
    expect(models.WORKFLOW_QUERY_KEYS.has('contracts')).toBe(true)
  })

  it('los campos editables dependen del tipo de anexo', () => {
    expect(models.ANNEX_FIELDS_BY_TYPE[models.ANNEX_TYPE_CODE.CONVERSION]).toEqual([])
    expect(models.ANNEX_FIELDS_BY_TYPE[models.ANNEX_TYPE_CODE.SALARY]).toEqual(['newBaseSalary'])
  })
})
