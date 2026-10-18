import { maxLength, required, type Validator } from './validators'
import messages from '@/messages'

export const requestRejectionReasonNameRules: Validator[] = [
  required(messages.requestRejectionReason.rules.nameRequired),
  maxLength(150, messages.requestRejectionReason.rules.nameMaxLength),
]

export const requestRejectionReasonDescriptionRules: Validator[] = [
  maxLength(250, messages.requestRejectionReason.rules.descriptionMaxLength),
]

export const requestRejectionReasonSubModuleRules: Validator[] = [
  required(messages.requestRejectionReason.rules.subModuleRequired),
]
