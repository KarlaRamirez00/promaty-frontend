import { required, type Validator } from './validators'
import messages from '@/messages'

export const clientNameRules: Validator[] = [required(messages.client.rules.nameRequired)]
