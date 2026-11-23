import { getDashboardSummaryApi, listDashboardBirthdaysApi } from '@/services'
import { mapperBirthdayList, mapperDashboardSummary } from '@/mappers'
import { useGetDetail } from '@/utils'
import type { BirthdayQueryParams, DashboardQueryParams } from '@/types/dashboard'

export function getDashboardSummaryAction(params: DashboardQueryParams) {
  return useGetDetail(getDashboardSummaryApi, params, mapperDashboardSummary)
}

export function getDashboardBirthdaysAction(params: BirthdayQueryParams) {
  return useGetDetail(listDashboardBirthdaysApi, params, mapperBirthdayList)
}
