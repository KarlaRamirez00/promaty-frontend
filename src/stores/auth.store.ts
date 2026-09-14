import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { login as requestLogin, type LoginCredentials } from '@/services'
import { clearToken, getToken, setToken } from '@/lib/authToken'
import { decodeJwt } from '@/lib/jwt'
import type { JwtClaims } from '@/types/auth'

function claimsFromToken(token: string | null): JwtClaims | null {
  return token ? decodeJwt(token) : null
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getToken())
  const claims = ref<JwtClaims | null>(claimsFromToken(token.value))

  const isAuthenticated = computed(() => token.value !== null)
  const role = computed(() => claims.value?.role ?? null)
  const userName = computed(() => claims.value?.name ?? null)
  const permissions = computed<string[]>(() => claims.value?.permissions ?? [])
  const allowedAllProjects = computed(() => claims.value?.allowedAllProjects ?? false)
  const projectIds = computed<number[]>(() => claims.value?.projectIds ?? [])

  async function login(credentials: LoginCredentials): Promise<void> {
    const issuedToken = await requestLogin(credentials)
    setToken(issuedToken)
    token.value = issuedToken
    claims.value = claimsFromToken(issuedToken)
  }

  function logout(): void {
    clearToken()
    token.value = null
    claims.value = null
  }

  return {
    token,
    isAuthenticated,
    role,
    userName,
    permissions,
    allowedAllProjects,
    projectIds,
    login,
    logout,
  }
})
