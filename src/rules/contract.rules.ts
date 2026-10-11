import { maxLength, type Validator } from './validators'
import messages from '@/messages'

export const contractDetailRules: Validator[] = [
  maxLength(500, messages.contract.rules.contractDetailMaxLength),
]

export function isBeforeToday(isoDate: string): boolean {
  return isoDate < todayIso()
}

export function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
