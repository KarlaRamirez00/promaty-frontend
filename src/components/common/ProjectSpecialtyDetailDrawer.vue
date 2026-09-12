<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectSpecialty } from '@/models/projectSpecialty/projectSpecialty.models'
import { ACTION } from '@/constants/actions.constants'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailFieldList from '@/components/common/DetailFieldList.vue'

const props = withDefaults(
  defineProps<{
    projectSpecialty: ProjectSpecialty | null
    loading?: boolean
    hasUpdatePermission?: boolean
    hasActivePermission?: boolean
  }>(),
  {
    hasUpdatePermission: true,
    hasActivePermission: true,
  },
)

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  edit: [projectSpecialty: ProjectSpecialty]
  toggleActive: [projectSpecialty: ProjectSpecialty]
}>()

const fields = computed(() => {
  const p = props.projectSpecialty
  if (!p) return []
  return [
    { key: 'name', label: 'Nombre', value: p.name },
    { key: 'createdAt', label: 'Fecha de creación', value: p.createdAt },
    { key: 'createdBy', label: 'Creado por', value: p.createdBy },
    { key: 'updatedAt', label: 'Última actualización', value: p.updatedAt },
    { key: 'updatedBy', label: 'Actualizado por', value: p.updatedBy },
  ]
})

// Doble gate: el permiso dice quién puede hacerlo; actions[] dice si este registro lo permite ahora.
const showEdit = computed(
  () =>
    props.hasUpdatePermission && (props.projectSpecialty?.actions.includes(ACTION.UPDATE) ?? false),
)
const showToggle = computed(
  () =>
    props.hasActivePermission && (props.projectSpecialty?.actions.includes(ACTION.ACTIVE) ?? false),
)
</script>

<template>
  <DetailDrawer v-model:open="open" entity="especialidad" width="clamp(360px, 40vw, 480px)">
    <template #badge>
      <v-chip
        v-if="projectSpecialty"
        size="small"
        variant="tonal"
        :color="projectSpecialty.status.color"
        class="mt-1"
      >
        {{ projectSpecialty.status.label }}
      </v-chip>
    </template>

    <div v-if="loading && !projectSpecialty" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <DetailFieldList v-else-if="projectSpecialty" :items="fields" />

    <template v-if="projectSpecialty" #actions>
      <v-btn v-if="showEdit" variant="tonal" block @click="emit('edit', projectSpecialty)">
        Editar
      </v-btn>
      <v-btn
        v-if="showToggle"
        variant="text"
        block
        :color="projectSpecialty.active ? 'primary' : 'success'"
        @click="emit('toggleActive', projectSpecialty)"
      >
        {{ projectSpecialty.active ? 'Desactivar' : 'Activar' }}
      </v-btn>
    </template>
  </DetailDrawer>
</template>
