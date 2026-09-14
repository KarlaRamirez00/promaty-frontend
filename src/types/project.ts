export interface ProjectRelationRaw {
  id: number
  name: string
}

export interface ProjectStatusRaw {
  id: number
  code: string
  name: string
}

export interface ProjectListRaw {
  id: number
  name: string
  costCenterCode: string
  typeName: string
  specialtyName: string
  clientName: string
  statusName: string
  startDate: string
  endDate: string | null
  createdBy: string
  updatedBy: string
  actions: string[]
}

export interface ProjectRaw {
  id: number
  name: string
  costCenterCode: string
  type: ProjectRelationRaw
  specialty: ProjectRelationRaw
  client: ProjectRelationRaw
  status: ProjectStatusRaw
  startDate: string
  endDate: string | null
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

export interface ProjectFormPayload {
  name: string
  costCenterCode: string
  typeId: number
  specialtyId: number
  clientId: number
  startDate: string
  endDate: string | null
}
