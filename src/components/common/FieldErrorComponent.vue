<script setup lang="ts">
import { mdiArrowUp } from '@mdi/js'

defineProps<{
  message?: string
}>()
</script>

<template>
  <div v-if="message" class="d-flex align-center ga-1 text-caption text-error mt-1">
    <v-icon :icon="mdiArrowUp" size="12" />
    {{ message }}
  </div>
</template>
