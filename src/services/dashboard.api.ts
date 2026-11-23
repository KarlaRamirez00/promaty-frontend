import { rrhhApi, unwrap } from '@/lib/http'
import type { ApiListResponse, ApiResponse } from '@/types/api'
import type {
  BirthdayQueryParams,
  BirthdayRaw,
  DashboardQueryParams,
  DashboardSummaryRaw,
} from '@/types/dashboard'

function toQuery(params: BirthdayQueryParams) {
  return {
    ...(params.projectId ? { projectId: params.projectId } : {}),
    ...(params.month ? { month: params.month } : {}),
  }
}

export async function getDashboardSummaryApi(
  params: DashboardQueryParams,
): Promise<DashboardSummaryRaw> {
  const response = await rrhhApi.get<ApiResponse<DashboardSummaryRaw>>('/dashboard/summary', {
    params: toQuery(params),
  })
  return unwrap(response)
}

export async function listDashboardBirthdaysApi(params: BirthdayQueryParams): Promise<BirthdayRaw[]> {
  const response = await rrhhApi.get<ApiListResponse<BirthdayRaw>>('/dashboard/birthdays', {
    params: toQuery(params),
  })
  return response.data.data
}
