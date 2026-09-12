// Nombres de ruta centralizados — evita strings sueltos repetidos en router.push / router.beforeEach.
export const ROUTE = {
  LOGIN: 'login',
  FORBIDDEN: 'forbidden',
  REQUEST_LIST: 'requests',
  CLIENT_LIST: 'clients',
  PROJECT_TYPE_LIST: 'projectTypes',
  PROJECT_SPECIALTY_LIST: 'projectSpecialties',
} as const

export type RouteName = (typeof ROUTE)[keyof typeof ROUTE]
