<script setup lang="ts">
import { mdiTuneVariant } from '@mdi/js'
import DetailDrawer from '@/components/common/DetailDrawer.vue'

const open = defineModel<boolean>('open', { default: false })
const active = defineModel<boolean | null>('active', { default: null })

const emit = defineEmits<{
  clear: []
}>()

const activeOptions = [
  { title: 'Activos', value: true },
  { title: 'Inactivos', value: false },
]
</script>

<template>
  <DetailDrawer v-model:open="open" width="320">
    <template #header>
      <div class="d-flex align-center ga-2">
        <v-icon :icon="mdiTuneVariant" size="20" />
        <span class="text-h6 font-weight-bold">Filtros</span>
      </div>
    </template>

    <div class="pa-2">
      <div class="text-caption text-medium-emphasis mb-1">Estado</div>
      <v-select
        v-model="active"
        :items="activeOptions"
        item-title="title"
        item-value="value"
        placeholder="Seleccionar"
        variant="outlined"
        density="compact"
        clearable
        hide-details
      />
    </div>

    <template #actions>
      <v-btn variant="text" block @click="emit('clear')">Limpiar</v-btn>
      <v-btn color="primary" variant="flat" block @click="open = false">Filtrar contenido</v-btn>
    </template>
  </DetailDrawer>
</template>
