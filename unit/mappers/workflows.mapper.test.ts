import { describe, expect, it } from 'vitest'
import * as m from '@/mappers'
import { createAnnexForm, createContractForm, createStaffForm, createTerminationForm } from '@/models'

const STAMPS = {
  createdAt: '2026-03-05T10:00:00',
  updatedAt: '2026-03-06T11:30:00',
  createdBy: 'ana',
  updatedBy: 'luis',
  actions: ['UPDATE'],
}
const STATUS = { id: 1, code: 'APPROVED', name: 'Aprobado' }
const STAFF = { id: 7, fullName: 'Ana Paz', identificationNumber: '12345678-5' }
const FILE = { id: 1, name: 'doc.PDF', fileSize: 2048, mediaFileId: 'm', updatedAt: '2026-03-06T11:30:00' }

describe('retry sync mapper', () => {
  it('normaliza el resultado del reintento', () => {
    expect(m.mapperRetrySyncResult({ synced: true, syncErrorMessage: null })).toEqual({ synced: true, syncErrorMessage: null })
    expect(m.mapperRetrySyncResult({ synced: false, syncErrorMessage: 'Rex+ caído' })).toEqual({ synced: false, syncErrorMessage: 'Rex+ caído' })
  })

  it('un resultado sin synced o sin motivo no se toma como sincronizado', () => {
    expect(m.mapperRetrySyncResult({} as never)).toEqual({ synced: false, syncErrorMessage: null })
  })
})

describe('annul mapper', () => {
  it('recorta el motivo de la anulación', () => {
    expect(m.mapperAnnulPayload({ reason: '  Error de digitación ' })).toEqual({ reason: 'Error de digitación' })
  })
})

describe('contract mapper', () => {
  const raw = {
    id: 1,
    requestId: 2,
    costCenterCode: 'CC',
    contractTypeName: 'Fijo',
    jobTitleName: 'Maestro',
    staff: STAFF,
    startDate: '2026-01-01',
    endDate: null,
    agreedSalary: 900000,
    baseSalary: 800000,
    statusName: 'Vigente',
    statusCode: 'ACTIVE',
    company: { id: 1, name: 'Cia' },
    contractType: { id: 2, name: 'Fijo' },
    jobTitle: { id: 3, name: 'Maestro' },
    site: { id: 4, name: 'Sucursal' },
    project: { id: 5, name: 'Obra' },
    weeklyWorkHours: 45,
    workDays: 5,
    contractDetail: null,
    mealType: null,
    transportType: null,
    rexContractNumber: null,
    attachments: [FILE, { ...FILE, name: 'sinextension' }],
    attachmentRequirements: [{ type: 'X' }],
    status: STATUS,
    ...STAMPS,
  }

  it('formatea identificación solo si es RUT', () => {
    expect(m.toDisplayIdentification('12345678-5')).toBe('12.345.678-5')
    expect(m.toDisplayIdentification('P1234567')).toBe('P1234567')
  })

  it('mapea opciones de catálogo y colaboradores', () => {
    expect(m.mapperContractCatalogOptions([{ id: 1, name: 'A', code: 'a' }])).toEqual([{ id: 1, name: 'A', code: 'a' }])
    expect(m.mapperContractStaffOptions([{ id: 1, name: 'Ana', identificationNumber: '1-9' }] as never)).toEqual([
      { id: 1, title: 'Ana — 1-9' },
    ])
  })

  it('lista', () => {
    expect(m.mapperContractList([raw] as never)[0]).toMatchObject({
      identificationNumber: '12.345.678-5',
      startDate: '01-01-2026',
      endDate: 'S/F',
      agreedSalary: '$ 900.000',
      statusColor: 'success',
    })
  })

  it('detalle usa S/D para opcionales y deduce el tipo de archivo', () => {
    const detail = m.mapperContractDetail(raw as never)
    expect(detail).toMatchObject({
      contractDetail: 'S/D',
      mealTypeName: 'S/D',
      transportTypeName: 'S/D',
      baseSalary: '$ 800.000',
      createdAt: '05-03-2026, 10:00 h',
    })
    expect(detail.attachments.map((a) => a.fileType)).toEqual(['pdf', ''])
    expect(detail.attachments[0].fileSizeLabel).toBe('2 KB')
  })

  it('detalle con opcionales presentes y sin adjuntos', () => {
    const detail = m.mapperContractDetail({
      ...raw,
      contractDetail: 'texto',
      mealType: { id: 1, name: 'Almuerzo' },
      transportType: { id: 2, name: 'Bus' },
      attachments: undefined,
      attachmentRequirements: undefined,
    } as never)
    expect(detail).toMatchObject({ contractDetail: 'texto', mealTypeName: 'Almuerzo', transportTypeName: 'Bus', attachments: [], attachmentRequirements: [] })
  })

  it('datos de edición', () => {
    const edit = m.mapperContractEditData({ ...raw, mealType: { id: 8, name: 'M' }, transportType: { id: 9, name: 'T' } } as never)
    expect(edit.form).toMatchObject({
      id: 1,
      staffId: 7,
      staffLabel: 'Ana Paz — 12.345.678-5',
      projectId: 5,
      baseSalary: '800.000',
      agreedSalary: '900.000',
      mealTypeId: 8,
      transportTypeId: 9,
      contractDetail: '',
    })
    expect(edit.currentProject).toEqual({ id: 5, name: 'Obra' })
    const sparse = m.mapperContractEditData({ ...raw, agreedSalary: null, attachments: undefined, contractDetail: 'x' } as never)
    expect(sparse.form).toMatchObject({ agreedSalary: '', mealTypeId: null, transportTypeId: null, contractDetail: 'x' })
    expect(sparse.attachments).toEqual([])
  })

  it('payloads de solicitud y edición', () => {
    const form = createContractForm({
      staffId: 7,
      projectId: 5,
      companyId: 1,
      contractTypeId: 2,
      jobTitleId: 3,
      siteId: 4,
      startDate: '2026-01-01',
      baseSalary: '800.000',
      agreedSalary: '900.000',
      weeklyWorkHours: 45,
      workDays: 5,
      contractDetail: '  ',
    })
    const create = m.mapperContractFormToPayload(form)
    expect(create).toMatchObject({ entityType: 'CONTRACT', action: 'CREATE', projectId: 5 })
    expect(create.contractData).toMatchObject({ staffId: 7, baseSalary: 800000, agreedSalary: 900000, contractDetail: null })
    const update = m.mapperContractFormToUpdatePayload({ ...form, agreedSalary: '', contractDetail: ' t ' })
    expect(update).toMatchObject({ projectId: 5, agreedSalary: null, contractDetail: 't' })
  })
})

