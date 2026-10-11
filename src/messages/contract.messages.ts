export default {
  toastCreate: {
    title: 'Solicitud de contrato enviada',
    message: 'Puedes seguir su aprobación desde Solicitudes.',
  },
  toastUpdate: {
    title: 'Solicitud de contrato actualizada',
  },
  toastError: {
    title: 'Hubo un error',
    message: 'Revisa tu conexión a internet o contacta con un administrador.',
  },

  alertInfo: {
    title: 'Nuevo contrato',
    message: 'Completa la información del contrato. Se enviará como solicitud para su <strong>aprobación</strong>.',
  },
  alertError: {
    title: 'Nuevo contrato',
    message: 'Debes <strong>llenar la información</strong> del contrato.',
  },

  rules: {
    projectRequired: 'Selecciona un centro de costo.',
    staffRequired: 'Selecciona un colaborador.',
    companyRequired: 'Selecciona una empresa.',
    contractTypeRequired: 'Selecciona un tipo de contrato.',
    jobTitleRequired: 'Selecciona un cargo.',
    siteRequired: 'Selecciona una sede.',
    startDateRequired: 'La fecha de inicio es obligatoria.',
    startDatePast: 'La fecha de inicio no puede ser anterior a hoy.',
    endDateRequired: 'La fecha de término es obligatoria para contratos a plazo fijo.',
    endDateBeforeStart: 'La fecha de término no puede ser anterior a la de inicio.',
    baseSalaryRequired: 'El sueldo base es obligatorio.',
    salaryPositive: 'Debe ser mayor a 0.',
    weeklyWorkHoursRequired: 'Selecciona las horas semanales.',
    workDaysRequired: 'Selecciona los días de trabajo.',
    contractDetailMaxLength: 'Máximo 500 caracteres.',
  },
}
