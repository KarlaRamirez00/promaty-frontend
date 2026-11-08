<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { requestPasswordRecovery } from '@/services'
import { usePasswordFlowStore } from '@/stores'
import { ApiRequestError } from '@/lib/http'
import { ROUTE } from '@/router/route-names'
import { firstError, userEmailRules } from '@/rules'
import { useBackendFieldErrors } from '@/composables/useBackendFieldErrors'
import AuthCard from '@/components/auth/AuthCard.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'
import ErrorComponent from '@/components/common/ErrorComponent.vue'

const router = useRouter()
const flow = usePasswordFlowStore()
const { backendErrorFields, setFromError, clear: clearBackendErrors } = useBackendFieldErrors()

const email = ref(flow.email)
const loading = ref(false)
const errorMessage = ref('')

const isEmailValid = computed(() => !firstError(email.value, userEmailRules))

async function submit() {
  if (loading.value || !isEmailValid.value) return

  clearBackendErrors()
  errorMessage.value = ''
  loading.value = true
  try {
    await requestPasswordRecovery(email.value)
  } catch (error) {
    if (!setFromError(error)) {
      errorMessage.value =
        error instanceof ApiRequestError
          ? error.message
          : 'No se pudo enviar el código. Intenta nuevamente.'
    }
    loading.value = false
    return
  }

  flow.start({
    email: email.value,
    notice: 'Si el correo está registrado, te enviamos un código de recuperación.',
  })
  loading.value = false
  await router.push({ name: ROUTE.RESET_CREDENTIALS })
}
</script>

<template>
  <AuthCard
    title="Recuperar contraseña"
    subtitle="Ingresa tu correo y te enviaremos un código para crear una nueva contraseña."
  >
    <AlertComponent v-if="flow.notice" type="info" :message="flow.notice" />
    <AlertComponent v-if="errorMessage" type="error" :message="errorMessage" />
    <ErrorComponent :error-fields="backendErrorFields" class="mb-4" />

    <v-form @submit.prevent="submit">
      <v-text-field
        v-model="email"
        v-input-mask="'email'"
        label="Correo"
        type="email"
        autocomplete="email"
        variant="outlined"
        density="comfortable"
      />

      <v-btn
        type="submit"
        color="primary"
        size="large"
        block
        class="mt-4"
        :disabled="!isEmailValid"
        :loading="loading"
      >
        Enviar
      </v-btn>
    </v-form>

    <v-btn variant="text" block class="mt-2" :to="{ name: ROUTE.LOGIN }">
      Volver a iniciar sesión
    </v-btn>
  </AuthCard>
</template>
