export interface ProjectSpecialtyRaw {
  id: number
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

export interface ProjectSpecialtyListRaw {
  id: number
  name: string
  active: boolean
  actions: string[]
}

export interface ProjectSpecialtyFormPayload {
  name: string
}
