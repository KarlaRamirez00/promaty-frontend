export interface ProjectTypeRaw {
  id: number
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

export interface ProjectTypeListRaw {
  id: number
  name: string
  active: boolean
  actions: string[]
}

export interface ProjectTypeFormPayload {
  name: string
}
