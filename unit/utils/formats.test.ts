import { describe, expect, it } from 'vitest'
import {
  NO_DATA,
  NO_DATE,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatFileSize,
  formatPhone,
  formatRut,
} from '@/utils/formats'

describe('formatDate', () => {
  it('devuelve el fallback si no hay valor o es inválido', () => {
    expect(formatDate(null)).toBe(NO_DATE)
    expect(formatDate(undefined)).toBe(NO_DATE)
    expect(formatDate('no-es-fecha')).toBe(NO_DATE)
    expect(formatDate('', 'X')).toBe('X')
  })

  it('no desplaza un día las fechas puras', () => {
    expect(formatDate('2026-03-05')).toBe('05-03-2026')
  })

  it('formatea fechas con hora', () => {
    expect(formatDate('2026-03-05T12:00:00')).toBe('05-03-2026')
  })
})

describe('formatDateTime', () => {
  it('maneja ausencia e invalidez', () => {
    expect(formatDateTime(null)).toBe(NO_DATE)
    expect(formatDateTime('xx')).toBe(NO_DATE)
  })

  it('agrega la hora con dos dígitos', () => {
    expect(formatDateTime('2026-03-05T09:07:00')).toBe('05-03-2026, 09:07 h')
  })
})

describe('formatRut', () => {
  it('agrupa miles con y sin guion', () => {
    expect(formatRut('123456785')).toBe('12.345.678-5')
    expect(formatRut('12345678-k')).toBe('12.345.678-K')
    expect(formatRut('1-9')).toBe('1-9')
  })

  it('devuelve el valor original si no se puede separar', () => {
    expect(formatRut('')).toBe('')
    expect(formatRut('-')).toBe('-')
  })
})

describe('formatPhone', () => {
  it('formatea 9 dígitos con +56', () => {
    expect(formatPhone('962099485')).toBe('+56 9 6209 9485')
  })

  it('deja igual lo que no tiene 9 dígitos', () => {
    expect(formatPhone('1234')).toBe('1234')
  })
})

describe('formatCurrency', () => {
  it('usa fallback para null y undefined', () => {
    expect(formatCurrency(null)).toBe(NO_DATA)
    expect(formatCurrency(undefined, '-')).toBe('-')
  })

  it('formatea con separador de miles', () => {
    expect(formatCurrency(800000)).toBe('$ 800.000')
  })
})

describe('formatFileSize', () => {
  it('escala las unidades', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(2048)).toBe('2 KB')
    expect(formatFileSize(1536 * 1024)).toBe('1,5 MB')
    expect(formatFileSize(5 * 1024 ** 4)).toBe('5.120 GB')
  })
})
