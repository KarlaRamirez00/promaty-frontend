export default {
  // Toasts
  toastCreate: {
    title: 'Colaborador creado con éxito',
    message: 'Puedes ver el nuevo colaborador desde la lista.',
  },
  toastUpdate: {
    title: 'Colaborador editado con éxito',
    message: 'Puedes ver el colaborador actualizado desde la lista.',
  },
  toastError: {
    title: 'Hubo un error',
    message: 'Revisa tu conexión a internet o contacta con un administrador.',
  },

  // Alertas dentro del formulario de crear/editar
  alertInfo: {
    title: 'Nuevo colaborador',
    message: 'Completa la información del colaborador.',
  },
  alertError: {
    title: 'Nuevo colaborador',
    message: 'Debes <strong>llenar la información</strong> del colaborador.',
  },

  // Validación del formulario de crear/editar
  rules: {
    nameRequired: 'Este campo es obligatorio.',
    nameInvalid: 'Solo se permiten letras.',
    nameMaxLength: 'Máximo 100 caracteres.',
    identificationNumberRequired: 'La identificación es obligatoria.',
    identificationNumberMaxLength: 'Máximo 20 caracteres.',
    identificationNumberInvalidRut: 'El RUT ingresado no es válido.',
    identificationNumberDuplicate: 'Ya existe un colaborador con esta identificación.',
    emailRequired: 'El correo es obligatorio.',
    emailInvalid: 'Ingresa un correo válido.',
    phoneRequired: 'El teléfono es obligatorio.',
    phoneInvalid: 'Formato inválido — 9 dígitos, sin +56 (ej. 912345678).',
    birthDateRequired: 'La fecha de nacimiento es obligatoria.',
    birthDateMinor: 'El colaborador debe ser mayor de 18 años.',
    registeredSexRequired: 'El sexo registral es obligatorio.',
    maritalStatusRequired: 'El estado civil es obligatorio.',
    nationalityRequired: 'La nacionalidad es obligatoria.',
    emergencyPhoneRequired: 'El teléfono de emergencia es obligatorio.',
    emergencyPhoneInvalid: 'Formato inválido — 9 dígitos, sin +56 (ej. 912345678).',
    emergencyContactNameRequired: 'El nombre del contacto de emergencia es obligatorio.',
    emergencyContactNameMaxLength: 'Máximo 100 caracteres.',
    addressRequired: 'La dirección es obligatoria.',
    addressMaxLength: 'Máximo 150 caracteres.',
    cityRequired: 'La ciudad es obligatoria.',
    cityMaxLength: 'Máximo 100 caracteres.',
    childrenCountRequired: 'Indica la cantidad de hijos.',
    shoeSizeRequired: 'La talla de calzado es obligatoria.',
    clothingSizeRequired: 'La talla de ropa es obligatoria.',
    educationLevelRequired: 'El nivel educacional es obligatorio.',
    afpRequired: 'La AFP es obligatoria.',
    healthSystemRequired: 'El sistema de salud es obligatorio.',
    bankRequired: 'El banco es obligatorio.',
    accountTypeRequired: 'El tipo de cuenta es obligatorio.',
    accountNumberRequired: 'El número de cuenta es obligatorio.',
    accountNumberMaxLength: 'Máximo 30 caracteres.',
  },
}
