export interface ClientRaw {
  id: number
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

export interface ClientListRaw {
  id: number
  name: string
  active: boolean
  updatedAt: string
  actions: string[]
}

export interface ClientFormPayload {
  name: string
}
