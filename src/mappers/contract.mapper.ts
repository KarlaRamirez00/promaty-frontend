import type {
  ContractAttachmentRaw,
  ContractCatalogOptionRaw,
  ContractListRaw,
  ContractRaw,
  ContractRequestPayload,
  ContractStaffOptionRaw,
} from '@/types/contract'
import type {
  Contract,
  ContractAttachment,
  ContractAttachmentType,
  ContractCatalogOption,
  ContractForm,
  ContractListItem,
  ContractStaffOption,
} from '@/models'
import { contractStatusColor } from '@/models'
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

export function mapperContractFormToPayload(form: ContractForm): ContractRequestPayload {
  return {
    entityType: 'CONTRACT',
    action: 'CREATE',
    projectId: form.projectId as number,
    contractData: {
      staffId: form.staffId as number,
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
    },
  }
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
  const dot = a.fileName.lastIndexOf('.')
  return {
    id: a.id,
    attachmentType: a.attachmentType as ContractAttachmentType,
    name: a.fileName,
    fileType: dot === -1 ? '' : a.fileName.slice(dot + 1).toLowerCase(),
    fileSizeLabel: formatFileSize(a.fileSize),
    mediaFileId: a.mediaFileId,
    updatedAt: a.uploadedAt,
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
    attachments: (raw.attachments ?? []).map(mapAttachment),
    missingAttachmentTypes: (raw.missingAttachmentTypes ?? []) as ContractAttachmentType[],
    status: raw.status,
    statusColor: contractStatusColor(raw.status.code),
    createdAt: formatDateTime(raw.createdAt),
    updatedAt: formatDateTime(raw.updatedAt),
    createdBy: raw.createdBy,
    updatedBy: raw.updatedBy,
    actions: raw.actions,
  }
}
