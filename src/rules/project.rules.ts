import { required, type Validator } from './validators'
import messages from '@/messages'

export const projectNameRules: Validator[] = [required(messages.project.rules.nameRequired)]

export const projectCostCenterCodeRules: Validator[] = [
  required(messages.project.rules.costCenterCodeRequired),
]
