<script setup lang="ts">
import { mdiHandWaveOutline } from '@mdi/js'
import { useAuthStore } from '@/stores'

const auth = useAuthStore()
</script>

<template>
  <div class="d-flex flex-column align-center justify-center text-center pa-8" style="min-height: 60vh">
    <v-icon :icon="mdiHandWaveOutline" size="64" color="primary" class="mb-4" />
    <p v-if="auth.userName" class="text-medium-emphasis mb-1 home-greeting-name">{{ auth.userName }}</p>
    <h1 class="text-h4 font-weight-bold mb-2">Te damos la bienvenida a Promaty</h1>
    <p class="text-body-1 text-medium-emphasis">
      Usa el menú principal para gestionar tus solicitudes.
    </p>
  </div>
</template>

<style scoped>
.home-greeting-name {
  font-style: italic;
  font-size: 1rem;
}
</style>
