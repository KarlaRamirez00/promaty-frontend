<script setup lang="ts">
import { computed } from 'vue'
import { mdiDotsHorizontal, mdiEyeOutline, mdiPencilOutline, mdiPower } from '@mdi/js'

const props = defineProps<{
  record: { active?: boolean }
}>()

const emit = defineEmits<{
  view: []
  edit: []
  toggle: []
}>()

const toggleLabel = computed(() => (props.record.active ? 'Desactivar' : 'Activar'))
</script>

<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <v-btn :icon="mdiDotsHorizontal" variant="text" size="small" v-bind="menuProps" />
    </template>

    <v-list class="actions-list" density="compact" nav>
      <v-list-item :prepend-icon="mdiEyeOutline" title="Ver detalle" @click="emit('view')" />
      <v-list-item :prepend-icon="mdiPencilOutline" title="Editar" @click="emit('edit')" />
      <v-list-item
        v-if="record.active !== undefined"
        :prepend-icon="mdiPower"
        :title="toggleLabel"
        @click="emit('toggle')"
      />
    </v-list>
  </v-menu>
</template>

<style scoped>
.actions-list {
  border-radius: 12px;
}
</style>
