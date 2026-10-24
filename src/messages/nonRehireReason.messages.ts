export default {
  // Toasts
  toastCreate: {
    title: 'Motivo de no recontratación creado con éxito',
    message: 'Puedes ver el nuevo motivo desde la lista.',
  },
  toastUpdate: {
    title: 'Motivo de no recontratación editado con éxito',
    message: 'Puedes ver el motivo actualizado desde la lista.',
  },
  toastActivate: {
    title: 'Motivo de no recontratación activado',
    message: 'El motivo ha sido activado con éxito.',
  },
  toastDeactivate: {
    title: 'Motivo de no recontratación desactivado',
    message: 'El motivo ha sido desactivado con éxito.',
  },
  toastError: {
    title: 'Hubo un error',
    message: 'Revisa tu conexión a internet o contacta con un administrador.',
  },

  // Alertas dentro del formulario de crear/editar
  alertInfo: {
    title: 'Nuevo motivo de no recontratación',
    message: 'Completa la información del motivo de no recontratación.',
  },
  alertError: {
    title: 'Nuevo motivo de no recontratación',
    message: 'Debes <strong>llenar la información</strong> del motivo de no recontratación.',
  },

  // Validación del formulario de crear/editar
  rules: {
    nameRequired: 'El nombre es obligatorio.',
    nameMaxLength: 'Máximo 150 caracteres.',
    descriptionMaxLength: 'Máximo 250 caracteres.',
  },
}
