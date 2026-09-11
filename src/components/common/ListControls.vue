<script setup lang="ts">
import { mdiDownload, mdiFilterVariant, mdiKeyboardReturn, mdiMagnify, mdiPlus } from '@mdi/js'

withDefaults(
  defineProps<{
    searchPlaceholder: string
    newLabel?: string
    showExport?: boolean
    showNew?: boolean
  }>(),
  {
    showExport: true,
    showNew: true,
  },
)

const search = defineModel<string>('search', { default: '' })

const emit = defineEmits<{
  filter: []
  export: []
  new: []
}>()

const CONTROL_HEIGHT = 40
const ICON_SIZE = 20
const ICON_COLOR = 'grey-darken-1'
const BORDER_STYLE = 'border-color: rgba(var(--v-theme-on-surface), 0.33)'
</script>

<template>
  <div class="d-flex flex-wrap align-center ga-3 mb-3">
    <v-btn
      variant="outlined"
      density="compact"
      :height="CONTROL_HEIGHT"
      :style="BORDER_STYLE"
      @click="emit('filter')"
    >
      <template #prepend>
        <v-icon :icon="mdiFilterVariant" :size="ICON_SIZE" :color="ICON_COLOR" />
      </template>
      Filtrar
    </v-btn>

    <v-text-field
      v-model="search"
      :placeholder="searchPlaceholder"
      :aria-label="searchPlaceholder"
      variant="outlined"
      density="compact"
      :height="CONTROL_HEIGHT"
      hide-details
      class="flex-grow-1"
      style="min-width: 200px"
    >
      <template #prepend-inner>
        <v-icon :icon="mdiMagnify" :size="ICON_SIZE" :color="ICON_COLOR" />
      </template>
      <template #append-inner>
        <v-icon :icon="mdiKeyboardReturn" :size="ICON_SIZE" :color="ICON_COLOR" />
      </template>
    </v-text-field>

    <v-btn
      v-if="showExport"
      variant="outlined"
      density="compact"
      :height="CONTROL_HEIGHT"
      :width="CONTROL_HEIGHT"
      :style="BORDER_STYLE"
      rounded="lg"
      aria-label="Descargar"
      @click="emit('export')"
    >
      <v-icon :icon="mdiDownload" :size="ICON_SIZE" :color="ICON_COLOR" />
    </v-btn>

    <v-btn
      v-if="showNew"
      color="primary"
      density="compact"
      :height="CONTROL_HEIGHT"
      @click="emit('new')"
    >
      <template #prepend>
        <v-icon :icon="mdiPlus" :size="ICON_SIZE" />
      </template>
      {{ newLabel ?? 'Nuevo' }}
    </v-btn>
  </div>
</template>