describe('staff mapper', () => {
  const raw = {
    id: 1,
    identificationType: 'RUT',
    identificationNumber: '123456785',
    firstName: 'Ana',
    paternalLastName: 'Paz',
    maternalLastName: '',
    costCenterCode: null,
    hireDate: '2026-02-01',
    statusCode: 'ACTIVE',
    statusName: 'Activo',
    status: STATUS,
    attachments: null,
    ...STAMPS,
  }

  it('lista formatea RUT, nombre y centro de costo', () => {
    expect(m.mapperStaffList([raw, { ...raw, identificationType: 'PASSPORT', identificationNumber: 'P1', costCenterCode: 'CC' }] as never)).toMatchObject([
      { identificationNumber: '12.345.678-5', fullName: 'Ana Paz', costCenterCode: 'S/D', hireDate: '01-02-2026' },
      { identificationNumber: 'P1', costCenterCode: 'CC' },
    ])
  })

  it('detalle', () => {
    const detail = m.mapperStaffDetail({ ...raw, birthDate: '1990-01-01', blockReason: null } as never)
    expect(detail).toMatchObject({ fullName: 'Ana Paz', attachments: [], createdAt: '05-03-2026, 10:00 h' })
  })

  it('payload de formulario y de creación', () => {
    const form = createStaffForm({
      identificationType: 'RUT',
      identificationNumber: ' 12345678-5 ',
      firstName: ' Ana ',
      paternalLastName: ' Paz ',
      maternalLastName: ' Rojas ',
      birthDate: '1990-01-01',
      registeredSexId: 1,
      maritalStatusId: 2,
      nationalityId: 3,
      phone1: '9 1234 5678',
      emergencyPhone: '9 8765 4321',
      emergencyContactName: ' Luis ',
      address: ' Calle 1 ',
      comunaId: 4,
      hasChildren: true,
      childrenCount: 2,
      personalEmail: ' a@a.cl ',
      shoeSize: 40,
      clothingSize: 'M',
      educationLevelId: 5,
      afpId: 6,
      healthSystemId: 7,
      bankId: 8,
      accountType: 'CHECKING',
      accountNumber: ' 123 ',
    } as never)
    const payload = m.mapperStaffFormToPayload(form)
    expect(payload).toMatchObject({ firstName: 'Ana', phone1: '912345678', emergencyPhone: '987654321', childrenCount: 2, accountNumber: '123' })
    expect(m.mapperStaffFormToPayload({ ...form, hasChildren: false }).childrenCount).toBeNull()
    expect(m.mapperStaffFormToCreatePayload(form)).toMatchObject({ identificationType: 'RUT', identificationNumber: '12345678-5' })
  })

  it('payloads de bloqueo y desbloqueo', () => {
    expect(m.mapperStaffBlockPayload(9, { reason: ' motivo ' })).toEqual({ statusId: 9, blockReason: 'motivo' })
    expect(m.mapperStaffUnblockPayload(3)).toEqual({ statusId: 3 })
  })
})

