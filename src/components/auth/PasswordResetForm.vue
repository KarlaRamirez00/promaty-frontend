<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { mdiCheckCircle, mdiCircleOutline, mdiEye, mdiEyeOff } from '@mdi/js'
import { resetPassword } from '@/services'
import { useAuthStore, usePasswordFlowStore, useSnackbarStore } from '@/stores'
import { ApiRequestError } from '@/lib/http'
import { useBackendFieldErrors } from '@/composables/useBackendFieldErrors'
import { usePasswordPolicy } from '@/composables/usePasswordPolicy'
import { ROUTE } from '@/router/route-names'
import AlertComponent from '@/components/common/AlertComponent.vue'
import ErrorComponent from '@/components/common/ErrorComponent.vue'
import FieldErrorComponent from '@/components/common/FieldErrorComponent.vue'

defineProps<{
  codeLabel: string
}>()

const router = useRouter()
const auth = useAuthStore()
const flow = usePasswordFlowStore()
const snackbar = useSnackbarStore()
const {
  backendErrorFields,
  setFromError,
  clear: clearBackendErrors,
  hasBackendError,
} = useBackendFieldErrors()

const askEmail = !flow.email
const askCode = !flow.temporaryPassword

const email = ref(flow.email)
const code = ref(flow.temporaryPassword)
const password = ref('')
const confirmation = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const { requirements, matches, isValid } = usePasswordPolicy(password, confirmation)

const mismatchMessage = computed(() =>
  confirmation.value && !matches.value ? 'Las contraseñas no coinciden.' : '',
)
const canSubmit = computed(() => isValid.value && !!email.value && !!code.value)

async function submit() {
  if (loading.value || !canSubmit.value) return

  clearBackendErrors()
  errorMessage.value = ''
  loading.value = true
  try {
    await resetPassword({
      email: email.value,
      resetCode: code.value,
      password: password.value,
    })
  } catch (error) {
    if (!setFromError(error)) {
      errorMessage.value =
        error instanceof ApiRequestError
          ? error.message
          : 'No se pudo cambiar la contraseña. Intenta nuevamente.'
    }
    loading.value = false
    return
  }

  try {
    await auth.login({ email: email.value, password: password.value })
    snackbar.success({
      title: 'Contraseña actualizada',
      message: 'Ya iniciaste sesión con tu nueva contraseña.',
    })
    flow.clear()
    await router.replace('/')
  } catch {
    snackbar.success({
      title: 'Contraseña actualizada',
      message: 'Inicia sesión con tu nueva contraseña.',
    })
    flow.clear()
    await router.replace({ name: ROUTE.LOGIN })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AlertComponent v-if="flow.notice" type="info" :message="flow.notice" />
  <AlertComponent v-if="errorMessage" type="error" :message="errorMessage" />

  <v-form @submit.prevent="submit">
    <v-text-field
      v-if="askEmail"
      v-model="email"
      v-input-mask="'email'"
      label="Correo"
      type="email"
      autocomplete="email"
      variant="outlined"
      density="comfortable"
      class="mb-2"
    />

    <v-text-field
      v-if="askCode"
      v-model="code"
      v-input-mask="'lettersAndNumbers'"
      :label="codeLabel"
      autocomplete="one-time-code"
      maxlength="12"
      variant="outlined"
      density="comfortable"
      class="mb-2"
      :error="hasBackendError('resetCode')"
    />

    <v-text-field
      v-model="password"
      label="Nueva contraseña"
      :type="showPassword ? 'text' : 'password'"
      autocomplete="new-password"
      :append-inner-icon="showPassword ? mdiEyeOff : mdiEye"
      variant="outlined"
      density="comfortable"
      :error="hasBackendError('password')"
      hide-details
      @click:append-inner="showPassword = !showPassword"
    />

    <ul class="requirements mt-2 mb-4">
      <li
        v-for="requirement in requirements"
        :key="requirement.label"
        class="d-flex align-center ga-2 text-body-2"
        :class="requirement.met ? 'text-success' : 'text-medium-emphasis'"
      >
        <v-icon :icon="requirement.met ? mdiCheckCircle : mdiCircleOutline" size="16" />
        {{ requirement.label }}
      </li>
    </ul>

    <v-text-field
      v-model="confirmation"
      label="Confirmar contraseña"
      :type="showPassword ? 'text' : 'password'"
      autocomplete="new-password"
      :append-inner-icon="showPassword ? mdiEyeOff : mdiEye"
      variant="outlined"
      density="comfortable"
      :error="!!mismatchMessage"
      hide-details
      @click:append-inner="showPassword = !showPassword"
    />
    <FieldErrorComponent :message="mismatchMessage" />

    <ErrorComponent :error-fields="backendErrorFields" class="mt-4" />

    <v-btn
      type="submit"
      color="primary"
      size="large"
      block
      class="mt-4"
      :disabled="!canSubmit"
      :loading="loading"
    >
      Guardar
    </v-btn>
  </v-form>
</template>

<style scoped>
.requirements {
  padding: 0;
  list-style: none;
}
</style>
