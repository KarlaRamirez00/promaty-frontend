import type { SettingType } from '@/types/setting'

export interface Setting {
  key: string
  label: string
  type: SettingType
  value: string
  defaultValue: string
  min: number | null
  max: number | null
  updatedAt: string
  updatedBy: string
}

export interface SettingGroup {
  key: string
  label: string
  settings: Setting[]
}

export interface SettingForm {
  key: string
  value: string
}

export const createSettingForm = (overrides: Partial<SettingForm> = {}): SettingForm => ({
  key: '',
  value: '',
  ...overrides,
})
