// Respuestas crudas de backend (antes de pasar por los mapeadores) para armar el backend falso.
export const ALL_ACTIONS = ['UPDATE', 'ACTIVE', 'STATUS', 'APPROVE', 'VALIDATE', 'ANNUL']

const STAMPS = {
  createdAt: '2026-03-05T10:00:00',
  updatedAt: '2026-03-06T11:30:00',
  createdBy: 'Ana Pérez',
  updatedBy: 'Luis Soto',
  actions: ALL_ACTIONS,
}

export const named = (id: number, name = `Opción ${id}`) => ({ id, name, code: `C${id}` })
const status = (code: string, name: string, id = 1) => ({ id, code, name })

export const STATUSES = {
  request: [status('PENDING_APPROVAL', 'Pendiente de aprobación', 1), status('PENDING_VALIDATION', 'Pendiente de validación', 2), status('APPROVED', 'Aprobada', 3)],
  contract: [status('PENDING_APPROVAL', 'Pendiente de aprobación', 1), status('ACTIVE', 'Vigente', 2), status('EXPIRED', 'Vencido', 3)],
  staff: [status('ACTIVE', 'Activo', 1), status('BLOCKED', 'Bloqueado', 2)],
  project: [status('IN_PROGRESS', 'En curso', 1), status('FINISHED', 'Finalizado', 2)],
}

export const client = (id = 1, active = true) => ({ id, name: `Mandante ${id}`, active, ...STAMPS })
export const projectType = (id = 1, active = true) => ({ id, name: `Tipo ${id}`, active, ...STAMPS })
export const projectSpecialty = (id = 1, active = true) => ({ id, name: `Especialidad ${id}`, active, ...STAMPS })
export const nonRehireReason = (id = 1, active = true) => ({ id, name: `Motivo ${id}`, description: 'Descripción', active, ...STAMPS })
export const rejectionReason = (id = 1, active = true) => ({
  id,
  name: `Rechazo ${id}`,
  description: 'Descripción',
  subModule: 'contracts',
  active,
  ...STAMPS,
})

export const project = (id = 1) => ({
  id,
  name: `Proyecto ${id}`,
  costCenterCode: `CC-${id}`,
  typeName: 'Tipo 1',
  specialtyName: 'Especialidad 1',
  clientName: 'Mandante 1',
  statusCode: 'IN_PROGRESS',
  statusName: 'En curso',
  startDate: '2026-01-15',
  endDate: null as string | null,
  type: { id: 1, name: 'Tipo 1' },
  specialty: { id: 1, name: 'Especialidad 1' },
  client: { id: 1, name: 'Mandante 1' },
  status: STATUSES.project[0],
  ...STAMPS,
})

export const role = (id = 1, active = true) => ({
  id,
  name: `Rol ${id}`,
  description: 'Descripción del rol',
  active,
  totalUsers: 2,
  permissions: [{ id: 1, name: 'client.read' }, { id: 2, name: 'client.create' }],
  subModules: [{ id: 1, name: 'client', alias: 'Mandantes' }],
  ...STAMPS,
})

export const permission = (id: number, name: string, subModuleId: number, alias: string) => ({
  id,
  name,
  alias: name,
  description: `Permiso ${name}`,
  subModule: { id: subModuleId, name: name.split('.')[0], alias },
})

export const PERMISSIONS = [
  permission(1, 'client.read', 1, 'Mandantes'),
  permission(2, 'client.create', 1, 'Mandantes'),
  permission(3, 'client.update', 1, 'Mandantes'),
  permission(4, 'staff.read', 2, 'Colaboradores'),
  permission(5, 'staff.create', 2, 'Colaboradores'),
  permission(6, 'project.read', 3, 'Proyectos'),
  permission(7, 'project.AllowedAll', 3, 'Proyectos'),
  permission(9, 'hr.AllowedAll', 5, 'Colaboradores'),
  permission(8, 'unknown.read', 4, 'Desconocido'),
]

export const user = (id = 1, active = true) => ({
  id,
  firstName: 'Ana',
  lastName: `Paz ${id}`,
  email: `ana${id}@promaty.cl`,
  phoneNumber: '912345678' as string | null,
  active,
  role: { id: 1, name: 'Rol 1' },
  projectIds: [1],
  ...STAMPS,
})

