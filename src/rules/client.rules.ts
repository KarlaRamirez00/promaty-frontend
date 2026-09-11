import { maxLength, required, type Validator } from '@/rules/validators'
import messages from '@/messages'

export const clientNameRules: Validator[] = [
  required(messages.client.rules.nameRequired),
  maxLength(120, messages.client.rules.nameMaxLength),
]
