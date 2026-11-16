import { maxLength, type Validator } from './validators'
import messages from '@/messages'

export const annexDescriptionRules: Validator[] = [
  maxLength(500, messages.annex.rules.descriptionMaxLength),
]
