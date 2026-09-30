
import type {
  IdentificationType,
  StaffCreatePayload,
  StaffFormPayload,
  StaffListRaw,
  StaffRaw,
} from '@/types/staff'
import type { Staff, StaffForm, StaffListItem } from '@/models'
import { formatDateTime, formatRut } from '@/utils'

function toFullName(firstName: string, paternalLastName: string, maternalLastName: string): string {
  return `${firstName} ${paternalLastName} ${maternalLastName}`.trim()
}

// El formato con puntos ("12.345.678-5") solo aplica a RUT — un pasaporte no tiene estructura fija.
function toDisplayIdentificationNumber(type: IdentificationType, value: string): string {
  return type === 'RUT' ? formatRut(value) : value
}

export function mapperStaffList(items: StaffListRaw[]): StaffListItem[] {
  return items.map((item) => ({
    id: item.id,
    identificationType: item.identificationType,
    identificationNumber: toDisplayIdentificationNumber(item.identificationType, item.identificationNumber),
    fullName: toFullName(item.firstName, item.paternalLastName, item.maternalLastName),
    actions: item.actions,
  }))
}

export function mapperStaffDetail(raw: StaffRaw): Staff {
  return {
    id: raw.id,
    identificationType: raw.identificationType,
    identificationNumber: toDisplayIdentificationNumber(raw.identificationType, raw.identificationNumber),
    firstName: raw.firstName,
    paternalLastName: raw.paternalLastName,
    maternalLastName: raw.maternalLastName,
    fullName: toFullName(raw.firstName, raw.paternalLastName, raw.maternalLastName),
    birthDate: raw.birthDate,
    registeredSex: raw.registeredSex,
    maritalStatus: raw.maritalStatus,
    nationality: raw.nationality,
    phone1: raw.phone1,
    emergencyPhone: raw.emergencyPhone,
    emergencyContactName: raw.emergencyContactName,
    address: raw.address,
    city: raw.city,
    hasChildren: raw.hasChildren,
    childrenCount: raw.childrenCount,
    personalEmail: raw.personalEmail,
    shoeSize: raw.shoeSize,
    clothingSize: raw.clothingSize,
    educationLevel: raw.educationLevel,
    afp: raw.afp,
    healthSystem: raw.healthSystem,
    bank: raw.bank,
    accountType: raw.accountType,
    accountNumber: raw.accountNumber,
    createdAt: formatDateTime(raw.createdAt),
    updatedAt: formatDateTime(raw.updatedAt),
    createdBy: raw.createdBy,
    updatedBy: raw.updatedBy,
    actions: raw.actions,
  }
}

export function mapperStaffFormToPayload(form: StaffForm): StaffFormPayload {
  return {
    firstName: form.firstName.trim(),
    paternalLastName: form.paternalLastName.trim(),
    maternalLastName: form.maternalLastName.trim(),
    birthDate: form.birthDate as string,
    registeredSexId: form.registeredSexId as number,
    maritalStatusId: form.maritalStatusId as number,
    nationalityId: form.nationalityId as number,
    phone1: form.phone1.trim(),
    emergencyPhone: form.emergencyPhone.trim(),
    emergencyContactName: form.emergencyContactName.trim(),
    address: form.address.trim(),
    city: form.city.trim(),
    hasChildren: form.hasChildren,
    childrenCount: form.hasChildren ? form.childrenCount : null,
    personalEmail: form.personalEmail.trim(),
    shoeSize: form.shoeSize as number,
    clothingSize: form.clothingSize as NonNullable<StaffForm['clothingSize']>,
    educationLevelId: form.educationLevelId as number,
    afpId: form.afpId as number,
    healthSystemId: form.healthSystemId as number,
    bankId: form.bankId as number,
    accountType: form.accountType as NonNullable<StaffForm['accountType']>,
    accountNumber: form.accountNumber.trim(),
  }
}

export function mapperStaffFormToCreatePayload(form: StaffForm): StaffCreatePayload {
  return {
    ...mapperStaffFormToPayload(form),
    identificationType: form.identificationType,
    identificationNumber: form.identificationNumber.trim(),
  }
}
