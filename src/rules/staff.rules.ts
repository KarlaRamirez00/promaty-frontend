import { email, maxLength, pattern, required, type Validator } from './validators'
import messages from '@/messages'

const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/

export const staffNameRules: Validator[] = [
  required(messages.staff.rules.nameRequired),
  pattern(NAME_PATTERN, messages.staff.rules.nameInvalid),
  maxLength(100, messages.staff.rules.nameMaxLength),
]

export const staffIdentificationNumberRules: Validator[] = [
  required(messages.staff.rules.identificationNumberRequired),
  maxLength(20, messages.staff.rules.identificationNumberMaxLength),
]

export const staffEmailRules: Validator[] = [
  required(messages.staff.rules.emailRequired),
  email(messages.staff.rules.emailInvalid),
]

// Formato exacto que exige el backend: 9 dígitos, empieza con 9, sin +56.
export const staffPhoneRules: Validator[] = [
  required(messages.staff.rules.phoneRequired),
  pattern(/^9\d{8}$/, messages.staff.rules.phoneInvalid),
]

export const staffEmergencyPhoneRules: Validator[] = [
  required(messages.staff.rules.emergencyPhoneRequired),
  pattern(/^9\d{8}$/, messages.staff.rules.emergencyPhoneInvalid),
]

export const staffEmergencyContactNameRules: Validator[] = [
  required(messages.staff.rules.emergencyContactNameRequired),
  maxLength(100, messages.staff.rules.emergencyContactNameMaxLength),
]

export const staffAddressRules: Validator[] = [
  required(messages.staff.rules.addressRequired),
  maxLength(150, messages.staff.rules.addressMaxLength),
]

export const staffCityRules: Validator[] = [
  required(messages.staff.rules.cityRequired),
  maxLength(100, messages.staff.rules.cityMaxLength),
]

export const staffAccountNumberRules: Validator[] = [
  required(messages.staff.rules.accountNumberRequired),
  maxLength(30, messages.staff.rules.accountNumberMaxLength),
]

// Dígito verificador de RUT chileno (algoritmo módulo 11). Solo aplica cuando
// identificationType es "RUT" — se valida aparte en el formulario, no como Validator genérico,
// porque depende de otro campo.
export function isValidRut(value: string): boolean {
  const clean = value.replaceAll('.', '').trim()
  const [body, dv] = clean.split('-')
  if (!body || !dv || !/^\d+$/.test(body)) return false

  let sum = 0
  let multiplier = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  const remainder = 11 - (sum % 11)
  let expectedDv = String(remainder)
  if (remainder === 11) expectedDv = '0'
  else if (remainder === 10) expectedDv = 'K'
  return expectedDv === dv.toUpperCase()
}

// El colaborador debe ser mayor de 18 años (regla de backend, replicada acá para feedback
// inmediato — birthDate llega como "yyyy-MM-dd").
export function isAdult(birthDate: string): boolean {
  const [year, month, day] = birthDate.split('-').map(Number)
  const birth = new Date(year, month - 1, day)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())
  if (!hasHadBirthdayThisYear) age--
  return age >= 18
}
