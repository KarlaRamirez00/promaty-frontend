import { required, type Validator } from './validators'
import messages from '@/messages'

export const projectSpecialtyNameRules: Validator[] = [
  required(messages.projectSpecialty.rules.nameRequired),
]
