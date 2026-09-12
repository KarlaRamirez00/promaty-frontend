export default {
  // Toasts
  toastCreate: {
    title: 'Especialidad creada con éxito',
    message: 'Puedes ver la nueva especialidad desde la lista.',
  },
  toastUpdate: {
    title: 'Especialidad editada con éxito',
    message: 'Puedes ver la especialidad actualizada desde la lista.',
  },
  toastActivate: {
    title: 'Especialidad activada',
    message: 'La especialidad ha sido activada con éxito.',
  },
  toastDeactivate: {
    title: 'Especialidad desactivada',
    message: 'La especialidad ha sido desactivada con éxito.',
  },
  toastError: {
    title: 'Hubo un error',
    message: 'Revisa tu conexión a internet o contacta con un administrador.',
  },

  // Alertas dentro del formulario de crear/editar
  alertInfo: {
    title: 'Nueva especialidad',
    message: 'Completa la información de la especialidad.',
  },
  alertError: {
    title: 'Nueva especialidad',
    message: 'Debes <strong>llenar la información</strong> de la especialidad.',
  },

  // Validación del formulario de crear/editar
  rules: {
    nameRequired: 'El nombre es obligatorio.',
    nameMaxLength: 'El nombre no puede superar los 120 caracteres.',
  },
}
