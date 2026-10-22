export interface RequestStatusRaw {
  id: number
  code: string
  name: string
}

export interface RequestRaw {
  id: number
  entityType: string
  action: string
  typeName: string
  entityId: number | null
  projectName: string
  costCenterCode: string
  requesterUserId: number
  requesterName: string
  // Datos del colaborador de la solicitud; vienen null si la solicitud no es de un colaborador.
  staffIdentificationType: string | null
  staffIdentificationNumber: string | null
  staffFirstName: string | null
  staffPaternalLastName: string | null
  staffMaternalLastName: string | null
  staffPosition: string | null
  status: RequestStatusRaw
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

export interface RequestApprovalRaw {
  id: number
  level: string
  decision: string
  rejectionReasonId: number | null
  rejectionReasonName: string | null
  comment: string | null
  approverUserId: number
  approverName: string
  createdAt: string
}

export interface RequestDetailRaw extends RequestRaw {
  projectId: number
  pendingData: Record<string, unknown> | null
  approvals: RequestApprovalRaw[]
}

export interface RequestCountersRaw {
  pendingApproval: number
  pendingValidation: number
}

export interface RequestDecidePayload {
  decision: 'APPROVED' | 'REJECTED'
  rejectionReasonId?: number
  comment?: string
}
