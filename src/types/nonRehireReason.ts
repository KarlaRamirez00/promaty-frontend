export interface NonRehireReasonListRaw {
  id: number
  name: string
  code: string
  active: boolean
  updatedAt: string
  actions: string[]
}

export interface NonRehireReasonRaw extends NonRehireReasonListRaw {
  description: string | null
  createdAt: string
  createdBy: string
  updatedBy: string
}

export interface NonRehireReasonFormPayload {
  name: string
  description: string
}
