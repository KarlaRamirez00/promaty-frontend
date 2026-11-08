import { authApi, unwrap } from '@/lib/http'
import type { ApiResponse } from '@/types/api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface PasswordResetPayload {
  email: string
  resetCode: string
  password: string
}

interface LoginResult {
  token: string
}

export async function login(credentials: LoginCredentials): Promise<string> {
  const response = await authApi.post<ApiResponse<LoginResult>>('/auth/login', credentials)
  return unwrap(response).token
}

export async function resetPassword(payload: PasswordResetPayload): Promise<void> {
  await authApi.post('/auth/password-reset', payload)
}

export async function requestPasswordRecovery(email: string): Promise<void> {
  await authApi.post('/auth/password-recovery', { email })
}
