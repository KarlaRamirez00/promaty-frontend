<script setup lang="ts">
import PromatyLogo from '@/components/PromatyLogo.vue'

defineProps<{
  title: string
  subtitle: string
}>()
</script>

<template>
  <div class="auth-wrapper">
    <v-card class="auth-card pa-6 pa-sm-8" elevation="2" rounded="lg">
      <div class="d-flex justify-center mb-6">
        <PromatyLogo />
      </div>

      <h1 class="text-h6 text-center mb-1">{{ title }}</h1>
      <p class="text-body-2 text-medium-emphasis text-center mb-6">{{ subtitle }}</p>

      <slot />
    </v-card>
  </div>
</template>

<style scoped>
.auth-wrapper {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
}
</style>
