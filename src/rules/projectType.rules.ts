import { required, type Validator } from './validators'
import messages from '@/messages'

export const projectTypeNameRules: Validator[] = [required(messages.projectType.rules.nameRequired)]
