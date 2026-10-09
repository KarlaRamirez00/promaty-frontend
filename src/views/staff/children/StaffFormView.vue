<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { mdiArrowDownCircleOutline, mdiContentSave } from '@mdi/js'
import {
  createStaffAction,
  getAfpOptionsAction,
  getBankOptionsAction,
  getComunaOptionsAction,
  getEducationLevelOptionsAction,
  getHealthSystemOptionsAction,
  getMaritalStatusOptionsAction,
  getNationalityOptionsAction,
  getProvinciaOptionsAction,
  getRegionOptionsAction,
  getRegisteredSexOptionsAction,
  getStaffDetailAction,
  updateStaffAction,
} from '@/actions'
import { useBackendFieldErrors } from '@/composables/useBackendFieldErrors'
import { useMessage } from '@/composables/useMessage'
import { maskPhone, maskRut } from '@/utils'
import messages from '@/messages'
import staffMessages from '@/messages/staff.messages'
import { ROUTE } from '@/router/route-names'
import {
  ACCOUNT_TYPE_OPTIONS,
  CLOTHING_SIZE_OPTIONS,
  createStaffForm,
  IDENTIFICATION_TYPE_OPTIONS,
  SHOE_SIZE_OPTIONS,
  type StaffForm,
} from '@/models'
import {
  firstError,
  isAdult,
  isValidRut,
  staffAccountNumberRules,
  staffAddressRules,
  staffEmailRules,
  staffEmergencyContactNameRules,
  staffEmergencyPhoneRules,
  staffIdentificationNumberRules,
  staffNameRules,
  staffPhoneRules,
} from '@/rules'
import ErrorComponent from '@/components/common/ErrorComponent.vue'
import FieldErrorComponent from '@/components/common/FieldErrorComponent.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'
import DateField from '@/components/common/DateField.vue'

const props = defineProps<{
  id?: string
}>()

const router = useRouter()
const queryClient = useQueryClient()
const { toastSaved, toastFailed } = useMessage()
const {
  backendErrorFields,
  setFromError,
  clear: clearBackendErrors,
  hasBackendError,
} = useBackendFieldErrors()

const staffId = computed(() => (props.id ? Number(props.id) : null))
const isEditing = computed(() => staffId.value !== null)

const { data: existingStaff } = useQuery({
  queryKey: computed(() => ['staff', 'detail', staffId.value]),
  queryFn: () => getStaffDetailAction(staffId.value as number),
  enabled: computed(() => staffId.value !== null),
})

const { data: registeredSexOptions } = useQuery({
  queryKey: ['registeredSexes', 'options'],
  queryFn: getRegisteredSexOptionsAction,
})
const { data: maritalStatusOptions } = useQuery({
  queryKey: ['maritalStatuses', 'options'],
  queryFn: getMaritalStatusOptionsAction,
})
const { data: nationalityOptions } = useQuery({
  queryKey: ['nationalities', 'options'],
  queryFn: getNationalityOptionsAction,
})
const { data: educationLevelOptions } = useQuery({
  queryKey: ['educationLevels', 'options'],
  queryFn: getEducationLevelOptionsAction,
})
const { data: afpOptions } = useQuery({
  queryKey: ['afps', 'options'],
  queryFn: getAfpOptionsAction,
})
const { data: healthSystemOptions } = useQuery({
  queryKey: ['healthSystems', 'options'],
  queryFn: getHealthSystemOptionsAction,
})
const { data: regionOptions } = useQuery({
  queryKey: ['regions', 'options'],
  queryFn: getRegionOptionsAction,
})
const { data: bankOptions } = useQuery({
  queryKey: ['banks', 'options'],
  queryFn: getBankOptionsAction,
})

const form = ref<StaffForm>(createStaffForm())

const { data: provinciaOptions } = useQuery({
  queryKey: computed(() => ['provincias', 'options', form.value.regionId]),
  queryFn: () => getProvinciaOptionsAction(form.value.regionId as number),
  enabled: computed(() => form.value.regionId !== null),
})
const { data: comunaOptions } = useQuery({
  queryKey: computed(() => ['comunas', 'options', form.value.provinciaId]),
  queryFn: () => getComunaOptionsAction(form.value.provinciaId as number),
  enabled: computed(() => form.value.provinciaId !== null),
})

