export default {
  // Toasts
  toastCreate: {
    title: 'Motivo de rechazo creado con éxito',
    message: 'Puedes ver el nuevo motivo desde la lista.',
  },
  toastUpdate: {
    title: 'Motivo de rechazo editado con éxito',
    message: 'Puedes ver el motivo actualizado desde la lista.',
  },
  toastActivate: {
    title: 'Motivo de rechazo activado',
    message: 'El motivo ha sido activado con éxito.',
  },
  toastDeactivate: {
    title: 'Motivo de rechazo desactivado',
    message: 'El motivo ha sido desactivado con éxito.',
  },
  toastError: {
    title: 'Hubo un error',
    message: 'Revisa tu conexión a internet o contacta con un administrador.',
  },

  // Alertas dentro del formulario de crear/editar
  alertInfo: {
    title: 'Nuevo motivo de rechazo',
    message: 'Completa la información del motivo de rechazo.',
  },
  alertError: {
    title: 'Nuevo motivo de rechazo',
    message: 'Debes <strong>llenar la información</strong> del motivo de rechazo.',
  },

  // Validación del formulario de crear/editar
  rules: {
    nameRequired: 'El nombre es obligatorio.',
    nameMaxLength: 'Máximo 150 caracteres.',
    descriptionMaxLength: 'Máximo 250 caracteres.',
    subModuleRequired: 'El submódulo es obligatorio.',
  },
}
