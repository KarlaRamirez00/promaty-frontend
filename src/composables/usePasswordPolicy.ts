import { computed, type Ref } from 'vue'

const MIN_LENGTH = 8
const MAX_LENGTH = 12

export function usePasswordPolicy(password: Ref<string>, confirmation: Ref<string>) {
  const requirements = computed(() => [
    {
      label: `Entre ${MIN_LENGTH} y ${MAX_LENGTH} caracteres`,
      met: password.value.length >= MIN_LENGTH && password.value.length <= MAX_LENGTH,
    },
    { label: 'Una letra mayúscula', met: /[A-Z]/.test(password.value) },
    { label: 'Una letra minúscula', met: /[a-z]/.test(password.value) },
    { label: 'Un número', met: /\d/.test(password.value) },
    { label: 'Un carácter especial', met: /[^A-Za-z\d]/.test(password.value) },
  ])

  const matches = computed(() => confirmation.value === password.value)
  const isValid = computed(
    () => requirements.value.every((requirement) => requirement.met) && matches.value,
  )

  return { requirements, matches, isValid }
}