const fieldErrors = ref<Record<string, string>>({})
const hasSubmitted = ref(false)

const selectedBankSupportsRutAccount = computed(
  () => bankOptions.value?.find((bank) => bank.id === form.value.bankId)?.supportsRutAccount ?? false,
)

const accountTypeOptions = computed(() =>
  selectedBankSupportsRutAccount.value
    ? ACCOUNT_TYPE_OPTIONS
    : ACCOUNT_TYPE_OPTIONS.filter((option) => option.value !== 'RUT'),
)

watch(selectedBankSupportsRutAccount, (supportsRut) => {
  if (!supportsRut && form.value.accountType === 'RUT') form.value.accountType = null
})

// Backend acepta texto libre en accountNumber (sin regex ni validación de solo-dígitos) — esta
// restricción es puro criterio de UX nuestro, no depende del contrato de backend.
const accountNumberInput = computed({
  get: () => form.value.accountNumber,
  set: (value: string) => {
    form.value.accountNumber = value.replaceAll(/\D/g, '')
  },
})

const identificationNumberInput = computed({
  get: () => form.value.identificationNumber,
  set: (value: string) => {
    form.value.identificationNumber =
      form.value.identificationType === 'RUT' ? maskRut(value) : value
  },
})

const identificationNumberMaxLength = computed(() =>
  form.value.identificationType === 'RUT' ? 12 : 20,
)

const ALLOWED_CONTROL_KEYS = new Set(['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'])

// Bloquea el carácter antes de que se pinte en pantalla — evita el parpadeo de teclas muertas/IME
// (ej. "ñ") que maskRut() recién limpiaba después de que el navegador terminaba la composición.
function onIdentificationNumberKeydown(event: KeyboardEvent) {
  if (form.value.identificationType !== 'RUT') return
  if (event.ctrlKey || event.metaKey || ALLOWED_CONTROL_KEYS.has(event.key)) return
  if (!/^[0-9kK]$/.test(event.key)) event.preventDefault()
}

watch(
  () => form.value.identificationType,
  () => {
    if (isEditing.value) return
    form.value.identificationNumber = ''
    delete fieldErrors.value.identificationNumber
  },
)

function onRegionChange() {
  form.value.provinciaId = null
  form.value.comunaId = null
}

function onProvinciaChange() {
  form.value.comunaId = null
}

function hasError(field: string): boolean {
  return !!fieldErrors.value[field] || hasBackendError(field)
}

const hasValidationError = computed(() => hasSubmitted.value && Object.keys(fieldErrors.value).length > 0)
const alert = computed(() =>
  hasValidationError.value ? staffMessages.alertError : staffMessages.alertInfo,
)

watch(
  existingStaff,
  (staff) => {
    if (staff) {
      form.value = createStaffForm({
        id: staff.id,
        identificationType: staff.identificationType,
        identificationNumber: staff.identificationNumber,
        firstName: staff.firstName,
        paternalLastName: staff.paternalLastName,
        maternalLastName: staff.maternalLastName,
        birthDate: staff.birthDate,
        registeredSexId: staff.registeredSex.id,
        maritalStatusId: staff.maritalStatus.id,
        nationalityId: staff.nationality.id,
        phone1: maskPhone(staff.phone1),
        emergencyPhone: maskPhone(staff.emergencyPhone),
        emergencyContactName: staff.emergencyContactName,
        address: staff.address,
        regionId: staff.region.id,
        provinciaId: staff.provincia.id,
        comunaId: staff.comuna.id,
        hasChildren: staff.hasChildren,
        childrenCount: staff.childrenCount,
        personalEmail: staff.personalEmail,
        shoeSize: staff.shoeSize,
        clothingSize: staff.clothingSize,
        educationLevelId: staff.educationLevel.id,
        afpId: staff.afp.id,
        healthSystemId: staff.healthSystem.id,
        bankId: staff.bank.id,
        accountType: staff.accountType,
        accountNumber: staff.accountNumber,
      })
    }
  },
  { immediate: true },
)

function goToList() {
  router.push({ name: ROUTE.STAFF_LIST })
}

