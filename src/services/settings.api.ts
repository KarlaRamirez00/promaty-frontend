import { rrhhApi, unwrap } from '@/lib/http'
import type { ApiListResponse, ApiResponse } from '@/types/api'
import type { SettingPayload, SettingRaw } from '@/types/setting'

export async function listSettingsApi(): Promise<SettingRaw[]> {
  const response = await rrhhApi.get<ApiListResponse<SettingRaw>>('/settings')
  return response.data.data
}

export async function updateSettingApi(key: string, payload: SettingPayload): Promise<SettingRaw> {
  const response = await rrhhApi.put<ApiResponse<SettingRaw>>(`/settings/${key}`, payload)
  return unwrap(response)
}