describe('request mapper', () => {
  const raw = {
    id: 1,
    entityType: 'CONTRACT',
    entityId: 2,
    typeName: 'Contrato',
    staffFirstName: 'Ana',
    staffPaternalLastName: 'Paz',
    staffMaternalLastName: null,
    staffIdentificationNumber: '123456785',
    staffIdentificationType: 'RUT',
    staffPosition: null,
    costCenterCode: 'CC',
    requesterName: 'Luis',
    status: STATUS,
    createdAt: '2026-03-05T10:00:00',
    actions: [],
  }

  it('lista con datos completos y ausentes', () => {
    const [full, empty, passport] = m.mapperRequestList([
      raw,
      { ...raw, staffFirstName: null, staffPaternalLastName: null, staffIdentificationNumber: null, staffPosition: 'Jefe' },
      { ...raw, staffIdentificationType: 'PASSPORT', staffIdentificationNumber: 'P1' },
    ] as never)
    expect(full).toMatchObject({ staffFullName: 'Ana Paz', staffIdentificationNumber: '12.345.678-5', staffPosition: 'S/D', createdAt: '05-03-2026', statusColor: expect.any(String) })
    expect(empty).toMatchObject({ staffFullName: 'S/D', staffIdentificationNumber: 'S/D', staffPosition: 'Jefe' })
    expect(passport.staffIdentificationNumber).toBe('P1')
  })

  it('detalle traduce los niveles de aprobación', () => {
    const detail = m.mapperRequestDetail({
      id: 1,
      typeName: 'Contrato',
      projectId: 2,
      projectName: 'Obra',
      costCenterCode: 'CC',
      requesterName: 'Luis',
      status: STATUS,
      createdAt: '2026-03-05T10:00:00',
      updatedAt: '2026-03-06T11:30:00',
      actions: [],
      approvals: [
        { id: 1, level: 'PROJECT_MANAGER', decision: 'APPROVED', rejectionReasonName: null, comment: null, approverName: 'a', createdAt: '2026-03-05T10:00:00' },
        { id: 2, level: 'OTHER', decision: 'REJECTED', rejectionReasonName: 'x', comment: 'c', approverName: 'b', createdAt: '2026-03-05T10:00:00' },
        { id: 3, level: 'HR', decision: 'APPROVED', rejectionReasonName: null, comment: null, approverName: 'c', createdAt: '2026-03-05T10:00:00' },
      ],
    } as never)
    expect(detail.approvals.map((a) => [a.levelLabel, a.approved])).toEqual([
      ['Gerente de obra', true],
      ['OTHER', false],
      ['RRHH', true],
    ])
  })

  it('payloads de decisión', () => {
    expect(m.mapperRequestApprovePayload()).toEqual({ decision: 'APPROVED' })
    expect(m.mapperRequestRejectPayload({ rejectionReasonId: 3, comment: ' no ' } as never)).toEqual({
      decision: 'REJECTED',
      rejectionReasonId: 3,
      comment: 'no',
    })
    expect(m.mapperRequestRejectPayload({ rejectionReasonId: 3, comment: '  ' } as never)).toEqual({
      decision: 'REJECTED',
      rejectionReasonId: 3,
    })
  })
})

