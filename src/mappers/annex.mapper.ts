import {
  mdiBriefcaseOutline,
  mdiCalendarRange,
  mdiCashMultiple,
  mdiClockOutline,
  mdiFileDocumentOutline,
  mdiMapMarkerOutline,
  mdiOfficeBuildingOutline,
} from '@mdi/js'
import type { StaffInfoItem } from '@/types/staffInfo'
import type {
  AnnexAttachmentRaw,
  AnnexContractSummaryRaw,
  AnnexListRaw,
  AnnexRaw,
  AnnexRequestPayload,
  AnnexStaffOptionRaw,
  AnnexTypeRaw,
  AnnexUpdatePayload,
} from '@/types/annex'
import type {
  Annex,
  AnnexAttachment,
  AnnexChange,
  AnnexContractSummary,
  AnnexEditData,
  AnnexForm,
  AnnexListItem,
  AnnexStaffOption,
  AnnexTypeOption,
} from '@/models'
import { ANNEX_TYPE_CODE, annexStatusColor, createAnnexForm } from '@/models'
import { formatCurrency, formatDate, formatDateTime, formatFileSize, NO_DATA, parseCurrency } from '@/utils'
import { maskCurrency } from '@/utils/masks'
import { toDisplayIdentification } from './contract.mapper'

const INDEFINITE_LABEL = 'Indefinido'

export function mapperAnnexTypeOptions(items: AnnexTypeRaw[]): AnnexTypeOption[] {
  return items.map(({ id, name, code }) => ({ id, name, code }))
}

function mapContractSummary(raw: AnnexContractSummaryRaw): AnnexContractSummary {
  return {
    contractTypeCode: raw.contractType.code,
    contractTypeName: raw.contractType.name,
    startDate: formatDate(raw.startDate),
    endDate: formatDate(raw.endDate),
    endDateIso: raw.endDate,
    baseSalary: formatCurrency(raw.baseSalary),
    baseSalaryValue: raw.baseSalary,
    jobTitle: raw.jobTitle,
    weeklyWorkHours: raw.weeklyWorkHours,
    workDays: raw.workDays,
    site: raw.site,
    projectName: raw.project.name,
  }
}

export function mapperAnnexStaffOptions(items: AnnexStaffOptionRaw[]): AnnexStaffOption[] {
  return items.map((item) => ({
    id: item.id,
    title: `${item.name} — ${toDisplayIdentification(item.identificationNumber)}`,
    name: item.name,
    identification: toDisplayIdentification(item.identificationNumber),
    contract: mapContractSummary(item.activeContract),
  }))
}

// Datos del contrato vigente para la tarjeta del colaborador; el orden fija su jerarquía visual.
export function mapperAnnexContractInfoItems(contract: AnnexContractSummary): StaffInfoItem[] {
  return [
    { icon: mdiFileDocumentOutline, label: 'Tipo de contrato', value: contract.contractTypeName, emphasis: true },
    {
      icon: mdiCalendarRange,
      label: 'Vigencia',
      value: `${contract.startDate} → ${contract.endDate}`,
      emphasis: true,
    },
    { icon: mdiOfficeBuildingOutline, label: 'Centro de costo', value: contract.projectName },
    { icon: mdiBriefcaseOutline, label: 'Cargo', value: contract.jobTitle.name },
    { icon: mdiCashMultiple, label: 'Sueldo base', value: contract.baseSalary },
    {
      icon: mdiClockOutline,
      label: 'Jornada',
      value: `${contract.weeklyWorkHours} h · ${contract.workDays} días`,
    },
    { icon: mdiMapMarkerOutline, label: 'Sucursal', value: contract.site.name },
  ]
}

function mapAttachment(raw: AnnexAttachmentRaw): AnnexAttachment {
  return {
    id: raw.id,
    name: raw.name,
    fileType: raw.name.split('.').pop()?.toLowerCase() ?? '',
    fileSizeLabel: formatFileSize(raw.fileSize),
    mediaFileId: raw.mediaFileId,
    updatedAt: formatDateTime(raw.updatedAt),
  }
}

