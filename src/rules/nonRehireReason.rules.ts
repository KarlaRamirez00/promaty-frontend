import { maxLength, required, type Validator } from './validators'
import messages from '@/messages'

export const nonRehireReasonNameRules: Validator[] = [
  required(messages.nonRehireReason.rules.nameRequired),
  maxLength(150, messages.nonRehireReason.rules.nameMaxLength),
]

export const nonRehireReasonDescriptionRules: Validator[] = [
  maxLength(250, messages.nonRehireReason.rules.descriptionMaxLength),
]
