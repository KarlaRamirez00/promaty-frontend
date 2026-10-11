export interface ContractCatalogOptionRaw {
  id: number
  name: string
  code: string
}

export interface ContractProjectOptionRaw {
  id: number
  name: string
}

export interface ContractStaffOptionRaw {
  id: number
  name: string
  identificationNumber: string
}

export interface ContractRequestData {
  staffId: number
  companyId: number
  contractTypeId: number
  jobTitleId: number
  siteId: number
  startDate: string
  endDate: string | null
  baseSalary: number
  agreedSalary: number | null
  weeklyWorkHours: number
  workDays: number
  contractDetail: string | null
  mealTypeId: number | null
  transportTypeId: number | null
}

export interface ContractRequestPayload {
  entityType: 'CONTRACT'
  action: 'CREATE'
  projectId: number
  contractData: ContractRequestData
}

export interface ContractStatusRaw {
  id: number
  code: string
  name: string
}

export interface ContractStaffRaw {
  id: number
  fullName: string
  identificationNumber: string
}

export interface ContractListRaw {
  id: number
  staff: ContractStaffRaw
  name: string | null
  contractNumber: string | null
  costCenterCode: string
  contractTypeName: string
  statusName: string
  startDate: string
  endDate: string | null
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

interface ContractNamedRaw {
  id: number
  name: string
}

export interface ContractRaw {
  id: number
  staff: ContractStaffRaw
  company: ContractNamedRaw
  contractType: ContractNamedRaw
  jobTitle: ContractNamedRaw
  site: ContractNamedRaw
  costCenterCode: string
  startDate: string
  endDate: string | null
  baseSalary: number
  agreedSalary: number | null
  weeklyWorkHours: number
  workDays: number
  contractDetail: string | null
  mealType: ContractNamedRaw | null
  transportType: ContractNamedRaw | null
  status: ContractStatusRaw
  name: string | null
  contractNumber: string | null
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}