export const attachmentRaw = (id = 1) => ({
  id,
  name: `documento-${id}.pdf`,
  fileType: 'pdf',
  fileSize: 2048,
  mediaFileId: `file-${id}`,
  updatedAt: '2026-03-06T11:30:00',
  attachmentType: 'CEDULA_FRONTAL',
})

export const staffList = (id = 1) => ({
  id,
  identificationType: 'RUT',
  identificationNumber: '123456785',
  firstName: 'Ana',
  paternalLastName: 'Paz',
  maternalLastName: 'Rojas',
  costCenterCode: 'CC-1',
  hireDate: '2026-02-01',
  statusCode: 'ACTIVE',
  statusName: 'Activo',
  ...STAMPS,
})

export const staff = (id = 1, blocked = false) => ({
  ...staffList(id),
  statusCode: blocked ? 'BLOCKED' : 'ACTIVE',
  statusName: blocked ? 'Bloqueado' : 'Activo',
  birthDate: '1990-05-20',
  registeredSex: named(1, 'Femenino'),
  maritalStatus: named(1, 'Soltero'),
  nationality: named(1, 'Chilena'),
  phone1: '912345678',
  emergencyPhone: '987654321',
  emergencyContactName: 'Luis Paz',
  address: 'Calle 123',
  region: named(1, 'Región 1'),
  provincia: named(1, 'Provincia 1'),
  comuna: named(1, 'Comuna 1'),
  hasChildren: true,
  childrenCount: 2,
  personalEmail: 'ana@correo.cl',
  shoeSize: 38,
  clothingSize: 'M',
  educationLevel: named(1, 'Media'),
  afp: named(1, 'AFP 1'),
  healthSystem: named(1, 'Fonasa'),
  bank: { ...named(1, 'Banco 1'), supportsRutAccount: true },
  accountType: 'CHECKING',
  accountNumber: '12345678',
  status: blocked ? STATUSES.staff[1] : STATUSES.staff[0],
  blockReason: blocked ? 'Motivo de bloqueo' : null,
  attachments: [attachmentRaw(1)],
})

const staffRef = { id: 1, fullName: 'Ana Paz Rojas', identificationNumber: '12345678-5' }

export const request = (id = 1, entityType = 'CONTRACT') => ({
  id,
  entityType,
  entityId: 10 + id,
  typeName: 'Contrato',
  staffFirstName: 'Ana',
  staffPaternalLastName: 'Paz',
  staffMaternalLastName: 'Rojas',
  staffIdentificationNumber: '123456785',
  staffIdentificationType: 'RUT',
  staffPosition: 'Maestro',
  costCenterCode: 'CC-1',
  requesterName: 'Luis Soto',
  status: STATUSES.request[0],
  createdAt: '2026-03-05T10:00:00',
  actions: ALL_ACTIONS,
})

export const requestDetail = (id = 1) => ({
  id,
  typeName: 'Contrato',
  projectId: 1,
  projectName: 'Proyecto 1',
  costCenterCode: 'CC-1',
  requesterName: 'Luis Soto',
  status: STATUSES.request[0],
  createdAt: '2026-03-05T10:00:00',
  updatedAt: '2026-03-06T11:30:00',
  actions: ALL_ACTIONS,
  approvals: [
    { id: 1, level: 'PROJECT_MANAGER', decision: 'APPROVED', rejectionReasonName: null, comment: null, approverName: 'Jefe', createdAt: '2026-03-05T12:00:00' },
    { id: 2, level: 'HR', decision: 'REJECTED', rejectionReasonName: 'Motivo', comment: 'Falta dato', approverName: 'RRHH', createdAt: '2026-03-05T13:00:00' },
  ],
})

export const contractList = (id = 1) => ({
  id,
  requestId: id,
  costCenterCode: 'CC-1',
  contractTypeName: 'Plazo fijo',
  jobTitleName: 'Maestro',
  staff: staffRef,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  agreedSalary: 900000,
  statusName: 'Vigente',
  statusCode: 'ACTIVE',
  actions: ALL_ACTIONS,
})

