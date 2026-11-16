<script setup lang="ts">
import { mdiAccountCircleOutline } from '@mdi/js'
import type { StaffInfoItem } from '@/types/staffInfo'

defineProps<{
  name: string
  identification: string
  items: StaffInfoItem[]
}>()
</script>

<template>
  <v-card variant="outlined" class="pa-4 pa-sm-5">
    <div class="d-flex align-center ga-3">
      <v-avatar color="primary" variant="tonal" size="44">
        <v-icon :icon="mdiAccountCircleOutline" size="28" />
      </v-avatar>
      <div class="staff-info__text">
        <div class="text-subtitle-1 font-weight-bold">{{ name }}</div>
        <div class="text-body-2 text-medium-emphasis">RUT {{ identification }}</div>
      </div>
    </div>

    <template v-if="items.length > 0">
      <v-divider class="my-4" />
      <dl class="staff-info__grid">
        <div v-for="item in items" :key="item.label" class="d-flex ga-3">
          <v-icon :icon="item.icon" size="20" color="primary" class="mt-1" />
          <div class="staff-info__text">
            <dt class="text-caption text-medium-emphasis">{{ item.label }}</dt>
            <dd :class="['text-body-2', { 'font-weight-bold': item.emphasis }]">{{ item.value }}</dd>
          </div>
        </div>
      </dl>
    </template>

    <slot />
  </v-card>
</template>

<style scoped>
/* Las columnas se ajustan al ancho disponible: 1 en móvil, 2 en tablet y 3 en pantallas amplias. */
.staff-info__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 230px), 1fr));
  gap: 16px 24px;
  margin: 0;
}

.staff-info__grid dd {
  margin: 0;
}

/* Los textos largos hacen salto de línea: el usuario necesita leerlos completos. */
.staff-info__text {
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>
