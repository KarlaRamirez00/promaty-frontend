import { describe, expect, it } from 'vitest'
import { getGreeting } from '@/utils'

const at = (hour: number, minute = 0) => new Date(2026, 10, 22, hour, minute)

describe('getGreeting', () => {
  it.each([
    [0, 'Buenos días'],
    [11, 'Buenos días'],
    [12, 'Buenas tardes'],
    [19, 'Buenas tardes'],
    [20, 'Buenas noches'],
    [23, 'Buenas noches'],
  ])('a las %i horas saluda con "%s"', (hour, expected) => {
    expect(getGreeting(at(hour, 59))).toBe(expected)
  })

  it('usa la hora actual cuando no recibe fecha', () => {
    expect(['Buenos días', 'Buenas tardes', 'Buenas noches']).toContain(getGreeting())
  })
})
