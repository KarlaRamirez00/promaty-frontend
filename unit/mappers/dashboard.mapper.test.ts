import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mapperBirthdayList, mapperDashboardSummary } from '@/mappers'
import * as fx from '../helpers/fixtures'

describe('mapperDashboardSummary', () => {
  it('suma las solicitudes por tipo y por nivel (aprobar y validar)', () => {
    const summary = mapperDashboardSummary(fx.dashboardSummary())
    expect(summary.pendingRequests).toEqual({ contract: 2, termination: 1, annex: 1, total: 4, toApprove: 2, toValidate: 2 })
    expect(summary).toMatchObject({ activeStaff: 6, blockedStaff: 1, expiringContracts: 3, expiringContractsDays: 30 })
  })

  it('un nivel sin permiso queda en null y un tipo sin permiso cuenta como cero', () => {
    const summary = mapperDashboardSummary(
      fx.dashboardSummary({
        pendingRequests: {
          contract: 3,
          termination: null,
          annex: null,
          toApprove: null,
          toValidate: { contract: 3, termination: null, annex: null },
        },
      }),
    )
    expect(summary.pendingRequests).toEqual({ contract: 3, termination: 0, annex: 0, total: 3, toApprove: null, toValidate: 3 })
  })

  it('tolera una respuesta sin los bloques por nivel', () => {
    const summary = mapperDashboardSummary(fx.dashboardSummary({ pendingRequests: { contract: 1, termination: 0, annex: 0 } }))
    expect(summary.pendingRequests).toMatchObject({ total: 1, toApprove: null, toValidate: null })
  })

  it('mantiene en null los indicadores sin permiso', () => {
    const summary = mapperDashboardSummary(fx.EMPTY_DASHBOARD_SUMMARY)
    expect(Object.values(summary).every((value) => value === null)).toBe(true)
  })
})

describe('mapperBirthdayList', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 22, 15))
  })
  afterEach(() => vi.useRealTimers())

  it('arma el día de la semana con el día de dos dígitos y marca el cumpleaños de hoy', () => {
    const [saturday, sunday] = mapperBirthdayList([fx.birthday(1, 'Ana Paz', 7), fx.birthday(2, 'Luis Soto', 22)])
    expect(saturday.dayLabel).toMatch(/^sábado 07$/i)
    expect(saturday.isToday).toBe(false)
    expect(sunday.dayLabel).toMatch(/^domingo 22$/i)
    expect(sunday.isToday).toBe(true)
  })

  it('no marca como hoy el mismo día de otro mes', () => {
    const [item] = mapperBirthdayList([fx.birthday(1, 'Ana Paz', 22, 12)])
    expect(item.isToday).toBe(false)
    expect(item.month).toBe(12)
  })

  it('muestra S/D cuando falta el centro de costo', () => {
    const [item] = mapperBirthdayList([fx.birthday(1, 'Ana Paz', 7, 11, null)])
    expect(item.costCenterCode).toBe('S/D')
  })
})
