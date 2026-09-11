import { jwtDecode } from 'jwt-decode'
import type { JwtClaims } from '@/types/auth'

// Un token corrupto o expirado no debe romper el arranque de la app: se trata como sesión inválida.
export function decodeJwt(token: string): JwtClaims | null {
  try {
    return jwtDecode<JwtClaims>(token)
  } catch {
    return null
  }
}