describe('termination mapper', () => {
  const raw = {
    id: 1,
    requestId: 2,
    costCenterCode: 'CC',
    staff: STAFF,
    legalTerminationCauseName: 'Causa',
    terminationDate: '2026-03-05',
    definitiveTermination: true,
    statusName: 'Aprobado',
    statusCode: 'APPROVED',
    jobTitleName: 'Maestro',
    contractStartDate: '2026-01-01',
    legalTerminationCause: { id: 1, name: 'Causa' },
    nonRehireReason: { id: 2, name: 'Motivo' },
    notes: null,
    rexTerminationNumber: null,
    annulmentReason: null,
    attachments: [FILE],
    attachmentRequirements: [{ required: true, label: 'Carta' }],
    status: STATUS,
    ...STAMPS,
  }

  it('lista y opciones', () => {
    expect(m.mapperTerminationList([raw] as never)[0]).toMatchObject({ terminationDate: '05-03-2026', definitive: true })
    expect(m.mapperTerminationStaffOptions([{ id: 1, name: 'Ana', identificationNumber: '12345678-5', minTerminationDate: 'a', maxTerminationDate: 'b' }] as never)).toEqual([
      { id: 1, title: 'Ana — 12.345.678-5', minDate: 'a', maxDate: 'b' },
    ])
    expect(m.mapperTerminationCatalogOptions([{ id: 1, name: 'X', extra: 1 }] as never)).toEqual([{ id: 1, name: 'X' }])
    expect(
      m.mapperLegalTerminationCauseOptions([
        { id: 1, name: 'A', requiresAttachment: true, attachmentLabel: 'L' },
        { id: 2, name: 'B' },
      ] as never),
    ).toEqual([
      { id: 1, name: 'A', requiresAttachment: true, attachmentLabel: 'L' },
      { id: 2, name: 'B', requiresAttachment: false, attachmentLabel: '' },
    ])
  })

  it('detalle', () => {
    const detail = m.mapperTerminationDetail(raw as never)
    expect(detail).toMatchObject({ definitive: 'Sí', isDefinitive: true, nonRehireReasonName: 'Motivo', notes: 'S/D', terminationDate: '05-03-2026' })
    const other = m.mapperTerminationDetail({ ...raw, definitiveTermination: false, nonRehireReason: null, notes: 'n', attachments: undefined, attachmentRequirements: undefined } as never)
    expect(other).toMatchObject({ definitive: 'No', nonRehireReasonName: 'S/D', notes: 'n', attachments: [], attachmentRequirements: [] })
  })

  it('datos de edición', () => {
    const edit = m.mapperTerminationEditData(raw as never)
    expect(edit.currentCause).toMatchObject({ requiresAttachment: true, attachmentLabel: 'Carta' })
    expect(edit.form).toMatchObject({ staffId: 7, nonRehireReasonId: 2, notes: '' })
    const none = m.mapperTerminationEditData({ ...raw, nonRehireReason: null, notes: 'x', attachments: undefined, attachmentRequirements: undefined } as never)
    expect(none.currentCause).toMatchObject({ requiresAttachment: false, attachmentLabel: '' })
    expect(none.form).toMatchObject({ nonRehireReasonId: null, notes: 'x' })
  })

  it('payloads', () => {
    const form = createTerminationForm({
      staffId: 7,
      terminationDate: '2026-03-05',
      legalTerminationCauseId: 1,
      definitiveTermination: true,
      nonRehireReasonId: 2,
      notes: ' n ',
    })
    expect(m.mapperTerminationFormToCreatePayload(form)).toMatchObject({
      entityType: 'TERMINATION',
      terminationData: { staffId: 7, nonRehireReasonId: 2, notes: 'n' },
    })
    expect(m.mapperTerminationFormToUpdatePayload({ ...form, definitiveTermination: false, notes: ' ' })).toMatchObject({
      nonRehireReasonId: null,
      notes: null,
    })
    expect(m.mapperAnnulPayload({ reason: ' r ' })).toEqual({ reason: 'r' })
  })
})

