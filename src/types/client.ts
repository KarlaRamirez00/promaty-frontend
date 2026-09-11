export interface ClientRaw {
  id: number
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
  actions: string[]
}

export interface ClientListRaw {
  id: number
  name: string
  active: boolean
  actions: string[]
}

export interface ClientFormPayload {
  name: string
}
