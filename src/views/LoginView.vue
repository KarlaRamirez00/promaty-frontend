<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mdiEye, mdiEyeOff } from '@mdi/js'
import { useAuthStore } from '@/stores/auth'
import { ApiRequestError } from '@/lib/http'
import PromatyLogo from '@/components/PromatyLogo.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const required = (label: string) => (value: string) => !!value || `Ingresa ${label}.`

const isDev = import.meta.env.DEV
const devCredentials = { email: 'karla@promaty.cl', password: 'admin2026' }

function fillDevCredentials() {
  email.value = devCredentials.email
  password.value = devCredentials.password
}

async function submit() {
  if (!email.value || !password.value) return

  const target =
    typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      ? route.query.redirect
      : '/'

  errorMessage.value = ''
  loading.value = true
  try {
    await auth.login({ email: email.value, password: password.value })
    await router.replace(target)
  } catch (error) {
    if (error instanceof ApiRequestError) {
      errorMessage.value =
        error.status === 401
          ? 'Correo o contraseña incorrectos.'
          : error.message
    } else {
      errorMessage.value = 'No se pudo iniciar sesión. Intenta nuevamente.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <v-card class="login-card pa-6 pa-sm-8" elevation="2" rounded="lg">
      <div class="d-flex justify-center mb-6">
        <PromatyLogo />
      </div>

      <h1 class="text-h6 text-center mb-1">Iniciar sesión</h1>
      <p class="text-body-2 text-medium-emphasis text-center mb-6">
        Ingresa tus credenciales para continuar.
      </p>

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        {{ errorMessage }}
      </v-alert>

      <v-form @submit.prevent="submit">
        <v-text-field
          v-model="email"
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
          label="Contraseña"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          :rules="[required('tu contraseña')]"
          :append-inner-icon="showPassword ? mdiEyeOff : mdiEye"
          variant="outlined"
          density="comfortable"
          @click:append-inner="showPassword = !showPassword"
        />

        <v-btn
          type="submit"
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
        · clave: <code>{{ devCredentials.password }}</code>
      </v-sheet>
    </v-card>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.dev-credentials {
  cursor: pointer;
}

.dev-credentials code {
  font-size: 0.85em;
}
</style>
