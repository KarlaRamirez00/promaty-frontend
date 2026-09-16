import { required, type Validator } from './validators'
import messages from '@/messages'

export const roleNameRules: Validator[] = [required(messages.role.rules.nameRequired)]
