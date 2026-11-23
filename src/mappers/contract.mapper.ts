import type {
  ContractAttachmentRaw,
  ContractCatalogOptionRaw,
  ContractListRaw,
  ContractRaw,
  ContractRequestData,
  ContractRequestPayload,
  ContractStaffOptionRaw,
  ContractUpdateData,
} from '@/types/contract'
import type {
  Contract,
  ContractAttachment,
  ContractAttachmentType,
  ContractCatalogOption,
  ContractEditData,
  ContractForm,
  ContractListItem,
  ContractStaffOption,
} from '@/models'
import { contractStatusColor, createContractForm } from '@/models'
import { maskCurrency } from '@/utils/masks'
import { formatCurrency, formatDate, formatDateTime, formatFileSize, formatRut, NO_DATA, parseCurrency } from '@/utils'

const RUT_PATTERN = /^\d{7,8}-[\dkK]$/

// El contrato no informa el tipo de identificación: solo se formatea lo que tiene forma de RUT.
export function toDisplayIdentification(value: string): string {
  return RUT_PATTERN.test(value) ? formatRut(value) : value
}

export function mapperContractCatalogOptions(items: ContractCatalogOptionRaw[]): ContractCatalogOption[] {
  return items.map((item) => ({ id: item.id, name: item.name, code: item.code }))
}

export function mapperContractStaffOptions(items: ContractStaffOptionRaw[]): ContractStaffOption[] {
  return items.map((item) => ({
    id: item.id,
    title: `${item.name} — ${item.identificationNumber}`,
  }))
}

function toContractFields(form: ContractForm): Omit<ContractRequestData, 'staffId'> {
  return {
    companyId: form.companyId as number,
    contractTypeId: form.contractTypeId as number,
    jobTitleId: form.jobTitleId as number,
    siteId: form.siteId as number,
    startDate: form.startDate as string,
    endDate: form.endDate,
    baseSalary: parseCurrency(form.baseSalary),
    agreedSalary: form.agreedSalary ? parseCurrency(form.agreedSalary) : null,
    weeklyWorkHours: form.weeklyWorkHours as number,
    workDays: form.workDays as number,
    contractDetail: form.contractDetail.trim() || null,
    mealTypeId: form.mealTypeId,
    transportTypeId: form.transportTypeId,
  }
}

export function mapperContractFormToPayload(form: ContractForm): ContractRequestPayload {
  return {
    entityType: 'CONTRACT',
    action: 'CREATE',
    projectId: form.projectId as number,
    contractData: { staffId: form.staffId as number, ...toContractFields(form) },
  }
}

export function mapperContractFormToUpdatePayload(form: ContractForm): ContractUpdateData {
  return { projectId: form.projectId as number, ...toContractFields(form) }
}

export function mapperContractList(items: ContractListRaw[]): ContractListItem[] {
  return items.map((item) => ({
    id: item.id,
    requestId: item.requestId,
    costCenterCode: item.costCenterCode,
    contractTypeName: item.contractTypeName,
    jobTitleName: item.jobTitleName,
    identificationNumber: toDisplayIdentification(item.staff.identificationNumber),
    fullName: item.staff.fullName,
    startDate: formatDate(item.startDate),
    endDate: formatDate(item.endDate),
    agreedSalary: formatCurrency(item.agreedSalary),
    statusName: item.statusName,
    statusColor: contractStatusColor(item.statusCode),
    actions: item.actions,
  }))
}

function mapAttachment(a: ContractAttachmentRaw): ContractAttachment {
  const dot = a.name.lastIndexOf('.')
  return {
    id: a.id,
    attachmentType: a.attachmentType as ContractAttachmentType,
    name: a.name,
    fileType: dot === -1 ? '' : a.name.slice(dot + 1).toLowerCase(),
    fileSizeLabel: formatFileSize(a.fileSize),
    mediaFileId: a.mediaFileId,
    updatedAt: a.updatedAt,
  }
}

export function mapperContractDetail(raw: ContractRaw): Contract {
  return {
    id: raw.id,
    requestId: raw.requestId,
    fullName: raw.staff.fullName,
    identificationNumber: toDisplayIdentification(raw.staff.identificationNumber),
    companyName: raw.company.name,
    contractTypeName: raw.contractType.name,
    jobTitleName: raw.jobTitle.name,
    siteName: raw.site.name,
    costCenterCode: raw.costCenterCode,
    startDate: formatDate(raw.startDate),
    endDate: formatDate(raw.endDate),
    baseSalary: formatCurrency(raw.baseSalary),
    agreedSalary: formatCurrency(raw.agreedSalary),
    weeklyWorkHours: raw.weeklyWorkHours,
    workDays: raw.workDays,
    contractDetail: raw.contractDetail ?? NO_DATA,
    mealTypeName: raw.mealType?.name ?? NO_DATA,
    transportTypeName: raw.transportType?.name ?? NO_DATA,
    rexContractNumber: raw.rexContractNumber,
    annulmentReason: raw.annulmentReason ?? null,
    syncErrorMessage: raw.syncErrorMessage ?? null,
    attachments: (raw.attachments ?? []).map(mapAttachment),
    attachmentRequirements: raw.attachmentRequirements ?? [],
    status: raw.status,
    statusColor: contractStatusColor(raw.status.code),
    createdAt: formatDateTime(raw.createdAt),
    updatedAt: formatDateTime(raw.updatedAt),
    createdBy: raw.createdBy,
    updatedBy: raw.updatedBy,
    actions: raw.actions,
  }
}

export function mapperContractEditData(raw: ContractRaw): ContractEditData {
  return {
    form: createContractForm({
      id: raw.id,
      staffId: raw.staff.id,
      staffLabel: `${raw.staff.fullName} — ${toDisplayIdentification(raw.staff.identificationNumber)}`,
      projectId: raw.project.id,
      companyId: raw.company.id,
      contractTypeId: raw.contractType.id,
      jobTitleId: raw.jobTitle.id,
      siteId: raw.site.id,
      startDate: raw.startDate,
      endDate: raw.endDate,
      baseSalary: maskCurrency(String(raw.baseSalary), 0),
      agreedSalary: raw.agreedSalary === null ? '' : maskCurrency(String(raw.agreedSalary), 0),
      weeklyWorkHours: raw.weeklyWorkHours,
      workDays: raw.workDays,
      contractDetail: raw.contractDetail ?? '',
      mealTypeId: raw.mealType?.id ?? null,
      transportTypeId: raw.transportType?.id ?? null,
    }),
    attachments: (raw.attachments ?? []).map(mapAttachment),
    currentProject: raw.project,
  }
}