function validateIdentificationNumber(): string | null {
  const identificationError = firstError(
    form.value.identificationNumber,
    staffIdentificationNumberRules,
  )
  if (identificationError) return identificationError
  if (form.value.identificationType === 'RUT' && !isValidRut(form.value.identificationNumber)) {
    return staffMessages.rules.identificationNumberInvalidRut
  }
  return null
}

function onIdentificationNumberBlur() {
  if (isEditing.value || !form.value.identificationNumber) return
  const error = validateIdentificationNumber()
  fieldErrors.value = { ...fieldErrors.value, identificationNumber: error ?? '' }
  if (!error) delete fieldErrors.value.identificationNumber
}

function validateTextFields(): Record<string, string> {
  const errors: Record<string, string> = {}

  const firstNameError = firstError(form.value.firstName, staffNameRules)
  if (firstNameError) errors.firstName = firstNameError

  const paternalLastNameError = firstError(form.value.paternalLastName, staffNameRules)
  if (paternalLastNameError) errors.paternalLastName = paternalLastNameError

  const maternalLastNameError = firstError(form.value.maternalLastName, staffNameRules)
  if (maternalLastNameError) errors.maternalLastName = maternalLastNameError

  const emailError = firstError(form.value.personalEmail, staffEmailRules)
  if (emailError) errors.personalEmail = emailError

  const phoneError = firstError(form.value.phone1, staffPhoneRules)
  if (phoneError) errors.phone1 = phoneError

  const emergencyPhoneError = firstError(form.value.emergencyPhone, staffEmergencyPhoneRules)
  if (emergencyPhoneError) errors.emergencyPhone = emergencyPhoneError

  const emergencyContactNameError = firstError(
    form.value.emergencyContactName,
    staffEmergencyContactNameRules,
  )
  if (emergencyContactNameError) errors.emergencyContactName = emergencyContactNameError

  const addressError = firstError(form.value.address, staffAddressRules)
  if (addressError) errors.address = addressError

  const accountNumberError = firstError(form.value.accountNumber, staffAccountNumberRules)
  if (accountNumberError) errors.accountNumber = accountNumberError

  return errors
}

function validateRequiredSelects(): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!form.value.registeredSexId) errors.registeredSexId = staffMessages.rules.registeredSexRequired
  if (!form.value.maritalStatusId) errors.maritalStatusId = staffMessages.rules.maritalStatusRequired
  if (!form.value.nationalityId) errors.nationalityId = staffMessages.rules.nationalityRequired
  if (!form.value.shoeSize) errors.shoeSize = staffMessages.rules.shoeSizeRequired
  if (!form.value.clothingSize) errors.clothingSize = staffMessages.rules.clothingSizeRequired
  if (!form.value.educationLevelId) errors.educationLevelId = staffMessages.rules.educationLevelRequired
  if (!form.value.afpId) errors.afpId = staffMessages.rules.afpRequired
  if (!form.value.healthSystemId) errors.healthSystemId = staffMessages.rules.healthSystemRequired
  if (!form.value.regionId) errors.regionId = staffMessages.rules.regionRequired
  if (!form.value.provinciaId) errors.provinciaId = staffMessages.rules.provinciaRequired
  if (!form.value.comunaId) errors.comunaId = staffMessages.rules.comunaRequired
  if (!form.value.bankId) errors.bankId = staffMessages.rules.bankRequired
  if (!form.value.accountType) errors.accountType = staffMessages.rules.accountTypeRequired

  return errors
}

function validateBirthDateAndChildren(): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!form.value.birthDate) {
    errors.birthDate = staffMessages.rules.birthDateRequired
  } else if (!isAdult(form.value.birthDate)) {
    errors.birthDate = staffMessages.rules.birthDateMinor
  }

  if (form.value.hasChildren && !form.value.childrenCount) {
    errors.childrenCount = staffMessages.rules.childrenCountRequired
  }

  return errors
}

