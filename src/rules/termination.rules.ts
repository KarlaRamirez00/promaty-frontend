import { maxLength, type Validator } from './validators'
import messages from '@/messages'

export const terminationNotesRules: Validator[] = [
  maxLength(500, messages.termination.rules.notesMaxLength),
]
