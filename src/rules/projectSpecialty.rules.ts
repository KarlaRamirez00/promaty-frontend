import { maxLength, required, type Validator } from '@/rules/validators'
import messages from '@/messages'

export const projectSpecialtyNameRules: Validator[] = [
  required(messages.projectSpecialty.rules.nameRequired),
  maxLength(120, messages.projectSpecialty.rules.nameMaxLength),
]
