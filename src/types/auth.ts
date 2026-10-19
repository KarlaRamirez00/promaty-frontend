// Claims del JWT emitido por promaty-backend (authorizer-server, AuthServiceImpl).
export interface JwtClaims {
  sub: string
  role: string
  name: string
  permissions: string[]
  isSystemRole: boolean
  allowedAllProjects: boolean
  projectIds: number[]
  iat: number
  exp: number
}
