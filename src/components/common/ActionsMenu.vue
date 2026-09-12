<script setup lang="ts">
import { computed } from 'vue'
import { mdiDotsHorizontal, mdiEyeOutline, mdiPencilOutline, mdiPower } from '@mdi/js'
import { ACTION } from '@/constants/actions.constants'

const props = withDefaults(
  defineProps<{
    record: { active?: boolean; actions: string[] }
    hasUpdatePermission?: boolean
    hasActivePermission?: boolean
  }>(),
  {
    hasUpdatePermission: true,
    hasActivePermission: true,
  },
)

const emit = defineEmits<{
  view: []
  edit: []
  toggle: []
}>()

// Doble gate: el permiso dice quién puede hacerlo; actions[] dice si este registro lo permite ahora.
const showEdit = computed(() => props.hasUpdatePermission && props.record.actions.includes(ACTION.UPDATE))
const showToggle = computed(
  () =>
    props.hasActivePermission &&
    props.record.active !== undefined &&
    props.record.actions.includes(ACTION.ACTIVE),
)
const toggleLabel = computed(() => (props.record.active ? 'Desactivar' : 'Activar'))
const toggleColor = computed(() => (props.record.active ? 'error' : 'success'))
</script>

<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <v-btn :icon="mdiDotsHorizontal" variant="text" size="small" v-bind="menuProps" />
    </template>

    <v-list class="actions-list" density="compact" nav>
      <v-list-item
        :prepend-icon="mdiEyeOutline"
        base-color="info"
        title="Ver detalle"
        @click="emit('view')"
      />
      <v-list-item
        v-if="showEdit"
        :prepend-icon="mdiPencilOutline"
        base-color="warning"
        title="Editar"
        @click="emit('edit')"
      />
      <v-list-item
        v-if="showToggle"
        :prepend-icon="mdiPower"
        :base-color="toggleColor"
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
