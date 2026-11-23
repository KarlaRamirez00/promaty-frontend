import { NO_DATA } from '@/utils'
import type { BirthdayRaw, DashboardSummaryRaw, PendingByTypeRaw } from '@/types/dashboard'
import type { Birthday, DashboardSummary } from '@/models'

const WEEKDAY_FORMAT = new Intl.DateTimeFormat('es-CL', { weekday: 'long' })

function sumByType(block: PendingByTypeRaw | null | undefined): number | null {
  if (!block) return null
  return (block.contract ?? 0) + (block.termination ?? 0) + (block.annex ?? 0)
}

export function mapperDashboardSummary(raw: DashboardSummaryRaw): DashboardSummary {
  const pending = raw.pendingRequests
  return {
    pendingRequests: pending
      ? {
          contract: pending.contract ?? 0,
          termination: pending.termination ?? 0,
          annex: pending.annex ?? 0,
          total: (pending.contract ?? 0) + (pending.termination ?? 0) + (pending.annex ?? 0),
          toApprove: sumByType(pending.toApprove),
          toValidate: sumByType(pending.toValidate),
        }
      : null,
    activeStaff: raw.activeStaff,
    blockedStaff: raw.blockedStaff,
    expiringContracts: raw.expiringContracts,
    expiringContractsDays: raw.expiringContractsDays,
    hiresThisMonth: raw.hiresThisMonth,
    hiresNextMonth: raw.hiresNextMonth,
    terminationsThisMonth: raw.terminationsThisMonth,
  }
}

// El backend entrega día y mes; el día de la semana se calcula con el año en curso.
export function mapperBirthdayList(items: BirthdayRaw[]): Birthday[] {
  const today = new Date()
  return items.map((raw) => {
    const date = new Date(today.getFullYear(), raw.month - 1, raw.day)
    return {
      staffId: raw.staffId,
      fullName: raw.fullName,
      month: raw.month,
      dayLabel: `${WEEKDAY_FORMAT.format(date)} ${String(raw.day).padStart(2, '0')}`,
      costCenterCode: raw.costCenterCode ?? NO_DATA,
      isToday: raw.day === today.getDate() && raw.month === today.getMonth() + 1,
    }
  })
}
