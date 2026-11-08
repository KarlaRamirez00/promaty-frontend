<script setup lang="ts">
import { ROUTE } from '@/router/route-names'
import AuthCard from '@/components/auth/AuthCard.vue'
import PasswordResetForm from '@/components/auth/PasswordResetForm.vue'
</script>

<template>
  <AuthCard
    title="Crea tu contraseña"
    subtitle="Por seguridad, reemplaza tu clave temporal por una contraseña nueva."
  >
    <PasswordResetForm code-label="Clave temporal" />

    <v-btn variant="text" block class="mt-2" :to="{ name: ROUTE.LOGIN }">
      Volver a iniciar sesión
    </v-btn>
  </AuthCard>
</template>
