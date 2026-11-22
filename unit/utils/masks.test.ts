import { describe, expect, it } from 'vitest'
import { INPUT_MASKS, maskCurrency, maskPhone, maskRut, parseCurrency } from '@/utils/masks'

describe('INPUT_MASKS', () => {
  it('filtra por tipo de dato', () => {
    expect(INPUT_MASKS.onlyNumbers('a1b2')).toBe('12')
    expect(INPUT_MASKS.bankAccount('12-34')).toBe('1234')
    expect(INPUT_MASKS.decimalNumbers('1.2.3a')).toBe('1.23')
    expect(INPUT_MASKS.decimalNumbers('12a')).toBe('12')
    expect(INPUT_MASKS.onlyLetters('Ana 3<>')).toBe('Ana ')
    expect(INPUT_MASKS.lettersAndNumbers('a b-1')).toBe('ab1')
    expect(INPUT_MASKS.lettersNumbersAndSeparators('a b_1-.')).toBe('ab_1-.')
    expect(INPUT_MASKS.freeText('Hola <script>"x"; (1)')).toBe('Hola scriptx (1)')
    expect(INPUT_MASKS.email('a b@c.cl%')).toBe('ab@c.cl')
  })

  it('delega en rut, teléfono y moneda', () => {
    expect(INPUT_MASKS.rut('123456785')).toBe('12.345.678-5')
    expect(INPUT_MASKS.phone('962099485')).toBe('9 6209 9485')
    expect(INPUT_MASKS.currency('1234567')).toBe('1.234.567')
    expect(INPUT_MASKS.decimalCurrency('1234,567')).toBe('1.234,56')
  })
})

describe('maskPhone', () => {
  it('agrupa y limita a 9 dígitos', () => {
    expect(maskPhone('9')).toBe('9')
    expect(maskPhone('96209')).toBe('9 6209')
    expect(maskPhone('96209948512')).toBe('9 6209 9485')
    expect(maskPhone('')).toBe('')
  })
})

describe('maskRut', () => {
  it('maneja entradas cortas', () => {
    expect(maskRut('')).toBe('')
    expect(maskRut('5')).toBe('5')
    expect(maskRut('k')).toBe('')
  })

  it('formatea cuerpo y dígito verificador', () => {
    expect(maskRut('12345678k')).toBe('12.345.678-K')
    expect(maskRut('1234567890')).toBe('12.345.678-0')
    expect(maskRut('1k5')).toBe('1-5')
  })
})

describe('maskCurrency', () => {
  it('agrupa miles y quita ceros a la izquierda', () => {
    expect(maskCurrency('000800000', 0)).toBe('800.000')
    expect(maskCurrency('0', 0)).toBe('0')
    expect(maskCurrency('', 0)).toBe('')
  })

  it('ignora decimales con decimals en 0', () => {
    expect(maskCurrency('1000,5', 0)).toBe('1.000')
  })

  it('admite coma decimal', () => {
    expect(maskCurrency('42520,2', 2)).toBe('42.520,2')
    expect(maskCurrency('42520,239', 2)).toBe('42.520,23')
    expect(maskCurrency('42520', 2)).toBe('42.520')
    expect(maskCurrency('1,2,3', 2)).toBe('1,23')
  })
})

describe('parseCurrency', () => {
  it('invierte el formato chileno', () => {
    expect(parseCurrency('42.520,23')).toBeCloseTo(42520.23, 2)
    expect(parseCurrency('800.000')).toBe(800000)
    expect(parseCurrency('abc')).toBeNaN()
  })
})
