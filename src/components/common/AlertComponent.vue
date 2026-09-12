<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'info' | 'success' | 'warning' | 'error'
    message: string
    icon?: string
  }>(),
  { type: 'info' },
)
</script>

<template>
  <v-alert :type="type" :icon="icon" variant="tonal" density="compact" class="mb-4 text-caption">
    <div v-html="message" />
  </v-alert>
</template>
