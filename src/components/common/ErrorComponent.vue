<script setup lang="ts">
import { computed } from 'vue'
import type { ApiErrorFields } from '@/types/api'

const props = defineProps<{
  errorFields: ApiErrorFields | null
}>()

const messages = computed(() => Object.values(props.errorFields ?? {}))
</script>

<template>
  <v-alert v-if="messages.length" type="error" variant="tonal" density="compact" class="mb-4 text-caption">
    <div class="font-weight-medium mb-1">Errores encontrados</div>
    <ul class="pl-6">
      <li v-for="message in messages" :key="message">{{ message }}</li>
    </ul>
  </v-alert>
</template>
