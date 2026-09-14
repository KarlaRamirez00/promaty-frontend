export default {
  // Toasts
  toastCreate: {
    title: 'Proyecto creado con éxito',
    message: 'Puedes ver el nuevo proyecto desde la lista.',
  },
  toastUpdate: {
    title: 'Proyecto editado con éxito',
    message: 'Puedes ver el proyecto actualizado desde la lista.',
  },
  toastStatusUpdated: {
    title: 'Estado actualizado',
    message: 'El estado del proyecto se actualizó correctamente.',
  },
  toastError: {
    title: 'Hubo un error',
    message: 'Revisa tu conexión a internet o contacta con un administrador.',
  },

  // Alertas dentro del formulario de crear/editar
  alertInfo: {
    title: 'Nuevo proyecto',
    message: 'Completa la información del proyecto.',
  },
  alertError: {
    title: 'Nuevo proyecto',
    message: 'Debes <strong>llenar la información</strong> del proyecto.',
  },

  // Validación del formulario de crear/editar
  rules: {
    nameRequired: 'El nombre es obligatorio.',
    costCenterCodeRequired: 'El centro de costo es obligatorio.',
    typeRequired: 'El tipo de proyecto es obligatorio.',
    specialtyRequired: 'La especialidad es obligatoria.',
    clientRequired: 'El mandante es obligatorio.',
    startDateRequired: 'La fecha de inicio es obligatoria.',
  },
}
