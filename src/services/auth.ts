import { authApi, unwrap } from '@/lib/http'
import type { ApiResponse } from '@/types/api'

export interface LoginCredentials {
  email: string
  password: string
}

interface LoginResult {
  token: string
}

export async function login(credentials: LoginCredentials): Promise<string> {
  const response = await authApi.post<ApiResponse<LoginResult>>('/auth/login', credentials)
  return unwrap(response).token
}
