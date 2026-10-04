export interface UserRoleRaw {
  id: number
  name: string
}

// actions[] todavía no viene en este DTO (T-B553, pendiente en backend) — a diferencia de
// Role/Project, el gate de acciones acá es solo por permiso, sin doble gate por registro.
export interface UserRaw {
  id: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  active: boolean
  role: UserRoleRaw
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
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
