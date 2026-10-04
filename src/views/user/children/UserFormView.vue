<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { mdiArrowDownCircleOutline, mdiContentSave, mdiEye, mdiEyeOff } from '@mdi/js'
import {
  createUserAction,
  getCostCenterOptionsAction,
  getRoleOptionsAction,
  getUserDetailAction,
  updateUserAction,
} from '@/actions'
import { useBackendFieldErrors } from '@/composables/useBackendFieldErrors'
import { useMessage } from '@/composables/useMessage'
import messages from '@/messages'
import userMessages from '@/messages/user.messages'
import { ROUTE } from '@/router/route-names'
import { createUserForm, type UserForm } from '@/models'
import {
  firstError,
  userEmailRules,
  userFirstNameRules,
  userLastNameRules,
  userPasswordRules,
} from '@/rules'
import ErrorComponent from '@/components/common/ErrorComponent.vue'
import FieldErrorComponent from '@/components/common/FieldErrorComponent.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'

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

const userId = computed(() => (props.id ? Number(props.id) : null))
const isEditing = computed(() => userId.value !== null)

const { data: existingUser } = useQuery({
  queryKey: computed(() => ['users', 'detail', userId.value]),
  queryFn: () => getUserDetailAction(userId.value as number),
  enabled: computed(() => userId.value !== null),
})

const { data: roleOptions } = useQuery({
  queryKey: ['roles', 'options'],
  queryFn: () => getRoleOptionsAction(),
})

const { data: costCenterOptions } = useQuery({
  queryKey: ['projects', 'options', 'costCenters'],
  queryFn: getCostCenterOptionsAction,
})

const form = ref<UserForm>(createUserForm())
const fieldErrors = ref<Record<string, string>>({})
const showPassword = ref(false)

function hasError(field: string): boolean {
  return !!fieldErrors.value[field] || hasBackendError(field)
}

const hasValidationError = computed(() => Object.keys(fieldErrors.value).length > 0)
const alert = computed(() =>
  hasValidationError.value ? userMessages.alertError : userMessages.alertInfo,
)

watch(
  existingUser,
  (user) => {
    if (user) {
      form.value = createUserForm({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        roleId: user.role.id,
        projectIds: user.projectIds,
      })
    }
  },
  { immediate: true },
)

function goToList() {
  router.push({ name: ROUTE.USER_LIST })
}

function validate(): boolean {
  const errors: Record<string, string> = {}

  const firstNameError = firstError(form.value.firstName, userFirstNameRules)
  if (firstNameError) errors.firstName = firstNameError

  const lastNameError = firstError(form.value.lastName, userLastNameRules)
  if (lastNameError) errors.lastName = lastNameError

  const emailError = firstError(form.value.email, userEmailRules)
  if (emailError) errors.email = emailError

  if (!form.value.roleId) errors.roleId = userMessages.rules.roleRequired

  if (!isEditing.value) {
    const passwordError = firstError(form.value.password, userPasswordRules)
    if (passwordError) errors.password = passwordError
  }

  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function saveUser(value: UserForm): Promise<void> {
  if (value.id) {
    await updateUserAction(value)
  } else {
    await createUserAction(value)
  }
}

const saveMutation = useMutation({
  mutationFn: saveUser,
  onSuccess: (_data, value) => {
    queryClient.invalidateQueries({ queryKey: ['users'], refetchType: 'none' })
    toastSaved(value.id, messages.user)
    goToList()
  },
  onError: (error: unknown) => {
    if (!setFromError(error)) toastFailed(messages.user)
  },
})

function submit() {
  clearBackendErrors()
  if (!validate()) return
  saveMutation.mutate(form.value)
}
</script>

<template>
  <h1 class="text-h5 font-weight-bold mb-4">
    {{ isEditing ? 'Editar usuario' : 'Nuevo usuario' }}
  </h1>

  <AlertComponent
    :type="hasValidationError ? 'error' : 'info'"
    :message="alert.message"
    :icon="mdiArrowDownCircleOutline"
  />

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-2 mb-4">Datos principales</h2>

  <v-row>
    <v-col cols="12" md="6">
      <v-text-field
        v-model="form.firstName"
        v-input-mask="'onlyLetters'"
        label="Nombre"
        placeholder="Ingresa el nombre"
        variant="outlined"
        density="comfortable"
        :error="hasError('firstName')"
        maxlength="120"
        counter
        hide-details="auto"
        persistent-placeholder
        autofocus
      />
      <FieldErrorComponent :message="fieldErrors.firstName" />
    </v-col>

    <v-col cols="12" md="6">
      <v-text-field
        v-model="form.lastName"
        v-input-mask="'onlyLetters'"
        label="Apellido"
        placeholder="Ingresa el apellido"
        variant="outlined"
        density="comfortable"
        :error="hasError('lastName')"
        maxlength="120"
        counter
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.lastName" />
    </v-col>

    <v-col cols="12" md="6">
      <v-text-field
        v-model="form.email"
        v-input-mask="'email'"
        label="Correo"
        placeholder="Ingresa el correo"
        type="email"
        variant="outlined"
        density="comfortable"
        :error="hasError('email')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.email" />
    </v-col>

    <v-col cols="12" md="6">
      <v-text-field
        v-model="form.phoneNumber"
        v-input-mask="'phone'"
        maxlength="9"
        label="Teléfono (opcional)"
        placeholder="Ingresa el teléfono"
        variant="outlined"
        density="comfortable"
        hide-details
        persistent-placeholder
      />
    </v-col>

    <v-col cols="12" md="6">
      <v-select
        v-model="form.roleId"
        :items="roleOptions ?? []"
        item-title="name"
        item-value="id"
        label="Rol"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        persistent-placeholder
        :error="hasError('roleId')"
        hide-details="auto"
      />
      <FieldErrorComponent :message="fieldErrors.roleId" />
    </v-col>

    <v-col v-if="!isEditing" cols="12" md="6">
      <v-text-field
        v-model="form.password"
        label="Contraseña"
        placeholder="Ingresa la contraseña"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="new-password"
        variant="outlined"
        density="comfortable"
        :error="hasError('password')"
        :append-inner-icon="showPassword ? mdiEyeOff : mdiEye"
        hide-details="auto"
        persistent-placeholder
        @click:append-inner="showPassword = !showPassword"
      />
      <FieldErrorComponent :message="fieldErrors.password" />
    </v-col>

    <v-col cols="12" :md="isEditing ? 6 : 12">
      <v-autocomplete
        v-model="form.projectIds"
        :items="costCenterOptions ?? []"
        item-title="title"
        item-value="id"
        label="Centros de costo"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        persistent-placeholder
        multiple
        chips
        closable-chips
        :error="hasError('projectIds')"
        hide-details="auto"
      />
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