const requirement = (type: string, required = true) => ({ type, label: `Requisito ${type}`, required })

export const contract = (id = 1) => ({
  ...contractList(id),
  baseSalary: 800000,
  company: named(1, 'Empresa 1'),
  contractType: named(1, 'Plazo fijo'),
  jobTitle: named(1, 'Maestro'),
  site: named(1, 'Casa matriz'),
  project: { id: 1, name: 'Proyecto 1' },
  weeklyWorkHours: 45,
  workDays: 5,
  contractDetail: 'Detalle',
  mealType: named(1, 'Almuerzo'),
  transportType: null,
  rexContractNumber: 'REX-1',
  attachments: [attachmentRaw(1)],
  attachmentRequirements: [requirement('CEDULA_FRONTAL')],
  status: STATUSES.contract[1],
  ...STAMPS,
})

export const termination = (id = 1) => ({
  id,
  requestId: id,
  costCenterCode: 'CC-1',
  staff: staffRef,
  legalTerminationCauseName: 'Necesidades de la empresa',
  terminationDate: '2026-06-30',
  definitiveTermination: true,
  statusName: 'Aprobado',
  statusCode: 'APPROVED',
  jobTitleName: 'Maestro',
  contractStartDate: '2026-01-01',
  legalTerminationCause: named(1, 'Necesidades de la empresa'),
  nonRehireReason: named(1, 'Mal desempeño'),
  notes: 'Observaciones',
  rexTerminationNumber: 'REX-9',
  annulmentReason: null,
  attachments: [attachmentRaw(1)],
  attachmentRequirements: [requirement('CARTA')],
  status: status('APPROVED', 'Aprobado', 3),
  ...STAMPS,
})

const contractSummary = {
  contractType: { id: 1, code: 'F', name: 'Plazo fijo' },
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  baseSalary: 800000,
  jobTitle: named(1, 'Maestro'),
  weeklyWorkHours: 45,
  workDays: 5,
  site: named(1, 'Casa matriz'),
  project: { id: 1, name: 'Proyecto 1' },
}

export const annex = (id = 1, code = 'CONTRACT_EXTENSION') => ({
  id,
  requestId: id,
  costCenterCode: 'CC-1',
  staff: staffRef,
  project: { id: 1, name: 'Proyecto 1' },
  annexType: { id: 1, name: 'Prórroga', code },
  effectiveDate: '2026-07-01',
  description: 'Descripción del anexo',
  newEndDate: '2027-06-30',
  newBaseSalary: 900000,
  newJobTitleName: 'Jefe',
  newJobTitle: named(2, 'Jefe'),
  newWeeklyWorkHours: 40,
  newWorkDays: 4,
  newSite: named(2, 'Norte'),
  previousEndDate: '2026-12-31',
  previousBaseSalary: 800000,
  previousJobTitle: named(1, 'Maestro'),
  previousContractType: named(1, 'Plazo fijo'),
  previousWeeklyWorkHours: 45,
  previousWorkDays: 5,
  previousSite: named(1, 'Casa matriz'),
  currentContract: contractSummary,
  statusName: 'Pendiente de aprobación',
  statusCode: 'PENDING_APPROVAL',
  status: status('PENDING_APPROVAL', 'Pendiente de aprobación'),
  rexAnnexNumber: null,
  attachments: [attachmentRaw(1)],
  attachmentRequirements: [requirement('ANEXO', false)],
  ...STAMPS,
})

export const annexableStaff = (id = 1) => ({
  id,
  name: 'Ana Paz Rojas',
  identificationNumber: '12345678-5',
  activeContract: contractSummary,
})

export const setting = (key: string, type: 'INTEGER' | 'DECIMAL' | 'BOOLEAN', group = 'contracts') => ({
  key,
  group,
  groupLabel: `Grupo ${group}`,
  label: `Parámetro ${key}`,
  type,
  value: type === 'BOOLEAN' ? 'true' : '5',
  defaultValue: type === 'BOOLEAN' ? 'false' : '3',
  min: type === 'BOOLEAN' ? null : 1,
  max: type === 'BOOLEAN' ? null : 99,
  updatedAt: '2026-03-06T11:30:00',
  updatedBy: 'Ana Pérez',
})
