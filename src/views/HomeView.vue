<script setup lang="ts">
import { mdiHandWaveOutline } from '@mdi/js'
</script>

<template>
  <div class="d-flex flex-column align-center justify-center text-center pa-8" style="min-height: 60vh">
    <v-icon :icon="mdiHandWaveOutline" size="64" color="primary" class="mb-4" />
    <h1 class="text-h4 font-weight-bold mb-2">Te damos la bienvenida a Promaty</h1>
    <p class="text-body-1 text-medium-emphasis">
      Usa el menú principal para gestionar tus solicitudes.
    </p>
  </div>
</template>
