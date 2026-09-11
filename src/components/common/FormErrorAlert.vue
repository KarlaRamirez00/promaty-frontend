<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<template>
  <v-alert v-if="message" type="error" variant="tonal" density="compact" class="mb-4">
    {{ message }}
  </v-alert>
</template>
