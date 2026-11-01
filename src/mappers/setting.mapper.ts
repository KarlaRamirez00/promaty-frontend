import { formatDateTime, NO_DATA } from '@/utils'
import type { SettingPayload, SettingRaw } from '@/types/setting'
import type { Setting, SettingForm, SettingGroup } from '@/models'

function mapperSetting(raw: SettingRaw): Setting {
  return {
    key: raw.key,
    label: raw.label,
    type: raw.type,
    value: raw.value,
    defaultValue: raw.defaultValue,
    min: raw.min,
    max: raw.max,
    updatedAt: formatDateTime(raw.updatedAt),
    updatedBy: raw.updatedBy ?? NO_DATA,
  }
}

export function mapperSettingGroups(items: SettingRaw[]): SettingGroup[] {
  const groups = new Map<string, SettingGroup>()
  for (const raw of items) {
    const group = groups.get(raw.group) ?? { key: raw.group, label: raw.groupLabel, settings: [] }
    group.settings.push(mapperSetting(raw))
    groups.set(raw.group, group)
  }
  return [...groups.values()]
}

export function mapperSettingFormToPayload(form: SettingForm): SettingPayload {
  return { value: form.value.trim() }
}
