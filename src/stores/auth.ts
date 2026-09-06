import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { login as requestLogin, type LoginCredentials } from '@/services/auth'
import { clearToken, getToken, setToken } from '@/lib/authToken'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getToken())

  const isAuthenticated = computed(() => token.value !== null)

  async function login(credentials: LoginCredentials): Promise<void> {
    const issuedToken = await requestLogin(credentials)
    setToken(issuedToken)
    token.value = issuedToken
  }

  function logout(): void {
    clearToken()
    token.value = null
  }

  return { token, isAuthenticated, login, logout }
})
