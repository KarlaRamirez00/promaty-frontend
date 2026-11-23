// Un tipo en null significa que el usuario no tiene el permiso de ese tipo.
export interface PendingByTypeRaw {
  contract: number | null
  termination: number | null
  annex: number | null
}

export interface PendingRequestsRaw extends PendingByTypeRaw {
  // Un bloque en null significa que el usuario no tiene ningún permiso de ese nivel.
  toApprove: PendingByTypeRaw | null
  toValidate: PendingByTypeRaw | null
}

// Cada indicador llega null cuando el usuario no tiene el permiso de lectura de su dato.
export interface DashboardSummaryRaw {
  pendingRequests: PendingRequestsRaw | null
  activeStaff: number | null
  blockedStaff: number | null
  expiringContracts: number | null
  expiringContractsDays: number | null
  hiresThisMonth: number | null
  hiresNextMonth: number | null
  terminationsThisMonth: number | null
}

export interface BirthdayRaw {
  staffId: number
  fullName: string
  day: number
  month: number
  costCenterCode: string | null
}

export interface DashboardQueryParams {
  projectId?: number | null
}

export interface BirthdayQueryParams extends DashboardQueryParams {
  month?: number
}
