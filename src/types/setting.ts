export type SettingType = 'INTEGER' | 'DECIMAL' | 'BOOLEAN'

export interface SettingRaw {
  key: string
  group: string
  groupLabel: string
  label: string
  type: SettingType
  value: string
  defaultValue: string
  min: number | null
  max: number | null
  updatedAt: string | null
  updatedBy: string | null
}

export interface SettingPayload {
  value: string
}
