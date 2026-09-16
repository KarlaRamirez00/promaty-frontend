// Nombres de ruta centralizados — evita strings sueltos repetidos en router.push / router.beforeEach.
export const ROUTE = {
  HOME: 'home',
  LOGIN: 'login',
  FORBIDDEN: 'forbidden',
  REQUEST_LIST: 'requests',
  CLIENT_LIST: 'clients',
  CLIENT_NEW: 'clients-new',
  CLIENT_EDIT: 'clients-edit',
  PROJECT_TYPE_LIST: 'projectTypes',
  PROJECT_TYPE_NEW: 'projectTypes-new',
  PROJECT_TYPE_EDIT: 'projectTypes-edit',
  PROJECT_SPECIALTY_LIST: 'projectSpecialties',
  PROJECT_SPECIALTY_NEW: 'projectSpecialties-new',
  PROJECT_SPECIALTY_EDIT: 'projectSpecialties-edit',
  PROJECT_LIST: 'projects',
  PROJECT_NEW: 'projects-new',
  PROJECT_EDIT: 'projects-edit',
  ROLE_LIST: 'roles',
  ROLE_NEW: 'roles-new',
  ROLE_EDIT: 'roles-edit',
} as const

export type RouteName = (typeof ROUTE)[keyof typeof ROUTE]
