export interface ClientRaw {
  id: number
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ClientListRaw {
  id: number
  name: string
  active: boolean
}

export interface ClientFormPayload {
  name: string
}