function toUpdatePayload(form: AnnexForm): AnnexUpdatePayload {
  return {
    annexTypeId: form.annexTypeId as number,
    effectiveDate: form.effectiveDate as string,
    description: form.description.trim(),
    ...(form.newEndDate ? { newEndDate: form.newEndDate } : {}),
    ...(form.newBaseSalary ? { newBaseSalary: parseCurrency(form.newBaseSalary) } : {}),
    ...(form.newJobTitleId ? { newJobTitleId: form.newJobTitleId } : {}),
    ...(form.newWeeklyWorkHours ? { newWeeklyWorkHours: form.newWeeklyWorkHours } : {}),
    ...(form.newWorkDays ? { newWorkDays: form.newWorkDays } : {}),
    ...(form.newSiteId ? { newSiteId: form.newSiteId } : {}),
  }
}

export function mapperAnnexFormToCreatePayload(form: AnnexForm): AnnexRequestPayload {
  return {
    entityType: 'ANNEX',
    action: 'CREATE',
    annexData: { staffId: form.staffId as number, ...toUpdatePayload(form) },
  }
}

export function mapperAnnexFormToUpdatePayload(form: AnnexForm): AnnexUpdatePayload {
  return toUpdatePayload(form)
}

function changeSummary(raw: AnnexListRaw): string {
  switch (raw.annexType.code) {
    case ANNEX_TYPE_CODE.EXTENSION:
      return formatDate(raw.newEndDate)
    case ANNEX_TYPE_CODE.CONVERSION:
      return INDEFINITE_LABEL
    case ANNEX_TYPE_CODE.SALARY:
      return formatCurrency(raw.newBaseSalary)
    case ANNEX_TYPE_CODE.JOB_TITLE:
      return raw.newJobTitleName ?? NO_DATA
    default:
      return NO_DATA
  }
}

export function mapperAnnexList(items: AnnexListRaw[]): AnnexListItem[] {
  return items.map((item) => ({
    id: item.id,
    requestId: item.requestId,
    costCenterCode: item.costCenterCode,
    fullName: item.staff.fullName,
    identificationNumber: toDisplayIdentification(item.staff.identificationNumber),
    annexTypeName: item.annexType.name,
    change: changeSummary(item),
    effectiveDate: formatDate(item.effectiveDate),
    statusName: item.statusName,
    statusColor: annexStatusColor(item.statusCode),
    actions: item.actions,
  }))
}

const hoursLabel = (value: number | null | undefined) => (value == null ? NO_DATA : `${value} h`)
const daysLabel = (value: number | null | undefined) => (value == null ? NO_DATA : `${value} días`)

// Una vez aprobado, el contrato ya tiene el cambio aplicado: el "antes" sale de los valores previos.
const beforeValue = <T>(approved: boolean, previous: T, current: T): T => (approved ? previous : current)

type ChangeBuilder = (raw: AnnexRaw, approved: boolean) => AnnexChange[]

function scheduleChanges(raw: AnnexRaw, approved: boolean): AnnexChange[] {
  const current = raw.currentContract
  const changes: AnnexChange[] = []
  if (raw.newWeeklyWorkHours != null) {
    changes.push({
      key: 'weeklyWorkHours',
      label: 'Horas semanales',
      before: hoursLabel(beforeValue(approved, raw.previousWeeklyWorkHours, current?.weeklyWorkHours)),
      after: hoursLabel(raw.newWeeklyWorkHours),
    })
  }
  if (raw.newWorkDays != null) {
    changes.push({
      key: 'workDays',
      label: 'Días de trabajo',
      before: daysLabel(beforeValue(approved, raw.previousWorkDays, current?.workDays)),
      after: daysLabel(raw.newWorkDays),
    })
  }
  if (raw.newSite) {
    changes.push({
      key: 'site',
      label: 'Sucursal',
      before: beforeValue(approved, raw.previousSite?.name, current?.site.name) ?? NO_DATA,
      after: raw.newSite.name,
    })
  }
  return changes
}

