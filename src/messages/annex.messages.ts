export default {
  toastCreate: {
    title: 'Solicitud de anexo enviada',
    message: 'Puedes seguir su aprobación desde Solicitudes.',
  },
  toastUpdate: {
    title: 'Solicitud de anexo actualizada',
  },
  toastError: {
    title: 'Hubo un error',
    message: 'Revisa tu conexión a internet o contacta con un administrador.',
  },

  alertInfo: {
    title: 'Nuevo anexo',
    message: 'Completa la información del anexo. Se enviará como solicitud para su <strong>aprobación</strong>.',
  },
  alertEdit: {
    title: 'Editar anexo',
    message: 'Modifica la información del anexo. El colaborador no se puede cambiar. Al guardar, la solicitud vuelve a la jefatura para su <strong>aprobación</strong>.',
  },
  alertError: {
    title: 'Nuevo anexo',
    message: 'Debes <strong>llenar la información</strong> del anexo.',
  },

  rules: {
    staffRequired: 'Selecciona un colaborador.',
    annexTypeRequired: 'Selecciona un tipo de anexo.',
    effectiveDateRequired: 'La fecha de vigencia es obligatoria.',
    descriptionRequired: 'La descripción es obligatoria.',
    descriptionMaxLength: 'Máximo 500 caracteres.',
    newEndDateRequired: 'La nueva fecha de término es obligatoria.',
    newEndDateAfterCurrent: 'Debe ser posterior al término actual del contrato.',
    newBaseSalaryRequired: 'El nuevo sueldo base es obligatorio.',
    newBaseSalaryGreater: 'Debe ser mayor al sueldo actual.',
    newJobTitleRequired: 'Selecciona el nuevo cargo.',
    scheduleOrSiteRequired: 'Indica al menos un cambio: horas, días o sucursal.',
  },
}
