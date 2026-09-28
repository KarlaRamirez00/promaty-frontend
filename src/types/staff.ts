export type IdentificationType = 'RUT' | 'PASSPORT'
export type ClothingSize = 'S' | 'M' | 'L' | 'XL' | 'XXL'
export type AccountType = 'CHECKING' | 'SIGHT' | 'SAVINGS' | 'RUT'

// Catálogos de solo lectura (sin CRUD propio) que respaldan los selectores del formulario de Staff.
// code es el identificador semántico estable (nunca cambia) — cualquier lógica de negocio en
// frontend (ej. "Cuenta RUT solo para BancoEstado") debe compararse contra code, nunca contra id;
// id es solo la FK real que se manda a backend al crear/editar.
export interface CatalogOptionRaw {
  id: number
  name: string
  code: string
}

export interface BankOptionRaw extends CatalogOptionRaw {
  supportsRutAccount: boolean
}

export interface StaffListRaw {
  id: number
  identificationType: IdentificationType
  identificationNumber: string
  firstName: string
  paternalLastName: string
  maternalLastName: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

// El detalle trae los mismos campos que la lista más el resto de la ficha — las 7 FK vienen
// expandidas como {id, name, code} para poder pre-cargar el selector sin otro llamado.
export interface StaffRaw extends StaffListRaw {
  birthDate: string
  registeredSex: CatalogOptionRaw
  maritalStatus: CatalogOptionRaw
  nationality: CatalogOptionRaw
  phone1: string
  emergencyPhone: string
  emergencyContactName: string
  address: string
  city: string
  hasChildren: boolean
  childrenCount: number | null
  personalEmail: string
  shoeSize: number
  clothingSize: ClothingSize
  educationLevel: CatalogOptionRaw
  afp: CatalogOptionRaw
  healthSystem: CatalogOptionRaw
  bank: CatalogOptionRaw
  accountType: AccountType
  accountNumber: string
}

// La identificación (tipo + número) es inmutable tras crear — no forma parte del payload de edición.
// Las 7 FK van como {catalogo}Id (Long) al crear/editar, no como objeto expandido.
export interface StaffFormPayload {
  firstName: string
  paternalLastName: string
  maternalLastName: string
  birthDate: string
  registeredSexId: number
  maritalStatusId: number
  nationalityId: number
  phone1: string
  emergencyPhone: string
  emergencyContactName: string
  address: string
  city: string
  hasChildren: boolean
  childrenCount: number | null
  personalEmail: string
  shoeSize: number
  clothingSize: ClothingSize
  educationLevelId: number
  afpId: number
  healthSystemId: number
  bankId: number
  accountType: AccountType
  accountNumber: string
}

export interface StaffCreatePayload extends StaffFormPayload {
  identificationType: IdentificationType
  identificationNumber: string
}
