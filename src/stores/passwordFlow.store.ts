import { ref } from 'vue'
import { defineStore } from 'pinia'

interface PasswordFlowData {
  email?: string
  temporaryPassword?: string
  notice?: string
}

export const usePasswordFlowStore = defineStore('passwordFlow', () => {
  const email = ref('')
  const temporaryPassword = ref('')
  const notice = ref('')

  function start(data: PasswordFlowData): void {
    email.value = data.email ?? ''
    temporaryPassword.value = data.temporaryPassword ?? ''
    notice.value = data.notice ?? ''
  }

  function clear(): void {
    start({})
  }

  return { email, temporaryPassword, notice, start, clear }
})
