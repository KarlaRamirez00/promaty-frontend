export interface RolePermissionRaw {
  id: number
  name: string
}

export interface RoleSubModuleRaw {
  id: number
  name: string
  alias: string
}

export interface RoleListRaw {
  id: number
  name: string
  description: string | null
  active: boolean
  totalUsers: number
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

export interface RoleRaw {
  id: number
  name: string
  description: string | null
  active: boolean
  totalUsers: number
  permissions: RolePermissionRaw[]
  subModules: RoleSubModuleRaw[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  actions: string[]
}

export interface RoleFormPayload {
  name: string
  description: string | null
  permissionIds: number[]
  subModuleIds: number[]
}

export interface RoleActiveUpdateResultRaw {
  id: number
  active: boolean
  reassignedUsers: number
}
