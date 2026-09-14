<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '@/models'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailFieldList from '@/components/common/DetailFieldList.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const props = withDefaults(
  defineProps<{
    project: Project | null
    loading?: boolean
    hasUpdatePermission?: boolean
  }>(),
  {
    hasUpdatePermission: true,
  },
)

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  edit: [project: Project]
}>()

const fields = computed(() => {
  const p = props.project
  if (!p) return []
  return [
    { key: 'name', label: 'Nombre', value: p.name },
    { key: 'costCenterCode', label: 'Centro de costo', value: p.costCenterCode },
    { key: 'type', label: 'Tipo de proyecto', value: p.type.name },
    { key: 'specialty', label: 'Especialidad', value: p.specialty.name },
    { key: 'client', label: 'Mandante', value: p.client.name },
    { key: 'startDate', label: 'Fecha de inicio', value: p.startDate },
    { key: 'endDate', label: 'Fecha de término', value: p.endDate },
    { key: 'createdAt', label: 'Fecha de creación', value: p.createdAt },
    { key: 'createdBy', label: 'Creado por', value: p.createdBy },
    { key: 'updatedAt', label: 'Última actualización', value: p.updatedAt },
    { key: 'updatedBy', label: 'Actualizado por', value: p.updatedBy },
  ]
})
</script>

<template>
  <DetailDrawer v-model:open="open" entity="proyecto" width="clamp(360px, 40vw, 480px)">
    <template #header>
      <slot name="header">
        <div>
          <div class="text-h6 font-weight-bold">Detalle de proyecto</div>
          <v-chip v-if="project" size="small" variant="tonal" color="info" class="mt-1">
            {{ project.status.name }}
          </v-chip>
        </div>
      </slot>
    </template>

    <template v-if="project" #menu>
      <ActionsMenu
        :record="project"
        :has-update-permission="hasUpdatePermission"
        :show-view="false"
        @edit="emit('edit', project)"
      />
    </template>

    <div v-if="loading && !project" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <DetailFieldList v-else-if="project" :items="fields" />
  </DetailDrawer>
</template>
