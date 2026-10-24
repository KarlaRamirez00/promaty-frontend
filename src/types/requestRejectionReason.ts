export interface RequestRejectionReasonListRaw {
  id: number
  name: string
  description: string | null
  subModule: string
  active: boolean
  updatedAt: string
  actions: string[]
}

export interface RequestRejectionReasonRaw extends RequestRejectionReasonListRaw {
  createdAt: string
  createdBy: string
  updatedBy: string
}

export interface RequestRejectionReasonSubModuleRaw {
  code: string
  name: string
}

export interface RequestRejectionReasonFormPayload {
  name: string
  description: string
  subModule: string
}
