export interface PendingRequests {
  contract: number
  termination: number
  annex: number
  total: number
  // Pendientes de aprobar y de validar, o null si el usuario no puede decidir en ese nivel.
  toApprove: number | null
  toValidate: number | null
}

// Un indicador en null significa que el usuario no puede verlo y la tarjeta se oculta.
export interface DashboardSummary {
  pendingRequests: PendingRequests | null
  activeStaff: number | null
  blockedStaff: number | null
  expiringContracts: number | null
  expiringContractsDays: number | null
  hiresThisMonth: number | null
  hiresNextMonth: number | null
  terminationsThisMonth: number | null
}

export interface Birthday {
  staffId: number
  fullName: string
  month: number
  dayLabel: string
  costCenterCode: string
  isToday: boolean
}
