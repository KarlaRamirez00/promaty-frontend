export interface UserRoleRaw {
  id: number
  name: string
}

export interface UserRaw {
  id: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  active: boolean
  role: UserRoleRaw
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

export interface UserDetailRaw extends UserRaw {
  projectIds: number[]
}

export interface UserFormPayload {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  roleId: number
  projectIds: number[]
}

// El campo password en creación va a desaparecer con HU-B80 (clave temporal generada por el
// sistema) — no es parte del payload de edición.
export interface UserCreatePayload extends UserFormPayload {
  password: string
}
