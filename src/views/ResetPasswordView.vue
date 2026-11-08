<script setup lang="ts">
import { ROUTE } from '@/router/route-names'
import AuthCard from '@/components/auth/AuthCard.vue'
import PasswordResetForm from '@/components/auth/PasswordResetForm.vue'
</script>

<template>
  <AuthCard
    title="Restablecer contraseña"
    subtitle="Ingresa el código que enviamos a tu correo y elige una contraseña nueva."
  >
    <PasswordResetForm code-label="Código de recuperación" submit-label="Actualizar" />

    <v-btn variant="text" block class="mt-2" :to="{ name: ROUTE.RECOVERY }">
      Solicitar un nuevo código
    </v-btn>
    <v-btn variant="text" block :to="{ name: ROUTE.LOGIN }">Volver a iniciar sesión</v-btn>
  </AuthCard>
</template>
