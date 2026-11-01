import { required, type Validator } from './validators'
import messages from '@/messages'
import type { Setting } from '@/models'

function numberRule(setting: Setting): Validator {
  return (value) => {
    const number = Number(value)
    if (!Number.isFinite(number)) return messages.setting.rules.valueNumber
    if (setting.type === 'INTEGER' && !Number.isInteger(number)) {
      return messages.setting.rules.valueInteger
    }
    const belowMin = setting.min !== null && number < setting.min
    const aboveMax = setting.max !== null && number > setting.max
    return belowMin || aboveMax ? `Debe estar entre ${setting.min} y ${setting.max}.` : null
  }
}

export function settingValueRules(setting: Setting): Validator[] {
  if (setting.type === 'BOOLEAN') return []
  return [required(messages.setting.rules.valueRequired), numberRule(setting)]
}
