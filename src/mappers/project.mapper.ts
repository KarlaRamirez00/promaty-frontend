import { formatDate, formatDateTime } from '@/utils'
import type { ProjectFormPayload, ProjectListRaw, ProjectRaw } from '@/types/project'
import type { Project, ProjectForm, ProjectListItem } from '@/models'

export function mapperProjectList(items: ProjectListRaw[]): ProjectListItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    costCenterCode: item.costCenterCode,
    typeName: item.typeName,
    specialtyName: item.specialtyName,
    clientName: item.clientName,
    statusName: item.statusName,
    startDate: formatDate(item.startDate),
    endDate: formatDate(item.endDate),
    actions: item.actions,
  }))
}

export function mapperProjectDetail(raw: ProjectRaw): Project {
  return {
    id: raw.id,
    name: raw.name,
    costCenterCode: raw.costCenterCode,
    type: raw.type,
    specialty: raw.specialty,
    client: raw.client,
    status: raw.status,
    startDate: formatDate(raw.startDate),
    endDate: formatDate(raw.endDate),
    startDateRaw: raw.startDate,
    endDateRaw: raw.endDate,
    createdAt: formatDateTime(raw.createdAt),
    updatedAt: formatDateTime(raw.updatedAt),
    createdBy: raw.createdBy,
    updatedBy: raw.updatedBy,
    actions: raw.actions,
  }
}

export function mapperProjectFormToPayload(form: ProjectForm): ProjectFormPayload {
  return {
    name: form.name.trim(),
    costCenterCode: form.costCenterCode.trim(),
    typeId: form.typeId as number,
    specialtyId: form.specialtyId as number,
    clientId: form.clientId as number,
    startDate: form.startDate as string,
    endDate: form.endDate,
  }
}