function validate(): boolean {
  const identificationErrors: Record<string, string> = {}
  if (!isEditing.value) {
    const identificationError = validateIdentificationNumber()
    if (identificationError) identificationErrors.identificationNumber = identificationError
  }

  const errors = {
    ...identificationErrors,
    ...validateTextFields(),
    ...validateRequiredSelects(),
    ...validateBirthDateAndChildren(),
  }

  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function saveStaff(value: StaffForm): Promise<void> {
  if (value.id) {
    await updateStaffAction(value)
  } else {
    await createStaffAction(value)
  }
}

const saveMutation = useMutation({
  mutationFn: saveStaff,
  onSuccess: (_data, value) => {
    queryClient.invalidateQueries({ queryKey: ['staff'], refetchType: 'none' })
    toastSaved(value.id, messages.staff)
    goToList()
  },
  onError: (error: unknown) => {
    if (!setFromError(error)) toastFailed(messages.staff)
  },
})

function submit() {
  hasSubmitted.value = true
  clearBackendErrors()
  if (!validate()) return
  saveMutation.mutate(form.value)
}
</script>

<template>
  <h1 class="text-h5 font-weight-bold mb-4">
    {{ isEditing ? 'Editar colaborador' : 'Nuevo colaborador' }}
  </h1>

  <AlertComponent
    :type="hasValidationError ? 'error' : 'info'"
    :message="alert.message"
    :icon="mdiArrowDownCircleOutline"
  />

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-2 mb-4">Identificación</h2>

  <v-row>
    <v-col cols="12" md="4">
      <div :class="{ 'staff-identification-locked': isEditing }">
        <v-select
          v-model="form.identificationType"
          :items="IDENTIFICATION_TYPE_OPTIONS"
          item-title="title"
          item-value="value"
          label="Tipo de identificación"
          placeholder="Seleccionar"
          variant="outlined"
          density="comfortable"
          persistent-placeholder
          :disabled="isEditing"
          hide-details
        />
      </div>
    </v-col>

    <v-col cols="12" md="8">
      <div :class="{ 'staff-identification-locked': isEditing }">
        <v-text-field
          v-model="identificationNumberInput"
          v-input-mask="form.identificationType === 'RUT' ? 'rut' : 'lettersAndNumbers'"
          :label="form.identificationType === 'RUT' ? 'RUT' : 'Número de identificación'"
          :placeholder="form.identificationType === 'RUT' ? '99.999.999-9' : 'Ingresa el número'"
          variant="outlined"
          density="comfortable"
          :error="hasError('identificationNumber')"
          :disabled="isEditing"
          :maxlength="identificationNumberMaxLength"
          hide-details="auto"
          persistent-placeholder
          autofocus
          @keydown="onIdentificationNumberKeydown"
          @blur="onIdentificationNumberBlur"
        />
      </div>
      <FieldErrorComponent :message="fieldErrors.identificationNumber" />
    </v-col>
  </v-row>

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-6 mb-4">Datos principales</h2>

  <v-row>
    <v-col cols="12" md="4">
      <v-text-field
        v-model="form.firstName"
        v-input-mask="'onlyLetters'"
        label="Nombre"
        placeholder="Ingresa el nombre"
        variant="outlined"
        density="comfortable"
        :error="hasError('firstName')"
        maxlength="100"
        counter
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.firstName" />
    </v-col>

    <v-col cols="12" md="4">
      <v-text-field
        v-model="form.paternalLastName"
        v-input-mask="'onlyLetters'"
        label="Apellido paterno"
        placeholder="Ingresa el apellido paterno"
        variant="outlined"
        density="comfortable"
        :error="hasError('paternalLastName')"
        maxlength="100"
        counter
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.paternalLastName" />
    </v-col>

    <v-col cols="12" md="4">
      <v-text-field
        v-model="form.maternalLastName"
        v-input-mask="'onlyLetters'"
        label="Apellido materno"
        placeholder="Ingresa el apellido materno"
        variant="outlined"
        density="comfortable"
        :error="hasError('maternalLastName')"
        maxlength="100"
        counter
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.maternalLastName" />
    </v-col>

    <v-col cols="12" md="4">
      <DateField
        v-model="form.birthDate"
        label="Fecha de nacimiento"
        :error="hasError('birthDate')"
        hide-details
      />
      <FieldErrorComponent :message="fieldErrors.birthDate" />
    </v-col>

    <v-col cols="12" md="4">
      <v-text-field
        v-model="form.personalEmail"
        v-input-mask="'email'"
        label="Correo personal"
        placeholder="Ingresa el correo"
        type="email"
        variant="outlined"
        density="comfortable"
        :error="hasError('personalEmail')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.personalEmail" />
    </v-col>

    <v-col cols="12" md="4">
      <v-text-field
        v-model="form.phone1"
        v-input-mask="'phone'"
        label="Teléfono"
        prefix="+56"
        placeholder="9 1234 5678"
        variant="outlined"
        density="comfortable"
        :error="hasError('phone1')"
        maxlength="11"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.phone1" />
    </v-col>

    <v-col cols="12" md="4">
      <v-select
        v-model="form.registeredSexId"
        :items="registeredSexOptions ?? []"
        item-title="name"
        item-value="id"
        label="Sexo registral"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('registeredSexId')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.registeredSexId" />
    </v-col>

    <v-col cols="12" md="4">
      <v-select
        v-model="form.maritalStatusId"
        :items="maritalStatusOptions ?? []"
        item-title="name"
        item-value="id"
        label="Estado civil"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('maritalStatusId')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.maritalStatusId" />
    </v-col>

    <v-col cols="12" md="4">
      <v-select
        v-model="form.nationalityId"
        :items="nationalityOptions ?? []"
        item-title="name"
        item-value="id"
        label="Nacionalidad"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('nationalityId')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.nationalityId" />
    </v-col>

    <v-col cols="12" :md="form.hasChildren ? 4 : 6">
      <div class="staff-boolean-field">
        <span class="staff-boolean-field__label">¿Tiene hijos?</span>
        <v-sheet
          border
          rounded
          class="d-flex align-center justify-space-between px-4"
          min-height="50"
        >
          <span class="text-body-2 text-medium-emphasis">
            {{ form.hasChildren ? 'Sí' : 'No' }}
          </span>
          <v-switch
            v-model="form.hasChildren"
            color="primary"
            density="compact"
            hide-details
            @update:model-value="(value) => { if (!value) form.childrenCount = null }"
          />
        </v-sheet>
      </div>
    </v-col>

    <v-col v-if="form.hasChildren" cols="12" md="4">
      <v-text-field
        v-model.number="form.childrenCount"
        v-input-mask="'onlyNumbers'"
        label="Cantidad de hijos"
        type="number"
        variant="outlined"
        density="comfortable"
        :error="hasError('childrenCount')"
        min="1"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.childrenCount" />
    </v-col>

    <v-col cols="12" :md="form.hasChildren ? 4 : 6">
      <v-select
        v-model="form.educationLevelId"
        :items="educationLevelOptions ?? []"
        item-title="name"
        item-value="id"
        label="Nivel educacional"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('educationLevelId')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.educationLevelId" />
    </v-col>
  </v-row>

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-6 mb-4">Dirección</h2>

  <v-row>
    <v-col cols="12">
      <v-text-field
        v-model="form.address"
        v-input-mask="'freeText'"
        label="Dirección"
        placeholder="Ingresa la calle y número"
        variant="outlined"
        density="comfortable"
        :error="hasError('address')"
        maxlength="150"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.address" />
    </v-col>

    <v-col cols="12" md="4">
      <v-select
        v-model="form.regionId"
        :items="regionOptions ?? []"
        item-title="name"
        item-value="id"
        label="Región"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('regionId')"
        hide-details="auto"
        persistent-placeholder
        @update:model-value="onRegionChange"
      />
      <FieldErrorComponent :message="fieldErrors.regionId" />
    </v-col>

    <v-col cols="12" md="4">
      <v-select
        v-model="form.provinciaId"
        :items="provinciaOptions ?? []"
        item-title="name"
        item-value="id"
        label="Provincia"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('provinciaId')"
        :disabled="!form.regionId"
        hide-details="auto"
        persistent-placeholder
        @update:model-value="onProvinciaChange"
      />
      <FieldErrorComponent :message="fieldErrors.provinciaId" />
    </v-col>

    <v-col cols="12" md="4">
      <v-select
        v-model="form.comunaId"
        :items="comunaOptions ?? []"
        item-title="name"
        item-value="id"
        label="Comuna"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('comunaId')"
        :disabled="!form.provinciaId"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.comunaId" />
    </v-col>
  </v-row>

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-6 mb-4">Contacto de emergencia</h2>

  <v-row>
    <v-col cols="12" md="6">
      <v-text-field
        v-model="form.emergencyContactName"
        v-input-mask="'onlyLetters'"
        label="Nombre del contacto"
        placeholder="Ingresa el nombre completo"
        variant="outlined"
        density="comfortable"
        :error="hasError('emergencyContactName')"
        maxlength="100"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.emergencyContactName" />
    </v-col>

    <v-col cols="12" md="6">
      <v-text-field
        v-model="form.emergencyPhone"
        v-input-mask="'phone'"
        label="Teléfono de emergencia"
        prefix="+56"
        placeholder="9 1234 5678"
        variant="outlined"
        density="comfortable"
        :error="hasError('emergencyPhone')"
        maxlength="11"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.emergencyPhone" />
    </v-col>
  </v-row>

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-6 mb-4">Tallas</h2>

  <v-row>
    <v-col cols="12" md="6">
      <v-select
        v-model="form.shoeSize"
        :items="SHOE_SIZE_OPTIONS"
        label="Talla de calzado"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('shoeSize')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.shoeSize" />
    </v-col>

    <v-col cols="12" md="6">
      <v-select
        v-model="form.clothingSize"
        :items="CLOTHING_SIZE_OPTIONS"
        label="Talla de ropa"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('clothingSize')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.clothingSize" />
    </v-col>
  </v-row>

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-6 mb-4">
    Datos previsionales
  </h2>

  <v-row>
    <v-col cols="12" md="6">
      <v-select
        v-model="form.afpId"
        :items="afpOptions ?? []"
        item-title="name"
        item-value="id"
        label="AFP"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('afpId')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.afpId" />
    </v-col>

    <v-col cols="12" md="6">
      <v-select
        v-model="form.healthSystemId"
        :items="healthSystemOptions ?? []"
        item-title="name"
        item-value="id"
        label="Sistema de salud"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('healthSystemId')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.healthSystemId" />
    </v-col>
  </v-row>

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-6 mb-4">Datos bancarios</h2>

  <v-row>
    <v-col cols="12" md="4">
      <v-select
        v-model="form.bankId"
        :items="bankOptions ?? []"
        item-title="name"
        item-value="id"
        label="Banco"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('bankId')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.bankId" />
    </v-col>

    <v-col cols="12" md="4">
      <v-select
        v-model="form.accountType"
        :items="accountTypeOptions"
        item-title="title"
        item-value="value"
        label="Tipo de cuenta"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('accountType')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.accountType" />
    </v-col>

    <v-col cols="12" md="4">
      <v-text-field
        v-model="accountNumberInput"
        v-input-mask="'bankAccount'"
        label="Número de cuenta"
        placeholder="Ingresa el número de cuenta"
        variant="outlined"
        density="comfortable"
        :error="hasError('accountNumber')"
        inputmode="numeric"
        maxlength="30"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.accountNumber" />
    </v-col>
  </v-row>

  <ErrorComponent :error-fields="backendErrorFields" class="mt-6" />

  <div class="d-flex justify-end ga-2 mt-6">
    <v-btn variant="text" @click="goToList">Cancelar</v-btn>
    <v-btn
      color="primary"
      variant="flat"
      :prepend-icon="mdiContentSave"
      :loading="saveMutation.isPending.value"
      @click="submit"
    >
      Guardar
    </v-btn>
  </div>
</template>

<style scoped>
/* Vuetify pone pointer-events: none en el campo deshabilitado (.v-input--disabled), así que el
   hover nunca llega a él — el cursor se define acá, en el contenedor que sí recibe el mouse. */
.staff-identification-locked {
  cursor: not-allowed;
}

/* Replica el label "cortando" el borde de un v-text-field outlined, para que este v-sheet se vea
   igual a los campos vecinos en vez de un label suelto arriba del contenedor. */
.staff-boolean-field {
  position: relative;
}

/* v-sheet usa el token de borde genérico (más tenue) — un v-field outlined dibuja su borde con
   opacidad 0.38, que es la que realmente se ve en los campos vecinos como "Cantidad de hijos". */
.staff-boolean-field :deep(.v-sheet) {
  border-color: rgba(var(--v-theme-on-surface), 0.38) !important;
}

.staff-boolean-field__label {
  position: absolute;
  top: -8px;
  left: 12px;
  z-index: 1;
  padding: 0 4px;
  background: rgb(var(--v-theme-background));
  font-size: 12px;
  line-height: 1;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
</style>
