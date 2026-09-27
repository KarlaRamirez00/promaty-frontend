import { email, minLength, required, type Validator } from './validators'
import messages from '@/messages'

export const userFirstNameRules: Validator[] = [required(messages.user.rules.firstNameRequired)]
export const userLastNameRules: Validator[] = [required(messages.user.rules.lastNameRequired)]

export const userEmailRules: Validator[] = [
  required(messages.user.rules.emailRequired),
  email(messages.user.rules.emailInvalid),
]

export const userPasswordRules: Validator[] = [
  required(messages.user.rules.passwordRequired),
  minLength(8, messages.user.rules.passwordMinLength),
]
