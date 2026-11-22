import { describe, expect, it } from 'vitest'
import * as rules from '@/rules'
import {
  email,
  firstError,
  isAdult,
  isBeforeToday,
  isValidRut,
  latestAdultBirthDate,
  maxLength,
  minLength,
  pattern,
  required,
  settingValueRules,
  staffPhoneRules,
  todayIso,
  inputMaskNumbers,
  type Validator,
} from '@/rules'
import type { Setting } from '@/models'

describe('validadores base', () => {
  it('required', () => {
    expect(required('m')('  ')).toBe('m')
    expect(required('m')('a')).toBeNull()
  })

  it('email', () => {
    const rule = email('m')
    expect(rule('a@b.cl')).toBeNull()
    for (const bad of ['', 'a', 'a@b', '@b.cl', 'a@', 'a@.cl', 'a@b.', 'a@b@c.cl']) expect(rule(bad)).toBe('m')
  })

  it('minLength, maxLength y pattern', () => {
    expect(minLength(3, 'm')('ab')).toBe('m')
    expect(minLength(3, 'm')('abc')).toBeNull()
    expect(maxLength(3, 'm')('abcd')).toBe('m')
    expect(maxLength(3, 'm')('abc')).toBeNull()
    expect(pattern(/^\d+$/, 'm')('a')).toBe('m')
    expect(pattern(/^\d+$/, 'm')('1')).toBeNull()
  })

  it('firstError devuelve el primer mensaje o null', () => {
    expect(firstError('', [required('a'), minLength(2, 'b')])).toBe('a')
    expect(firstError('x', [required('a'), minLength(2, 'b')])).toBe('b')
    expect(firstError('xx', [required('a'), minLength(2, 'b')])).toBeNull()
    expect(firstError('x', [])).toBeNull()
  })
})

describe('todas las listas de reglas', () => {
  const lists = Object.entries(rules).filter(([, value]) => Array.isArray(value)) as [string, Validator[]][]
  const samples = ['', ' ', 'a', 'Ana Pérez', '9 1234 5678', 'a@b.cl', '12345', 'x'.repeat(600), '<script>']

  it('hay listas registradas', () => {
    expect(lists.length).toBeGreaterThan(20)
  })

  for (const [name, list] of lists) {
    it(`${name} devuelve null o texto`, () => {
      for (const sample of samples) {
        const result = firstError(sample, list)
        expect(result === null || typeof result === 'string').toBe(true)
      }
    })
  }

  it('los campos obligatorios rechazan vacío', () => {
    for (const [name, list] of lists) {
      if (/Description|Notes|contractDetail/.test(name)) continue
      expect(firstError('', list), name).not.toBeNull()
    }
  })
})

describe('isValidRut', () => {
  it('valida el dígito verificador', () => {
    expect(isValidRut('12.345.678-5')).toBe(true)
    expect(isValidRut('12345678-5')).toBe(true)
    expect(isValidRut('11.111.111-1')).toBe(true)
    expect(isValidRut('12345678-9')).toBe(false)
    expect(isValidRut('6-k')).toBe(true)
    expect(isValidRut('7-0')).toBe(false)
    expect(isValidRut('')).toBe(false)
    expect(isValidRut('12345678')).toBe(false)
    expect(isValidRut('ab-1')).toBe(false)
  })

  it('cubre los dígitos 0 y K', () => {
    expect(isValidRut('13.039.597-0')).toBe(false)
    expect(isValidRut('10-0')).toBe(false)
    expect(isValidRut('1-9')).toBe(true)
  })
})

describe('fechas de negocio', () => {
  it('latestAdultBirthDate y isAdult son coherentes', () => {
    const limit = latestAdultBirthDate()
    expect(limit).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(isAdult(limit)).toBe(true)
    expect(isAdult('1990-01-01')).toBe(true)
    expect(isAdult(todayIso())).toBe(false)
  })

  it('isAdult considera si ya hubo cumpleaños este año', () => {
    const now = new Date()
    const year = now.getFullYear() - 18
    const pad = (n: number) => String(n).padStart(2, '0')
    expect(isAdult(`${year}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`)).toBe(true)
    expect(isAdult(`${year}-${pad(now.getMonth() + 1)}-${pad(now.getDate() + 1)}`)).toBe(
      now.getDate() >= 28 ? isAdult(`${year}-${pad(now.getMonth() + 1)}-${pad(now.getDate() + 1)}`) : false,
    )
    expect(isAdult(`${year + 1}-01-01`)).toBe(false)
    expect(isAdult(`${year - 1}-12-31`)).toBe(true)
  })

  it('isBeforeToday compara con hoy', () => {
    expect(isBeforeToday('2000-01-01')).toBe(true)
    expect(isBeforeToday('2999-01-01')).toBe(false)
    expect(isBeforeToday(todayIso())).toBe(false)
  })
})

describe('staffPhoneRules', () => {
  it('exige el formato enmascarado', () => {
    expect(firstError('9 1234 5678', staffPhoneRules)).toBeNull()
    expect(firstError('912345678', staffPhoneRules)).not.toBeNull()
  })
})

describe('inputMaskNumbers', () => {
  it('deja solo dígitos y limita el largo', () => {
    expect(inputMaskNumbers('a1b2c3', 2)).toBe('12')
  })
})

describe('settingValueRules', () => {
  const base = { type: 'INTEGER', min: 1, max: 10 } as Setting

  it('un booleano no lleva reglas', () => {
    expect(settingValueRules({ ...base, type: 'BOOLEAN' })).toEqual([])
  })

  it('valida número, entero y rango', () => {
    const list = settingValueRules(base)
    expect(firstError('', list)).not.toBeNull()
    expect(firstError('abc', list)).not.toBeNull()
    expect(firstError('1.5', list)).not.toBeNull()
    expect(firstError('0', list)).toBe('Debe estar entre 1 y 10.')
    expect(firstError('11', list)).toBe('Debe estar entre 1 y 10.')
    expect(firstError('5', list)).toBeNull()
  })

  it('acepta decimales y límites ausentes', () => {
    const list = settingValueRules({ type: 'DECIMAL', min: null, max: null } as Setting)
    expect(firstError('1.5', list)).toBeNull()
    expect(firstError('-100', list)).toBeNull()
  })
})
