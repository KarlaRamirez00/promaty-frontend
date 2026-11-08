<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mdiEye, mdiEyeOff } from '@mdi/js'
import { useAuthStore, usePasswordFlowStore } from '@/stores'
import { ApiRequestError } from '@/lib/http'
import { ROUTE } from '@/router/route-names'
import { safeRedirect } from '@/utils'
import AuthCard from '@/components/auth/AuthCard.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'

const PASSWORD_CHANGE_REQUIRED = 428
const TEMPORARY_KEY_EXPIRED = 'TEMPORARY_PASSWORD_EXPIRED'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const flow = usePasswordFlowStore()
flow.clear()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const remember = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const required = (label: string) => (value: string) => !!value || `Ingresa ${label}.`

const isDev = import.meta.env.DEV
const devCredentials = { email: 'test@promaty.cl', password: 'Test.2026' }

function fillDevCredentials() {
  email.value = devCredentials.email
  password.value = devCredentials.password
}

async function handleLoginError(error: unknown) {
  if (!(error instanceof ApiRequestError)) {
    errorMessage.value = 'No se pudo iniciar sesión. Intenta nuevamente.'
    return
  }

  if (error.status === PASSWORD_CHANGE_REQUIRED) {
    flow.start({ email: email.value, temporaryPassword: password.value })
    await router.push({ name: ROUTE.FIRST_LOGIN })
    return
  }

  if (error.apiName === TEMPORARY_KEY_EXPIRED) {
    flow.start({ email: email.value, notice: error.message })
    await router.push({ name: ROUTE.RECOVERY })
    return
  }

  errorMessage.value = error.status === 401 ? 'Correo o contraseña incorrectos.' : error.message
}

async function submit() {
  if (loading.value || !email.value || !password.value) return

  const target = safeRedirect(route.query.redirect) ?? '/'

  errorMessage.value = ''
  loading.value = true
  try {
    await auth.login({ email: email.value, password: password.value }, remember.value)
  } catch (error) {
    await handleLoginError(error)
    loading.value = false
    return
  }

  // La sesión ya está iniciada: si la ruta guardada no carga, se entra por la raíz en vez de mostrar un error de login.
  try {
    await router.replace(target)
  } catch (error) {
    console.error('No se pudo abrir la ruta solicitada tras el login', error)
    await router.replace('/')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthCard title="Iniciar sesión" subtitle="Ingresa tus credenciales para continuar.">
    <AlertComponent v-if="errorMessage" type="error" :message="errorMessage" />

    <v-form @submit.prevent="submit">
      <v-text-field
        v-model="email"
        v-input-mask="'email'"
        data-testid="login-email"
        label="Correo"
        type="email"
        autocomplete="email"
        :rules="[required('tu correo')]"
        variant="outlined"
        density="comfortable"
        class="mb-2"
      />

      <v-text-field
        v-model="password"
        data-testid="login-password"
        label="Contraseña"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="current-password"
        :rules="[required('tu contraseña')]"
        :append-inner-icon="showPassword ? mdiEyeOff : mdiEye"
        variant="outlined"
        density="comfortable"
        @click:append-inner="showPassword = !showPassword"
      />

      <div class="d-flex align-center justify-space-between">
        <v-checkbox
          v-model="remember"
          data-testid="login-remember"
          label="Recordarme"
          density="compact"
          class="remember-me"
          hide-details
        />
        <router-link :to="{ name: ROUTE.RECOVERY }" class="text-body-2 text-primary">
          ¿Olvidaste tu contraseña?
        </router-link>
      </div>

      <v-btn
        type="submit"
        data-testid="login-submit"
        color="primary"
        size="large"
        block
        class="mt-4"
        :loading="loading"
      >
        Ingresar
      </v-btn>
    </v-form>

    <v-sheet
      v-if="isDev"
      border
      rounded
      class="dev-credentials mt-4 pa-3 text-center text-caption text-medium-emphasis"
      @click="fillDevCredentials"
    >
      <strong>Admin →</strong> correo: <code>{{ devCredentials.email }}</code>
      · clave: <code>••••••••</code>
    </v-sheet>
  </AuthCard>
</template>

<style scoped>
.remember-me :deep(.v-label) {
  font-size: 0.875rem;
  opacity: 1;
}

.remember-me :deep(.v-selection-control__input .v-icon) {
  font-size: 18px;
}

.dev-credentials {
  cursor: pointer;
}

.dev-credentials code {
  font-size: 0.85em;
}
</style>
