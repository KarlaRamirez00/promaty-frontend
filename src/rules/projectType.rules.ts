import { maxLength, required, type Validator } from '@/rules/validators'
import messages from '@/messages'

export const projectTypeNameRules: Validator[] = [
  required(messages.projectType.rules.nameRequired),
  maxLength(120, messages.projectType.rules.nameMaxLength),
]
