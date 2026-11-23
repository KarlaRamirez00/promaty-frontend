export default {
  toastApprove: {
    title: 'Solicitud aprobada',
    message: 'La solicitud pasó a la etapa de validación.',
  },
  toastValidate: {
    title: 'Solicitud validada',
    message: 'La solicitud fue validada con éxito.',
  },
  toastReject: {
    title: 'Solicitud rechazada',
    message: 'La solicitud fue rechazada con éxito.',
  },
  toastSyncError: {
    title: 'Error de sincronización',
    message: 'La decisión se registró, pero falló la sincronización con Rex+.',
  },
  toastRetrySync: {
    title: 'Sincronización exitosa',
    message: 'El registro quedó sincronizado con Rex+.',
  },
  toastRetrySyncFailed: {
    title: 'La sincronización sigue fallando',
    message: 'Rex+ no aceptó el registro. Revisa el motivo en el detalle.',
  },
  toastError: {
    title: 'Hubo un error',
    message: 'Revisa tu conexión a internet o contacta con un administrador.',
  },

  rules: {
    rejectionReasonRequired: 'Selecciona un motivo de rechazo.',
  },
}
