export default {
  // Toasts
  toastCreate: {
    title: 'Usuario creado con éxito',
    message: 'Puedes ver el nuevo usuario desde la lista de usuarios.',
  },
  toastUpdate: {
    title: 'Usuario editado con éxito',
    message: 'Puedes ver el usuario actualizado desde la lista de usuarios.',
  },
  toastActivate: {
    title: 'Usuario activado',
    message: 'El usuario ha sido activado con éxito.',
  },
  toastDeactivate: {
    title: 'Usuario desactivado',
    message: 'El usuario ha sido desactivado con éxito.',
  },
  toastError: {
    title: 'Hubo un error',
    message: 'Revisa tu conexión a internet o contacta con un administrador.',
  },

  // Alertas dentro del formulario de crear/editar
  alertInfo: {
    title: 'Nuevo usuario',
    message: 'Completa la información del usuario.',
  },
  alertError: {
    title: 'Nuevo usuario',
    message: 'Debes <strong>llenar la información</strong> del usuario.',
  },

  // Validación del formulario de crear/editar
  rules: {
    firstNameRequired: 'El nombre es obligatorio.',
    lastNameRequired: 'El apellido es obligatorio.',
    emailRequired: 'El correo es obligatorio.',
    emailInvalid: 'Ingresa un correo válido.',
    passwordRequired: 'La contraseña es obligatoria.',
    passwordMinLength: 'La contraseña debe tener al menos 8 caracteres.',
    roleRequired: 'El rol es obligatorio.',
  },
}