const CHANGE_BUILDERS: Record<string, ChangeBuilder> = {
  [ANNEX_TYPE_CODE.EXTENSION]: (raw, approved) => [
    {
      key: 'endDate',
      label: 'Fecha de término',
      before: formatDate(beforeValue(approved, raw.previousEndDate, raw.currentContract?.endDate)),
      after: formatDate(raw.newEndDate),
    },
  ],
  [ANNEX_TYPE_CODE.CONVERSION]: (raw, approved) => [
    {
      key: 'contractType',
      label: 'Tipo de contrato',
      before:
        beforeValue(approved, raw.previousContractType?.name, raw.currentContract?.contractType.name) ?? NO_DATA,
      after: INDEFINITE_LABEL,
    },
  ],
  [ANNEX_TYPE_CODE.SALARY]: (raw, approved) => [
    {
      key: 'baseSalary',
      label: 'Sueldo base',
      before: formatCurrency(beforeValue(approved, raw.previousBaseSalary, raw.currentContract?.baseSalary)),
      after: formatCurrency(raw.newBaseSalary),
    },
  ],
  [ANNEX_TYPE_CODE.JOB_TITLE]: (raw, approved) => [
    {
      key: 'jobTitle',
      label: 'Cargo',
      before: beforeValue(approved, raw.previousJobTitle?.name, raw.currentContract?.jobTitle.name) ?? NO_DATA,
      after: raw.newJobTitle?.name ?? NO_DATA,
    },
  ],
  [ANNEX_TYPE_CODE.SCHEDULE_OR_SITE]: scheduleChanges,
}

function buildChanges(raw: AnnexRaw): AnnexChange[] {
  return CHANGE_BUILDERS[raw.annexType.code]?.(raw, raw.status.code === 'APPROVED') ?? []
}

export function mapperAnnexEditData(raw: AnnexRaw): AnnexEditData {
  return {
    form: createAnnexForm({
      id: raw.id,
      staffId: raw.staff.id,
      staffLabel: `${raw.staff.fullName} — ${toDisplayIdentification(raw.staff.identificationNumber)}`,
      annexTypeId: raw.annexType.id,
      effectiveDate: raw.effectiveDate,
      description: raw.description,
      newEndDate: raw.newEndDate,
      newBaseSalary: raw.newBaseSalary == null ? '' : maskCurrency(String(raw.newBaseSalary), 0),
      newJobTitleId: raw.newJobTitle?.id ?? null,
      newWeeklyWorkHours: raw.newWeeklyWorkHours,
      newWorkDays: raw.newWorkDays,
      newSiteId: raw.newSite?.id ?? null,
    }),
    attachments: (raw.attachments ?? []).map(mapAttachment),
    staffName: raw.staff.fullName,
    staffIdentification: toDisplayIdentification(raw.staff.identificationNumber),
    contract: raw.currentContract ? mapContractSummary(raw.currentContract) : null,
    currentType: raw.annexType,
  }
}

export function mapperAnnexDetail(raw: AnnexRaw): Annex {
  return {
    id: raw.id,
    requestId: raw.requestId,
    fullName: raw.staff.fullName,
    identificationNumber: toDisplayIdentification(raw.staff.identificationNumber),
    projectName: raw.project.name,
    costCenterCode: raw.costCenterCode,
    annexTypeName: raw.annexType.name,
    effectiveDate: formatDate(raw.effectiveDate),
    description: raw.description,
    changes: buildChanges(raw),
    rexAnnexNumber: raw.rexAnnexNumber,
    syncErrorMessage: raw.syncErrorMessage ?? null,
    attachments: (raw.attachments ?? []).map(mapAttachment),
    attachmentRequirements: raw.attachmentRequirements ?? [],
    status: raw.status,
    statusColor: annexStatusColor(raw.status.code),
    createdAt: formatDateTime(raw.createdAt),
    updatedAt: formatDateTime(raw.updatedAt),
    createdBy: raw.createdBy,
    updatedBy: raw.updatedBy,
    actions: raw.actions,
  }
}
