export default {
  toastCreate: {
    title: 'Solicitud de finiquito enviada',
    message: 'Puedes seguir su aprobación desde Solicitudes.',
  },
  toastUpdate: {
    title: 'Finiquito editado con éxito',
    message: 'Puedes ver el finiquito actualizado desde la lista.',
  },
  toastAnnul: {
    title: 'Finiquito anulado',
    message: 'El finiquito fue anulado con éxito.',
  },
  toastError: {
    title: 'Hubo un error',
    message: 'Revisa tu conexión a internet o contacta con un administrador.',
  },

  alertInfo: {
    title: 'Nuevo finiquito',
    message: 'Completa la información del finiquito. Se enviará como solicitud para su <strong>aprobación</strong>.',
  },
  alertEdit: {
    title: 'Editar finiquito',
    message: 'Modifica la información del finiquito. El colaborador no se puede cambiar.',
  },
  alertError: {
    title: 'Nuevo finiquito',
    message: 'Debes <strong>llenar la información</strong> del finiquito.',
  },

  rules: {
    staffRequired: 'Selecciona un colaborador.',
    terminationDateRequired: 'La fecha de término es obligatoria.',
    causeRequired: 'Selecciona una causal.',
    nonRehireReasonRequired: 'Selecciona un motivo de no recontratación.',
    notesMaxLength: 'Máximo 500 caracteres.',
    annulReasonRequired: 'Indica el motivo de la anulación.',
    annulReasonMaxLength: 'El motivo no puede superar los 250 caracteres.',
  },
}
