<script setup lang="ts">
import { mdiTuneVariant } from '@mdi/js'

defineProps<{
  filters: { key: string; label: string }[]
}>()

const emit = defineEmits<{
  removeFilter: [key: string]
  clearAll: []
}>()
</script>

<template>
  <v-sheet
    v-if="filters.length === 0"
    variant="tonal"
    rounded
    class="pa-3 mb-4 d-flex align-center ga-2 text-medium-emphasis"
  >
    <v-icon :icon="mdiTuneVariant" size="small" />
    <span class="text-body-2">Ningún filtro seleccionado</span>
  </v-sheet>

  <div v-else class="d-flex flex-wrap align-center ga-2 mb-4">
    <span class="text-caption text-medium-emphasis">Filtros aplicados:</span>
    <v-chip
      v-for="filter in filters"
      :key="filter.key"
      size="small"
      variant="tonal"
      closable
      @click:close="emit('removeFilter', filter.key)"
    >
      {{ filter.label }}
    </v-chip>
    <v-btn variant="text" size="small" density="comfortable" @click="emit('clearAll')">
      Limpiar todos
    </v-btn>
  </div>
</template>