describe('annex mapper', () => {
  const summary = {
    contractType: { code: 'F', name: 'Fijo' },
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    baseSalary: 800000,
    jobTitle: { id: 1, name: 'Maestro' },
    weeklyWorkHours: 45,
    workDays: 5,
    site: { id: 1, name: 'Casa matriz' },
    project: { id: 1, name: 'Obra' },
  }
  const raw = {
    id: 1,
    requestId: 2,
    costCenterCode: 'CC',
    staff: STAFF,
    project: { id: 1, name: 'Obra' },
    annexType: { id: 1, name: 'Prórroga', code: 'CONTRACT_EXTENSION' },
    effectiveDate: '2026-04-01',
    description: 'd',
    newEndDate: '2027-01-01',
    newBaseSalary: 900000,
    newJobTitleName: 'Jefe',
    newJobTitle: { id: 5, name: 'Jefe' },
    newWeeklyWorkHours: 40,
    newWorkDays: 4,
    newSite: { id: 6, name: 'Norte' },
    previousEndDate: '2026-12-31',
    previousBaseSalary: 800000,
    previousJobTitle: { id: 1, name: 'Maestro' },
    previousContractType: { id: 1, name: 'Fijo' },
    previousWeeklyWorkHours: 45,
    previousWorkDays: 5,
    previousSite: { id: 1, name: 'Casa matriz' },
    currentContract: summary,
    statusName: 'Pendiente',
    statusCode: 'PENDING_APPROVAL',
    status: { id: 1, code: 'PENDING_APPROVAL', name: 'Pendiente' },
    rexAnnexNumber: null,
    attachments: [FILE],
    attachmentRequirements: [],
    ...STAMPS,
  }
  const withType = (code: string, extra: object = {}) => ({ ...raw, annexType: { id: 1, name: 'T', code }, ...extra })

  it('opciones de tipo y colaboradores', () => {
    expect(m.mapperAnnexTypeOptions([{ id: 1, name: 'A', code: 'c', extra: 1 }] as never)).toEqual([{ id: 1, name: 'A', code: 'c' }])
    const [option] = m.mapperAnnexStaffOptions([{ id: 1, name: 'Ana', identificationNumber: '12345678-5', activeContract: summary }] as never)
    expect(option).toMatchObject({ title: 'Ana — 12.345.678-5', identification: '12.345.678-5' })
    expect(option.contract).toMatchObject({ startDate: '01-01-2026', baseSalary: '$ 800.000', baseSalaryValue: 800000, projectName: 'Obra', endDateIso: '2026-12-31' })
  })

  it('arma los datos de la tarjeta del contrato', () => {
    const [option] = m.mapperAnnexStaffOptions([{ id: 1, name: 'Ana', identificationNumber: '1-9', activeContract: summary }] as never)
    const items = m.mapperAnnexContractInfoItems(option.contract)
    expect(items.map((i) => i.label)).toEqual(['Tipo de contrato', 'Vigencia', 'Centro de costo', 'Cargo', 'Sueldo base', 'Jornada', 'Sucursal'])
    expect(items[1].value).toBe('01-01-2026 → 31-12-2026')
    expect(items[5].value).toBe('45 h · 5 días')
  })

  it('resume el cambio en la lista según el tipo', () => {
    const rows = [
      withType('CONTRACT_EXTENSION'),
      withType('CONVERSION_TO_INDEFINITE'),
      withType('SALARY_INCREASE'),
      withType('JOB_TITLE_CHANGE'),
      withType('JOB_TITLE_CHANGE', { newJobTitleName: null }),
      withType('SCHEDULE_OR_SITE_CHANGE'),
    ]
    expect(m.mapperAnnexList(rows as never).map((r) => r.change)).toEqual(['01-01-2027', 'Indefinido', '$ 900.000', 'Jefe', 'S/D', 'S/D'])
  })

  it('el detalle muestra el "antes" actual si no está aprobado y el previo si lo está', () => {
    const pending = m.mapperAnnexDetail(raw as never)
    expect(pending.changes).toEqual([{ key: 'endDate', label: 'Fecha de término', before: '31-12-2026', after: '01-01-2027' }])
    const approved = m.mapperAnnexDetail({ ...raw, status: STATUS, currentContract: { ...summary, endDate: '2027-01-01' } } as never)
    expect(approved.changes[0].before).toBe('31-12-2026')
  })

  it('el detalle arma el cambio de cada tipo', () => {
    const detailOf = (code: string, extra: object = {}) => m.mapperAnnexDetail(withType(code, extra) as never).changes
    expect(detailOf('CONVERSION_TO_INDEFINITE')[0]).toMatchObject({ key: 'contractType', before: 'Fijo', after: 'Indefinido' })
    expect(detailOf('CONVERSION_TO_INDEFINITE', { status: STATUS })[0].before).toBe('Fijo')
    expect(detailOf('CONVERSION_TO_INDEFINITE', { currentContract: null })[0].before).toBe('S/D')
    expect(detailOf('SALARY_INCREASE')[0]).toMatchObject({ key: 'baseSalary', before: '$ 800.000', after: '$ 900.000' })
    expect(detailOf('JOB_TITLE_CHANGE')[0]).toMatchObject({ key: 'jobTitle', before: 'Maestro', after: 'Jefe' })
    expect(detailOf('JOB_TITLE_CHANGE', { currentContract: null, newJobTitle: null })[0]).toMatchObject({ before: 'S/D', after: 'S/D' })
    expect(detailOf('UNKNOWN')).toEqual([])
  })

  it('el detalle de horario y sucursal incluye solo lo que cambia', () => {
    const changes = m.mapperAnnexDetail(withType('SCHEDULE_OR_SITE_CHANGE') as never).changes
    expect(changes).toEqual([
      { key: 'weeklyWorkHours', label: 'Horas semanales', before: '45 h', after: '40 h' },
      { key: 'workDays', label: 'Días de trabajo', before: '5 días', after: '4 días' },
      { key: 'site', label: 'Sucursal', before: 'Casa matriz', after: 'Norte' },
    ])
    const approved = m.mapperAnnexDetail(
      withType('SCHEDULE_OR_SITE_CHANGE', { status: STATUS, previousWeeklyWorkHours: null, previousWorkDays: null, previousSite: null }) as never,
    ).changes
    expect(approved.map((c) => c.before)).toEqual(['S/D', 'S/D', 'S/D'])
    const none = m.mapperAnnexDetail(
      withType('SCHEDULE_OR_SITE_CHANGE', { newWeeklyWorkHours: null, newWorkDays: null, newSite: null, currentContract: null }) as never,
    ).changes
    expect(none).toEqual([])
    const noContract = m.mapperAnnexDetail(withType('SCHEDULE_OR_SITE_CHANGE', { currentContract: null }) as never).changes
    expect(noContract.map((c) => c.before)).toEqual(['S/D', 'S/D', 'S/D'])
  })

  it('el detalle conserva adjuntos y requisitos por defecto', () => {
    const detail = m.mapperAnnexDetail({ ...raw, attachments: undefined, attachmentRequirements: undefined } as never)
    expect(detail).toMatchObject({ attachments: [], attachmentRequirements: [], effectiveDate: '01-04-2026' })
    expect(m.mapperAnnexDetail(raw as never).attachments[0]).toMatchObject({ fileType: 'pdf', fileSizeLabel: '2 KB' })
  })

  it('datos de edición', () => {
    const edit = m.mapperAnnexEditData(raw as never)
    expect(edit.form).toMatchObject({ staffId: 7, annexTypeId: 1, newBaseSalary: '900.000', newJobTitleId: 5, newSiteId: 6 })
    expect(edit.contract).toMatchObject({ projectName: 'Obra' })
    const sparse = m.mapperAnnexEditData({ ...raw, newBaseSalary: null, newJobTitle: null, newSite: null, currentContract: null, attachments: undefined } as never)
    expect(sparse.form).toMatchObject({ newBaseSalary: '', newJobTitleId: null, newSiteId: null })
    expect(sparse).toMatchObject({ contract: null, attachments: [] })
  })

  it('payloads incluyen solo los campos informados', () => {
    const form = createAnnexForm({
      staffId: 7,
      annexTypeId: 1,
      effectiveDate: '2026-04-01',
      description: ' d ',
      newEndDate: '2027-01-01',
      newBaseSalary: '900.000',
      newJobTitleId: 5,
      newWeeklyWorkHours: 40,
      newWorkDays: 4,
      newSiteId: 6,
    })
    const create = m.mapperAnnexFormToCreatePayload(form)
    expect(create).toMatchObject({ entityType: 'ANNEX', action: 'CREATE' })
    expect(create.annexData).toMatchObject({ staffId: 7, description: 'd', newBaseSalary: 900000, newSiteId: 6, newWorkDays: 4 })
    const minimal = m.mapperAnnexFormToUpdatePayload(createAnnexForm({ annexTypeId: 1, effectiveDate: '2026-04-01', description: 'x' }))
    expect(Object.keys(minimal).sort()).toEqual(['annexTypeId', 'description', 'effectiveDate'])
  })
})
