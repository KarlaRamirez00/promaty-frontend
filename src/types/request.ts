export type RequestType =
  | 'Anexo'
  | 'Anticipo'
  | 'Colaborador'
  | 'Contrato'
  | 'Control de asistencia'
  | 'Finiquito'
  | 'Permiso'
  | 'Reclutamiento'
  | 'Sueldo'
  | 'Traspaso'

export type RequestStatus =
  | 'Pendiente aprobación'
  | 'Pendiente validación'
  | 'Aprobado'
  | 'Rechazado'

export interface Request {
  cc: string
  type: RequestType
  project: string
  createdAt: string
  requester: string
  status: RequestStatus
}
