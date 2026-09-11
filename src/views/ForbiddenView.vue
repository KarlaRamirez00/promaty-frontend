<script setup lang="ts">
import { mdiLockOutline } from '@mdi/js'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <v-container class="d-flex flex-column align-center justify-center text-center" style="min-height: 70vh">
    <v-icon :icon="mdiLockOutline" size="64" color="grey" class="mb-4" />
    <h1 class="text-h5 mb-2">Sin acceso</h1>
    <p class="text-body-2 text-medium-emphasis mb-6">
      No tienes permisos suficientes para ver esta sección.
    </p>
    <v-btn color="primary" variant="flat" @click="router.push('/')">Volver al inicio</v-btn>
  </v-container>
</template>
